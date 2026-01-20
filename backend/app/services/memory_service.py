"""Lightweight memory placeholders."""

from typing import List

from app.utils.compression import compress_messages


_IN_MEMORY_STORE: dict[str, list[dict]] = {}


async def compress_context(user_id: str | None) -> str:
    """Return summarized context for a user session."""
    messages = await get_recent_messages(user_id)
    if not messages:
        return "No prior context."
    return compress_messages(messages)


async def save_message(user_id: str | None, role: str, content: str) -> None:
    """Persist a message for the user (in-memory stub)."""
    key = user_id or "anonymous"
    _IN_MEMORY_STORE.setdefault(key, []).append({"role": role, "content": content})


async def get_recent_messages(user_id: str | None, limit: int = 10) -> List[dict]:
    """Fetch recent messages for prompt building."""
    key = user_id or "anonymous"
    messages = _IN_MEMORY_STORE.get(key, [])
    return messages[-limit:]
