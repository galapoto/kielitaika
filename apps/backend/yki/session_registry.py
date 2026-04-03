from __future__ import annotations

from yki.contracts import OrchestratedSession


class SessionRegistry:
    def __init__(self):
        self._sessions: dict[str, OrchestratedSession] = {}

    def save(self, session: OrchestratedSession):
        self._sessions[session.session_id] = session

    def get(self, session_id: str) -> OrchestratedSession | None:
        return self._sessions.get(session_id)

    def delete(self, session_id: str):
        self._sessions.pop(session_id, None)
