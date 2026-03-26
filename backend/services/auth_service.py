from __future__ import annotations

import hashlib
from datetime import timedelta
from typing import Any

from ..core.config import SETTINGS
from ..core.errors import AppError
from ..core.state_store import STORE
from ..core.utils import hash_password, iso_now, new_id, normalize_email, parse_iso, utc_now, verify_password


AUTH_GUARD_KEY = "__auth__"


def auth_methods() -> list[dict[str, Any]]:
    methods = [
        {
            "method_id": "password",
            "kind": "password",
            "enabled": True,
            "display_name": "Email and password",
        }
    ]
    for provider in SETTINGS.auth_provider_ids:
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
    return (("users", AUTH_GUARD_KEY), *items)


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


def _store_tokens(*, user_id: str, auth_session_id: str | None = None) -> dict[str, Any]:
    tokens, access_payload, refresh_payload = _issue_tokens(user_id=user_id, auth_session_id=auth_session_id)
    STORE.set("access_tokens", tokens["access_token"], access_payload)
    STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
    return tokens


def _auth_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user.get("name"),
        "subscription_tier": user.get("subscription_tier", "free"),
    }


def bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AppError(401, "AUTH_REQUIRED", "Authentication is required.", False, {"classification": "non_retryable"})
    return authorization.split(" ", 1)[1].strip()


def current_user_from_authorization(authorization: str | None) -> tuple[dict[str, Any], dict[str, Any]]:
    return get_current_user(access_token=bearer_token(authorization))


def create_user(*, email: str, password: str, name: str | None) -> dict[str, Any]:
    normalized = normalize_email(email)
    if not normalized:
        raise AppError(400, "VALIDATION_ERROR", "Email is required.", False, {"classification": "non_retryable"})
    if len(password) < 8 or len(password) > 128:
        raise AppError(400, "VALIDATION_ERROR", "Password must be 8-128 characters.", False, {"classification": "non_retryable"})

    user_id = new_id("usr")
    tokens, access_payload, refresh_payload = _issue_tokens(user_id=user_id)
    user = {
        "user_id": user_id,
        "email": normalized,
        "name": name.strip() if isinstance(name, str) and name.strip() else None,
        "password_hash": hash_password(password),
        "subscription_tier": "free",
        "provider_links": {},
        "created_at": iso_now(),
    }
    with STORE.locked(
        *_auth_lock_items(
            ("email_index", normalized),
            ("users", user_id),
            ("access_tokens", tokens["access_token"]),
            ("refresh_tokens", tokens["refresh_token"]),
        )
    ):
        if STORE.has("email_index", normalized):
            raise AppError(400, "AUTH_EMAIL_EXISTS", "Email already registered.", False, {"classification": "non_retryable"})
        STORE.set("users", user_id, user)
        STORE.set("email_index", normalized, user_id)
        STORE.set("access_tokens", tokens["access_token"], access_payload)
        STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
        return {"auth_user": _auth_user(user), "tokens": tokens}


def login_user(*, email: str, password: str) -> dict[str, Any]:
    normalized = normalize_email(email)
    with STORE.locked(*_auth_lock_items(("email_index", normalized))):
        user_id = STORE.get_ref("email_index", normalized)
        if not user_id:
            raise AppError(401, "AUTH_INVALID_CREDENTIALS", "Incorrect email or password.", False, {"classification": "non_retryable"})

    tokens, access_payload, refresh_payload = _issue_tokens(user_id=user_id)
    with STORE.locked(
        *_auth_lock_items(
            ("email_index", normalized),
            ("users", str(user_id)),
            ("access_tokens", tokens["access_token"]),
            ("refresh_tokens", tokens["refresh_token"]),
        )
    ):
        current_user_id = STORE.get_ref("email_index", normalized)
        user = STORE.get_ref("users", str(current_user_id or ""))
        if not current_user_id or not user or str(current_user_id) != str(user_id):
            raise AppError(401, "AUTH_INVALID_CREDENTIALS", "Incorrect email or password.", False, {"classification": "non_retryable"})
        if not verify_password(password, user.get("password_hash", "")):
            raise AppError(401, "AUTH_INVALID_CREDENTIALS", "Incorrect email or password.", False, {"classification": "non_retryable"})
        STORE.set("access_tokens", tokens["access_token"], access_payload)
        STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
        return {"auth_user": _auth_user(user), "tokens": tokens}


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
                ("access_tokens", tokens["access_token"]),
                ("refresh_tokens", tokens["refresh_token"]),
            )
        ):
            user_id = STORE.get_ref("provider_index", link_key)
            user = STORE.get_ref("users", str(user_id or ""))
            if not user_id or not user:
                raise AppError(401, "AUTH_SESSION_EXPIRED", "Provider-linked user was not found.", False, {"classification": "terminal"})
            STORE.set("access_tokens", tokens["access_token"], access_payload)
            STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
            return {"auth_user": _auth_user(user), "tokens": tokens}

    user_id = new_id("usr")
    email = f"{provider}-{user_id}@provider.local"
    user = {
        "user_id": user_id,
        "email": email,
        "name": None,
        "password_hash": None,
        "subscription_tier": "free",
        "provider_links": {provider: external_subject},
        "created_at": iso_now(),
    }
    tokens, access_payload, refresh_payload = _issue_tokens(user_id=user_id)
    with STORE.locked(
        *_auth_lock_items(
            ("provider_index", link_key),
            ("email_index", email),
            ("users", user_id),
            ("access_tokens", tokens["access_token"]),
            ("refresh_tokens", tokens["refresh_token"]),
        )
    ):
        existing_user_id = STORE.get_ref("provider_index", link_key)
        if existing_user_id:
            existing_user = STORE.get_ref("users", str(existing_user_id))
            if not existing_user:
                raise AppError(401, "AUTH_SESSION_EXPIRED", "Provider-linked user was not found.", False, {"classification": "terminal"})
            STORE.set("access_tokens", tokens["access_token"], access_payload)
            STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
            return {"auth_user": _auth_user(existing_user), "tokens": tokens}
        STORE.set("users", user_id, user)
        STORE.set("email_index", email, user_id)
        STORE.set("provider_index", link_key, user_id)
        STORE.set("access_tokens", tokens["access_token"], access_payload)
        STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
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
        STORE.delete("refresh_tokens", token_value)
        STORE.set("access_tokens", tokens["access_token"], access_payload)
        STORE.set("refresh_tokens", tokens["refresh_token"], refresh_payload)
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
            raise AppError(401, "AUTH_SESSION_EXPIRED", "Access token has expired.", False, {"classification": "terminal"})
        user = STORE.get_ref("users", user_id)
        if not user:
            raise AppError(401, "AUTH_SESSION_EXPIRED", "Authenticated user was not found.", False, {"classification": "terminal"})
        return _auth_user(user) | {"subscription_tier": user.get("subscription_tier", "free")}, copy_token_payload(token_payload)


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
