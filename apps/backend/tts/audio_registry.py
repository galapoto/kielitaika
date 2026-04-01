import json
from datetime import datetime
from pathlib import Path
from threading import Lock

from tts.deterministic_renderer import render_deterministic_wav
from utils.hash_utils import deterministic_hash, stable_value

AUDIO_ASSET_MISSING_ERROR = "AUDIO_ASSET_MISSING"
DEFAULT_YKI_LISTENING_VOICE_ID = "yki-listening-fi-v1"
DEFAULT_YKI_LISTENING_SETTINGS = {
    "duration_ms": 1800,
    "format": "wav",
    "provider": "deterministic_local",
    "sample_rate_hz": 16000,
}


def build_audio_key(text: str, voice_id: str, settings: dict):
    return deterministic_hash(
        {
            "settings": stable_value(settings),
            "text": text,
            "voiceId": voice_id,
        }
    )


class AudioRegistryStore:
    def get(self, asset_id: str):
        raise NotImplementedError

    def upsert(self, entry: dict):
        raise NotImplementedError

    def list(self):
        raise NotImplementedError


class FileBackedAudioRegistryStore(AudioRegistryStore):
    def __init__(self, root_path: str | Path | None = None):
        self.root_path = Path(root_path or "/tmp/kielitaika-yki-audio")
        self.assets_path = self.root_path / "assets"
        self.registry_path = self.root_path / "registry.json"
        self.assets_path.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _read_registry(self):
        if not self.registry_path.exists():
            return {}

        with self.registry_path.open("r", encoding="utf-8") as registry_file:
            return json.load(registry_file)

    def _write_registry(self, payload: dict):
        self.root_path.mkdir(parents=True, exist_ok=True)
        with self.registry_path.open("w", encoding="utf-8") as registry_file:
            json.dump(payload, registry_file, ensure_ascii=True, indent=2, sort_keys=True)

    def get(self, asset_id: str):
        with self._lock:
            return self._read_registry().get(asset_id)

    def upsert(self, entry: dict):
        with self._lock:
            registry = self._read_registry()
            registry[entry["id"]] = entry
            self._write_registry(registry)

    def list(self):
        with self._lock:
            return list(self._read_registry().values())


class AudioRegistry:
    def __init__(self, store: AudioRegistryStore | None = None):
        self.store = store or FileBackedAudioRegistryStore()

    def _build_file_path(self, asset_id: str, file_format: str):
        assets_path = getattr(self.store, "assets_path", Path("/tmp/kielitaika-yki-audio/assets"))
        return Path(assets_path) / f"{asset_id}.{file_format}"

    def pre_render(self, *, text: str, voice_id: str, settings: dict):
        normalized_settings = stable_value(settings)
        asset_id = build_audio_key(text, voice_id, normalized_settings)
        existing = self.store.get(asset_id)

        if existing and Path(existing["file_path"]).exists():
            return existing

        metadata = render_deterministic_wav(
            text=text,
            voice_id=voice_id,
            settings=normalized_settings,
            output_path=self._build_file_path(asset_id, normalized_settings.get("format", "wav")),
        )

        file_path = self._build_file_path(asset_id, metadata["format"])
        entry = {
            "id": asset_id,
            "text": text,
            "voiceId": voice_id,
            "file_path": str(file_path),
            "url": f"/api/audio/{asset_id}",
            "content_type": metadata["content_type"],
            "duration_ms": metadata["duration_ms"],
            "created_at": datetime.utcnow().isoformat(),
            "settings": normalized_settings,
        }
        self.store.upsert(entry)
        return entry

    def get_required(self, asset_id: str):
        entry = self.store.get(asset_id)

        if not entry:
            return None

        if not Path(entry["file_path"]).exists():
            return None

        return entry

audio_registry = AudioRegistry()


def pre_render_listening_asset(
    text: str,
    voice_id: str = DEFAULT_YKI_LISTENING_VOICE_ID,
    settings: dict | None = None,
):
    return audio_registry.pre_render(
        text=text,
        voice_id=voice_id,
        settings=settings or DEFAULT_YKI_LISTENING_SETTINGS,
    )


def get_audio_asset(asset_id: str):
    return audio_registry.get_required(asset_id)
