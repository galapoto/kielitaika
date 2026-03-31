import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path

from utils.hash_utils import stable_serialize, stable_value

RUNTIME_DIR = Path(__file__).resolve().parents[1] / "runtime"
SQLITE_PATH = Path(
    os.getenv("KIELITAIKA_RUNTIME_DB_PATH", str(RUNTIME_DIR / "kielitaika_runtime.sqlite3"))
)


def _ensure_runtime_directory():
    SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)


def _current_timestamp():
    return datetime.now(UTC).isoformat()


def _connect():
    _ensure_runtime_directory()
    connection = sqlite3.connect(SQLITE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA foreign_keys=ON")
    connection.execute("PRAGMA synchronous=FULL")
    return connection


def initialize_storage():
    with _connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS runtime_counters (
                counter_name TEXT PRIMARY KEY,
                counter_value INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS audit_events (
                sequence_id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT NOT NULL UNIQUE,
                session_id TEXT,
                user_id TEXT,
                timestamp TEXT NOT NULL,
                event_type TEXT NOT NULL,
                trace_id TEXT,
                request_payload_hash TEXT NOT NULL,
                response_payload_hash TEXT NOT NULL,
                contract_version TEXT NOT NULL,
                session_hash TEXT,
                task_sequence_hash TEXT,
                payload_json TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_audit_events_session_id
            ON audit_events(session_id, sequence_id);

            CREATE INDEX IF NOT EXISTS idx_audit_events_user_id
            ON audit_events(user_id, sequence_id);

            CREATE TABLE IF NOT EXISTS certifications (
                session_id TEXT PRIMARY KEY,
                final_result_hash TEXT NOT NULL,
                certification_record_json TEXT NOT NULL,
                export_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS yki_practice_sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                is_certified INTEGER NOT NULL DEFAULT 0,
                payload_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )


@contextmanager
def transaction():
    initialize_storage()
    connection = _connect()
    try:
        connection.execute("BEGIN IMMEDIATE")
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _json_load(row, key: str):
    return stable_value(json.loads(row[key]))


def next_counter_value(counter_name: str, connection=None):
    if connection is None:
        with transaction() as transactional_connection:
            return next_counter_value(counter_name, transactional_connection)

    existing = connection.execute(
        "SELECT counter_value FROM runtime_counters WHERE counter_name = ?",
        (counter_name,),
    ).fetchone()
    if existing is None:
        next_value = 1
        connection.execute(
            "INSERT INTO runtime_counters(counter_name, counter_value) VALUES(?, ?)",
            (counter_name, next_value),
        )
        return next_value

    next_value = int(existing["counter_value"]) + 1
    connection.execute(
        "UPDATE runtime_counters SET counter_value = ? WHERE counter_name = ?",
        (next_value, counter_name),
    )
    return next_value


def insert_audit_event(event: dict, connection=None):
    payload_json = stable_serialize(event)
    if connection is None:
        with transaction() as transactional_connection:
            insert_audit_event(event, transactional_connection)
        return

    connection.execute(
        """
        INSERT INTO audit_events(
            event_id,
            session_id,
            user_id,
            timestamp,
            event_type,
            trace_id,
            request_payload_hash,
            response_payload_hash,
            contract_version,
            session_hash,
            task_sequence_hash,
            payload_json
        )
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            event["event_id"],
            event.get("session_id"),
            event.get("user_id"),
            event["timestamp"],
            event["event_type"],
            event.get("trace_id"),
            event["request_payload_hash"],
            event["response_payload_hash"],
            event["contract_version"],
            event.get("session_hash"),
            event.get("task_sequence_hash"),
            payload_json,
        ),
    )


def read_audit_events(*, session_id: str | None = None, user_id: str | None = None, connection=None):
    if connection is None:
        initialize_storage()
        with _connect() as db:
            return read_audit_events(session_id=session_id, user_id=user_id, connection=db)

    query = "SELECT payload_json FROM audit_events"
    params = []
    conditions = []
    if session_id is not None:
        conditions.append("session_id = ?")
        params.append(session_id)
    if user_id is not None:
        conditions.append("user_id = ?")
        params.append(user_id)
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY sequence_id ASC"

    rows = connection.execute(query, params).fetchall()
    return [stable_value(json.loads(row["payload_json"])) for row in rows]


def get_last_audit_event(stream_key: str, connection=None):
    events = read_audit_events(connection=connection)
    for event in reversed(events):
        current_stream_key = (
            f"session:{event['session_id']}"
            if event.get("session_id")
            else f"user:{event['user_id']}" if event.get("user_id") else "global:runtime"
        )
        if current_stream_key == stream_key:
            return event
    return None


def insert_certification_record(session_id: str, stored_record: dict, connection=None):
    certification_record = stored_record["certification_record"]
    payload_json = stable_serialize(certification_record)
    export_json = stable_serialize(stored_record["export"])
    if connection is None:
        with transaction() as transactional_connection:
            insert_certification_record(session_id, stored_record, transactional_connection)
        return

    connection.execute(
        """
        INSERT INTO certifications(
            session_id,
            final_result_hash,
            certification_record_json,
            export_json,
            created_at
        )
        VALUES(?, ?, ?, ?, ?)
        """,
        (
            session_id,
            stored_record["final_result_hash"],
            payload_json,
            export_json,
            stored_record["stored_at"],
        ),
    )


def read_certification_record(session_id: str, connection=None):
    if connection is None:
        initialize_storage()
        with _connect() as db:
            return read_certification_record(session_id, db)

    row = connection.execute(
        """
        SELECT final_result_hash, certification_record_json, export_json, created_at
        FROM certifications
        WHERE session_id = ?
        """,
        (session_id,),
    ).fetchone()
    if row is None:
        return None

    certification_record = stable_value(json.loads(row["certification_record_json"]))
    export_payload = stable_value(json.loads(row["export_json"]))
    return {
        "certification_record": certification_record,
        "final_result_hash": row["final_result_hash"],
        "stored_at": row["created_at"],
        "export": export_payload,
    }


def list_certifications_for_user(user_id: str, connection=None):
    if connection is None:
        initialize_storage()
        with _connect() as db:
            return list_certifications_for_user(user_id, db)

    rows = connection.execute(
        "SELECT certification_record_json FROM certifications ORDER BY created_at ASC"
    ).fetchall()
    records = []
    for row in rows:
        record = stable_value(json.loads(row["certification_record_json"]))
        if record.get("user_id") == user_id:
            records.append(record)
    return records


def upsert_practice_session(session_id: str, payload: dict, *, is_certified: bool, connection=None):
    payload_json = stable_serialize(payload)
    if connection is None:
        with transaction() as transactional_connection:
            upsert_practice_session(
                session_id,
                payload,
                is_certified=is_certified,
                connection=transactional_connection,
            )
        return

    connection.execute(
        """
        INSERT INTO yki_practice_sessions(session_id, user_id, is_certified, payload_json, updated_at)
        VALUES(?, ?, ?, ?, ?)
        ON CONFLICT(session_id) DO UPDATE SET
            user_id = excluded.user_id,
            is_certified = excluded.is_certified,
            payload_json = excluded.payload_json,
            updated_at = excluded.updated_at
        """,
        (
            session_id,
            payload["user_id"],
            1 if is_certified else 0,
            payload_json,
            payload.get("updated_at")
            or payload.get("stored_at")
            or payload.get("timestamp")
            or _current_timestamp(),
        ),
    )


def read_practice_session(session_id: str, connection=None):
    if connection is None:
        initialize_storage()
        with _connect() as db:
            return read_practice_session(session_id, db)

    row = connection.execute(
        "SELECT payload_json FROM yki_practice_sessions WHERE session_id = ?",
        (session_id,),
    ).fetchone()
    if row is None:
        return None
    return stable_value(json.loads(row["payload_json"]))


def read_all_practice_sessions(connection=None):
    if connection is None:
        initialize_storage()
        with _connect() as db:
            return read_all_practice_sessions(db)

    rows = connection.execute(
        "SELECT payload_json FROM yki_practice_sessions ORDER BY updated_at ASC"
    ).fetchall()
    return [stable_value(json.loads(row["payload_json"])) for row in rows]


def export_session_bundle(session_id: str):
    return {
        "session": read_practice_session(session_id),
        "audit_events": read_audit_events(session_id=session_id),
        "certification": read_certification_record(session_id),
    }


def restore_session_bundle(bundle: dict, connection=None):
    if connection is None:
        with transaction() as transactional_connection:
            restore_session_bundle(bundle, transactional_connection)
        return

    session = bundle.get("session")
    if session:
        upsert_practice_session(
            session["session_id"],
            session,
            is_certified=bool(bundle.get("certification")),
            connection=connection,
        )

    for event in bundle.get("audit_events") or []:
        existing = connection.execute(
            "SELECT 1 FROM audit_events WHERE event_id = ?",
            (event["event_id"],),
        ).fetchone()
        if not existing:
            insert_audit_event(event, connection)

    certification = bundle.get("certification")
    if certification:
        existing = connection.execute(
            "SELECT 1 FROM certifications WHERE session_id = ?",
            (certification["certification_record"]["session_id"],),
        ).fetchone()
        if not existing:
            insert_certification_record(
                certification["certification_record"]["session_id"],
                certification,
                connection,
            )


def reset_storage():
    for suffix in ("", "-wal", "-shm"):
        candidate = Path(f"{SQLITE_PATH}{suffix}")
        if candidate.exists():
            candidate.unlink()
