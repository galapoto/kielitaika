"""Context compression helpers."""


def compress_messages(messages: list) -> str:
    """Summarize messages into a compact string."""
    if not messages:
        return ""
    # Simple heuristic: join last few exchanges with role markers.
    parts = [f"{m.get('role')}: {m.get('content')}" for m in messages[-6:]]
    return " | ".join(parts)
