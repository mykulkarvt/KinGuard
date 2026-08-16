"""
KinGuard — Flask backend with family accounts, onboarding + accessibility.

The loop:
  1. Senior taps a situation  -> POST /api/alert   (saved to the database)
  2. Family phone polls        -> GET  /api/alerts  (sees the new alert)
  3. Family taps "she's safe"  -> POST /api/resolve (marks it done)

Access model (the security piece):
  - A *family member* has an account (email + password) and logs in. Every pair
    of phones (one senior + one family) is OWNED by an account, and the settings
    / alert APIs check that ownership — so only the owner can read or change a
    pair's data.
  - The *senior* never logs in. Their phone holds a long-lived, revocable DEVICE
    TOKEN (delivered once through the family's setup link and then kept in an
    HttpOnly cookie). The family can revoke/rotate it from Setup.
  - Phone numbers are encrypted at rest; the pair id is a random token, never the
    phone number.
"""

from flask import (Flask, render_template, request, jsonify, send_from_directory,
                   redirect, session, g)
from werkzeug.security import generate_password_hash, check_password_hash
from contextlib import closing
from functools import wraps
from datetime import timedelta
import sqlite3, time, os, json, base64, threading, secrets, hashlib

app = Flask(__name__)
DB = os.path.join(os.path.dirname(__file__), "kinguard.db")

# Session signing key. MUST be set via env in production; otherwise sessions
# (logins) reset on every restart.
app.secret_key = os.environ.get("KINGUARD_SECRET_KEY", "").strip()
if not app.secret_key:
    app.secret_key = secrets.token_hex(32)
    print("[KinGuard] No KINGUARD_SECRET_KEY set — using a TEMPORARY key; all logins "
          "reset on restart. Generate one with: python -c \"import secrets; "
          "print(secrets.token_hex(32))\"  and set KINGUARD_SECRET_KEY.")

app.permanent_session_lifetime = timedelta(days=30)
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    # Secure cookies require HTTPS. PythonAnywhere serves HTTPS; for plain-http
    # local dev set KINGUARD_COOKIE_SECURE=0 so the session cookie still sticks.
    SESSION_COOKIE_SECURE=os.environ.get("KINGUARD_COOKIE_SECURE", "1") != "0",
)
COOKIE_SECURE = app.config["SESSION_COOKIE_SECURE"]
DEVICE_COOKIE = "kg_device"          # senior device token lives here (HttpOnly)

VALID_RULES = {"police", "transfer", "voice", "link", "prize", "panic"}
ALLOWED_CONDITIONS = {"hearing", "vision", "tremor", "memory"}
# Languages the UI is translated into (see static/rules.js). 'en' is the default.
ALLOWED_LANGS = {"hi", "te", "en"}
DEFAULT_LANG = "en"

# An alert older than this (seconds) is treated as stale and stops showing.
ALERT_TTL_SECONDS = 600  # 10 minutes

# Upper bounds so a malformed or oversized payload can never bloat a row.
MAX_NAME_LEN = 80
MAX_PHONE_LEN = 25
MAX_EMAIL_LEN = 120
MIN_PASSWORD_LEN = 8


# ---------- phone-number encryption at rest ----------
# Phone numbers are personal data, so they are encrypted before being written to
# the database and decrypted only when served back to a caller that is allowed to
# see them. Provide the key via the KINGUARD_DB_KEY env var in production —
# generate one with:
#   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Without a valid key we fall back to a throwaway one so local dev still runs, but
# anything stored then becomes unreadable after a restart.
from cryptography.fernet import Fernet

_DB_KEY = os.environ.get("KINGUARD_DB_KEY", "").strip()
try:
    _fernet = Fernet(_DB_KEY.encode()) if _DB_KEY else None
except Exception:
    _fernet = None
if _fernet is None:
    _fernet = Fernet(Fernet.generate_key())
    print("[KinGuard] No valid KINGUARD_DB_KEY set — using a TEMPORARY key; stored "
          "phone numbers will be UNREADABLE after a restart. Generate a key with: "
          'python -c "from cryptography.fernet import Fernet; '
          'print(Fernet.generate_key().decode())"  and set KINGUARD_DB_KEY.')


def enc_phone(plaintext):
    """Encrypt a phone number for storage; blank stays blank."""
    s = plaintext or ""
    return _fernet.encrypt(s.encode()).decode() if s else ""


def dec_phone(stored):
    """Decrypt a stored phone number, or '' if it can't be decrypted (key change,
    legacy/garbage value) so the app never crashes on read."""
    if not stored:
        return ""
    try:
        return _fernet.decrypt(stored.encode()).decode()
    except Exception:
        return ""


def _looks_encrypted(value):
    # Fernet tokens always begin with 'gAAAAA' (version byte 0x80 + timestamp).
    return isinstance(value, str) and value.startswith("gAAAAA")


def get_db():
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
    """Legacy helper: reduce a phone number to digits. Only used by the very old
    single-row DB migration below; pairs are random tokens now."""
    s = value if isinstance(value, str) else ("" if value is None else str(value))
    return "".join(ch for ch in s if ch in "0123456789")[:20]


_PAIR_CHARS = frozenset(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")


def clean_token(value):
    """Sanitise a token/id from a URL or JSON to the URL-safe token charset."""
    s = value if isinstance(value, str) else ("" if value is None else str(value))
    return "".join(ch for ch in s if ch in _PAIR_CHARS)[:64]


def new_token(nbytes=16):
    """A fresh, unguessable token (nbytes*8 bits)."""
    return secrets.token_urlsafe(nbytes)


def hash_token(tok):
    """One-way hash for storing high-entropy tokens (device tokens). High entropy
    means a fast hash is safe here — no per-guess slowdown is needed."""
    return hashlib.sha256((tok or "").encode()).hexdigest()


def req_pair():
    """The pair a family request is scoped to (from ?pair=). Opaque token."""
    return clean_token(request.args.get("pair"))


def _has_col(con, table, col):
    return col in {r["name"] for r in con.execute(f"PRAGMA table_info({table})")}


def _table_exists(con, table):
    return con.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)
    ).fetchone() is not None


def init_db():
    with closing(get_db()) as con, con:
        # --- accounts: one per family member (the login) ---
        con.execute(
            """CREATE TABLE IF NOT EXISTS accounts (
                   id              INTEGER PRIMARY KEY AUTOINCREMENT,
                   email           TEXT UNIQUE NOT NULL,
                   password_hash   TEXT NOT NULL,
                   session_version INTEGER NOT NULL DEFAULT 1,
                   created_at      INTEGER NOT NULL
               )"""
        )

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
        if not _has_col(con, "alerts", "pair"):
            con.execute("ALTER TABLE alerts ADD COLUMN pair TEXT NOT NULL DEFAULT 'default'")

        # --- settings: one row per pair, owned by an account ---
        if _table_exists(con, "settings") and not _has_col(con, "settings", "pair"):
            con.execute("ALTER TABLE settings RENAME TO settings_old")
        con.execute(
            """CREATE TABLE IF NOT EXISTS settings (
                   pair             TEXT PRIMARY KEY,
                   owner_account_id INTEGER,
                   senior_name  TEXT, senior_phone TEXT,
                   family_name  TEXT, family_phone TEXT,
                   conditions   TEXT,
                   big_text     INTEGER, high_contrast INTEGER,
                   vibrate      INTEGER, auto_speak    INTEGER,
                   simple_mode  INTEGER,
                   lang         TEXT
               )"""
        )
        if not _has_col(con, "settings", "owner_account_id"):
            con.execute("ALTER TABLE settings ADD COLUMN owner_account_id INTEGER")
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

        # --- senior devices: revocable per-phone tokens (stored hashed) ---
        con.execute(
            """CREATE TABLE IF NOT EXISTS senior_devices (
                   id         INTEGER PRIMARY KEY AUTOINCREMENT,
                   pair       TEXT NOT NULL,
                   token_hash TEXT UNIQUE NOT NULL,
                   label      TEXT,
                   created_at INTEGER NOT NULL,
                   revoked_at INTEGER
               )"""
        )

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

        # --- one-time: encrypt any legacy plaintext phone numbers in place ---
        for r in con.execute(
                "SELECT pair, senior_phone, family_phone FROM settings").fetchall():
            sp, fp = r["senior_phone"], r["family_phone"]
            nsp = sp if _looks_encrypted(sp) else enc_phone(sp or "")
            nfp = fp if _looks_encrypted(fp) else enc_phone(fp or "")
            if nsp != (sp or "") or nfp != (fp or ""):
                con.execute(
                    "UPDATE settings SET senior_phone=?, family_phone=? WHERE pair=?",
                    (nsp, nfp, r["pair"]),
                )


# ---------- accounts / sessions ----------
def _norm_email(v):
    return (v or "").strip().lower()[:MAX_EMAIL_LEN]


def _start_session(account_id, session_version):
    session.clear()
    session["account_id"] = account_id
    session["sv"] = session_version
    session["csrf"] = new_token(24)
    session.permanent = True


def current_account():
    """The logged-in account row, or None. Also invalidates the cookie if the
    account's session_version was bumped ('log out everywhere')."""
    aid = session.get("account_id")
    if not aid:
        return None
    with closing(get_db()) as con:
        row = con.execute("SELECT * FROM accounts WHERE id=?", (aid,)).fetchone()
    if row is None or row["session_version"] != session.get("sv"):
        return None
    return row


def login_required(view):
    """Gate a *page*: send anonymous visitors to the login screen."""
    @wraps(view)
    def wrapper(*a, **k):
        if current_account() is None:
            return redirect("/login?next=" + clean_path(request.path))
        return view(*a, **k)
    return wrapper


def api_login_required(view):
    """Gate an *API*: 401 for anonymous callers, and require a matching CSRF
    token on state-changing requests (cookies alone must not authorise writes)."""
    @wraps(view)
    def wrapper(*a, **k):
        acct = current_account()
        if acct is None:
            return jsonify(error="login required"), 401
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            if request.headers.get("X-CSRF-Token", "") != session.get("csrf", ""):
                return jsonify(error="bad csrf"), 403
        g.account = acct
        return view(*a, **k)
    return wrapper


def clean_path(p):
    # Only allow same-site absolute paths as a post-login redirect target.
    return p if isinstance(p, str) and p.startswith("/") and not p.startswith("//") else "/family"


def own_pair(con, account_id, pair):
    """The settings row for `pair` IFF it is owned by `account_id`, else None."""
    if not pair:
        return None
    return con.execute(
        "SELECT * FROM settings WHERE pair=? AND owner_account_id=?",
        (pair, account_id)).fetchone()


# Simple in-memory login throttle (single worker on PythonAnywhere free).
_login_hits = {}
_login_lock = threading.Lock()
LOGIN_WINDOW = 300     # seconds
LOGIN_MAX = 8          # failed attempts per window per client


def _client_key():
    fwd = request.headers.get("X-Forwarded-For", "")
    return (fwd.split(",")[0].strip() or request.remote_addr or "?")


def login_allowed(key):
    now = time.time()
    with _login_lock:
        hits = [t for t in _login_hits.get(key, []) if now - t < LOGIN_WINDOW]
        _login_hits[key] = hits
        return len(hits) < LOGIN_MAX


def login_record_fail(key):
    with _login_lock:
        _login_hits.setdefault(key, []).append(time.time())


# ---------- senior device auth ----------
def device_pair():
    """Resolve the senior device cookie to its (non-revoked) pair, or ''."""
    tok = request.cookies.get(DEVICE_COOKIE, "")
    if not tok:
        return ""
    with closing(get_db()) as con:
        row = con.execute(
            "SELECT pair FROM senior_devices WHERE token_hash=? AND revoked_at IS NULL",
            (hash_token(tok),)).fetchone()
    return row["pair"] if row else ""


def issue_senior_token(con, pair):
    """Create a fresh senior device token for a pair (caller handles revoking old
    ones). Returns the plaintext token — only ever available at creation time."""
    tok = new_token(24)
    con.execute(
        "INSERT INTO senior_devices (pair, token_hash, label, created_at) VALUES (?,?,?,?)",
        (pair, hash_token(tok), "senior", int(time.time())))
    return tok


def settings_dict(row):
    return {
        "senior_name": row["senior_name"] or "",
        "senior_phone": dec_phone(row["senior_phone"]),
        "family_name": row["family_name"] or "",
        "family_phone": dec_phone(row["family_phone"]),
        "conditions": (row["conditions"] or "").split(",") if row["conditions"] else [],
        "big_text": row["big_text"],
        "high_contrast": row["high_contrast"],
        "vibrate": row["vibrate"],
        "auto_speak": row["auto_speak"],
        "simple_mode": row["simple_mode"],
        "lang": row["lang"] or DEFAULT_LANG,
    }


DEFAULT_SETTINGS = {
    "senior_name": "", "senior_phone": "",
    "family_name": "", "family_phone": "",
    "conditions": [], "big_text": 0, "high_contrast": 0,
    "vibrate": 0, "auto_speak": 0, "simple_mode": 0,
    "lang": DEFAULT_LANG,
}


# ---------- Web Push (VAPID) ----------
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

VAPID_SIGNER = None
if _PUSH_LIB and VAPID_PUBLIC and VAPID_PRIVATE:
    try:
        VAPID_SIGNER = Vapid01.from_string(VAPID_PRIVATE)
    except Exception:
        VAPID_SIGNER = None
PUSH_ENABLED = VAPID_SIGNER is not None


def send_push(pair, rule):
    """Best-effort Web Push to this pair's family devices. Never raises."""
    if not PUSH_ENABLED:
        return
    with closing(get_db()) as con:
        srow = con.execute("SELECT senior_name, lang FROM settings WHERE pair=?", (pair,)).fetchone()
        subs = con.execute("SELECT endpoint, p256dh, auth FROM push_subs WHERE pair=?", (pair,)).fetchall()
    if not subs:
        return
    senior = (srow["senior_name"] if srow else "") or ""
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
            code = getattr(getattr(e, "response", None), "status_code", None)
            if code in (404, 410):
                dead.append(s["endpoint"])
        except Exception:
            pass
    if dead:
        with closing(get_db()) as con, con:
            con.executemany("DELETE FROM push_subs WHERE endpoint=?", [(e,) for e in dead])


@app.after_request
def no_store_api(resp):
    if request.path.startswith("/api/"):
        resp.headers["Cache-Control"] = "no-store"
    return resp


# ---------- pages ----------
@app.route("/sw.js")
def service_worker():
    return send_from_directory(app.static_folder, "sw.js", mimetype="application/javascript")


@app.route("/")
def index():
    return redirect("/family" if current_account() else "/login")


@app.route("/login")
def login_page():
    if current_account():
        return redirect("/family")
    return render_template("login.html")


@app.route("/register")
def register_page():
    if current_account():
        return redirect("/family")
    return render_template("register.html")


@app.route("/setup")
@login_required
def setup():
    return render_template("setup.html", csrf=session.get("csrf", ""))


@app.route("/family")
@login_required
def family():
    return render_template("family.html", csrf=session.get("csrf", ""))


@app.route("/senior")
def senior():
    # A senior link is /senior?t=<device-token>. Validate it, drop the token into
    # an HttpOnly cookie, and redirect to a clean URL so the secret leaves the
    # address bar / history. After that the phone is linked with no login.
    tok = clean_token(request.args.get("t"))
    if tok:
        with closing(get_db()) as con:
            row = con.execute(
                "SELECT pair FROM senior_devices WHERE token_hash=? AND revoked_at IS NULL",
                (hash_token(tok),)).fetchone()
        resp = redirect("/senior")
        if row:
            resp.set_cookie(DEVICE_COOKIE, tok, max_age=60 * 60 * 24 * 365,
                            httponly=True, secure=COOKIE_SECURE, samesite="Lax")
        return resp
    return render_template("senior.html")


@app.route("/privacy")
def privacy():
    # Public on purpose: Play requires a privacy policy reachable without an
    # account, and the Play listing links straight here.
    return render_template("privacy.html")


@app.route("/.well-known/assetlinks.json")
def assetlinks():
    # Digital Asset Links: proves this site and the Play app com.kinguard.app
    # belong to the same owner. Without it the TWA opens inside a browser tab
    # with the address bar showing, instead of looking like an installed app.
    # Kept in static/ rather than a literal .well-known directory so the file is
    # visible and editable in the PythonAnywhere Files tab.
    #
    # The fingerprint must match the certificate Play actually ships the app
    # with. If Play App Signing is enabled, that is the *app signing* key from
    # Play Console (Setup > App integrity), NOT the upload key — listing only
    # the upload key silently fails verification. Extra fingerprints can simply
    # be added to the array.
    return send_from_directory(app.static_folder, "assetlinks.json",
                               mimetype="application/json")


@app.route("/delete-account")
def delete_account_info():
    # Play requires the account-deletion path to be discoverable from OUTSIDE the
    # app as well as inside it, so this must stay reachable without logging in —
    # somebody who cannot get into their account still has to be able to find it.
    # This URL is the one given to Google in the Data Safety form.
    return render_template("delete-account.html")


# ---------- auth API ----------
@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json(force=True, silent=True) or {}
    email = _norm_email(data.get("email"))
    pw = data.get("password") or ""
    if "@" not in email or "." not in email:
        return jsonify(error="Please enter a valid email address."), 400
    if len(pw) < MIN_PASSWORD_LEN:
        return jsonify(error="Password must be at least %d characters." % MIN_PASSWORD_LEN), 400
    with closing(get_db()) as con, con:
        if con.execute("SELECT 1 FROM accounts WHERE email=?", (email,)).fetchone():
            return jsonify(error="That email is already registered."), 409
        cur = con.execute(
            "INSERT INTO accounts (email, password_hash, created_at) VALUES (?,?,?)",
            (email, generate_password_hash(pw), int(time.time())))
        aid = cur.lastrowid
    _start_session(aid, 1)
    return jsonify(ok=True)


@app.route("/api/login", methods=["POST"])
def api_login():
    key = _client_key()
    if not login_allowed(key):
        return jsonify(error="Too many attempts. Please wait a few minutes."), 429
    data = request.get_json(force=True, silent=True) or {}
    email = _norm_email(data.get("email"))
    pw = data.get("password") or ""
    with closing(get_db()) as con:
        row = con.execute("SELECT * FROM accounts WHERE email=?", (email,)).fetchone()
    if row is None or not check_password_hash(row["password_hash"], pw):
        login_record_fail(key)
        return jsonify(error="Wrong email or password."), 401
    _start_session(row["id"], row["session_version"])
    return jsonify(ok=True)


@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify(ok=True)


@app.route("/api/me")
@api_login_required
def api_me():
    with closing(get_db()) as con:
        rows = con.execute(
            "SELECT pair, senior_name FROM settings WHERE owner_account_id=? ORDER BY rowid",
            (g.account["id"],)).fetchall()
    return jsonify(email=g.account["email"], csrf=session.get("csrf", ""),
                   pairs=[{"pair": r["pair"], "senior_name": r["senior_name"] or ""}
                          for r in rows])


@app.route("/api/account", methods=["DELETE"])
@api_login_required
def api_delete_account():
    """Permanently delete this account and everything it owns.

    Google Play requires a real deletion that the user can start from inside the
    app — deactivating or freezing an account does not satisfy the policy — so
    every row goes here and nothing is kept.

    The password is re-checked even though the caller is already logged in. This
    is not the usual ceremony: deleting a family account also revokes the senior
    device tokens, which silently kills the SOS button on the senior's phone.
    Whoever is holding an unlocked family phone should not be able to do that to
    someone else in two taps. Rate-limited on the same counter as login so this
    route can't be used to guess a password either.
    """
    key = _client_key()
    if not login_allowed(key):
        return jsonify(error="Too many attempts. Please wait a few minutes."), 429
    data = request.get_json(force=True, silent=True) or {}
    if not check_password_hash(g.account["password_hash"], data.get("password") or ""):
        login_record_fail(key)
        return jsonify(error="Wrong password."), 401

    aid = g.account["id"]
    with closing(get_db()) as con, con:
        # Child rows are keyed by pair, not by account, so collect the owned
        # pairs first and clear each stream before the settings rows go.
        pairs = [r["pair"] for r in con.execute(
            "SELECT pair FROM settings WHERE owner_account_id=?", (aid,)).fetchall()]
        for p in pairs:
            con.execute("DELETE FROM alerts         WHERE pair=?", (p,))
            con.execute("DELETE FROM senior_devices WHERE pair=?", (p,))
            con.execute("DELETE FROM push_subs      WHERE pair=?", (p,))
        con.execute("DELETE FROM settings WHERE owner_account_id=?", (aid,))
        con.execute("DELETE FROM accounts WHERE id=?", (aid,))
    session.clear()
    return jsonify(ok=True)


# ---------- settings API (family, owner-only) ----------
@app.route("/api/settings")
@api_login_required
def get_settings():
    pair = req_pair()
    if not pair:
        return jsonify(dict(DEFAULT_SETTINGS))
    with closing(get_db()) as con:
        row = own_pair(con, g.account["id"], pair)
    if row is None:
        return jsonify(dict(DEFAULT_SETTINGS))
    return jsonify(settings_dict(row))


@app.route("/api/settings", methods=["POST"])
@api_login_required
def save_settings():
    data = request.get_json(force=True, silent=True) or {}
    senior_phone = _clean_phone(data.get("senior_phone"))
    if not senior_phone:
        return jsonify(error="senior phone required"), 400
    raw_conds = data.get("conditions")
    raw_conds = raw_conds if isinstance(raw_conds, list) else []
    conds = list(dict.fromkeys(c for c in raw_conds if c in ALLOWED_CONDITIONS))
    cset = set(conds)
    big_text = 1 if ("vision" in cset or "tremor" in cset) else 0
    high_contrast = 1 if "vision" in cset else 0
    auto_speak = 1 if "vision" in cset else 0
    vibrate = 1 if "hearing" in cset else 0
    simple_mode = 1 if "memory" in cset else 0
    lang = data.get("lang")
    lang = lang if lang in ALLOWED_LANGS else DEFAULT_LANG
    aid = g.account["id"]
    with closing(get_db()) as con, con:
        # Edit an existing pair only if this account owns it; otherwise create a
        # brand-new owned pair with a fresh random id.
        incoming = clean_token(data.get("pair"))
        pair = incoming if (incoming and own_pair(con, aid, incoming)) else new_token(16)
        con.execute(
            """INSERT INTO settings
                  (pair, owner_account_id, senior_name, senior_phone,
                   family_name, family_phone, conditions, big_text, high_contrast,
                   vibrate, auto_speak, simple_mode, lang)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(pair) DO UPDATE SET
                  senior_name=excluded.senior_name, senior_phone=excluded.senior_phone,
                  family_name=excluded.family_name, family_phone=excluded.family_phone,
                  conditions=excluded.conditions, big_text=excluded.big_text,
                  high_contrast=excluded.high_contrast, vibrate=excluded.vibrate,
                  auto_speak=excluded.auto_speak, simple_mode=excluded.simple_mode,
                  lang=excluded.lang""",
            (
                pair, aid,
                _clean_name(data.get("senior_name"), ""), enc_phone(senior_phone),
                _clean_name(data.get("family_name"), ""),
                enc_phone(_clean_phone(data.get("family_phone"))),
                ",".join(conds),
                big_text, high_contrast, vibrate, auto_speak, simple_mode, lang,
            ),
        )
        # Make sure the pair has an active senior link; hand back the token only
        # if we just created one (it can never be retrieved again).
        has_dev = con.execute(
            "SELECT 1 FROM senior_devices WHERE pair=? AND revoked_at IS NULL",
            (pair,)).fetchone()
        senior_token = None if has_dev else issue_senior_token(con, pair)
    return jsonify(ok=True, pair=pair, senior_token=senior_token)


@app.route("/api/senior-link", methods=["POST"])
@api_login_required
def regen_senior_link():
    """Revoke this pair's current senior link(s) and mint a new one."""
    data = request.get_json(force=True, silent=True) or {}
    pair = clean_token(data.get("pair"))
    with closing(get_db()) as con, con:
        if not own_pair(con, g.account["id"], pair):
            return jsonify(error="not found"), 404
        con.execute(
            "UPDATE senior_devices SET revoked_at=? WHERE pair=? AND revoked_at IS NULL",
            (int(time.time()), pair))
        tok = issue_senior_token(con, pair)
    return jsonify(ok=True, senior_token=tok)


# ---------- senior API (device-token) ----------
@app.route("/api/senior")
def senior_config():
    """Minimal config for the senior's phone — never exposes the full settings."""
    pair = device_pair()
    if not pair:
        return jsonify(error="not linked"), 401
    with closing(get_db()) as con:
        row = con.execute("SELECT * FROM settings WHERE pair=?", (pair,)).fetchone()
    if row is None:
        return jsonify(error="not linked"), 401
    s = settings_dict(row)
    return jsonify(senior_name=s["senior_name"], family_name=s["family_name"],
                   family_phone=s["family_phone"], lang=s["lang"],
                   big_text=s["big_text"], high_contrast=s["high_contrast"],
                   vibrate=s["vibrate"], auto_speak=s["auto_speak"],
                   simple_mode=s["simple_mode"])


@app.route("/api/alert", methods=["POST"])
def create_alert():
    # Authenticated by the senior device cookie (SameSite=Lax, so it is not sent
    # on cross-site POSTs — no CSRF token needed).
    pair = device_pair()
    if not pair:
        return jsonify(error="not linked"), 401
    data = request.get_json(force=True, silent=True) or {}
    rule = data.get("rule")
    if rule not in VALID_RULES:
        return jsonify(error="unknown rule"), 400
    now = int(time.time())
    with closing(get_db()) as con, con:
        con.execute(
            "UPDATE alerts SET status='resolved', resolved_at=? WHERE pair=? AND status='active'",
            (now, pair))
        cur = con.execute(
            "INSERT INTO alerts (pair, rule, created_at, status) VALUES (?, ?, ?, 'active')",
            (pair, rule, now))
        alert_id = cur.lastrowid
    if PUSH_ENABLED:
        threading.Thread(target=send_push, args=(pair, rule), daemon=True).start()
    return jsonify(id=alert_id, rule=rule)


# ---------- alert API (family, owner-only) ----------
@app.route("/api/alerts")
@api_login_required
def list_alerts():
    pair = req_pair()
    with closing(get_db()) as con:
        if not pair or not own_pair(con, g.account["id"], pair):
            return jsonify(alert=None)
        cutoff = int(time.time()) - ALERT_TTL_SECONDS
        row = con.execute(
            "SELECT id, rule, created_at FROM alerts "
            "WHERE pair=? AND status='active' AND created_at > ? ORDER BY id DESC LIMIT 1",
            (pair, cutoff)).fetchone()
    if not row:
        return jsonify(alert=None)
    return jsonify(alert={"id": row["id"], "rule": row["rule"],
                          "created_at": row["created_at"]})


@app.route("/api/resolve", methods=["POST"])
@api_login_required
def resolve_alert():
    data = request.get_json(force=True, silent=True) or {}
    pair = req_pair()
    alert_id = data.get("id")
    if isinstance(alert_id, bool) or not isinstance(alert_id, int):
        return jsonify(ok=True)
    with closing(get_db()) as con, con:
        if not own_pair(con, g.account["id"], pair):
            return jsonify(ok=True)
        con.execute(
            "UPDATE alerts SET status='resolved', resolved_at=? WHERE pair=? AND id=?",
            (int(time.time()), pair, alert_id))
    return jsonify(ok=True)


# ---------- push subscription API (family, owner-only) ----------
@app.route("/api/vapid")
@api_login_required
def vapid_public():
    return jsonify(public_key=VAPID_PUBLIC, enabled=PUSH_ENABLED)


@app.route("/api/subscribe", methods=["POST"])
@api_login_required
def subscribe():
    data = request.get_json(force=True, silent=True) or {}
    pair = req_pair()
    endpoint = data.get("endpoint")
    keys = data.get("keys") or {}
    p256dh, auth = keys.get("p256dh"), keys.get("auth")
    if not (isinstance(endpoint, str) and p256dh and auth):
        return jsonify(error="bad subscription"), 400
    with closing(get_db()) as con, con:
        if not own_pair(con, g.account["id"], pair):
            return jsonify(error="not found"), 404
        con.execute(
            "INSERT INTO push_subs (endpoint, pair, p256dh, auth, created_at) "
            "VALUES (?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET "
            "pair=excluded.pair, p256dh=excluded.p256dh, auth=excluded.auth",
            (endpoint[:1000], pair, str(p256dh)[:200], str(auth)[:100], int(time.time())))
    return jsonify(ok=True)


@app.route("/api/unsubscribe", methods=["POST"])
@api_login_required
def unsubscribe():
    data = request.get_json(force=True, silent=True) or {}
    endpoint = data.get("endpoint")
    if isinstance(endpoint, str):
        with closing(get_db()) as con, con:
            con.execute("DELETE FROM push_subs WHERE endpoint=?", (endpoint,))
    return jsonify(ok=True)


init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
