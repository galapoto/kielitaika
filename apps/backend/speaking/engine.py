import tts.audio_registry as audio_registry_module
from utils.hash_utils import deterministic_hash

DEFAULT_SPEAKING_VOICE_ID = "speaking-prompt-fi-v1"
DEFAULT_SPEAKING_TTS_SETTINGS = {
    "duration_ms": 2200,
    "format": "wav",
    "provider": "deterministic_local",
    "sample_rate_hz": 16000,
}


def build_prompt_catalog():
    prompts = [
        {
            "id": "speaking-intro-1",
            "title": "Introduce yourself",
            "prompt_text": "Kerro lyhyesti kuka olet ja missa asut.",
            "reference_response": "Olen Anna ja asun Helsingissa.",
            "accepted_variations": [
                "Mina olen Anna ja asun Helsingissa.",
                "Olen Anna. Asun Helsingissa.",
            ],
            "response_guidance": "Say one short sentence about your name and where you live.",
        },
        {
            "id": "speaking-routine-1",
            "title": "Describe your morning",
            "prompt_text": "Kerro mita teet aamulla ennen toita tai opintoja.",
            "reference_response": "Heraan aikaisin ja juon kahvia ennen toita.",
            "accepted_variations": [
                "Heraan aikaisin ja juon kahvia ennen opintoja.",
                "Aamulla heraan aikaisin ja juon kahvia ennen toita.",
            ],
            "response_guidance": "Use one routine sentence with a clear time reference.",
        },
        {
            "id": "speaking-service-1",
            "title": "Ask for directions",
            "prompt_text": "Kysy kohteliaasti missa kirjasto on.",
            "reference_response": "Anteeksi, missa kirjasto on?",
            "accepted_variations": [
                "Hei, missa kirjasto on?",
                "Anteeksi, voisitko kertoa missa kirjasto on?",
            ],
            "response_guidance": "Use a polite opening and a clear location question.",
        },
    ]

    for prompt in prompts:
        prompt["deterministic_key"] = deterministic_hash(
            {
                "accepted_variations": prompt["accepted_variations"],
                "id": prompt["id"],
                "prompt_text": prompt["prompt_text"],
                "reference_response": prompt["reference_response"],
                "response_guidance": prompt["response_guidance"],
                "title": prompt["title"],
            }
        )

    return prompts


def normalize_transcript(value):
    if not isinstance(value, str):
        return ""

    filtered = []
    for character in value.strip().casefold():
        if character.isalnum() or character in {" ", "ä", "ö", "å"}:
            filtered.append(character)
        elif character in {".", ",", "!", "?", ":", ";", "-", "_"}:
            filtered.append(" ")

    return " ".join("".join(filtered).split())


def _token_difference(expected: str, submitted: str):
    expected_tokens = expected.split()
    submitted_tokens = submitted.split()

    missing = [token for token in expected_tokens if token not in submitted_tokens]
    extra = [token for token in submitted_tokens if token not in expected_tokens]
    fragments = []

    if missing:
        fragments.append(f"Missing: {', '.join(missing)}")

    if extra:
        fragments.append(f"Unexpected: {', '.join(extra)}")

    if not fragments and expected != submitted:
        fragments.append("Word order differs from the reference response.")

    return " | ".join(fragments) if fragments else None


def evaluate_spoken_response(prompt, transcript: str):
    normalized_transcript = normalize_transcript(transcript)
    normalized_reference = normalize_transcript(prompt["reference_response"])
    normalized_variations = {
        normalize_transcript(variation)
        for variation in prompt.get("accepted_variations", [])
    }

    correct = normalized_transcript == normalized_reference or normalized_transcript in normalized_variations
    difference = None if correct else _token_difference(normalized_reference, normalized_transcript)

    return {
        "correct": correct,
        "submitted_transcript": transcript.strip() if isinstance(transcript, str) else "",
        "normalized_transcript": normalized_transcript,
        "expected_response": prompt["reference_response"],
        "difference": difference,
        "evaluation_mode": "normalized_match",
    }


def pre_render_prompt_audio(prompt):
    return audio_registry_module.audio_registry.pre_render(
        text=prompt["prompt_text"],
        voice_id=DEFAULT_SPEAKING_VOICE_ID,
        settings=DEFAULT_SPEAKING_TTS_SETTINGS,
    )
