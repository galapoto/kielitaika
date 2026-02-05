import json
import logging
import traceback

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Request
from pydantic import BaseModel

from app.core.config import get_settings
from app.services import stt_service, tts_service
from app.services.pronunciation_engine import PronunciationEngine
from app.services.pronunciation_engine_v2 import analyze_pronunciation_v2
from app.services.pronunciation_nudge import mini_nudge
from app.services.tts_resolver import resolve_tts_provider, resolve_tts_voice

router = APIRouter()
_pronunciation_engine = PronunciationEngine()
_settings = get_settings()
_tts_log = logging.getLogger("puhis.voice.tts")


class PronunciationRequest(BaseModel):
    """Request model for pronunciation analysis."""
    expected_text: str
    transcript: str
    audio_bytes: bytes | None = None


class PronunciationNudgeRequest(BaseModel):
    """Lightweight request for mini pronunciation nudges."""
    expected_text: str | None = None
    transcript: str | None = None


@router.websocket("/stt-stream")
async def stt_stream(ws: WebSocket):
    """Handle streaming STT. Receives audio bytes, streams transcript chunks back."""
    await ws.accept()
    try:
        async def incoming():
            while True:
                data = await ws.receive_bytes()
                yield data

        async for text in stt_service.stream_stt(incoming()):
            await ws.send_text(text)
    except WebSocketDisconnect:
        return
    except Exception as exc:  # pragma: no cover - network path
        await ws.send_text(f"error: {exc}")


async def _send_tts_error(ws: WebSocket, reason: str, message: str) -> None:
    """Send structured TTS error over WebSocket so frontend never sees silent failure."""
    try:
        payload = {"type": "error", "source": "tts", "reason": reason, "message": message}
        await ws.send_text(json.dumps(payload))
    except Exception:
        pass


@router.websocket("/tts-stream")
async def tts_stream(ws: WebSocket):
    """Handle streaming TTS playback. Receives text, streams audio bytes back. Failures are surfaced, not silent."""
    await ws.accept()
    try:
        # ---- FORENSIC CHECK 1: API KEY ----
        settings = get_settings()
        if not settings.openai_api_key or not str(settings.openai_api_key).strip():
            msg = "OPENAI_API_KEY is missing or empty at runtime"
            _tts_log.error(msg)
            await _send_tts_error(ws, "missing_api_key", msg)
            await ws.close(code=1011, reason=msg)
            return

        payload = await ws.receive_json()
        text = (payload.get("text") or "").strip()

        # ---- FORENSIC CHECK 2: TEXT ----
        if not text:
            msg = "No text provided to TTS stream"
            _tts_log.error(msg)
            await _send_tts_error(ws, "missing_text", msg)
            await ws.close(code=1003, reason=msg)
            return

        _tts_log.info("TTS requested, text length=%d", len(text))

        # ---- STREAM AUDIO ----
        chunk_count = 0
        async for chunk in tts_service.stream_tts(text):
            if chunk:
                chunk_count += 1
                await ws.send_bytes(chunk)

        # ---- FORENSIC CHECK 3: NO AUDIO ----
        if chunk_count == 0:
            msg = "TTS stream produced zero audio chunks"
            _tts_log.error(msg)
            await _send_tts_error(ws, "no_audio", msg)
            await ws.close(code=1011, reason="no_audio_chunks")
            return

        _tts_log.info("TTS completed successfully, chunks=%d", chunk_count)
        await ws.close(code=1000, reason="tts_complete")

    except WebSocketDisconnect:
        _tts_log.warning("TTS WebSocket disconnected by client")
    except Exception as exc:
        msg = f"Unhandled exception in TTS stream: {exc}"
        _tts_log.error(msg)
        _tts_log.error(traceback.format_exc())
        await _send_tts_error(ws, "unhandled_exception", msg)
        try:
            await ws.close(code=1011, reason="unhandled_exception")
        except Exception:
            pass


@router.post("/pronunciation/analyze")
async def analyze_pronunciation(request: PronunciationRequest):
    """
    Analyze pronunciation quality (v1 - basic).
    
    Compares expected text with transcript to detect:
    - Vowel length errors
    - Consonant length errors (gemination)
    - Rhythm issues
    
    Returns pronunciation score (0-4) and detailed feedback.
    """
    if not request.expected_text or not request.transcript:
        raise HTTPException(
            status_code=400,
            detail="Both expected_text and transcript are required"
        )
    
    analysis = _pronunciation_engine.analyze_audio(
        audio_bytes=request.audio_bytes,
        expected_text=request.expected_text,
        transcript=request.transcript
    )
    
    return {
        "pronunciation": analysis,
        "score": analysis["score"],
        "feedback": analysis["feedback"]
    }


@router.post("/pronunciation/analyze-v2")
async def analyze_pronunciation_v2_endpoint(request: PronunciationRequest):
    """
    Advanced pronunciation analysis (v2 - with phoneme alignment).
    
    Features:
    - Phoneme-level comparison
    - Enhanced vowel/consonant detection
    - Stress pattern analysis
    - Segment-by-segment feedback
    - Improvement priorities
    
    Returns comprehensive pronunciation analysis.
    """
    if not request.expected_text or not request.transcript:
        raise HTTPException(
            status_code=400,
            detail="Both expected_text and transcript are required"
        )
    
    analysis = await analyze_pronunciation_v2(
        audio_bytes=request.audio_bytes,
        expected_text=request.expected_text,
        transcript=request.transcript,
    )
    
    return {
        "pronunciation": analysis,
        "score": analysis["score"],
        "feedback": analysis.get("detailed_feedback", analysis.get("feedback", "")),
        "phoneme_errors": analysis.get("phoneme_errors", []),
        "improvement_priorities": analysis.get("improvement_priorities", []),
    }


@router.post("/stt")
async def transcribe_audio_file(request: Request):
    """
    Transcribe an uploaded audio file (webm/opus recommended).
    
    Provides a simple non-streaming fallback for clients that can't use
    WebSockets. Returns the full transcript once processing completes.
    """
    audio_bytes = await request.body()
    transcript = await stt_service.transcribe_audio(audio_bytes)
    return {"transcript": transcript}


@router.post("/pronunciation/nudge")
async def pronunciation_nudge(request: PronunciationNudgeRequest):
    """Return a short, positive pronunciation nudge (vowel, consonant, phrase)."""
    return {"nudge": mini_nudge(request.expected_text, request.transcript)}
