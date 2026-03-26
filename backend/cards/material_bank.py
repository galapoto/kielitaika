from __future__ import annotations

import json
import re
from collections import Counter
from functools import lru_cache
from pathlib import Path
from typing import Any


PRIMARY_MATERIAL_ROOT = Path("/home/vitus/Asiakirjat/Professional_Finnish_materials")
YKI_ENGINE_ROOT = Path("/home/vitus/kielitaikka-yki-engine")
RUNTIME_MATERIAL_ROOT = Path("backend/runtime/materials")
NORMALIZED_DIR = RUNTIME_MATERIAL_ROOT / "normalized"
NORMALIZED_BANK_PATH = NORMALIZED_DIR / "cards_authority.json"
INVENTORY_PATH = RUNTIME_MATERIAL_ROOT / "material_inventory.json"

SUPPORTED_CONTENT_TYPES = {"vocabulary_card", "sentence_card", "grammar_card"}
LEVEL_BAND_MAP = {
    "A1": "A1_A2",
    "A2": "A1_A2",
    "A1_A2": "A1_A2",
    "A2_B1": "B1_B2",
    "B1": "B1_B2",
    "B2": "B1_B2",
    "B1_B2": "B1_B2",
    "C1": "C1_C2",
    "C2": "C1_C2",
    "C1_C2": "C1_C2",
}


def _normalized_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def _normalized_key(value: Any) -> str:
    return _normalized_text(value).lower()


def _safe_quality_score(card: dict[str, Any]) -> float:
    quality = card.get("quality")
    if not isinstance(quality, dict):
        return 0.0
    try:
        return float(quality.get("quality_score") or 0.0)
    except (TypeError, ValueError):
        return 0.0


def _decode_json_objects(path: Path) -> tuple[list[dict[str, Any]], str | None]:
    text = path.read_text(encoding="utf-8")
    decoder = json.JSONDecoder()
    payloads: list[dict[str, Any]] = []
    index = 0
    error: str | None = None
    while index < len(text):
        while index < len(text) and text[index].isspace():
            index += 1
        if index >= len(text):
            break
        try:
            obj, end = decoder.raw_decode(text, index)
        except json.JSONDecodeError as exc:
            error = f"{exc.msg} at char {exc.pos}"
            break
        if isinstance(obj, dict):
            payloads.append(obj)
        index = end
    return payloads, error


def _normalize_level_band(value: Any) -> str:
    return LEVEL_BAND_MAP.get(str(value or "").strip().upper(), "B1_B2")


def _normalize_profession(card: dict[str, Any]) -> str:
    profession = card.get("profession")
    if not isinstance(profession, dict):
        return "none"
    return str(profession.get("slug") or "none").strip().lower() or "none"


def _extract_front_text(card: dict[str, Any]) -> str:
    front = ((card.get("content") or {}).get("front") or {})
    if not isinstance(front, dict):
        return ""
    return _normalized_text(
        front.get("term")
        or front.get("sentence")
        or front.get("pattern")
        or front.get("rule_label")
        or front.get("prompt")
        or front.get("example")
    )


def _extract_answer_value(card: dict[str, Any], follow_up: dict[str, Any]) -> str:
    back = ((card.get("content") or {}).get("back") or {})
    if follow_up.get("evaluation_mode") == "option_id":
        answer_key = str(follow_up.get("answer_key") or "").strip()
        for option in follow_up.get("options") or []:
            if option.get("option_id") == answer_key:
                return _normalized_text(option.get("text"))
    return _normalized_text(
        follow_up.get("answer_key")
        or back.get("gloss")
        or back.get("expected_sentence")
        or back.get("target_form")
        or back.get("rule_summary")
        or ((card.get("content") or {}).get("explanation") or {}).get("summary")
    )


def _extract_back_prompt(card: dict[str, Any], follow_up: dict[str, Any]) -> str:
    content = card.get("content") or {}
    back = content.get("back") or {}
    return _normalized_text(
        follow_up.get("prompt")
        or back.get("recall_prompt")
        or back.get("rule_summary")
        or ((content.get("explanation") or {}).get("summary"))
        or "Answer the prompt."
    )


def _follow_up_priority(content_type: str) -> tuple[str, ...]:
    if content_type == "vocabulary_card":
        return ("recognition_mcq", "typed_recall", "context_mcq", "fill_in", "reverse_recall")
    if content_type == "sentence_card":
        return ("typed_recall", "recognition_mcq", "fill_in", "context_mcq", "reverse_recall")
    return ("fill_in", "recognition_mcq", "typed_recall", "context_mcq", "reverse_recall")


def _select_follow_up(card: dict[str, Any]) -> dict[str, Any]:
    content = card.get("content") or {}
    follow_ups = content.get("follow_ups")
    if not isinstance(follow_ups, list):
        return {}
    priorities = _follow_up_priority(str(card.get("content_type") or ""))
    ordered = sorted(
        (item for item in follow_ups if isinstance(item, dict)),
        key=lambda item: priorities.index(item.get("variant_type")) if item.get("variant_type") in priorities else len(priorities),
    )
    return ordered[0] if ordered else {}


def _accepted_variants(card: dict[str, Any], follow_up: dict[str, Any]) -> list[str]:
    values = []
    evaluation_mode = str(follow_up.get("evaluation_mode") or "normalized_text")
    answer_key = follow_up.get("answer_key")
    if isinstance(answer_key, str) and answer_key.strip():
        values.append(answer_key.strip())
    if evaluation_mode == "option_id":
        for option in follow_up.get("options") or []:
            if option.get("option_id") == answer_key and option.get("text"):
                values.append(str(option["text"]).strip())
    for variant in follow_up.get("accepted_variants") or []:
        if isinstance(variant, str) and variant.strip():
            values.append(variant.strip())
    if not values:
        fallback = _extract_answer_value(card, follow_up)
        if fallback:
            values.append(fallback)
    deduped: list[str] = []
    seen: set[str] = set()
    for value in values:
        normalized = _normalized_key(value)
        if normalized and normalized not in seen:
            seen.add(normalized)
            deduped.append(value)
    return deduped


def _normalize_follow_up(card: dict[str, Any], follow_up: dict[str, Any]) -> dict[str, Any]:
    options = []
    for option in follow_up.get("options") or []:
        if not isinstance(option, dict):
            continue
        option_id = str(option.get("option_id") or "").strip()
        text = _normalized_text(option.get("text"))
        if option_id and text:
            options.append({"option_id": option_id, "text": text})
    return {
        "variant_type": str(follow_up.get("variant_type") or "typed_recall"),
        "prompt": _extract_back_prompt(card, follow_up),
        "options": options,
        "blank_template": follow_up.get("blank_template"),
        "context_text": follow_up.get("context_text"),
        "stimulus_text": follow_up.get("stimulus_text"),
    }


def _normalize_runtime_shaped_card(card: dict[str, Any], *, source_path: str) -> dict[str, Any] | None:
    content_type = str(card.get("content_type") or "").strip()
    front_text = _normalized_text(card.get("front_text") or card.get("word"))
    follow_up = card.get("served_follow_up")
    if content_type not in SUPPORTED_CONTENT_TYPES or not front_text or not isinstance(follow_up, dict):
        return None
    answer_value = _normalized_text(card.get("_answer_value"))
    accepted = [
        str(variant).strip()
        for variant in (card.get("_accepted_variants") or [])
        if str(variant).strip()
    ]
    if not answer_value or not accepted:
        return None
    normalized_follow_up = _normalize_follow_up(card, follow_up)
    return {
        "id": str(card.get("id") or "").strip(),
        "content_type": content_type,
        "path": str(card.get("path") or "general"),
        "domain": str(card.get("domain") or card.get("path") or "general"),
        "profession": str(card.get("profession") or "none"),
        "level_band": _normalize_level_band(card.get("level_band")),
        "difficulty": str(card.get("difficulty") or "core"),
        "tags": [str(tag) for tag in (card.get("tags") or []) if str(tag).strip()],
        "prompt_family": str(card.get("prompt_family") or "core"),
        "word": front_text,
        "front_text": front_text,
        "back_prompt": _normalized_text(card.get("back_prompt") or normalized_follow_up.get("prompt") or "Answer the prompt."),
        "audio": card.get("audio"),
        "served_follow_up": normalized_follow_up,
        "_answer_value": answer_value,
        "_accepted_variants": accepted,
        "_quality_score": float(card.get("_quality_score") or 1.0),
        "_source_path": source_path,
        "_source_id": card.get("_source_id"),
        "_signature": [
            content_type,
            str(card.get("profession") or "none"),
            _normalize_level_band(card.get("level_band")),
            _normalized_key(front_text),
            _normalized_key(answer_value),
        ],
    }


def _card_signature(card: dict[str, Any], follow_up: dict[str, Any]) -> tuple[str, str, str, str, str]:
    return (
        str(card.get("content_type") or ""),
        _normalize_profession(card),
        _normalize_level_band(card.get("level_band")),
        _normalized_key(_extract_front_text(card)),
        _normalized_key(_extract_answer_value(card, follow_up)),
    )


def _normalize_card(card: dict[str, Any], *, source_path: str) -> dict[str, Any] | None:
    if "front_text" in card and "served_follow_up" in card:
        return _normalize_runtime_shaped_card(card, source_path=source_path)
    content_type = str(card.get("content_type") or "").strip()
    if content_type not in SUPPORTED_CONTENT_TYPES:
        return None
    follow_up = _select_follow_up(card)
    front_text = _extract_front_text(card)
    answer_value = _extract_answer_value(card, follow_up)
    if not front_text or not answer_value:
        return None
    profession = _normalize_profession(card)
    accepted = _accepted_variants(card, follow_up)
    if not accepted:
        return None
    prompt_family = ((card.get("content") or {}).get("prompt_family")) or "core"
    domain_path = "general" if profession == "none" else "professional"
    return {
        "id": str(card.get("id") or "").strip(),
        "content_type": content_type,
        "path": domain_path,
        "domain": str(card.get("domain") or domain_path),
        "profession": profession,
        "level_band": _normalize_level_band(card.get("level_band")),
        "difficulty": str(card.get("difficulty") or "core"),
        "tags": [str(tag) for tag in (card.get("tags") or []) if str(tag).strip()],
        "prompt_family": str(prompt_family),
        "word": front_text,
        "front_text": front_text,
        "back_prompt": _extract_back_prompt(card, follow_up),
        "audio": ((card.get("content") or {}).get("audio")),
        "served_follow_up": _normalize_follow_up(card, follow_up),
        "_answer_value": answer_value,
        "_accepted_variants": accepted,
        "_quality_score": _safe_quality_score(card),
        "_source_path": source_path,
        "_source_id": ((card.get("source") or {}).get("source_id")),
        "_signature": list(_card_signature(card, follow_up)),
    }


def _build_inventory(cards_total: int, cards_kept: int, duplicates_removed: int, dataset_reports: list[dict[str, Any]]) -> dict[str, Any]:
    yki_index_path = YKI_ENGINE_ROOT / "task_banks" / "task_index_v3_2.json"
    yki_statistics = {}
    if yki_index_path.exists():
        try:
            payload = json.loads(yki_index_path.read_text(encoding="utf-8"))
            if isinstance(payload, dict):
                yki_statistics = payload.get("statistics") or {}
        except Exception:
            yki_statistics = {}
    return {
        "version": 1,
        "generated_from": str(PRIMARY_MATERIAL_ROOT),
        "cards_total_recovered": cards_total,
        "cards_total_normalized": cards_kept,
        "duplicates_removed": duplicates_removed,
        "datasets": dataset_reports
        + [
            {
                "source_root": "backend/cards/logic.py",
                "dataset_type": "cards_runtime_seed_data",
                "classification": "INVALID",
                "reason": "Synthetic placeholder cards were the active runtime source before normalization.",
                "records_found": 3,
                "records_kept": 0,
            },
            {
                "source_root": str(yki_index_path),
                "dataset_type": "yki_task_bank",
                "classification": "VALID",
                "reason": "Certified YKI task index is present and already structured as backend authority.",
                "records_found": int((yki_statistics or {}).get("selected_runtime_entries") or 0),
                "records_kept": int((yki_statistics or {}).get("selected_runtime_entries") or 0),
            },
            {
                "source_root": str(YKI_ENGINE_ROOT / "exam_sessions"),
                "dataset_type": "yki_exam_runtime_snapshots",
                "classification": "INVALID",
                "reason": "Exam session snapshots are runtime artifacts, not authoritative learning material.",
                "records_found": len(list((YKI_ENGINE_ROOT / "exam_sessions").glob("*.json"))) if (YKI_ENGINE_ROOT / "exam_sessions").exists() else 0,
                "records_kept": 0,
            },
        ],
    }


def _write_artifacts(payload: dict[str, Any], inventory: dict[str, Any]) -> None:
    NORMALIZED_DIR.mkdir(parents=True, exist_ok=True)
    RUNTIME_MATERIAL_ROOT.mkdir(parents=True, exist_ok=True)
    NORMALIZED_BANK_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    INVENTORY_PATH.write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding="utf-8")


def build_material_bank() -> dict[str, Any]:
    dataset_reports: list[dict[str, Any]] = []
    recovered_cards = 0
    duplicates_removed = 0
    normalized_cards: list[dict[str, Any]] = []
    dedupe_index: dict[tuple[str, str, str, str, str], int] = {}

    for path in sorted(PRIMARY_MATERIAL_ROOT.rglob("*.json")):
        payloads, error = _decode_json_objects(path)
        cards_found = 0
        cards_kept = 0
        if path.name == "edit_before_move.json":
            dataset_reports.append(
                {
                    "source_root": str(path),
                    "dataset_type": "staging_cards_dump",
                    "classification": "INVALID",
                    "reason": "Malformed staging dump could not be decoded deterministically.",
                    "records_found": 0,
                    "records_kept": 0,
                    "decode_error": error,
                }
            )
            continue

        for payload in payloads:
            cards = payload.get("cards")
            if not isinstance(cards, list):
                continue
            for raw_card in cards:
                cards_found += 1
                recovered_cards += 1
                if not isinstance(raw_card, dict):
                    continue
                normalized = _normalize_card(raw_card, source_path=str(path))
                if not normalized:
                    continue
                signature = tuple(normalized["_signature"])
                existing_index = dedupe_index.get(signature)
                if existing_index is None:
                    dedupe_index[signature] = len(normalized_cards)
                    normalized_cards.append(normalized)
                    cards_kept += 1
                    continue
                existing_card = normalized_cards[existing_index]
                duplicates_removed += 1
                replacement = normalized
                if (
                    replacement["_quality_score"] < existing_card["_quality_score"]
                    or (
                        replacement["_quality_score"] == existing_card["_quality_score"]
                        and str(replacement["id"]) > str(existing_card["id"])
                    )
                ):
                    replacement = existing_card
                else:
                    normalized_cards[existing_index] = replacement

        dataset_reports.append(
            {
                "source_root": str(path),
                "dataset_type": "professional_finnish_cards",
                "classification": "VALID" if error is None else "NEEDS_CLEANING",
                "reason": "Recovered valid card batches and normalized them into runtime authority."
                if error is None
                else "Recovered valid card batches before malformed trailing content.",
                "records_found": cards_found,
                "records_kept": cards_kept,
                "decode_error": error,
            }
        )

    normalized_cards.sort(
        key=lambda card: (
            card["path"],
            card["profession"],
            card["level_band"],
            card["content_type"],
            _normalized_key(card["front_text"]),
            card["id"],
        )
    )

    distribution = {
        "by_path": dict(Counter(card["path"] for card in normalized_cards)),
        "by_content_type": dict(Counter(card["content_type"] for card in normalized_cards)),
        "by_level_band": dict(Counter(card["level_band"] for card in normalized_cards)),
        "by_profession": dict(Counter(card["profession"] for card in normalized_cards)),
    }
    payload = {
        "version": 1,
        "authority_root": str(PRIMARY_MATERIAL_ROOT),
        "generated_cards": len(normalized_cards),
        "duplicates_removed": duplicates_removed,
        "distribution": distribution,
        "cards": normalized_cards,
    }
    inventory = _build_inventory(
        cards_total=recovered_cards,
        cards_kept=len(normalized_cards),
        duplicates_removed=duplicates_removed,
        dataset_reports=dataset_reports,
    )
    _write_artifacts(payload, inventory)
    return payload


@lru_cache(maxsize=1)
def load_material_bank() -> dict[str, Any]:
    if NORMALIZED_BANK_PATH.exists():
        try:
            payload = json.loads(NORMALIZED_BANK_PATH.read_text(encoding="utf-8"))
            if isinstance(payload, dict) and isinstance(payload.get("cards"), list) and payload.get("cards"):
                return payload
        except Exception:
            pass
    return build_material_bank()


def load_authority_cards() -> list[dict[str, Any]]:
    payload = load_material_bank()
    cards = payload.get("cards")
    return cards if isinstance(cards, list) else []
