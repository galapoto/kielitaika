from __future__ import annotations

import json
import urllib.error
import urllib.request

from fastapi import APIRouter, HTTPException, Response

from ..core.config import SETTINGS


def build_audio_router() -> APIRouter:
    router = APIRouter()

    def _engine_url(path: str) -> str:
        return f"{SETTINGS.yki_engine_base_url.rstrip('/')}{path}"

    @router.get("/api/audio/health")
    async def audio_health() -> dict[str, object]:
        request = urllib.request.Request(_engine_url("/api/audio/health"), headers={"Accept": "application/json"})
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {"status": "ok"}
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8")
            detail = json.loads(raw) if raw else {"detail": "Audio health check failed"}
            raise HTTPException(status_code=exc.code, detail=detail) from exc
        except Exception as exc:  # pragma: no cover - network path
            raise HTTPException(status_code=503, detail="Audio proxy unavailable") from exc

    @router.get("/api/audio/{audio_asset_id}.mp3")
    async def audio_stream(audio_asset_id: str) -> Response:
        request = urllib.request.Request(
            _engine_url(f"/api/audio/{audio_asset_id}.mp3"),
            headers={"Accept": "audio/mpeg"},
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = response.read()
                return Response(
                    content=payload,
                    media_type=response.headers.get_content_type() or "audio/mpeg",
                    headers={"Cache-Control": "public, max-age=3600"},
                )
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="ignore")
            raise HTTPException(status_code=exc.code, detail=raw or "Audio asset unavailable") from exc
        except Exception as exc:  # pragma: no cover - network path
            raise HTTPException(status_code=503, detail="Audio proxy unavailable") from exc

    return router
