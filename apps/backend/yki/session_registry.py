from __future__ import annotations

from yki.contracts import OrchestratedSession


class SessionRegistry:
    def __init__(self):
        self._sessions: dict[str, OrchestratedSession] = {}
        self._latest_session_id: str | None = None

    def save(self, session: OrchestratedSession):
        self._sessions[session.session_id] = session
        self._latest_session_id = session.session_id

    def get(self, session_id: str) -> OrchestratedSession | None:
        return self._sessions.get(session_id)

    def get_latest(self) -> OrchestratedSession | None:
        if not self._latest_session_id:
            return None
        return self._sessions.get(self._latest_session_id)

    def delete(self, session_id: str):
        self._sessions.pop(session_id, None)
        if self._latest_session_id == session_id:
            self._latest_session_id = next(reversed(self._sessions), None) if self._sessions else None
