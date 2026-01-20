"""YKI Full Exam Simulation Service - Complete exam experience."""

from __future__ import annotations

from typing import Dict, List, Optional
from datetime import datetime, timedelta

from app.services import yki_engine


YKI_TASK_TYPES = {
    "speaking": [
        {
            "id": "speaking_1",
            "type": "monologue",
            "prompt": "Kerro minulle päivästäsi. Mitä teit tänään?",
            "time_limit": 90,
            "description": "Puhu vapaasti päivästäsi noin 90 sekuntia.",
        },
        {
            "id": "speaking_2",
            "type": "advice",
            "prompt": "Ystäväsi haluaa muuttaa Suomeen. Anna hänelle kolme neuvoa.",
            "time_limit": 90,
            "description": "Anna neuvoja noin 90 sekuntia.",
        },
        {
            "id": "speaking_3",
            "type": "comparison",
            "prompt": "Vertaile kahta asiaa: esimerkiksi kaupunki vs. maaseutu, tai kesä vs. talvi.",
            "time_limit": 90,
            "description": "Vertaile noin 90 sekuntia.",
        },
        {
            "id": "speaking_4",
            "type": "opinion",
            "prompt": "Kerro mielipiteesi jostain aiheesta. Esimerkiksi: Onko työ tärkeämpää kuin vapaa-aika?",
            "time_limit": 90,
            "description": "Ilmaise mielipiteesi noin 90 sekuntia.",
        },
    ],
    "writing": [
        {
            "id": "writing_1",
            "type": "email",
            "prompt": "Kirjoita sähköposti ystävällesi. Kerro mitä olet tehnyt viime aikoina ja kysy hänen uutisiaan.",
            "word_limit": 80,
            "time_limit": 20,
            "description": "Kirjoita noin 80 sanaa, aikaa 20 minuuttia.",
        },
        {
            "id": "writing_2",
            "type": "opinion",
            "prompt": "Kirjoita mielipidekirjoitus: Onko tärkeämpää opiskella kieliä vai matematiikkaa?",
            "word_limit": 120,
            "time_limit": 25,
            "description": "Kirjoita noin 120 sanaa, aikaa 25 minuuttia.",
        },
        {
            "id": "writing_3",
            "type": "story",
            "prompt": "Kerro lyhyt tarina: 'Eräänä päivänä...'",
            "word_limit": 100,
            "time_limit": 20,
            "description": "Kirjoita noin 100 sanaa, aikaa 20 minuuttia.",
        },
    ],
}


def generate_exam(exam_type: str = "full", level: str = "intermediate") -> Dict:
    """
    Generate a complete YKI exam simulation.
    
    Args:
        exam_type: "full", "speaking_only", "writing_only"
        level: "basic" (A1-A2) or "intermediate" (B1-B2)
    
    Returns:
        Exam structure with tasks and timing
    """
    exam = {
        "exam_id": f"yki_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "exam_type": exam_type,
        "level": level,
        "created_at": datetime.now().isoformat(),
        "tasks": [],
        "total_time_minutes": 0,
    }
    
    if exam_type in ("full", "speaking_only"):
        speaking_tasks = YKI_TASK_TYPES["speaking"][:4]  # All 4 speaking tasks
        exam["tasks"].extend(speaking_tasks)
        exam["total_time_minutes"] += sum(t["time_limit"] for t in speaking_tasks) // 60
    
    if exam_type in ("full", "writing_only"):
        writing_tasks = YKI_TASK_TYPES["writing"][:3]  # All 3 writing tasks
        exam["tasks"].extend(writing_tasks)
        exam["total_time_minutes"] += sum(t["time_limit"] for t in writing_tasks)
    
    return exam


def evaluate_exam_submission(
    exam_id: str,
    speaking_responses: List[Dict[str, str]],
    writing_responses: List[Dict[str, str]],
) -> Dict:
    """
    Evaluate a complete exam submission.
    
    Args:
        exam_id: Exam identifier
        speaking_responses: [{"task_id": "...", "transcript": "..."}, ...]
        writing_responses: [{"task_id": "...", "text": "..."}, ...]
    
    Returns:
        Complete evaluation with band predictions
    """
    speaking_scores = []
    writing_scores = []
    
    # Evaluate speaking tasks
    for response in speaking_responses:
        transcript = response.get("transcript", "")
        if transcript:
            evaluation = yki_engine.evaluate_speaking(transcript)
            speaking_scores.append({
                "task_id": response.get("task_id"),
                "scores": evaluation.get("scores", {}),
                "band": evaluation.get("band", "A2.1"),
            })
    
    # Evaluate writing tasks
    for response in writing_responses:
        text = response.get("text", "")
        if text:
            evaluation = yki_engine.evaluate_writing(text)
            writing_scores.append({
                "task_id": response.get("task_id"),
                "scores": evaluation.get("scores", {}),
                "band": evaluation.get("band", "A2.1"),
            })
    
    # Calculate overall band
    all_bands = [s["band"] for s in speaking_scores + writing_scores]
    overall_band = _calculate_overall_band(all_bands)
    
    # Generate readiness assessment
    readiness = _assess_readiness(speaking_scores, writing_scores, overall_band)
    
    return {
        "exam_id": exam_id,
        "speaking_results": speaking_scores,
        "writing_results": writing_scores,
        "overall_band": overall_band,
        "readiness": readiness,
        "recommendations": _generate_recommendations(speaking_scores, writing_scores),
    }


def _calculate_overall_band(bands: List[str]) -> str:
    """Calculate overall CEFR band from individual task bands."""
    if not bands:
        return "A2.1"
    
    # Convert bands to numeric scores
    band_scores = {
        "A2.1": 1.0,
        "A2.2": 1.5,
        "B1.1": 2.5,
        "B1.2": 3.0,
    }
    
    scores = [band_scores.get(band, 1.0) for band in bands]
    avg_score = sum(scores) / len(scores)
    
    if avg_score < 1.25:
        return "A2.1"
    elif avg_score < 1.75:
        return "A2.2"
    elif avg_score < 2.75:
        return "B1.1"
    else:
        return "B1.2"


def _assess_readiness(
    speaking_scores: List[Dict],
    writing_scores: List[Dict],
    overall_band: str,
) -> Dict:
    """Assess if user is ready for the actual YKI exam."""
    # Check band stability
    all_bands = [s["band"] for s in speaking_scores + writing_scores]
    band_variance = len(set(all_bands))
    
    # Check minimum scores
    min_speaking = min([sum(s["scores"].values()) / len(s["scores"]) for s in speaking_scores], default=0)
    min_writing = min([sum(s["scores"].values()) / len(s["scores"]) for s in writing_scores], default=0)
    
    ready = (
        band_variance <= 2 and  # Consistent performance
        min_speaking >= 2.0 and  # Minimum speaking level
        min_writing >= 2.0 and  # Minimum writing level
        overall_band in ("B1.1", "B1.2")  # Target level
    )
    
    return {
        "ready": ready,
        "confidence": "high" if ready and band_variance == 1 else "medium" if ready else "low",
        "band_stability": "stable" if band_variance <= 2 else "unstable",
        "weakest_area": _identify_weakest_area(speaking_scores, writing_scores),
    }


def _identify_weakest_area(speaking_scores: List[Dict], writing_scores: List[Dict]) -> str:
    """Identify the weakest area (fluency, grammar, vocabulary, etc.)."""
    if not speaking_scores and not writing_scores:
        return "general"
    
    # Aggregate scores by category
    categories = {
        "fluency": [],
        "grammar": [],
        "vocabulary": [],
        "structure": [],
    }
    
    for score_dict in speaking_scores + writing_scores:
        scores = score_dict.get("scores", {})
        if "fluency" in scores:
            categories["fluency"].append(scores["fluency"])
        if "grammar" in scores or "accuracy" in scores:
            categories["grammar"].append(scores.get("grammar") or scores.get("accuracy", 0))
        if "vocabulary" in scores:
            categories["vocabulary"].append(scores["vocabulary"])
        if "structure" in scores:
            categories["structure"].append(scores["structure"])
    
    # Find category with lowest average
    avg_scores = {
        cat: sum(vals) / len(vals) if vals else 4.0
        for cat, vals in categories.items()
    }
    
    return min(avg_scores.items(), key=lambda x: x[1])[0]


def _generate_recommendations(
    speaking_scores: List[Dict],
    writing_scores: List[Dict],
) -> List[str]:
    """Generate personalized recommendations for improvement."""
    recommendations = []
    
    # Analyze speaking
    if speaking_scores:
        avg_fluency = sum(s["scores"].get("fluency", 0) for s in speaking_scores) / len(speaking_scores)
        if avg_fluency < 2.5:
            recommendations.append("Harjoittele sujuvuutta: puhu pidempiä lauseita ilman pitkiä taukoja.")
        
        avg_vocab = sum(s["scores"].get("vocabulary", 0) for s in speaking_scores) / len(speaking_scores)
        if avg_vocab < 2.5:
            recommendations.append("Laajenna sanavarastoa: käytä monipuolisempia sanoja ja ilmaisuja.")
    
    # Analyze writing
    if writing_scores:
        avg_structure = sum(s["scores"].get("structure", 0) for s in writing_scores) / len(writing_scores)
        if avg_structure < 2.5:
            recommendations.append("Harjoittele tekstin rakennetta: käytä useampia lauseita ja kappaleita.")
        
        avg_task = sum(s["scores"].get("task_completion", 0) for s in writing_scores) / len(writing_scores)
        if avg_task < 2.5:
            recommendations.append("Vastaa tehtävän vaatimuksiin täydellisemmin: tarkista sanamäärä ja aihe.")
    
    if not recommendations:
        recommendations.append("Hyvä työ! Jatka harjoittelua ylläpitääksesi tason.")
    
    return recommendations
