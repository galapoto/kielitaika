import json
from hashlib import sha256


def stable_value(value):
    if isinstance(value, dict):
        return {key: stable_value(value[key]) for key in sorted(value)}

    if isinstance(value, list):
        return [stable_value(item) for item in value]

    return value


def stable_serialize(value):
    return json.dumps(
        stable_value(value),
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=True,
    )


def deterministic_hash(value):
    return sha256(stable_serialize(value).encode("utf-8")).hexdigest()
