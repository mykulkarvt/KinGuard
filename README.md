# 🛡️ KinGuard — परिवार की सुरक्षा (high-school project build)

A simple vernacular scam-protection tool for elderly users — in **Hindi, Telugu,
and English** — with a **family-in-the-loop** alert and an **accessibility setup**
for age-related needs.

When a senior reports a suspicious situation, a calm warning shows on their phone
*and* an alert appears on a family member's phone over the internet.

## What's in it

1. **Setup** (`/setup`) — the family member does this **once**: enters names,
   phone numbers, picks the **language** (हिन्दी / తెలుగు / English), and ticks the
   senior's needs (hard of hearing / low vision / shaky hands / memory). Those
   needs automatically turn on the right accessibility mode — the senior never
   has to configure anything.
2. **Senior's phone** (`/senior`) — a big "I'm scared" button + 5 common scam
   situations in Hindi. Tapping one shows a calm verdict ("यह धोखा है"), the
   steps to take, reads it aloud, and can call family / 1930.
3. **Family phone** (`/family`) — the moment the senior taps, an alert appears:
   *what* they reported, *why* it's dangerous, and *what to say to them*, with
   one tap to call, report, or resolve.

## Accessibility modes (set automatically from Setup)

| Need ticked in Setup | What turns on |
|----------------------|---------------|
| 🦻 Hard of hearing   | Phone **vibrates** on alerts (doesn't rely on sound); text always shown |
| 👓 Low vision        | **Big text**, **high contrast**, and the warning is **read aloud automatically** |
| ✋ Shaky hands        | **Bigger** text and buttons |
| 🧠 Memory / confusion | **Simple mode** — only the one big panic button is shown |

Also built in for everyone: screen-reader labels (Android TalkBack), large tap
targets, single-tap actions (no swipes/long-press), and the family's phone always
vibrates when an alert comes in.

## How to run

```bash
pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:5000/` in your browser. You'll see a **role picker**:
do **Setup** first (family enters names + language + needs), then each phone picks
“Senior” or “Family.” The choice is remembered.

## Push notifications — alerts even when the app is closed

By default the family phone only sees alerts while `/family` is **open** (it
checks every 3 seconds). Web Push adds a real system notification that arrives
**even when KinGuard is closed**.

**The family must turn it on once — and grant permission:**
1. Open `/family`.
2. Tap **🔔 “Get alerts even when closed.”**
3. On the browser prompt, tap **“Allow.”** ← easy to miss; without this, no
   notifications are delivered.
4. The button changes to **“Alerts are on.”** From then on, the senior's alerts
   buzz the family phone even with the app closed.

What it needs to actually deliver:
- **HTTPS** *and* a host with **open outbound network** (so the server can reach
  the browser's push service). Works on Render / Fly / Railway and on
  `localhost` for testing — but **not on free PythonAnywhere**, which blocks the
  outbound send.
- VAPID keys: run `python gen_vapid.py` once and set the printed values as the
  env vars `VAPID_PUBLIC`, `VAPID_PRIVATE`, `VAPID_SUBJECT` on the host. (With no
  env vars set, a temporary dev key pair is generated so it's testable locally.)
- **iPhone:** push only works if the family adds the PWA to the **Home Screen**
  (iOS 16.4+). Android Chrome works in the browser directly.
- On a **desktop**, a notification only arrives if the browser is still running
  (a closed tab is fine; a fully-quit browser may not receive it). The
  “app fully closed and it still buzzes” experience is the **real-phone** case.

### Install it as an app (PWA)
This is now an installable app. On each phone, open the site in Chrome, then
**menu → Add to Home screen**. It installs with an icon and opens fullscreen
like a real app. The senior's phone picks “Senior”; the family phone picks
“Family.” Tap ↻ in the footer to switch roles.

**Important for real use:** the senior and family are usually in different homes,
so the “same Wi-Fi” trick only works for local testing. For two real phones
anywhere, the server must be **hosted on the public internet** (e.g. PythonAnywhere)
so both phones can reach it. Then both install the app from that public URL.

## Files

| File | What it is |
|------|------------|
| `app.py` | Flask server: pages + alert API + settings API + push API, stores data in SQLite |
| `templates/setup.html` | onboarding (family sets names + language + accessibility) |
| `templates/senior.html` | the senior's screen (applies accessibility settings) |
| `templates/family.html` | the family member's screen (polls + push subscribe) |
| `templates/index.html` | a chooser landing page |
| `static/rules.js` | all scam rules **and** UI text, per language (हिन्दी / తెలుగు / English) |
| `static/style.css` | shared styling + the accessibility modes |
| `static/manifest.json` | makes it installable as an app (PWA) |
| `static/sw.js` | service worker — installability, offline shell, **push notifications** (never caches alerts) |
| `static/icon-192.png`, `icon-512.png` | app icons |
| `gen_vapid.py` | one-time generator for the Web Push (VAPID) keys |
| `requirements.txt` / `Procfile` | dependencies + start command for hosting (e.g. Render) |
| `kinguard.db` | created automatically on first run |

## Honest limitations 

- **The alert needs internet** on both phones. (A no-internet version could send
  an SMS instead, since SMS uses the cellular network, not data.)
- **It still needs the senior to tap.** During a live scam call the phone is busy,
  so a one-tap action is the realistic move — an app can't silently hear the call.
- **Vibration** works on Android browsers; iPhone Safari ignores it.
- **The translations are a first draft** — have a fluent speaker review each
  language (especially Telugu) before relying on it.
- **Verify the facts** (the 1930 helpline; that "digital arrest" has no legal
  basis) before relying on them.
- **Push needs the right host.** In-app polling works anywhere, but push
  notifications (alerts when the app is closed) need HTTPS + open outbound
  network — so they work on Render/Fly/Railway, **not** on free PythonAnywhere.
- **Push delivery isn't guaranteed when fully offline** — a closed device only
  gets a queued alert if it comes back within ~2 minutes (the push TTL).
- Uses Flask's development server — fine for a project/demo, not production.

## Possible next steps

- Add an SMS fallback for the offline / no-data case.
- Add more languages by extending `rules.js` (one dictionary entry per language).
- A larger text-size slider the senior can adjust themselves.
- Persist data in Postgres instead of SQLite for hosts with an ephemeral disk.
