from yki.contracts import DEFAULT_USER_ID, SECTION_ORDER
from yki.storage import InMemorySessionStorage, RedisSessionStorage

ADAPTIVE_CRITERIA_ORDER = [
    "content",
    "clarity",
    "relevance",
    "language_accuracy",
    "fluency",
    "pronunciation",
]

storage = InMemorySessionStorage()
try:
    storage = RedisSessionStorage()
except Exception:
    storage = InMemorySessionStorage()


def get_trend_label(progression):
    if len(progression) < 2:
        return "stable"
    if progression[-1] > progression[0]:
        return "improving"
    if progression[-1] < progression[0]:
        return "declining"
    return "stable"


def get_ranked_patterns(counts, preferred_order):
    ranked = sorted(
        counts.items(),
        key=lambda item: (-item[1], preferred_order.index(item[0])),
    )
    return [name for name, count in ranked if count > 0][:3]


def build_history_overview(history):
    progression = [item["overall_score"] for item in history]
    current_level = history[-1]["level"] if history else None

    weak_counts = {name: 0 for name in ADAPTIVE_CRITERIA_ORDER}
    section_totals = {name: 0 for name in SECTION_ORDER}
    section_counts = {name: 0 for name in SECTION_ORDER}

    for item in history:
        for weak_area in item.get("weak_areas", []):
            if weak_area in weak_counts:
                weak_counts[weak_area] += 1

        for section_name in SECTION_ORDER:
            score = item.get("section_scores", {}).get(section_name)
            if score is None:
                continue
            section_totals[section_name] += score
            section_counts[section_name] += 1

    section_averages = {}
    for section_name in SECTION_ORDER:
        count = section_counts[section_name]
        if count:
            section_averages[section_name] = round(section_totals[section_name] / count)

    weak_patterns = get_ranked_patterns(weak_counts, ADAPTIVE_CRITERIA_ORDER)
    strong_patterns = get_ranked_patterns(section_averages, SECTION_ORDER)

    return {
        "progression": progression,
        "current_level": current_level,
        "trend": get_trend_label(progression),
        "weak_patterns": weak_patterns,
        "strong_patterns": strong_patterns,
    }


def get_history_overview(user_id: str):
    history = storage.get_history(user_id)
    history = sorted(history, key=lambda item: item["date"])
    overview = build_history_overview(history)

    return {
        "sessions": history,
        "progression": overview["progression"],
        "current_level": overview["current_level"],
        "trend": overview["trend"],
        "weak_patterns": overview["weak_patterns"],
        "strong_patterns": overview["strong_patterns"],
    }


def get_progress_history(user_id: str = DEFAULT_USER_ID):
    return get_history_overview(user_id)
