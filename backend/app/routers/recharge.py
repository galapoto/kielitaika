from fastapi import APIRouter
from datetime import datetime, date
from typing import Dict
from sqlalchemy import select

from app.services.daily_recharge_engine import generate_today_recharge
from app.db.database import get_session
from app.db.models import DailyRecharge, UserDailyState, RechargeHistory

router = APIRouter()


@router.get("/today")
async def today(user_id: str | None = None):
    """Return today's recharge pack (vocab, grammar bite, mini challenge)."""
    bundle = await generate_today_recharge(user_id)
    
    # Store in database if user_id provided
    if user_id:
        try:
            async for session in get_session():
                # Check if today's recharge already exists
                from sqlalchemy import select, func
                today_start = datetime.combine(date.today(), datetime.min.time())
                today_end = datetime.combine(date.today(), datetime.max.time())
                
                existing = await session.execute(
                    select(DailyRecharge).where(
                        DailyRecharge.user_id == user_id,
                        DailyRecharge.date >= today_start,
                        DailyRecharge.date <= today_end,
                    )
                )
                existing_recharge = existing.scalar_one_or_none()
                
                if not existing_recharge:
                    # Create new recharge entry
                    import json
                    recharge = DailyRecharge(
                        user_id=user_id,
                        date=datetime.utcnow(),
                        vocab_json=json.dumps(bundle.get("vocab", [])),
                        grammar_json=json.dumps(bundle.get("grammar", {})),
                        challenge_json=json.dumps(bundle.get("mini_challenge", {})),
                        topic=bundle.get("next_conversation_topic", ""),
                        completed="false",
                    )
                    session.add(recharge)
                    await session.commit()
        except Exception as e:
            # Log error but don't fail the request
            print(f"Error storing recharge: {e}")
    
    return {"recharge": bundle}


@router.post("/update")
async def update_recharge(payload: Dict):
    """
    Mark a recharge section as completed.
    
    Payload: { "user_id": str, "section": "vocab" | "grammar" | "challenge" }
    """
    user_id = payload.get("user_id")
    section = payload.get("section")  # "vocab", "grammar", "challenge"
    
    if not user_id or not section:
        return {"error": "user_id and section required"}
    
    try:
        async for session in get_session():
            today_start = datetime.combine(date.today(), datetime.min.time())
            today_end = datetime.combine(date.today(), datetime.max.time())
            
            # Get or create today's state
            state_query = await session.execute(
                select(UserDailyState).where(
                    UserDailyState.user_id == user_id,
                    UserDailyState.date >= today_start,
                    UserDailyState.date <= today_end,
                )
            )
            state = state_query.scalar_one_or_none()
            
            if not state:
                state = UserDailyState(
                    user_id=user_id,
                    date=datetime.utcnow(),
                )
                session.add(state)
            
            # Update section
            if section == "vocab":
                state.vocab_done = "true"
            elif section == "grammar":
                state.grammar_done = "true"
            elif section == "challenge":
                state.challenge_done = "true"
            
            await session.commit()
            
            return {"status": "updated", "section": section}
    except Exception as e:
        return {"error": str(e)}


@router.post("/complete")
async def complete_recharge(payload: Dict):
    """
    Mark conversation as done and calculate XP.
    
    Payload: { "user_id": str, "vocab_done": bool, "grammar_done": bool, "challenge_done": bool, "conversation_done": bool }
    """
    user_id = payload.get("user_id")
    if not user_id:
        return {"error": "user_id required"}
    
    vocab_done = payload.get("vocab_done", False)
    grammar_done = payload.get("grammar_done", False)
    challenge_done = payload.get("challenge_done", False)
    conversation_done = payload.get("conversation_done", False)
    
    # Calculate XP
    xp_earned = 0
    if vocab_done:
        xp_earned += 2
    if grammar_done:
        xp_earned += 2
    if challenge_done:
        xp_earned += 3
    if conversation_done:
        xp_earned += 5
    
    try:
        async for session in get_session():
            today_start = datetime.combine(date.today(), datetime.min.time())
            today_end = datetime.combine(date.today(), datetime.max.time())
            
            # Update daily state
            from sqlalchemy import select
            state_query = await session.execute(
                select(UserDailyState).where(
                    UserDailyState.user_id == user_id,
                    UserDailyState.date >= today_start,
                    UserDailyState.date <= today_end,
                )
            )
            state = state_query.scalar_one_or_none()
            
            if not state:
                state = UserDailyState(
                    user_id=user_id,
                    date=datetime.utcnow(),
                )
                session.add(state)
            
            state.vocab_done = "true" if vocab_done else state.vocab_done
            state.grammar_done = "true" if grammar_done else state.grammar_done
            state.challenge_done = "true" if challenge_done else state.challenge_done
            state.conversation_done = "true" if conversation_done else state.conversation_done
            state.xp_earned = xp_earned
            
            await session.commit()
            
            return {
                "status": "completed",
                "xp_earned": xp_earned,
                "message": f"Great job! You earned {xp_earned} XP today! 🎉" if xp_earned > 0 else "Keep going!",
            }
    except Exception as e:
        return {"error": str(e)}
