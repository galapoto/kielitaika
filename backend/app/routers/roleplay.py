from __future__ import annotations

from datetime import datetime
from typing import List, Optional
import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_session
from app.db.models import RoleplayAttempt, RoleplayTurn, RoleplayScore
from app.routers.auth import get_current_user
from app.services.roleplay_scoring import score_roleplay

router = APIRouter(prefix="/roleplay", tags=["roleplay"])
log = logging.getLogger("puhis.roleplay")


class RoleplayTurnPayload(BaseModel):
    turn_index: int
    ai_transcript: str
    user_transcript: str
    ai_timestamp: Optional[datetime] = None
    user_timestamp: Optional[datetime] = None


class RoleplayCompletePayload(BaseModel):
    client_session_id: str = Field(..., min_length=6)
    profession_field: str
    cefr_level: str
    scenario_id: Optional[str] = None
    scenario_title: Optional[str] = None
    session_start_time: datetime
    session_end_time: datetime
    session_duration: int
    turns: List[RoleplayTurnPayload]


class RoleplayAttemptResponse(BaseModel):
    attempt_id: str
    status: str


class RoleplayScoreResponse(BaseModel):
    attempt_id: str
    overall_score: float
    fluency_score: float
    grammar_score: float
    vocabulary_score: float
    relevance_score: float
    cefr_estimate: Optional[str]
    feedback_fi: str


class RoleplayAttemptDetail(BaseModel):
    attempt_id: str
    user_id: str
    profession_field: str
    cefr_level: str
    scenario_id: Optional[str]
    scenario_title: Optional[str]
    session_start_time: datetime
    session_end_time: datetime
    session_duration: int
    turns: List[RoleplayTurnPayload]
    score: Optional[RoleplayScoreResponse] = None


@router.post("/complete", response_model=RoleplayAttemptResponse)
async def complete_roleplay(
    payload: RoleplayCompletePayload,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    if not payload.turns or len(payload.turns) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incomplete session: no turns provided",
        )

    # Enforce completion-only persistence
    if payload.session_end_time <= payload.session_start_time or payload.session_duration <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incomplete session: invalid session timing",
        )
    for turn in payload.turns:
        if not turn.ai_transcript.strip() or not turn.user_transcript.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incomplete session: missing transcripts",
            )

    # Idempotency by client_session_id + user_id
    existing = await session.execute(
        select(RoleplayAttempt).where(
            RoleplayAttempt.client_session_id == payload.client_session_id,
            RoleplayAttempt.user_id == current_user.id,
        )
    )
    attempt = existing.scalar_one_or_none()
    if attempt:
        log.info("roleplay.complete idempotent attempt_id=%s", attempt.id)
        return RoleplayAttemptResponse(attempt_id=attempt.id, status="existing")

    attempt = RoleplayAttempt(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        client_session_id=payload.client_session_id,
        profession_field=payload.profession_field,
        cefr_level=payload.cefr_level,
        scenario_id=payload.scenario_id,
        scenario_title=payload.scenario_title,
        session_start_time=payload.session_start_time,
        session_end_time=payload.session_end_time,
        session_duration=payload.session_duration,
    )
    session.add(attempt)

    turns = []
    for turn in payload.turns:
        turns.append(RoleplayTurn(
            attempt_id=attempt.id,
            turn_index=turn.turn_index,
            ai_transcript=turn.ai_transcript,
            user_transcript=turn.user_transcript,
            ai_timestamp=turn.ai_timestamp,
            user_timestamp=turn.user_timestamp,
        ))

    session.add_all(turns)
    await session.commit()

    log.info("roleplay.complete stored attempt_id=%s", attempt.id)
    return RoleplayAttemptResponse(attempt_id=attempt.id, status="created")


@router.post("/score", response_model=RoleplayScoreResponse)
async def score_roleplay_attempt(
    attempt_id: str = Field(..., min_length=6),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    attempt_res = await session.execute(
        select(RoleplayAttempt).where(RoleplayAttempt.id == attempt_id)
    )
    attempt = attempt_res.scalar_one_or_none()
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")

    existing_score = await session.execute(
        select(RoleplayScore).where(RoleplayScore.attempt_id == attempt_id)
    )
    score = existing_score.scalar_one_or_none()
    if score:
        return RoleplayScoreResponse(
            attempt_id=attempt.id,
            overall_score=score.overall_score,
            fluency_score=score.fluency_score,
            grammar_score=score.grammar_score,
            vocabulary_score=score.vocabulary_score,
            relevance_score=score.relevance_score,
            cefr_estimate=score.cefr_estimate,
            feedback_fi=score.feedback_fi,
        )

    turns_res = await session.execute(
        select(RoleplayTurn).where(RoleplayTurn.attempt_id == attempt_id).order_by(RoleplayTurn.turn_index)
    )
    turns = turns_res.scalars().all()
    if not turns:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot score empty attempt")

    score_result = score_roleplay(
        turns=[{
            "turn_index": t.turn_index,
            "ai_transcript": t.ai_transcript,
            "user_transcript": t.user_transcript,
        } for t in turns],
        profession_field=attempt.profession_field,
        cefr_level=attempt.cefr_level,
    )

    score = RoleplayScore(
        attempt_id=attempt.id,
        overall_score=score_result.overall_score,
        fluency_score=score_result.fluency_score,
        grammar_score=score_result.grammar_score,
        vocabulary_score=score_result.vocabulary_score,
        relevance_score=score_result.relevance_score,
        cefr_estimate=score_result.cefr_estimate,
        feedback_fi=score_result.feedback_fi,
    )
    session.add(score)
    await session.commit()

    log.info("roleplay.score created attempt_id=%s", attempt.id)
    return RoleplayScoreResponse(
        attempt_id=attempt.id,
        overall_score=score.overall_score,
        fluency_score=score.fluency_score,
        grammar_score=score.grammar_score,
        vocabulary_score=score.vocabulary_score,
        relevance_score=score.relevance_score,
        cefr_estimate=score.cefr_estimate,
        feedback_fi=score.feedback_fi,
    )


@router.get("/{attempt_id}", response_model=RoleplayAttemptDetail)
async def get_roleplay_attempt(
    attempt_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    attempt_res = await session.execute(
        select(RoleplayAttempt).where(RoleplayAttempt.id == attempt_id)
    )
    attempt = attempt_res.scalar_one_or_none()
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")

    turns_res = await session.execute(
        select(RoleplayTurn).where(RoleplayTurn.attempt_id == attempt_id).order_by(RoleplayTurn.turn_index)
    )
    turns = turns_res.scalars().all()

    score_res = await session.execute(
        select(RoleplayScore).where(RoleplayScore.attempt_id == attempt_id)
    )
    score = score_res.scalar_one_or_none()

    return RoleplayAttemptDetail(
        attempt_id=attempt.id,
        user_id=attempt.user_id,
        profession_field=attempt.profession_field,
        cefr_level=attempt.cefr_level,
        scenario_id=attempt.scenario_id,
        scenario_title=attempt.scenario_title,
        session_start_time=attempt.session_start_time,
        session_end_time=attempt.session_end_time,
        session_duration=attempt.session_duration,
        turns=[
            RoleplayTurnPayload(
                turn_index=t.turn_index,
                ai_transcript=t.ai_transcript,
                user_transcript=t.user_transcript,
                ai_timestamp=t.ai_timestamp,
                user_timestamp=t.user_timestamp,
            )
            for t in turns
        ],
        score=RoleplayScoreResponse(
            attempt_id=attempt.id,
            overall_score=score.overall_score,
            fluency_score=score.fluency_score,
            grammar_score=score.grammar_score,
            vocabulary_score=score.vocabulary_score,
            relevance_score=score.relevance_score,
            cefr_estimate=score.cefr_estimate,
            feedback_fi=score.feedback_fi,
        ) if score else None,
    )
