"""Security helpers placeholder."""

import hashlib


def hash_token(value: str) -> str:
    """Return a simple hash; replace with proper JWT logic later."""
    return hashlib.sha256(value.encode("utf-8")).hexdigest()
