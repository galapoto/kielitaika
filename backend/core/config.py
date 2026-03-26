from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    api_version: str = "v1"
    dev_mode: bool = True
    access_token_minutes: int = 30
    refresh_token_days: int = 7
    auth_provider_ids: tuple[str, ...] = ()
    google_oauth_client_id: str = "946481356194-v8t6riiihp9oetqd1fl6gc1onhi2quf1.apps.googleusercontent.com"
    google_oauth_client_secret: str = ""
    google_oauth_timeout_seconds: int = 600
    roleplay_session_ttl_minutes: int = 60 * 24
    cors_allow_origins: tuple[str, ...] = (
        "http://127.0.0.1:4173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    )
    cors_allow_origin_regex: str = r"^https?://(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$"
    yki_engine_base_url: str = "http://127.0.0.1:8181"
    yki_engine_repo_root: str = "/home/vitus/kielitaikka-yki-engine"

    @staticmethod
    def load() -> "Settings":
        providers = tuple(provider.strip() for provider in os.getenv("KT_AUTH_PROVIDER_IDS", "").split(",") if provider.strip())
        cors_origins = tuple(
            origin.strip()
            for origin in os.getenv("KT_CORS_ALLOW_ORIGINS", "").split(",")
            if origin.strip()
        )
        return Settings(
            dev_mode=os.getenv("KT_DEV_MODE", "true").strip().lower() in {"1", "true", "yes", "on"},
            auth_provider_ids=providers,
            google_oauth_client_id=os.getenv(
                "KT_GOOGLE_OAUTH_CLIENT_ID",
                "946481356194-v8t6riiihp9oetqd1fl6gc1onhi2quf1.apps.googleusercontent.com",
            ).strip(),
            google_oauth_client_secret=os.getenv("KT_GOOGLE_OAUTH_CLIENT_SECRET", "").strip(),
            google_oauth_timeout_seconds=max(int(os.getenv("KT_GOOGLE_OAUTH_TIMEOUT_SECONDS", "600") or "600"), 60),
            cors_allow_origins=cors_origins
            or (
                "http://127.0.0.1:4173",
                "http://localhost:4173",
                "http://127.0.0.1:5173",
                "http://localhost:5173",
            ),
            cors_allow_origin_regex=os.getenv(
                "KT_CORS_ALLOW_ORIGIN_REGEX",
                r"^https?://(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$",
            ),
            yki_engine_base_url=os.getenv("KT_YKI_ENGINE_BASE_URL", "http://127.0.0.1:8181"),
            yki_engine_repo_root=os.getenv("KT_YKI_ENGINE_REPO_ROOT", "/home/vitus/kielitaikka-yki-engine"),
        )


SETTINGS = Settings.load()
