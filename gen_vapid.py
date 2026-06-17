"""
Generate a VAPID key pair for Web Push, ONCE.

Run:  python gen_vapid.py

Copy the two printed values into your host's environment variables
(VAPID_PUBLIC, VAPID_PRIVATE) and set VAPID_SUBJECT to a mailto: address.
Keep VAPID_PRIVATE secret. Do NOT regenerate after people have subscribed —
changing the keys invalidates every existing push subscription.
"""
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization


def b64u(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


key = ec.generate_private_key(ec.SECP256R1())
# Private key stored as the raw 32-octet integer (what py_vapid.from_string wants).
private = b64u(key.private_numbers().private_value.to_bytes(32, "big"))
# Public key in uncompressed form = the browser's applicationServerKey.
public = b64u(
    key.public_key().public_bytes(
        serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint
    )
)

print("VAPID_PUBLIC =", public)
print("VAPID_PRIVATE =", private)
print("VAPID_SUBJECT = mailto:you@example.com")
