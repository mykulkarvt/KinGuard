# KinGuard — Security notes

KinGuard stores personal data for a senior and a family member (phone numbers,
names, and accessibility needs) and records scam alerts. This document describes
what is protected, how, and the known limits.

## Data collected
- **Phone numbers** (senior + family) — personal data.
- **Names** and the **accessibility needs** chosen at setup (vision / hearing /
  tremor / memory — the last is sensitive).
- **Alert history** — when a senior reported a scam (sensitive behavioural data).

## Access model
Access is by **identity**, not by knowing a link:

- **Family member** — has an account (email + password) and logs in. Every pair
  of phones is *owned* by an account. The settings and alert APIs check that
  ownership, so an account can only read or change its own pair(s).
- **Senior's phone** — never logs in. It holds a long-lived, **revocable device
  token**, delivered once through the family's private setup link and then kept
  in an `HttpOnly` cookie. The family can revoke/rotate it from Setup.
- **Pair id** is a random 128-bit token, never the phone number, so the APIs
  cannot be enumerated.

## Protections in place
- **Passwords** hashed with Werkzeug (PBKDF2). Never stored in the clear.
- **Sessions**: signed cookies, `HttpOnly` + `SameSite=Lax` + `Secure` (HTTPS).
  Bumping an account's `session_version` logs every device out.
- **CSRF**: family write endpoints require a matching `X-CSRF-Token`. The
  senior's alert POST relies on a `SameSite=Lax` cookie (not sent cross-site).
- **Phone numbers encrypted at rest** (Fernet). A leaked DB file exposes no
  readable numbers.
- **Device tokens stored hashed** (SHA-256); a leaked DB yields no usable links.
  Revocation is immediate.
- **Login throttling** (per-client, in-memory) to slow brute force.
- Phone numbers never appear in URLs, server logs, or browser history.

## Required configuration (production)
Set these environment variables (e.g. in the PythonAnywhere WSGI file). If they
are missing the app still runs but uses throwaway keys, and data/logins do not
survive a restart:

- `KINGUARD_SECRET_KEY` — session signing. `python -c "import secrets;print(secrets.token_hex(32))"`
- `KINGUARD_DB_KEY` — phone-number encryption. `python -c "from cryptography.fernet import Fernet;print(Fernet.generate_key().decode())"`
  Keep this **stable** — if it changes, stored numbers can't be decrypted.

Serve only over HTTPS. The database (`kinguard.db`, `*.db.bak`) is gitignored;
keep backups protected too.

## Known limits (accepted scope)
- **No self-serve password reset** (the free host blocks outbound email); reset a
  password by editing the DB.
- **No 2FA.**
- Login throttle is in-memory (resets on restart); adequate for a single worker.
- The senior's first link travels in a URL; mitigated by exchanging it for an
  `HttpOnly` cookie immediately and cleaning the URL.
- Phishing of a family member's password is out of scope.
