from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

from backend.cards.material_bank import PRIMARY_MATERIAL_ROOT


NORMALIZED_AUTHORITY_PATH = Path("backend/runtime/materials/normalized/cards_authority.json")


def load_authority() -> list[dict[str, Any]]:
    payload = json.loads(NORMALIZED_AUTHORITY_PATH.read_text(encoding="utf-8"))
    cards = payload.get("cards")
    if not isinstance(cards, list):
        raise RuntimeError("Normalized authority payload is missing cards.")
    return cards


def source_target_paths(cards: list[dict[str, Any]]) -> set[Path]:
    return {Path(str(card["_source_path"])) for card in cards}


def source_card_payload(card: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": card["id"],
        "content_type": card["content_type"],
        "path": card["path"],
        "domain": card["domain"],
        "profession": card["profession"],
        "level_band": card["level_band"],
        "difficulty": card["difficulty"],
        "tags": card["tags"],
        "prompt_family": card["prompt_family"],
        "word": card["word"],
        "front_text": card["front_text"],
        "back_prompt": card["back_prompt"],
        "audio": card["audio"],
        "served_follow_up": card["served_follow_up"],
        "_answer_value": card["_answer_value"],
        "_accepted_variants": card["_accepted_variants"],
        "_quality_score": card["_quality_score"],
        "_source_path": card["_source_path"],
        "_source_id": card.get("_source_id"),
    }


def rewrite_sources(cards: list[dict[str, Any]]) -> dict[str, int]:
    grouped: dict[Path, list[dict[str, Any]]] = {}
    for card in cards:
        path = Path(str(card["_source_path"]))
        grouped.setdefault(path, []).append(source_card_payload(card))

    written_counts: dict[str, int] = {}
    for path, items in grouped.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {"cards": sorted(items, key=lambda item: (item["level_band"], item["content_type"], item["id"]))}
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        written_counts[str(path)] = len(items)

    removable = {
        PRIMARY_MATERIAL_ROOT / "edit_before_move.json",
        PRIMARY_MATERIAL_ROOT / "fraasit" / "lähihoitaja_fraasit" / "lähihoitaja_fraasit",
    }
    for path in removable:
        if path.exists():
            path.unlink()
    return written_counts


def iter_finalized_source_cards(root: Path) -> list[dict[str, Any]]:
    cards: list[dict[str, Any]] = []
    for path in sorted(root.rglob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        items = payload.get("cards")
        if not isinstance(items, list):
            raise RuntimeError(f"Source file {path} does not contain a cards list.")
        for item in items:
            if not isinstance(item, dict):
                raise RuntimeError(f"Source file {path} contains a non-object card entry.")
            cards.append(item)
    return cards


def compare_source_with_authority(cards: list[dict[str, Any]], source_cards: list[dict[str, Any]]) -> dict[str, Any]:
    authority_by_id = {card["id"]: source_card_payload(card) for card in cards}
    source_by_id = {card["id"]: card for card in source_cards}
    missing = sorted(set(authority_by_id) - set(source_by_id))
    extra = sorted(set(source_by_id) - set(authority_by_id))
    mismatched = []
    for card_id in sorted(set(authority_by_id) & set(source_by_id)):
        if authority_by_id[card_id] != source_by_id[card_id]:
            mismatched.append(card_id)
    return {
        "authority_count": len(cards),
        "source_count": len(source_cards),
        "missing_ids": missing,
        "extra_ids": extra,
        "mismatched_ids": mismatched,
        "source_distribution": dict(Counter(card["content_type"] for card in source_cards)),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rewrite", action="store_true")
    args = parser.parse_args()

    cards = load_authority()
    if args.rewrite:
        written = rewrite_sources(cards)
        print(json.dumps({"rewritten": written}, ensure_ascii=False, indent=2))

    source_cards = iter_finalized_source_cards(PRIMARY_MATERIAL_ROOT)
    comparison = compare_source_with_authority(cards, source_cards)
    print(json.dumps(comparison, ensure_ascii=False, indent=2))
    if (
        comparison["authority_count"] != comparison["source_count"]
        or comparison["missing_ids"]
        or comparison["extra_ids"]
        or comparison["mismatched_ids"]
    ):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
