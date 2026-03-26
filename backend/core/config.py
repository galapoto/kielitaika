from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    api_version: str = "v1"
    access_token_minutes: int = 30
    refresh_token_days: int = 7
    auth_provider_ids: tuple[str, ...] = ()
    roleplay_session_ttl_minutes: int = 60 * 24
    yki_engine_base_url: str = "http://127.0.0.1:8181"
    yki_engine_repo_root: str = "/home/vitus/kielitaikka-yki-engine"

    @staticmethod
    def load() -> "Settings":
        providers = tuple(provider.strip() for provider in os.getenv("KT_AUTH_PROVIDER_IDS", "").split(",") if provider.strip())
        return Settings(
            auth_provider_ids=providers,
            yki_engine_base_url=os.getenv("KT_YKI_ENGINE_BASE_URL", "http://127.0.0.1:8181"),
            yki_engine_repo_root=os.getenv("KT_YKI_ENGINE_REPO_ROOT", "/home/vitus/kielitaikka-yki-engine"),
        )


SETTINGS = Settings.load()
