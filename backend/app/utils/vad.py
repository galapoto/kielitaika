"""Voice activity detection for audio processing."""

import audioop
from typing import Tuple, Optional


def detect_voice_activity(audio_bytes: bytes, threshold: int = 500) -> bool:
    """
    Return True if speech is likely present in the chunk.
    
    Uses RMS (Root Mean Square) energy-based detection.
    This is a lightweight heuristic suitable for real-time processing.
    
    Args:
        audio_bytes: Raw audio data (16-bit PCM expected)
        threshold: RMS threshold (default 500, adjust based on microphone sensitivity)
    
    Returns:
        True if voice activity detected, False otherwise
    """
    if not audio_bytes or len(audio_bytes) < 2:
        return False
    
    try:
        # Calculate RMS (Root Mean Square) for 16-bit audio
        rms = audioop.rms(audio_bytes, 2)
        return rms > threshold
    except Exception:
        # If decoding fails, assume speech to avoid over-filtering
        # This is safer than missing actual speech
        return True


def get_audio_energy(audio_bytes: bytes) -> Optional[float]:
    """
    Get RMS energy level of audio chunk.
    
    Returns:
        RMS value (0-32767 for 16-bit audio) or None if error
    """
    if not audio_bytes or len(audio_bytes) < 2:
        return None
    
    try:
        return float(audioop.rms(audio_bytes, 2))
    except Exception:
        return None


def detect_silence(audio_bytes: bytes, threshold: int = 200) -> bool:
    """
    Detect if audio chunk is likely silence.
    
    Args:
        audio_bytes: Raw audio data
        threshold: RMS threshold below which is considered silence
    
    Returns:
        True if likely silence, False otherwise
    """
    energy = get_audio_energy(audio_bytes)
    if energy is None:
        return False
    return energy < threshold
