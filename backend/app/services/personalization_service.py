"""Personalization Service v2 - Deep analytics and learning plan generation."""

from __future__ import annotations

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import Counter, defaultdict

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.services import grammar_engine, memory_service
from app.db.database import get_session
from app.db.models import GrammarLog, PronunciationLog


class PersonalizationService:
    """Advanced personalization with deep analytics and adaptive learning plans."""
    
    def __init__(self):
        self.error_patterns = defaultdict(list)
        self.vocabulary_tracking = defaultdict(int)
        self.pronunciation_history = []
        self.path_progress = defaultdict(dict)
    
    async def generate_learning_plan(self, user_id: str) -> Dict:
        """
        Generate comprehensive personalized learning plan.
        
        Analyzes:
        - Grammar error patterns
        - Vocabulary gaps
        - Pronunciation issues
        - Path mastery
        - Learning velocity
        """
        # Get user history
        messages = await memory_service.get_recent_messages(user_id, limit=100)
        grammar_logs = await self._get_grammar_logs(user_id)
        pronunciation_logs = await self._get_pronunciation_logs(user_id)
        
        # Analyze patterns
        error_analysis = self._analyze_grammar_errors(grammar_logs)
        vocab_analysis = self._analyze_vocabulary(messages)
        pronunciation_analysis = self._analyze_pronunciation(pronunciation_logs)
        progress_analysis = self._analyze_progress(user_id, messages)
        
        # Generate recommendations
        strengths = self._identify_strengths(error_analysis, vocab_analysis, pronunciation_analysis)
        weaknesses = self._identify_weaknesses(error_analysis, vocab_analysis, pronunciation_analysis)
        recommendations = self._generate_recommendations(weaknesses, progress_analysis)
        
        # Predict CEFR level
        predicted_level = self._predict_cefr_level(error_analysis, vocab_analysis, pronunciation_analysis)
        
        return {
            "user_id": user_id,
            "generated_at": datetime.now().isoformat(),
            "predicted_cefr": predicted_level,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations,
            "next_lessons": self._suggest_next_lessons(weaknesses, predicted_level),
            "vocabulary_focus": vocab_analysis.get("missing_core", []),
            "grammar_focus": error_analysis.get("top_errors", []),
            "progress_summary": progress_analysis,
            "profession": self._get_user_profession(user_id),
        }
    
    async def get_today_targets(self, user_id: str) -> Dict:
        """
        Get today's learning targets for recharge mode.
        
        Returns:
            Dict with vocabulary_focus, grammar_focus, profession, predicted_cefr
        """
        plan = await self.generate_learning_plan(user_id)
        return {
            "vocabulary_focus": plan.get("vocabulary_focus", []),
            "grammar_focus": plan.get("grammar_focus", []),
            "profession": plan.get("profession"),
            "predicted_cefr": plan.get("predicted_cefr", "A1"),
        }
    
    def _get_user_profession(self, user_id: str) -> str | None:
        """Get user's profession from path context (placeholder)."""
        # TODO: Query from user profile or path context
        return None
    
    async def track_progress(self, user_id: str, event: Dict) -> None:
        """Track user progress event."""
        event_type = event.get("type")
        
        if event_type == "grammar_error":
            self.error_patterns[user_id].append({
                "error_type": event.get("error_type"),
                "details": event.get("details"),
                "timestamp": datetime.now().isoformat(),
            })
        elif event_type == "vocabulary_used":
            word = event.get("word")
            if word:
                self.vocabulary_tracking[user_id] += 1
        elif event_type == "pronunciation":
            self.pronunciation_history.append({
                "user_id": user_id,
                "score": event.get("score"),
                "issues": event.get("issues", []),
                "timestamp": datetime.now().isoformat(),
            })
    
    def _analyze_grammar_errors(self, grammar_logs: List[Dict]) -> Dict:
        """Analyze grammar error patterns."""
        if not grammar_logs:
            return {"top_errors": [], "error_frequency": {}, "improving": True}
        
        error_types = Counter()
        error_details = defaultdict(list)
        
        for log in grammar_logs:
            mistakes = log.get("mistakes", [])
            for mistake in mistakes:
                error_type = mistake.get("type", "unknown")
                error_types[error_type] += 1
                error_details[error_type].append(mistake)
        
        # Check if improving (fewer errors in recent logs)
        recent_errors = len([log for log in grammar_logs[-10:] if log.get("mistakes")])
        older_errors = len([log for log in grammar_logs[:-10] if log.get("mistakes")]) if len(grammar_logs) > 10 else 0
        improving = recent_errors < older_errors if older_errors > 0 else True
        
        return {
            "top_errors": [error for error, count in error_types.most_common(5)],
            "error_frequency": dict(error_types),
            "improving": improving,
            "total_errors": sum(error_types.values()),
        }
    
    def _analyze_vocabulary(self, messages: List[Dict]) -> Dict:
        """Analyze vocabulary usage and gaps."""
        if not messages:
            return {"unique_words": 0, "vocabulary_depth": "low", "missing_core": []}
        
        # Extract all words from user messages
        all_words = []
        for msg in messages:
            if msg.get("role") == "user":
                text = msg.get("content", "")
                words = text.lower().split()
                all_words.extend(words)
        
        unique_words = len(set(all_words))
        
        # Check for core vocabulary
        core_vocab = ["hei", "kiitos", "anteeksi", "missä", "milloin", "haluan", "olen", "minä"]
        used_core = [word for word in core_vocab if word in all_words]
        missing_core = [word for word in core_vocab if word not in all_words]
        
        # Assess vocabulary depth
        if unique_words < 50:
            depth = "low"
        elif unique_words < 150:
            depth = "medium"
        else:
            depth = "high"
        
        return {
            "unique_words": unique_words,
            "vocabulary_depth": depth,
            "missing_core": missing_core,
            "core_coverage": len(used_core) / len(core_vocab) if core_vocab else 0,
        }
    
    def _analyze_pronunciation(self, pronunciation_logs: List[Dict]) -> Dict:
        """Analyze pronunciation patterns."""
        if not pronunciation_logs:
            return {"average_score": 0, "common_issues": [], "trend": "stable"}
        
        scores = [log.get("score", 0) for log in pronunciation_logs]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Track common issues
        all_issues = []
        for log in pronunciation_logs:
            all_issues.extend(log.get("vowel_issues", []))
            all_issues.extend(log.get("consonant_issues", []))
        
        issue_types = Counter([issue.get("type", "unknown") for issue in all_issues])
        common_issues = [issue for issue, count in issue_types.most_common(3)]
        
        # Check trend
        if len(scores) >= 5:
            recent_avg = sum(scores[-5:]) / 5
            older_avg = sum(scores[:-5]) / (len(scores) - 5) if len(scores) > 5 else recent_avg
            if recent_avg > older_avg + 0.3:
                trend = "improving"
            elif recent_avg < older_avg - 0.3:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"
        
        return {
            "average_score": avg_score,
            "common_issues": common_issues,
            "trend": trend,
        }
    
    def _analyze_progress(self, user_id: str, messages: List[Dict]) -> Dict:
        """Analyze overall learning progress."""
        if not messages:
            return {"sessions": 0, "messages_count": 0, "active_days": 0}
        
        # Count sessions (messages grouped by day)
        message_dates = set()
        for msg in messages:
            # Extract date from timestamp if available
            message_dates.add(datetime.now().date())  # Simplified
        
        return {
            "sessions": len(message_dates),
            "messages_count": len([m for m in messages if m.get("role") == "user"]),
            "active_days": len(message_dates),
            "last_activity": messages[-1].get("timestamp") if messages else None,
        }
    
    def _identify_strengths(
        self,
        error_analysis: Dict,
        vocab_analysis: Dict,
        pronunciation_analysis: Dict,
    ) -> List[str]:
        """Identify user's strengths."""
        strengths = []
        
        if error_analysis.get("improving"):
            strengths.append("Grammar accuracy is improving")
        
        if vocab_analysis.get("vocabulary_depth") in ("medium", "high"):
            strengths.append(f"Good vocabulary range ({vocab_analysis.get('unique_words')} unique words)")
        
        if pronunciation_analysis.get("average_score", 0) >= 3.0:
            strengths.append("Good pronunciation")
        
        if not strengths:
            strengths.append("Consistent practice")
        
        return strengths
    
    def _identify_weaknesses(
        self,
        error_analysis: Dict,
        vocab_analysis: Dict,
        pronunciation_analysis: Dict,
    ) -> List[Dict]:
        """Identify areas needing improvement."""
        weaknesses = []
        
        top_errors = error_analysis.get("top_errors", [])
        if top_errors:
            weaknesses.append({
                "area": "grammar",
                "issue": f"Common errors: {', '.join(top_errors[:3])}",
                "priority": "high" if error_analysis.get("total_errors", 0) > 10 else "medium",
            })
        
        missing_core = vocab_analysis.get("missing_core", [])
        if missing_core:
            weaknesses.append({
                "area": "vocabulary",
                "issue": f"Missing core words: {', '.join(missing_core[:5])}",
                "priority": "medium",
            })
        
        if pronunciation_analysis.get("average_score", 0) < 2.5:
            common_issues = pronunciation_analysis.get("common_issues", [])
            weaknesses.append({
                "area": "pronunciation",
                "issue": f"Pronunciation issues: {', '.join(common_issues[:2])}",
                "priority": "medium",
            })
        
        return weaknesses
    
    def _generate_recommendations(self, weaknesses: List[Dict], progress: Dict) -> List[str]:
        """Generate personalized recommendations."""
        recommendations = []
        
        for weakness in weaknesses:
            area = weakness.get("area")
            if area == "grammar":
                recommendations.append("Harjoittele lisää kielioppia: keskitty erityisesti yleisimpiin virheisiin.")
            elif area == "vocabulary":
                recommendations.append("Laajenna sanavarastoa: opettele uusia sanoja päivittäin.")
            elif area == "pronunciation":
                recommendations.append("Harjoittele ääntämistä: keskitty vokaali- ja konsonanttipituuksiin.")
        
        if progress.get("active_days", 0) < 3:
            recommendations.append("Harjoittele säännöllisemmin: tavoittele vähintään 3 kertaa viikossa.")
        
        if not recommendations:
            recommendations.append("Jatka hyvää työtä! Harjoittele monipuolisesti.")

        return recommendations

    async def get_today_targets(self, user_id: str) -> Dict:
        """Return a lightweight target set for today's session."""
        plan = await self.generate_learning_plan(user_id)
        return {
            "user_id": user_id,
            "vocabulary_focus": plan.get("vocabulary_focus", []),
            "grammar_focus": plan.get("grammar_focus", []),
            "predicted_cefr": plan.get("predicted_cefr"),
            "strengths": plan.get("strengths", []),
            "weaknesses": plan.get("weaknesses", []),
        }
    
    def _suggest_next_lessons(self, weaknesses: List[Dict], level: str) -> List[Dict]:
        """Suggest next lessons based on weaknesses."""
        suggestions = []
        
        for weakness in weaknesses[:3]:  # Top 3 weaknesses
            area = weakness.get("area")
            if area == "grammar":
                suggestions.append({
                    "type": "grammar",
                    "topic": weakness.get("issue", "Grammar practice"),
                    "level": level,
                    "priority": weakness.get("priority", "medium"),
                })
            elif area == "vocabulary":
                suggestions.append({
                    "type": "vocabulary",
                    "topic": "Core vocabulary",
                    "level": level,
                    "priority": weakness.get("priority", "medium"),
                })
        
        return suggestions
    
    def _predict_cefr_level(
        self,
        error_analysis: Dict,
        vocab_analysis: Dict,
        pronunciation_analysis: Dict,
    ) -> str:
        """Predict CEFR level based on analysis."""
        # Simple heuristic prediction
        error_count = error_analysis.get("total_errors", 0)
        vocab_size = vocab_analysis.get("unique_words", 0)
        pron_score = pronunciation_analysis.get("average_score", 0)
        
        # Score components (0-4 each)
        error_score = max(0, 4 - (error_count / 5))  # Fewer errors = higher score
        vocab_score = min(4, vocab_size / 40)  # More vocab = higher score
        pron_score_norm = pron_score  # Already 0-4
        
        avg_score = (error_score + vocab_score + pron_score_norm) / 3
        
        if avg_score < 1.5:
            return "A1"
        elif avg_score < 2.0:
            return "A2.1"
        elif avg_score < 2.5:
            return "A2.2"
        elif avg_score < 3.0:
            return "B1.1"
        else:
            return "B1.2"
    
    async def _get_grammar_logs(self, user_id: str) -> List[Dict]:
        """Get grammar error logs for user from database."""
        try:
            async for session in get_session():
                result = await session.execute(
                    select(GrammarLog)
                    .where(GrammarLog.user_id == user_id)
                    .order_by(GrammarLog.created_at.desc())
                    .limit(100)
                )
                logs = result.scalars().all()
                
                # Convert to dict format
                return [
                    {
                        "id": log.id,
                        "original_text": log.original_text,
                        "corrected_text": log.corrected_text,
                        "mistakes": log.mistakes or [],
                        "created_at": log.created_at.isoformat() if log.created_at else None,
                    }
                    for log in logs
                ]
        except Exception:
            # Fallback: return empty list if database not available
            return []
    
    async def _get_pronunciation_logs(self, user_id: str) -> List[Dict]:
        """Get pronunciation logs for user from database."""
        try:
            async for session in get_session():
                result = await session.execute(
                    select(PronunciationLog)
                    .where(PronunciationLog.user_id == user_id)
                    .order_by(PronunciationLog.created_at.desc())
                    .limit(100)
                )
                logs = result.scalars().all()
                
                # Convert to dict format
                return [
                    {
                        "id": log.id,
                        "transcript": log.transcript,
                        "expected_text": log.expected_text,
                        "score": log.score,
                        "issues": log.issues or [],
                        "created_at": log.created_at.isoformat() if log.created_at else None,
                    }
                    for log in logs
                ]
        except Exception:
            # Fallback: return empty list if database not available
            return []


# Global instance
_personalization_service = PersonalizationService()


async def generate_learning_plan(user_id: str) -> Dict:
    """Generate personalized learning plan."""
    return await _personalization_service.generate_learning_plan(user_id)


async def track_progress(user_id: str, event: Dict) -> None:
    """Track user progress event."""
    await _personalization_service.track_progress(user_id, event)


async def get_today_targets(user_id: str) -> Dict:
    """
    Get today's learning targets for recharge mode.
    
    Returns:
        Dict with vocabulary_focus, grammar_focus, profession, predicted_cefr
    """
    plan = await generate_learning_plan(user_id)
    return {
        "vocabulary_focus": plan.get("vocabulary_focus", []),
        "grammar_focus": plan.get("grammar_focus", []),
        "profession": plan.get("profession"),
        "predicted_cefr": plan.get("predicted_cefr", "A1"),
    }
