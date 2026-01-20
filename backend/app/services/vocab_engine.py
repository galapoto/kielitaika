"""Vocabulary utilities for general + workplace Finnish."""

from __future__ import annotations

from typing import Dict, List, Optional

from app.services import workplace_engine

GENERAL_VOCAB = [
    ("hei", "hello"),
    ("kiitos", "thank you"),
    ("anteeksi", "sorry / excuse me"),
    ("missä", "where"),
    ("milloin", "when"),
    ("paljonko", "how much"),
    ("haluaisin", "I would like"),
    ("tarvitsen apua", "I need help"),
]

WORKPLACE_CORE = {
    "sairaanhoitaja": [
        ("potilas", "patient"),
        ("vuororaportti", "shift report"),
        ("lääkehoito", "medication"),
        ("mittaus", "measurement"),
    ],
    "laakari": [
        ("diagnoosi", "diagnosis"),
        ("lähete", "referral"),
        ("hoitosuunnitelma", "treatment plan"),
    ],
    "ict": [
        ("palaveri", "meeting"),
        ("tiketti", "ticket"),
        ("julkaisu", "release"),
        ("bugi", "bug"),
    ],
    "sahkoinsinoori": [
        ("jännite", "voltage"),
        ("kaapeli", "cable"),
        ("turvallisuus", "safety"),
        ("asennus", "installation"),
    ],
    "hoiva-avustaja": [
        ("asiakas", "client"),
        ("päiväohjelma", "daily program"),
        ("havainto", "observation"),
        ("raportti", "report"),
    ],
    "rakennus": [
        ("työmaa", "construction site"),
        ("työkalu", "tool"),
        ("materiaali", "material"),
        ("turvallisuus", "safety"),
    ],
    "siivous": [
        ("siivous", "cleaning"),
        ("väline", "tool"),
        ("alue", "area"),
        ("tarkistus", "inspection"),
    ],
    "logistiikka": [
        ("varasto", "warehouse"),
        ("tavara", "goods"),
        ("lähetys", "shipment"),
        ("inventaario", "inventory"),
    ],
    "ravintola": [
        ("asiakas", "customer"),
        ("tilaus", "order"),
        ("ruoka", "food"),
        ("palvelu", "service"),
    ],
    "myynti": [
        ("asiakas", "customer"),
        ("tuote", "product"),
        ("hinta", "price"),
        ("tarjous", "offer"),
    ],
    "varhaiskasvatus": [
        ("lapsi", "child"),
        ("aktiviteetti", "activity"),
        ("havainto", "observation"),
        ("vanhempi", "parent"),
    ],
}


def get_vocab_units(path: str = "general", field: Optional[str] = None, limit: int = 12) -> List[dict]:
    """Return vocabulary units for a given path/field."""
    normalized = (path or "general").lower()
    if normalized == "workplace" and field:
        items = WORKPLACE_CORE.get(_normalize_field(field), [])
    else:
        items = GENERAL_VOCAB
    return [
        {"fi": finnish, "en": english}
        for finnish, english in items[:limit]
    ]


def detect_missing_vocab(field: str, transcript: str) -> List[str]:
    """Highlight workplace vocabulary that was not used in a transcript."""
    key = _normalize_field(field)
    vocab_list = WORKPLACE_CORE.get(key, [])
    text = transcript.lower()
    return [word for word, _ in vocab_list if word not in text]


def build_spaced_repetition_list(error_terms: List[str], field: Optional[str] = None, limit: int = 15) -> List[str]:
    """
    Combine recent errors with core vocabulary to form a review set.

    The list is small and deterministic so mobile clients can show it offline.
    """
    queue: List[str] = []
    seen: set[str] = set()
    for term in error_terms:
        term_lower = term.lower().strip()
        if term_lower and term_lower not in seen:
            queue.append(term_lower)
            seen.add(term_lower)
    if field:
        for word, _ in WORKPLACE_CORE.get(_normalize_field(field), []):
            if word not in seen:
                queue.append(word)
                seen.add(word)
    for word, _ in GENERAL_VOCAB:
        if word not in seen:
            queue.append(word)
            seen.add(word)
    return queue[:limit]


def _normalize_field(value: str) -> str:
    return (value or "").strip().lower()
