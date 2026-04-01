import math
import struct
import wave
from pathlib import Path

from utils.hash_utils import deterministic_hash

DEFAULT_SAMPLE_RATE = 16000
DEFAULT_CHANNEL_COUNT = 1
DEFAULT_SAMPLE_WIDTH = 2


def _build_wave_seed(text: str, voice_id: str, settings: dict):
    return deterministic_hash(
        {
            "text": text,
            "voiceId": voice_id,
            "settings": settings,
        }
    )


def render_deterministic_wav(
    *,
    text: str,
    voice_id: str,
    settings: dict,
    output_path: Path,
):
    output_path.parent.mkdir(parents=True, exist_ok=True)

    sample_rate = int(settings.get("sample_rate_hz", DEFAULT_SAMPLE_RATE))
    duration_ms = int(settings.get("duration_ms", max(1200, min(2600, 900 + len(text.split()) * 140))))
    total_samples = max(1, int(sample_rate * (duration_ms / 1000)))
    seed = _build_wave_seed(text, voice_id, settings)
    base_frequency = 220 + int(seed[0:2], 16)
    harmonic_frequency = 330 + int(seed[2:4], 16)
    modulation_frequency = 2 + (int(seed[4:6], 16) % 4)
    amplitude = 11000 + (int(seed[6:8], 16) % 3000)

    with wave.open(str(output_path), "wb") as wav_file:
        wav_file.setnchannels(DEFAULT_CHANNEL_COUNT)
        wav_file.setsampwidth(DEFAULT_SAMPLE_WIDTH)
        wav_file.setframerate(sample_rate)

        frames = bytearray()
        fade_in_samples = max(1, int(sample_rate * 0.04))
        fade_out_samples = max(1, int(sample_rate * 0.08))

        for index in range(total_samples):
            position = index / sample_rate

            if index < fade_in_samples:
                envelope = index / fade_in_samples
            elif index > total_samples - fade_out_samples:
                envelope = max(0.0, (total_samples - index) / fade_out_samples)
            else:
                envelope = 1.0

            modulation = 0.6 + 0.4 * math.sin(2 * math.pi * modulation_frequency * position)
            waveform = (
                math.sin(2 * math.pi * base_frequency * position)
                + 0.35 * math.sin(2 * math.pi * harmonic_frequency * position)
            )
            sample_value = int(amplitude * envelope * modulation * waveform)
            frames.extend(struct.pack("<h", max(-32767, min(32767, sample_value))))

        wav_file.writeframes(bytes(frames))

    return {
        "content_type": "audio/wav",
        "duration_ms": duration_ms,
        "format": "wav",
        "sample_rate_hz": sample_rate,
    }
