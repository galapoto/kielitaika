from __future__ import annotations

import hashlib
from datetime import timedelta
from typing import Any

from ..core.config import SETTINGS
from ..core.errors import AppError
from ..core.state_store import STORE
from ..core.utils import PasswordHashError, hash_password, iso_now, new_id, normalize_email, parse_iso, utc_now, verify_password


AUTH_GUARD_KEY = "__auth__"


def auth_methods() -> list[dict[str, Any]]:
    methods = [{
        "method_id": "password",
        "kind": "password",
        "enabled": True,
        "display_name": "Email and password",
    }]
    provider_ids = list(SETTINGS.auth_provider_ids)
    if SETTINGS.google_oauth_client_id and "google" not in provider_ids:
        provider_ids.append("google")
    for provider in provider_ids:
        methods.append(
            {
                "method_id": provider,
                "kind": "provider",
                "enabled": True,
                "display_name": provider.replace("_", " ").title(),
            }
        )
    return methods


def _auth_lock_items(*items: tuple[str, str]) -> tuple[tuple[str, str], ...]:
    return (
        ("users", AUTH_GUARD_KEY),
        ("auth_sessions", AUTH_GUARD_KEY),
        ("access_tokens", AUTH_GUARD_KEY),
        ("refresh_tokens", AUTH_GUARD_KEY),
        *items,
    )


def _persist_auth_state() -> None:
    STORE.write_snapshot()


def _issue_tokens(*, user_id: str, auth_session_id: str | None = None) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    issued_at = utc_now()
    auth_session = auth_session_id or new_id("auth")
    access_token = new_id("atk")
    refresh_token = new_id("rtk")
    access_expires_at = (issued_at + timedelta(minutes=SETTINGS.access_token_minutes)).replace(microsecond=0).isoformat()
    refresh_expires_at = (issued_at + timedelta(days=SETTINGS.refresh_token_days)).replace(microsecond=0).isoformat()
    access_payload = {
        "user_id": user_id,
        "auth_session_id": auth_session,
        "expires_at": access_expires_at,
    }
    refresh_payload = {
        "user_id": user_id,
        "auth_session_id": auth_session,
        "expires_at": refresh_expires_at,
    }
    return (
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "access_expires_at": access_expires_at,
            "refresh_expires_at": refresh_expires_at,
            "auth_session_id": auth_session,
        },
        access_payload,
        refresh_payload,
    )


def _set_auth_session(*, user_id: str, auth_session_id: str) -> None:
    existing = STORE.get_ref("auth_sessions", auth_session_id) or {}
    STORE.set(
        "auth_sessions",
        auth_session_id,
        {
            "auth_session_id": auth_session_id,
            "user_id": user_id,
            "status": "active",
            "created_at": existing.get("created_at") or iso_now(),
            "updated_at": iso_now(),
            "terminated_at": None,
        },
    )


def _assert_auth_session_active(*, auth_session_id: str, user_id: str) -> None:
    session = STORE.get_ref("auth_sessions", auth_session_id)
    if not session or session.get("user_id") != user_id or session.get("status") != "active":
        raise AppError(401, "AUTH_SESSION_EXPIRED", "User session is no longer valid.", False, {"classification": "terminal"})


def _invalidate_auth_session(*, auth_session_id: str) -> dict[str, Any]:
    session = STORE.get_ref("auth_sessions", auth_session_id)
    if not session:
        raise AppError(401, "AUTH_REQUIRED", "Authentication is required.", False, {"classification": "non_retryable"})

    access_tokens = [
        token
        for token, payload in STORE._data["access_tokens"].items()
        if isinstance(payload, dict) and payload.get("auth_session_id") == auth_session_id
    ]
    refresh_tokens = [
        token
        for token, payload in STORE._data["refresh_tokens"].items()
        if isinstance(payload, dict) and payload.get("auth_session_id") == auth_session_id
    ]
    for token in access_tokens:
        STORE.delete("access_tokens", token)
    for token in refresh_tokens:
        STORE.delete("refresh_tokens", token)
    STORE.set(
        "auth_sessions",
        auth_session_id,
        {
            **session,
            "status": "terminated",
            "updated_at": iso_now(),
            "terminated_at": iso_now(),
        },
    )
    return {"auth_session_id": auth_session_id, "status": "terminated"}


def _auth_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user.get("name"),
        "subscription_tier": user.get("subscription_tier", "free"),
        "subscription_expires_at": user.get("subscription_expires_at"),
        "trial_ends_at": user.get("trial_ends_at"),
    }


def bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AppError(401, "AUTH_REQUIRED", "Authentication is required.", False, {"classification": "non_retryable"})
    return authorization.split(" ", 1)[1].strip()


def current_user_from_authorization(authorization: str | None) -> tuple[dict[str, Any], dict[str, Any]]:
    return get_current_user(access_token=bearer_token(authorization))


def _auth_data_corruption(message: str, *, email: str | None = None, user_ids: list[str] | None = None, reason: str | None = None) -> AppError:
    details: dict[str, Any] = {"classification": "terminal"}
    if email:
        details["email"] = email
    if user_ids:
        details["user_ids"] = user_ids
    if reason:
        details["reason"] = reason
    return AppError(500, "AUTH_DATA_CORRUPTION", message, False, details)


def _matching_user_records(email: str) -> list[tuple[str, dict[str, Any]]]:
    normalized = normalize_email(email)
    records: list[tuple[str, dict[str, Any]]] = []
    for user_id, payload in STORE._data["users"].items():
        if not isinstance(payload, dict):
            continue
        if normalize_email(payload.get("email")) != normalized:
            continue
        records.append((str(user_id), dict(payload)))
    records.sort(key=lambda item: item[0])
    return records


def _load_user_by_email(email: str) -> dict[str, Any] | None:
    normalized = normalize_email(email)
    with STORE.locked(*_auth_lock_items(("email_index", normalized))):
        indexed_user_id = STORE.get_ref("email_index", normalized)
        matches = _matching_user_records(normalized)

    if len(matches) > 1:
        raise _auth_data_corruption(
            "User authentication data is invalid. Please reset password.",
            email=normalized,
            user_ids=[user_id for user_id, _ in matches],
            reason="multiple_users_for_email",
        )

    if not matches:
        if indexed_user_id:
            raise _auth_data_corruption(
                "User authentication data is invalid. Please reset password.",
                email=normalized,
                user_ids=[str(indexed_user_id)],
                reason="email_index_points_to_missing_user",
            )
        return None

    user_id, user = matches[0]
    if not indexed_user_id or str(indexed_user_id) != user_id:
        raise _auth_data_corruption(
            "User authentication data is invalid. Please reset password.",
            email=normalized,
            user_ids=[user_id, str(indexed_user_id)] if indexed_user_id else [user_id],
            reason="email_index_mismatch",
        )
    if str(user.get("user_id") or "") != user_id:
        raise _auth_data_corruption(
            "User authentication data is invalid. Please reset password.",
            email=normalized,
            user_ids=[user_id],
            reason="user_id_mismatch",
        )
    return user


def _issue_auth_for_user(user: dict[str, Any]) -> dict[str, Any]:
    current = dict(user)
    tokens, access_payload, refresh_payload = _issue_tokens(user_id=current["user_id"])
    with STORE.locked(
        *_auth_lock_items(
            ("users", current["user_id"]),
            ("auth_sessions", tokens["auth_session_id"]),
            ("access_tokens", tokens["access_token"]),
            ("refresh_tokens", tokens["refresh_token"]),
        )
    ):
        STORE.set("users", current["user_id"], current)
        _set_auth_session(user_id=current["user_id"], auth_session_id=tokens["auth_session_id"])
        STORE.set("access_tokens", tokens["access_token"], access_payload)
        STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
    _persist_auth_state()
    return {"auth_user": _auth_user(current), "tokens": tokens}


def create_user(*, email: str, password: str, name: str | None) -> dict[str, Any]:
    normalized = normalize_email(email)
    if not normalized:
        raise AppError(400, "VALIDATION_ERROR", "Email is required.", False, {"classification": "non_retryable"})
    if len(password) < 8 or len(password) > 128:
        raise AppError(400, "VALIDATION_ERROR", "Password must be 8-128 characters.", False, {"classification": "non_retryable"})
    if _load_user_by_email(normalized):
        raise AppError(400, "AUTH_EMAIL_EXISTS", "Email already registered.", False, {"classification": "non_retryable"})

    user_id = new_id("usr")
    tokens, access_payload, refresh_payload = _issue_tokens(user_id=user_id)
    user = {
        "user_id": user_id,
        "email": normalized,
        "name": name.strip() if isinstance(name, str) and name.strip() else None,
        "password_hash": hash_password(password),
        "subscription_tier": "free",
        "subscription_expires_at": None,
        "trial_ends_at": None,
        "provider_links": {},
        "created_at": iso_now(),
    }
    with STORE.locked(
        *_auth_lock_items(
            ("email_index", normalized),
            ("users", user_id),
            ("auth_sessions", tokens["auth_session_id"]),
            ("access_tokens", tokens["access_token"]),
            ("refresh_tokens", tokens["refresh_token"]),
        )
    ):
        if STORE.has("email_index", normalized):
            raise AppError(400, "AUTH_EMAIL_EXISTS", "Email already registered.", False, {"classification": "non_retryable"})
        STORE.set("users", user_id, user)
        STORE.set("email_index", normalized, user_id)
        _set_auth_session(user_id=user_id, auth_session_id=tokens["auth_session_id"])
        STORE.set("access_tokens", tokens["access_token"], access_payload)
        STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
    _persist_auth_state()
    return {"auth_user": _auth_user(user), "tokens": tokens}


def login_user(*, email: str, password: str) -> dict[str, Any]:
    user = _load_user_by_email(email)
    if not user:
        raise AppError(401, "AUTH_INVALID_CREDENTIALS", "Incorrect email or password.", False, {"classification": "non_retryable"})
    try:
        password_valid = verify_password(password, str(user.get("password_hash") or ""))
    except PasswordHashError as exc:
        raise _auth_data_corruption(
            "User authentication data is invalid. Please reset password.",
            email=user.get("email"),
            user_ids=[str(user.get("user_id") or "")],
            reason=str(exc),
        ) from exc
    if not password_valid:
        raise AppError(401, "AUTH_INVALID_CREDENTIALS", "Incorrect email or password.", False, {"classification": "non_retryable"})
    return _issue_auth_for_user(user)


def login_google_identity(*, provider: str, external_id: str, email: str, name: str | None) -> dict[str, Any]:
    provider_name = str(provider or "").strip().lower()
    normalized_email = normalize_email(email)
    external_subject = str(external_id or "").strip()
    if provider_name != "google":
        raise AppError(400, "AUTH_PROVIDER_DISABLED", "Unsupported provider.", False, {"classification": "non_retryable", "provider": provider_name})
    if not normalized_email or not external_subject:
        raise AppError(400, "VALIDATION_ERROR", "Google account details are incomplete.", False, {"classification": "non_retryable"})

    link_key = f"{provider_name}:{external_subject}"
    with STORE.locked(*_auth_lock_items(("provider_index", link_key))):
        linked_user_id = STORE.get_ref("provider_index", link_key)
    linked_user = STORE.get_ref("users", str(linked_user_id)) if linked_user_id else None
    if linked_user:
        if linked_user.get("email") != normalized_email:
            raise AppError(409, "AUTH_PROVIDER_CONFLICT", "Google account is linked to a different email.", False, {"provider": provider_name})

    user = linked_user or _load_user_by_email(normalized_email)
    if user:
        updated = dict(user)
        provider_links = dict(updated.get("provider_links") or {})
        provider_links[provider_name] = external_subject
        updated["provider_links"] = provider_links
        if not updated.get("name") and isinstance(name, str) and name.strip():
            updated["name"] = name.strip()
        with STORE.locked(
            *_auth_lock_items(
                ("provider_index", link_key),
                ("email_index", updated["email"]),
                ("users", updated["user_id"]),
            )
        ):
            STORE.set("users", updated["user_id"], updated)
            STORE.set("email_index", updated["email"], updated["user_id"])
            STORE.set("provider_index", link_key, updated["user_id"])
        _persist_auth_state()
        return _issue_auth_for_user(updated)

    user_id = new_id("usr")
    created = {
        "user_id": user_id,
        "email": normalized_email,
        "name": name.strip() if isinstance(name, str) and name.strip() else None,
        "password_hash": None,
        "subscription_tier": "free",
        "subscription_expires_at": None,
        "trial_ends_at": None,
        "provider_links": {provider_name: external_subject},
        "created_at": iso_now(),
    }
    with STORE.locked(
        *_auth_lock_items(
            ("provider_index", link_key),
            ("email_index", normalized_email),
            ("users", user_id),
        )
    ):
        STORE.set("users", user_id, created)
        STORE.set("email_index", normalized_email, user_id)
        STORE.set("provider_index", link_key, user_id)
    _persist_auth_state()
    return _issue_auth_for_user(created)


def login_provider(*, provider_id: str, provider_token: str) -> dict[str, Any]:
    provider = str(provider_id or "").strip()
    opaque_token = str(provider_token or "").strip()
    if provider not in SETTINGS.auth_provider_ids:
        raise AppError(400, "AUTH_PROVIDER_DISABLED", "Provider login is not enabled.", False, {"classification": "non_retryable"})
    if not opaque_token:
        raise AppError(400, "VALIDATION_ERROR", "Provider token is required.", False, {"classification": "non_retryable"})

    external_subject = hashlib.sha256(f"{provider}:{opaque_token}".encode("utf-8")).hexdigest()
    link_key = f"{provider}:{external_subject}"

    with STORE.locked(*_auth_lock_items(("provider_index", link_key))):
        existing_user_id = STORE.get_ref("provider_index", link_key)

    if existing_user_id:
        tokens, access_payload, refresh_payload = _issue_tokens(user_id=str(existing_user_id))
        with STORE.locked(
            *_auth_lock_items(
                ("provider_index", link_key),
                ("users", str(existing_user_id)),
                ("auth_sessions", tokens["auth_session_id"]),
                ("access_tokens", tokens["access_token"]),
                ("refresh_tokens", tokens["refresh_token"]),
            )
        ):
            user_id = STORE.get_ref("provider_index", link_key)
            user = STORE.get_ref("users", str(user_id or ""))
            if not user_id or not user:
                raise AppError(401, "AUTH_SESSION_EXPIRED", "Provider-linked user was not found.", False, {"classification": "terminal"})
            _set_auth_session(user_id=str(existing_user_id), auth_session_id=tokens["auth_session_id"])
            STORE.set("access_tokens", tokens["access_token"], access_payload)
            STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
        _persist_auth_state()
        return {"auth_user": _auth_user(user), "tokens": tokens}

    user_id = new_id("usr")
    email = f"{provider}-{user_id}@provider.local"
    user = {
        "user_id": user_id,
        "email": email,
        "name": None,
        "password_hash": None,
        "subscription_tier": "free",
        "subscription_expires_at": None,
        "trial_ends_at": None,
        "provider_links": {provider: external_subject},
        "created_at": iso_now(),
    }
    tokens, access_payload, refresh_payload = _issue_tokens(user_id=user_id)
    with STORE.locked(
        *_auth_lock_items(
            ("provider_index", link_key),
            ("email_index", email),
            ("users", user_id),
            ("auth_sessions", tokens["auth_session_id"]),
            ("access_tokens", tokens["access_token"]),
            ("refresh_tokens", tokens["refresh_token"]),
        )
    ):
        existing_user_id = STORE.get_ref("provider_index", link_key)
        if existing_user_id:
            existing_user = STORE.get_ref("users", str(existing_user_id))
            if not existing_user:
                raise AppError(401, "AUTH_SESSION_EXPIRED", "Provider-linked user was not found.", False, {"classification": "terminal"})
            _set_auth_session(user_id=str(existing_user_id), auth_session_id=tokens["auth_session_id"])
            STORE.set("access_tokens", tokens["access_token"], access_payload)
            STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
            _persist_auth_state()
            return {"auth_user": _auth_user(existing_user), "tokens": tokens}
        STORE.set("users", user_id, user)
        STORE.set("email_index", email, user_id)
        STORE.set("provider_index", link_key, user_id)
        _set_auth_session(user_id=user_id, auth_session_id=tokens["auth_session_id"])
        STORE.set("access_tokens", tokens["access_token"], access_payload)
        STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
    _persist_auth_state()
    return {"auth_user": _auth_user(user), "tokens": tokens}


def refresh_auth(*, refresh_token: str) -> dict[str, Any]:
    token_value = str(refresh_token or "").strip()
    if not token_value:
        raise AppError(400, "VALIDATION_ERROR", "Refresh token is required.", False, {"classification": "non_retryable"})

    with STORE.locked(*_auth_lock_items(("refresh_tokens", token_value))):
        token_payload = STORE.get_ref("refresh_tokens", token_value)
        if not token_payload:
            raise AppError(401, "AUTH_REFRESH_INVALID", "Refresh token is invalid.", False, {"classification": "non_retryable"})
        user_id = str(token_payload["user_id"])
        auth_session_id = token_payload["auth_session_id"]

    tokens, access_payload, refresh_payload = _issue_tokens(user_id=user_id, auth_session_id=auth_session_id)
    with STORE.locked(
        *_auth_lock_items(
            ("refresh_tokens", token_value),
            ("users", user_id),
            ("auth_sessions", auth_session_id),
            ("access_tokens", tokens["access_token"]),
            ("refresh_tokens", tokens["refresh_token"]),
        )
    ):
        token_payload = STORE.get_ref("refresh_tokens", token_value)
        if not token_payload:
            raise AppError(401, "AUTH_REFRESH_INVALID", "Refresh token is invalid.", False, {"classification": "non_retryable"})
        expires_at = parse_iso(token_payload.get("expires_at"))
        if not expires_at or expires_at <= utc_now():
            STORE.delete("refresh_tokens", token_value)
            raise AppError(401, "AUTH_SESSION_EXPIRED", "Refresh token has expired.", False, {"classification": "terminal"})
        user = STORE.get_ref("users", user_id)
        if not user:
            STORE.delete("refresh_tokens", token_value)
            raise AppError(401, "AUTH_SESSION_EXPIRED", "User session is no longer valid.", False, {"classification": "terminal"})
        _assert_auth_session_active(auth_session_id=auth_session_id, user_id=user_id)
        STORE.delete("refresh_tokens", token_value)
        _set_auth_session(user_id=user_id, auth_session_id=auth_session_id)
        STORE.set("access_tokens", tokens["access_token"], access_payload)
        STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
    _persist_auth_state()
    return {"auth_user": _auth_user(user), "tokens": tokens}


def get_current_user(*, access_token: str) -> tuple[dict[str, Any], dict[str, Any]]:
    token_value = str(access_token or "").strip()
    if not token_value:
        raise AppError(401, "AUTH_REQUIRED", "Authentication is required.", False, {"classification": "non_retryable"})

    with STORE.locked(*_auth_lock_items(("access_tokens", token_value))):
        token_payload = STORE.get_ref("access_tokens", token_value)
        if not token_payload:
            raise AppError(401, "AUTH_REQUIRED", "Authentication is required.", False, {"classification": "non_retryable"})
        user_id = str(token_payload["user_id"])

    with STORE.locked(*_auth_lock_items(("access_tokens", token_value), ("users", user_id))):
        token_payload = STORE.get_ref("access_tokens", token_value)
        if not token_payload:
            raise AppError(401, "AUTH_REQUIRED", "Authentication is required.", False, {"classification": "non_retryable"})
        expires_at = parse_iso(token_payload.get("expires_at"))
        if not expires_at or expires_at <= utc_now():
            STORE.delete("access_tokens", token_value)
            raise AppError(401, "AUTH_SESSION_EXPIRED", "Access token has expired.", False, {"classification": "terminal"})
        user = STORE.get_ref("users", user_id)
        if not user:
            raise AppError(401, "AUTH_SESSION_EXPIRED", "Authenticated user was not found.", False, {"classification": "terminal"})
        _assert_auth_session_active(auth_session_id=str(token_payload["auth_session_id"]), user_id=user_id)

    return _auth_user(user) | {"subscription_tier": user.get("subscription_tier", "free")}, copy_token_payload(token_payload)


def logout_auth(*, authorization: str | None, refresh_token: str | None = None) -> dict[str, Any]:
    session_id: str | None = None
    access_token = None
    try:
        access_token = bearer_token(authorization)
    except AppError:
        access_token = None
    token_value = str(refresh_token or "").strip()

    with STORE.locked(*_auth_lock_items()):
        if access_token:
            payload = STORE.get_ref("access_tokens", access_token)
            if isinstance(payload, dict):
                session_id = str(payload.get("auth_session_id") or "").strip() or None
        if not session_id and token_value:
            payload = STORE.get_ref("refresh_tokens", token_value)
            if isinstance(payload, dict):
                session_id = str(payload.get("auth_session_id") or "").strip() or None
        if not session_id:
            raise AppError(401, "AUTH_REQUIRED", "Authentication is required.", False, {"classification": "non_retryable"})
        payload = _invalidate_auth_session(auth_session_id=session_id)
    _persist_auth_state()
    return payload


def copy_token_payload(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "user_id": payload["user_id"],
        "auth_session_id": payload["auth_session_id"],
        "expires_at": payload["expires_at"],
    }


def auth_session_payload(*, user: dict[str, Any], token_payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "auth_user": _auth_user(user),
        "auth_session_id": token_payload["auth_session_id"],
        "available_auth_methods": auth_methods(),
    }
