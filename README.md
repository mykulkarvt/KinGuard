# KinGuard

Scam protection for elderly parents and grandparents, with a family member in the loop. Built first for India, with United States support added for the same scam patterns under their US names.

Live at **https://mykit.pythonanywhere.com** · [How it works](https://mykit.pythonanywhere.com/how-it-works)

## The problem

Scams aimed at older people in India are organised and convincing. Callers
pretend to be police and threaten a "digital arrest". They ask for money to be
moved to a "safe account" for verification. They clone a family member's voice
and beg for help. The victim is isolated on the phone with someone pressuring
them, and the advice they need is simple: hang up, send nothing, call your
family. But it is very hard to remember that while it is happening.

Most apps try to block scams automatically. That does not work well, because
the scam happens inside a normal phone call. KinGuard takes a different route:
it does not try to detect anything. It gives the elder one button, and it
brings their family into the conversation within seconds.

The same five scams run in the United States under different names and cost
victims there an estimated $7.7 billion a year. "Digital arrest" becomes
government impersonation. The "safe account" scam is what the FBI calls the
"phantom hacker" scam. The playbook is the same; only the badge is different.

## How it works

There are two phones.

**The elder's phone** shows one large red button and five common scam
situations. There is no account and no password. They never log in. Tapping a
situation tells them plainly that it is a scam, what to do right now, and reads
it aloud if they need that.

**The family member's phone** gets an alert the moment the elder taps. It shows
what was reported, why it is dangerous, and three specific things to say to
them, so the family member does not have to think of the words while worried.
One tap calls the elder. Another reports it: to 1930, India's cybercrime
helpline, or, for a US family, to the AARP Fraud Watch helpline plus the FTC
and FBI's online reporting, since the US has no single 24-hour number.

The family member does a five minute setup once, then sends the elder a private
link. That link pairs the elder's phone for good.

## Languages

The whole app, including the spoken warnings, runs in **Hindi, Telugu, Kannada,
Tamil and English**. The family member picks the language during setup and the
elder's phone opens entirely in it.

Adding a language means one entry in `static/rules.js` and nothing else. No
template changes.

## Countries

KinGuard currently supports **India and the United States**. During setup the
family member picks a country as well as a language, and that choice decides
the scam catalogue, the emergency number, and how to report a scam. These
vary by country, not by language, so they are kept as a separate table.
Adding a country means one entry in the `COUNTRIES` table in
`static/rules.js` plus the matching scam catalogue.

## Accessibility

During setup the family member ticks what the elder finds difficult. The
elder's phone then opens that way by itself, with nothing for them to configure.

| Ticked in setup | What the elder's phone does |
|---|---|
| Hard of hearing | Vibrates on an alert (Android only, see limitations) |
| Trouble seeing | Large text, high contrast, reads everything aloud |
| Shaky hands | Even larger buttons |
| Memory or confusion | Simple mode: one big button, nothing else |

## Privacy and security

- Both phone numbers are **encrypted before being stored**, using Fernet.
- Passwords are stored only as a hash.
- Every pair of phones is **owned by one account**, and every settings and
  alert endpoint checks that ownership, so no account can read another
  family's data.
- The elder's phone is authenticated by a **revocable device token** held in an
  HttpOnly cookie, not by a login. The family can rotate it at any time.
- **Account deletion is in the app** and removes everything with no copy kept:
  login, setup, alert history, the elder's link and any notification
  subscriptions.
- KinGuard does not read messages, listen to calls, or track location. The
  elder chooses what to report, by pressing a button.

[Privacy policy](https://mykit.pythonanywhere.com/privacy) ·
[Deleting your account](https://mykit.pythonanywhere.com/delete-account)

## Running it locally

```bash
pip install -r requirements.txt
python app.py           # http://127.0.0.1:5000
```

Set these in production. Without them the app still runs, but logins reset on
restart and stored phone numbers become unreadable.

| Variable | What it does |
|---|---|
| `KINGUARD_SECRET_KEY` | Signs the session cookie |
| `KINGUARD_DB_KEY` | Fernet key for encrypting phone numbers |
| `VAPID_PUBLIC` / `VAPID_PRIVATE` | Web Push keys, from `gen_vapid.py` |
| `VAPID_SUBJECT` | Contact address for the push service |
| `KINGUARD_ADMIN_EMAIL` | Which account may see `/stats` |

Rotating `KINGUARD_DB_KEY` makes every stored phone number permanently
unreadable, and changing the VAPID keys invalidates every existing
notification subscription.

## Alerts when the app is closed

KinGuard uses Web Push, so an alert reaches the family phone even if the app is
shut. This needs HTTPS, and the family member has to turn it on once by tapping
**Get alerts even when closed**.

On iPhone, Apple only allows this for apps added to the Home Screen, and only
on iOS 16.4 or later. The app detects that case and explains it rather than
hiding the option with no reason.

## Installing it

Android users can install from Google Play, where KinGuard is a Trusted Web
Activity wrapping the live site. Anyone can also install it straight from the
browser: **Add to Home Screen** on iPhone, or Chrome's install prompt on
Android. Both give a normal app icon and work offline for the parts that
matter.

## Files

| File | What it is |
|---|---|
| `app.py` | The whole backend: accounts, pairing, alerts, push, encryption |
| `static/rules.js` | Every scam rule and every piece of UI text, per language and per country |
| `static/sw.js` | Service worker: offline shell and push notifications |
| `static/style.css` | All styling, including the accessibility modes |
| `templates/` | The elder screen, family screen, setup, and public pages |
| `gen_vapid.py` | Generates the Web Push key pair, run once |

## Honest limitations

- **There is no password reset.** A family member who forgets their password is
  locked out, and because deletion re-checks the password, they cannot delete
  their account either. The host's free tier blocks outbound mail, so this
  needs either a paid tier or a recovery code at signup. It is the biggest
  outstanding gap.
- **Alerts when closed have to be switched on per family.** Until someone taps
  that button, an alert raised while the app is shut reaches nobody. The app
  looks like it is working and is not.
- **Vibration does not work on iPhone.** Safari has no vibration API, so the
  hard-of-hearing setting does nothing there. Everything else works.
- **An alert needs internet on both phones.** A version using SMS would work
  without data, since SMS runs on the cellular network.
- **The translations need a native speaker's review.** These are safety
  messages read by a frightened person, and they should not be trusted until
  checked.
- **The US scam catalogue is new and needs a closer review** against current
  FTC/FBI guidance before being fully trusted. Only English is available for
  the US; Spanish is not yet built.
- **Push delivery is not guaranteed to a device that is fully offline.** A
  closed phone only receives a queued alert if it reconnects within about two
  minutes.

## Possible next steps

- A recovery code issued at signup, so a locked-out user can get back in
- A practice alert, so a family can see the whole loop work before a real one
- A pairing code, so the elder's phone can be set up without sending a link
- SMS fallback for alerts when there is no internet
