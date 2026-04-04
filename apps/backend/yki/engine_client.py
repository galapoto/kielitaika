from __future__ import annotations

import json as jsonlib
import logging
import os

from yki.errors import EngineFailure

logger = logging.getLogger(__name__)


def get_engine_base_url() -> str:
    base_url = os.getenv("YKI_ENGINE_BASE_URL")
    if not base_url:
        raise EngineFailure("ENGINE_BASE_URL_MISSING")
    return base_url.rstrip("/")


class EngineClient:
    def __init__(self, base_url: str | None = None, timeout_seconds: float = 10.0):
        self.base_url = base_url
        self.timeout_seconds = timeout_seconds

    async def start_exam(self, payload: dict | None = None):
        effective_payload = payload or {"level_band": "B1_B2"}
        if "level_band" not in effective_payload:
            effective_payload = {**effective_payload, "level_band": "B1_B2"}
        return await self._request("POST", "/exam/start", json=effective_payload)

    async def get_session(self, session_id: str):
        return await self._request("GET", f"/exam/{session_id}")

    async def submit_answer(self, session_id: str, payload: dict):
        return await self._request("POST", f"/exam/{session_id}/answer", json=payload)

    async def submit_writing(self, session_id: str, payload: dict):
        return await self._request("POST", f"/exam/{session_id}/writing", json=payload)

    async def submit_audio(self, session_id: str, payload: dict):
        return await self._request("POST", f"/exam/{session_id}/audio", json=payload)

    async def submit_speaking(self, session_id: str, payload: dict):
        return await self._request("POST", f"/exam/{session_id}/speaking", json=payload)

    async def upload_audio(
        self,
        *,
        session_id: str,
        task_id: str,
        session_token: str,
        filename: str,
        content_type: str,
        content: bytes,
    ):
        return await self._request(
            "POST",
            "/upload/audio",
            data={
                "session_id": session_id,
                "task_id": task_id,
                "session_token": session_token,
            },
            files={
                "file": (filename, content, content_type),
            },
        )

    async def get_certificate(self, session_id: str):
        return await self._request("GET", f"/exam/{session_id}/certificate")

    async def _request(
        self,
        method: str,
        path: str,
        json: dict | None = None,
        data: dict | None = None,
        files: dict | None = None,
    ):
        try:
            import httpx
        except ImportError as exc:
            raise EngineFailure("HTTPX_UNAVAILABLE") from exc

        url = f"{self.base_url or get_engine_base_url()}{path}"
        if json is not None:
            logger.warning(
                "YKI engine request method=%s path=%s payload=%s",
                method,
                path,
                jsonlib.dumps(json, ensure_ascii=True, sort_keys=True),
            )
        elif data is not None or files is not None:
            logger.warning(
                "YKI engine request method=%s path=%s multipart=%s",
                method,
                path,
                jsonlib.dumps(
                    {
                        "data": data or {},
                        "files": sorted((files or {}).keys()),
                    },
                    ensure_ascii=True,
                    sort_keys=True,
                ),
            )
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.request(method, url, json=json, data=data, files=files)
        except httpx.TimeoutException as exc:
            raise EngineFailure("ENGINE_TIMEOUT") from exc
        except httpx.HTTPError as exc:
            raise EngineFailure("ENGINE_UNAVAILABLE") from exc

        response_text = response.text
        try:
            payload = response.json()
        except ValueError as exc:
            logger.error(
                "YKI engine invalid JSON method=%s path=%s status=%s payload=%s response=%s",
                method,
                path,
                response.status_code,
                jsonlib.dumps(json, ensure_ascii=True, sort_keys=True) if json is not None else "null",
                response_text,
            )
            raise EngineFailure("ENGINE_INVALID_JSON") from exc

        if response.status_code >= 400:
            logger.error(
                "YKI engine error method=%s path=%s status=%s payload=%s response=%s",
                method,
                path,
                response.status_code,
                jsonlib.dumps(json, ensure_ascii=True, sort_keys=True) if json is not None else "null",
                response_text,
            )
            raise EngineFailure(
                "ENGINE_ERROR",
                message=response_text or "ENGINE_ERROR",
                details={
                    "status_code": response.status_code,
                    "path": path,
                    "request_payload": json,
                    "response_text": response_text,
                },
            )

        return payload
