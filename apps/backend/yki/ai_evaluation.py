import json
import os
from urllib import error, request

TEXT_CRITERIA = ("content", "clarity", "relevance", "language_accuracy")
DEFAULT_TIMEOUT_SECONDS = 10
SYSTEM_PROMPT = (
    "You are a deterministic language-evaluation assistant. "
    "Return JSON only. "
    "Do not add markdown, explanations, or extra keys. "
    "Score each criterion from 0 to 5 as an integer."
)


def build_text_evaluation_prompt(answer: str):
    return (
        "Evaluate the following learner response for semantic quality.\n"
        "Return exactly this JSON object shape:\n"
        '{'
        '"content": 0, '
        '"clarity": 0, '
        '"relevance": 0, '
        '"language_accuracy": 0, '
        '"feedback": "..."'
        "}\n"
        "Use only integer scores between 0 and 5.\n"
        "Response:\n"
        f"{answer}"
    )


def is_ai_text_evaluation_enabled():
    return bool(
        os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_EVALUATION_MODEL")
    )


def _extract_message_content(raw_response):
    payload = json.loads(raw_response)
    choices = payload.get("choices")
    if not isinstance(choices, list) or not choices:
        raise ValueError("Missing choices")

    message = choices[0].get("message", {})
    content = message.get("content")

    if isinstance(content, str):
        return content.strip()

    if isinstance(content, list):
        collected = []
        for item in content:
            if isinstance(item, dict) and isinstance(item.get("text"), str):
                collected.append(item["text"])
        joined = "".join(collected).strip()
        if joined:
            return joined

    raise ValueError("Missing message content")


def _normalize_score(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("Score must be numeric")
    if int(value) != value:
        raise ValueError("Score must be an integer")

    score = int(value)
    if score < 0 or score > 5:
        raise ValueError("Score out of range")

    return score


def parse_ai_text_evaluation(raw_output):
    if isinstance(raw_output, dict):
        parsed = raw_output
    else:
        parsed = json.loads(raw_output)

    if not isinstance(parsed, dict):
        raise ValueError("AI output must be a JSON object")

    expected_keys = set(TEXT_CRITERIA + ("feedback",))
    if set(parsed.keys()) != expected_keys:
        raise ValueError("AI output keys do not match contract")

    normalized = {}
    for criterion in TEXT_CRITERIA:
        normalized[criterion] = _normalize_score(parsed[criterion])

    feedback = parsed.get("feedback")
    if not isinstance(feedback, str) or not feedback.strip():
        raise ValueError("Feedback must be a non-empty string")

    normalized["feedback"] = feedback.strip()
    return normalized


def _request_openai_text_evaluation(answer: str):
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_EVALUATION_MODEL")
    if not api_key or not model:
        raise ValueError("AI evaluation is not configured")

    base_url = os.getenv("OPENAI_API_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    timeout_seconds = int(
        os.getenv("OPENAI_EVALUATION_TIMEOUT_SECONDS", str(DEFAULT_TIMEOUT_SECONDS))
    )
    payload = {
        "model": model,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_text_evaluation_prompt(answer)},
        ],
    }

    raw_payload = json.dumps(payload).encode("utf-8")
    req = request.Request(
        f"{base_url}/chat/completions",
        data=raw_payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with request.urlopen(req, timeout=timeout_seconds) as response:
        return _extract_message_content(response.read().decode("utf-8"))


def fetch_ai_text_evaluation(answer: str, completion_fetcher=None):
    try:
        if completion_fetcher is not None:
            raw_output = completion_fetcher(answer)
        else:
            if not is_ai_text_evaluation_enabled():
                return None
            raw_output = _request_openai_text_evaluation(answer)

        return parse_ai_text_evaluation(raw_output)
    except (ValueError, TypeError, KeyError, json.JSONDecodeError, error.URLError):
        return None
