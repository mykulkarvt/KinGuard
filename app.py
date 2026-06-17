"""
KinGuard (परिवार की सुरक्षा) — Flask backend with onboarding + accessibility.

The loop:
  1. Senior taps a situation  -> POST /api/alert   (saved to the database)
  2. Family phone polls        -> GET  /api/alerts  (sees the new alert)
  3. Family taps "she's safe"  -> POST /api/resolve (marks it done)

Onboarding (done once by the family member):
  /setup  -> family enters names, phones, and the senior's needs.
  The chosen needs are turned into accessibility settings, so the senior's
  phone simply starts in the right mode (big text / vibration / simple / etc.).
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
from contextlib import closing
import sqlite3, time, os, json, base64, threading

app = Flask(__name__)
DB = os.path.join(os.path.dirname(__file__), "kinguard.db")

VALID_RULES = {"police", "transfer", "voice", "link", "prize", "panic"}
ALLOWED_CONDITIONS = {"hearing", "vision", "tremor", "memory"}
# Languages the UI is translated into (see static/rules.js). 'hi' is the default.
ALLOWED_LANGS = {"hi", "te", "en"}
DEFAULT_LANG = "hi"

# An alert older than this (seconds) is treated as stale and stops showing.
# Keeps the family screen from getting stuck on a forgotten/old alert.
ALERT_TTL_SECONDS = 600  # 10 minutes

# Upper bounds so a malformed or oversized payload can never bloat a row.
MAX_NAME_LEN = 80
MAX_PHONE_LEN = 25


def get_db():
    # timeout + busy_timeout let a write wait briefly for a lock instead of
    # failing with "database is locked" when the family phone happens to poll
    # at the same instant the senior taps an alert.
    con = sqlite3.connect(DB, timeout=5)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA busy_timeout=5000")
    return con


def _clean_name(value, default):
    """Trim, cap length, and fall back to the default if blank/missing."""
    s = value if isinstance(value, str) else ("" if value is None else str(value))
    return s.strip()[:MAX_NAME_LEN] or default


def _clean_phone(value):
    s = value if isinstance(value, str) else ("" if value is None else str(value))
    return s.strip()[:MAX_PHONE_LEN]


def norm_pair(value):
    """A *pair* (one senior + their family) is keyed by the senior's phone number
    reduced to digits only, so '+91 98765 43210' and '9876543210' map to the same
    family. This is what lets one deployment serve many families at once."""
    s = value if isinstance(value, str) else ("" if value is None else str(value))
    return "".join(ch for ch in s if ch in "0123456789")[:20]


def req_pair():
    """The pair this request is scoped to (from the ?pair= query parameter)."""
    return norm_pair(request.args.get("pair"))


def _has_col(con, table, col):
    return col in {r["name"] for r in con.execute(f"PRAGMA table_info({table})")}


def _table_exists(con, table):
    return con.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)
    ).fetchone() is not None


def init_db():
    with closing(get_db()) as con, con:
        # --- alerts: one stream per pair ---
        con.execute(
            """CREATE TABLE IF NOT EXISTS alerts (
                   id          INTEGER PRIMARY KEY AUTOINCREMENT,
                   pair        TEXT    NOT NULL DEFAULT 'default',
                   rule        TEXT    NOT NULL,
                   created_at  INTEGER NOT NULL,
                   status      TEXT    NOT NULL DEFAULT 'active',
                   resolved_at INTEGER
               )"""
        )
        if not _has_col(con, "alerts", "pair"):  # pre-multi-tenant DB
            con.execute("ALTER TABLE alerts ADD COLUMN pair TEXT NOT NULL DEFAULT 'default'")

        # --- settings: one row per pair, keyed by the senior's phone ---
        # Older builds keyed settings by a fixed id=1. Rebuild to a pair key and
        # carry that single old row over to a pair derived from its phone number.
        if _table_exists(con, "settings") and not _has_col(con, "settings", "pair"):
            con.execute("ALTER TABLE settings RENAME TO settings_old")
        con.execute(
            """CREATE TABLE IF NOT EXISTS settings (
                   pair         TEXT PRIMARY KEY,
                   senior_name  TEXT, senior_phone TEXT,
                   family_name  TEXT, family_phone TEXT,
                   conditions   TEXT,
                   big_text     INTEGER, high_contrast INTEGER,
                   vibrate      INTEGER, auto_speak    INTEGER,
                   simple_mode  INTEGER,
                   lang         TEXT
               )"""
        )
        if _table_exists(con, "settings_old"):
            old = con.execute("SELECT * FROM settings_old WHERE id=1").fetchone()
            if old:
                ocols = old.keys()
                pair = norm_pair(old["senior_phone"]) or "default"
                con.execute(
                    """INSERT OR IGNORE INTO settings
                       (pair, senior_name, senior_phone, family_name, family_phone,
                        conditions, big_text, high_contrast, vibrate, auto_speak,
                        simple_mode, lang)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (pair, old["senior_name"], old["senior_phone"],
                     old["family_name"], old["family_phone"], old["conditions"],
                     old["big_text"], old["high_contrast"], old["vibrate"],
                     old["auto_speak"], old["simple_mode"],
                     (old["lang"] if "lang" in ocols else "hi")),
                )
            con.execute("DROP TABLE settings_old")

        # --- push subscriptions: tagged with the pair they belong to ---
        con.execute(
            """CREATE TABLE IF NOT EXISTS push_subs (
                   endpoint   TEXT PRIMARY KEY,
                   pair       TEXT NOT NULL DEFAULT 'default',
                   p256dh     TEXT NOT NULL,
                   auth       TEXT NOT NULL,
                   created_at INTEGER NOT NULL
               )"""
        )
        if not _has_col(con, "push_subs", "pair"):
            con.execute("ALTER TABLE push_subs ADD COLUMN pair TEXT NOT NULL DEFAULT 'default'")


def settings_dict(row):
    return {
        "senior_name": row["senior_name"] or "कमला",
        "senior_phone": row["senior_phone"] or "",
        "family_name": row["family_name"] or "अर्जुन",
        "family_phone": row["family_phone"] or "",
        "conditions": (row["conditions"] or "").split(",") if row["conditions"] else [],
        "big_text": row["big_text"],
        "high_contrast": row["high_contrast"],
        "vibrate": row["vibrate"],
        "auto_speak": row["auto_speak"],
        "simple_mode": row["simple_mode"],
        "lang": row["lang"] or DEFAULT_LANG,
    }


# A safe default so the senior/family pages always get a usable config, even if
# the settings row somehow went missing (e.g. the DB file was edited by hand).
DEFAULT_SETTINGS = {
    "senior_name": "कमला", "senior_phone": "",
    "family_name": "अर्जुन", "family_phone": "",
    "conditions": [], "big_text": 0, "high_contrast": 0,
    "vibrate": 0, "auto_speak": 0, "simple_mode": 0,
    "lang": DEFAULT_LANG,
}


# ---------- Web Push (VAPID) ----------
# Push lets the family be alerted even when the app is closed. It needs HTTPS and
# OUTBOUND network from the server to the browser push services (FCM/Mozilla/…),
# so it requires a host with open outbound access — free PythonAnywhere blocks
# this; hosts like Render/Fly/Railway allow it. Keys come from env vars in
# production; if they're absent we generate a throwaway pair for local dev.
VAPID_SUBJECT = os.environ.get("VAPID_SUBJECT", "mailto:admin@example.com")
VAPID_PUBLIC = os.environ.get("VAPID_PUBLIC", "")
VAPID_PRIVATE = os.environ.get("VAPID_PRIVATE", "")

try:
    from pywebpush import webpush, WebPushException
    from py_vapid import Vapid01
    _PUSH_LIB = True
except Exception:
    _PUSH_LIB = False

if _PUSH_LIB and not (VAPID_PUBLIC and VAPID_PRIVATE):
    try:
        from cryptography.hazmat.primitives.asymmetric import ec
        from cryptography.hazmat.primitives import serialization
        _k = ec.generate_private_key(ec.SECP256R1())
        _b = lambda raw: base64.urlsafe_b64encode(raw).rstrip(b"=").decode()
        VAPID_PRIVATE = _b(_k.private_numbers().private_value.to_bytes(32, "big"))
        VAPID_PUBLIC = _b(_k.public_key().public_bytes(
            serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint))
        print("[KinGuard] No VAPID_PUBLIC/PRIVATE env vars set — using a TEMPORARY "
              "dev key pair (push subs reset on restart). Run gen_vapid.py and set "
              "the env vars for production.")
    except Exception:
        _PUSH_LIB = False

# A reusable signer (proven to work when passed to webpush as the vapid key).
VAPID_SIGNER = None
if _PUSH_LIB and VAPID_PUBLIC and VAPID_PRIVATE:
    try:
        VAPID_SIGNER = Vapid01.from_string(VAPID_PRIVATE)
    except Exception:
        VAPID_SIGNER = None
PUSH_ENABLED = VAPID_SIGNER is not None


def send_push(pair, rule):
    """Best-effort Web Push to this pair's family devices. Never raises — a push
    problem must not stop the alert itself from being recorded."""
    if not PUSH_ENABLED:
        return
    with closing(get_db()) as con:
        srow = con.execute("SELECT senior_name, lang FROM settings WHERE pair=?", (pair,)).fetchone()
        subs = con.execute("SELECT endpoint, p256dh, auth FROM push_subs WHERE pair=?", (pair,)).fetchall()
    if not subs:
        return
    senior = (srow["senior_name"] if srow else "") or "कमला"
    lang = (srow["lang"] if srow else "") or DEFAULT_LANG
    payload = json.dumps({"rule": rule, "lang": lang, "senior": senior})
    dead = []
    for s in subs:
        info = {"endpoint": s["endpoint"],
                "keys": {"p256dh": s["p256dh"], "auth": s["auth"]}}
        try:
            webpush(info, data=payload, vapid_private_key=VAPID_SIGNER,
                    vapid_claims={"sub": VAPID_SUBJECT}, ttl=120, timeout=10)
        except WebPushException as e:
            # 404/410 mean the subscription is permanently gone → forget it.
            code = getattr(getattr(e, "response", None), "status_code", None)
            if code in (404, 410):
                dead.append(s["endpoint"])
        except Exception:
            pass  # transient/network error — leave the sub for next time
    if dead:
        with closing(get_db()) as con, con:
            con.executemany("DELETE FROM push_subs WHERE endpoint=?", [(e,) for e in dead])


@app.after_request
def no_store_api(resp):
    # Polling endpoints (alerts/settings) must never be served from a browser's
    # HTTP cache — a stale 200 would freeze the family screen on an old alert.
    if request.path.startswith("/api/"):
        resp.headers["Cache-Control"] = "no-store"
    return resp


# ---------- pages ----------
@app.route("/sw.js")
def service_worker():
    # served from root so its scope covers the whole app
    return send_from_directory(app.static_folder, "sw.js", mimetype="application/javascript")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/setup")
def setup():
    return render_template("setup.html")


@app.route("/senior")
def senior():
    return render_template("senior.html")


@app.route("/family")
def family():
    return render_template("family.html")


# ---------- settings API ----------
@app.route("/api/settings")
def get_settings():
    pair = req_pair()
    if not pair:
        return jsonify(dict(DEFAULT_SETTINGS))
    with closing(get_db()) as con:
        row = con.execute("SELECT * FROM settings WHERE pair=?", (pair,)).fetchone()
    if row is None:
        return jsonify(dict(DEFAULT_SETTINGS))
    return jsonify(settings_dict(row))


@app.route("/api/settings", methods=["POST"])
def save_settings():
    data = request.get_json(force=True, silent=True) or {}
    # The senior's phone IS the pair key — it's what links the two phones. Without
    # it we can't create the pair.
    senior_phone = _clean_phone(data.get("senior_phone"))
    pair = norm_pair(senior_phone)
    if not pair:
        return jsonify(error="senior phone required"), 400
    # Keep only known conditions, de-duped in the order the family ticked them.
    raw_conds = data.get("conditions")
    raw_conds = raw_conds if isinstance(raw_conds, list) else []
    conds = list(dict.fromkeys(c for c in raw_conds if c in ALLOWED_CONDITIONS))
    cset = set(conds)
    # turn the senior's needs into concrete accessibility settings
    big_text = 1 if ("vision" in cset or "tremor" in cset) else 0
    high_contrast = 1 if "vision" in cset else 0
    auto_speak = 1 if "vision" in cset else 0
    vibrate = 1 if "hearing" in cset else 0
    simple_mode = 1 if "memory" in cset else 0
    lang = data.get("lang")
    lang = lang if lang in ALLOWED_LANGS else DEFAULT_LANG
    with closing(get_db()) as con, con:
        con.execute(
            """INSERT INTO settings
                  (pair, senior_name, senior_phone, family_name, family_phone,
                   conditions, big_text, high_contrast, vibrate, auto_speak,
                   simple_mode, lang)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(pair) DO UPDATE SET
                  senior_name=excluded.senior_name, senior_phone=excluded.senior_phone,
                  family_name=excluded.family_name, family_phone=excluded.family_phone,
                  conditions=excluded.conditions, big_text=excluded.big_text,
                  high_contrast=excluded.high_contrast, vibrate=excluded.vibrate,
                  auto_speak=excluded.auto_speak, simple_mode=excluded.simple_mode,
                  lang=excluded.lang""",
            (
                pair,
                _clean_name(data.get("senior_name"), "कमला"), senior_phone,
                _clean_name(data.get("family_name"), "अर्जुन"),
                _clean_phone(data.get("family_phone")),
                ",".join(conds),
                big_text, high_contrast, vibrate, auto_speak, simple_mode, lang,
            ),
        )
    return jsonify(ok=True, pair=pair)


# ---------- alert API ----------
@app.route("/api/alert", methods=["POST"])
def create_alert():
    data = request.get_json(force=True, silent=True) or {}
    pair = req_pair()
    rule = data.get("rule")
    if not pair:
        return jsonify(error="no pair"), 400
    if rule not in VALID_RULES:
        return jsonify(error="unknown rule"), 400
    now = int(time.time())
    with closing(get_db()) as con, con:
        # A new alert supersedes any previous unresolved one *for this pair*.
        con.execute(
            "UPDATE alerts SET status='resolved', resolved_at=? WHERE pair=? AND status='active'",
            (now, pair),
        )
        cur = con.execute(
            "INSERT INTO alerts (pair, rule, created_at, status) VALUES (?, ?, ?, 'active')",
            (pair, rule, now),
        )
        alert_id = cur.lastrowid
    # Push to this pair's family even if their app is closed. Fire-and-forget in a
    # thread so a slow/hung push service never delays the senior's response.
    if PUSH_ENABLED:
        threading.Thread(target=send_push, args=(pair, rule), daemon=True).start()
    return jsonify(id=alert_id, rule=rule)


@app.route("/api/alerts")
def list_alerts():
    pair = req_pair()
    if not pair:
        return jsonify(alert=None)
    cutoff = int(time.time()) - ALERT_TTL_SECONDS
    with closing(get_db()) as con:
        row = con.execute(
            "SELECT id, rule, created_at FROM alerts "
            "WHERE pair=? AND status='active' AND created_at > ? ORDER BY id DESC LIMIT 1",
            (pair, cutoff),
        ).fetchone()
    if not row:
        return jsonify(alert=None)
    return jsonify(alert={"id": row["id"], "rule": row["rule"],
                          "created_at": row["created_at"]})


@app.route("/api/resolve", methods=["POST"])
def resolve_alert():
    data = request.get_json(force=True, silent=True) or {}
    pair = req_pair()
    alert_id = data.get("id")
    # Only touch the table for a real integer id (bool is an int subclass — skip it).
    if not pair or isinstance(alert_id, bool) or not isinstance(alert_id, int):
        return jsonify(ok=True)
    with closing(get_db()) as con, con:
        con.execute(
            "UPDATE alerts SET status='resolved', resolved_at=? WHERE pair=? AND id=?",
            (int(time.time()), pair, alert_id),
        )
    return jsonify(ok=True)


# ---------- push subscription API ----------
@app.route("/api/vapid")
def vapid_public():
    # The family page needs the public key to subscribe; `enabled` lets it hide
    # the button when push isn't configured (e.g. running on free PythonAnywhere).
    return jsonify(public_key=VAPID_PUBLIC, enabled=PUSH_ENABLED)


@app.route("/api/subscribe", methods=["POST"])
def subscribe():
    data = request.get_json(force=True, silent=True) or {}
    pair = req_pair()
    endpoint = data.get("endpoint")
    keys = data.get("keys") or {}
    p256dh, auth = keys.get("p256dh"), keys.get("auth")
    if not (pair and isinstance(endpoint, str) and p256dh and auth):
        return jsonify(error="bad subscription"), 400
    with closing(get_db()) as con, con:
        con.execute(
            "INSERT INTO push_subs (endpoint, pair, p256dh, auth, created_at) "
            "VALUES (?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET "
            "pair=excluded.pair, p256dh=excluded.p256dh, auth=excluded.auth",
            (endpoint[:1000], pair, str(p256dh)[:200], str(auth)[:100], int(time.time())),
        )
    return jsonify(ok=True)


@app.route("/api/unsubscribe", methods=["POST"])
def unsubscribe():
    data = request.get_json(force=True, silent=True) or {}
    endpoint = data.get("endpoint")
    if isinstance(endpoint, str):
        with closing(get_db()) as con, con:
            con.execute("DELETE FROM push_subs WHERE endpoint=?", (endpoint,))
    return jsonify(ok=True)


init_db()

if __name__ == "__main__":
    # debug=False: never expose the interactive Werkzeug debugger (it allows
    # arbitrary code execution) if this is ever put on the public internet.
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
