import json
from datetime import datetime

try:
    import redis
except ImportError:  # pragma: no cover - exercised via fallback at runtime
    redis = None


class SessionStorage:
    def create(self, session):
        raise NotImplementedError

    def get(self, session_id):
        raise NotImplementedError

    def get_meta(self, session_id):
        raise NotImplementedError

    def update(self, session_id, session):
        raise NotImplementedError

    def upsert_history_summary(self, user_id, summary):
        raise NotImplementedError

    def get_history(self, user_id):
        raise NotImplementedError


_sessions = {}
_history = {}


class InMemorySessionStorage(SessionStorage):
    def create(self, session):
        _sessions[session["sessionId"]] = session

    def get(self, session_id):
        return _sessions.get(session_id)

    def get_meta(self, session_id):
        return None

    def update(self, session_id, session):
        _sessions[session_id] = session

    def upsert_history_summary(self, user_id, summary):
        history = _history.setdefault(user_id, [])
        for index, existing in enumerate(history):
            if existing["session_id"] == summary["session_id"]:
                history[index] = summary
                return
        history.append(summary)

    def get_history(self, user_id):
        return list(_history.get(user_id, []))


class RedisSessionStorage(SessionStorage):
    def __init__(self):
        if redis is None:
            raise RuntimeError("redis client not installed")

        self.client = redis.Redis(
            host="localhost",
            port=6379,
            decode_responses=True,
        )
        self.client.ping()

    def _get_session_ttl(self, session):
        expires_at = datetime.fromisoformat(session["timing"]["expiresAt"])
        ttl = int((expires_at - datetime.utcnow()).total_seconds())
        if ttl < 0:
            ttl = 1
        return ttl

    def create(self, session):
        ttl = self._get_session_ttl(session)
        self.client.set(session["sessionId"], json.dumps(session), ex=ttl)
        self.client.set(
            f"session_meta:{session['sessionId']}",
            session["timing"]["expiresAt"],
            ex=ttl + 60,
        )

    def get(self, session_id):
        data = self.client.get(session_id)
        if not data:
            return None
        return json.loads(data)

    def get_meta(self, session_id):
        return self.client.get(f"session_meta:{session_id}")

    def update(self, session_id, session):
        ttl = self._get_session_ttl(session)
        self.client.set(session_id, json.dumps(session), ex=ttl)

    def upsert_history_summary(self, user_id, summary):
        key = f"user_history:{user_id}"
        existing = self.get_history(user_id)

        updated = False
        for index, stored_summary in enumerate(existing):
            if stored_summary["session_id"] == summary["session_id"]:
                existing[index] = summary
                updated = True
                break

        if not updated:
            existing.append(summary)

        self.client.set(key, json.dumps(existing))

    def get_history(self, user_id):
        data = self.client.get(f"user_history:{user_id}")
        if not data:
            return []
        return json.loads(data)
