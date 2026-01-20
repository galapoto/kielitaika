"""Engagement + notification helper stubs (daily reminders, streak logic)."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List


class EngagementService:
    """Generates notification suggestions and engagement prompts."""

    def generate_daily_notifications(self, user_id: str | None) -> List[Dict]:
        """
        Return suggested daily notifications (morning vocab, afternoon grammar, evening micro task).

        TODO: integrate with real notification scheduler or Expo push tokens.
        """
        return [
            {"time": "08:00", "message": "3 words to kickstart your Finnish today!"},
            {"time": "13:00", "message": "Your grammar snack is ready 🍪"},
            {"time": "19:00", "message": "Finish your day with a 10-second speaking task!"},
        ]

    def evaluate_engagement_state(self, user_id: str | None) -> Dict:
        """
        Lightweight streak messaging.

        TODO: query actual streaks from DB when available.
        """
        return {
            "message": "No worries! Today is a fresh start 😊",
            "timestamp": datetime.utcnow().isoformat(),
        }

    def build_micro_challenge_prompt(self, user_id: str | None) -> str:
        """
        Return a quick micro output challenge line.

        TODO: personalize with user history.
        """
        return "Say one thing you can see right now."


_engagement_service = EngagementService()


def generate_daily_notifications(user_id: str | None) -> List[Dict]:
    return _engagement_service.generate_daily_notifications(user_id)


def evaluate_engagement_state(user_id: str | None) -> Dict:
    return _engagement_service.evaluate_engagement_state(user_id)


def build_micro_challenge_prompt(user_id: str | None) -> str:
    return _engagement_service.build_micro_challenge_prompt(user_id)


async def calculate_xp_reward(
    user_id: str,
    vocab_done: bool = False,
    grammar_done: bool = False,
    challenge_done: bool = False,
    conversation_done: bool = False,
) -> Dict:
    """
    Lightweight XP calculator stub until real streak/XP tables exist.

    Mirrors the Recharge spec:
      vocab_done: +2
      grammar_done: +2
      challenge_done: +3
      conversation_done: +5
    """
    xp = 0
    if vocab_done:
        xp += 2
    if grammar_done:
        xp += 2
    if challenge_done:
        xp += 3
    if conversation_done:
        xp += 5

    return {
        "user_id": user_id,
        "xp_awarded": xp,
        "breakdown": {
            "vocab": 2 if vocab_done else 0,
            "grammar": 2 if grammar_done else 0,
            "challenge": 3 if challenge_done else 0,
            "conversation": 5 if conversation_done else 0,
        },
    }


