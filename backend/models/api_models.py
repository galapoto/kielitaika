from __future__ import annotations

from typing import Literal
from typing import Any

from pydantic import BaseModel, Field


class RegisterPasswordRequest(BaseModel):
    email: str
    password: str
    name: str | None = Field(default=None, max_length=120)


class LoginPasswordRequest(BaseModel):
    email: str
    password: str


class LoginProviderRequest(BaseModel):
    provider_id: str
    provider_token: str
    redirect_uri: str | None = None


class GoogleAuthRequest(BaseModel):
    redirect_origin: str | None = None
    oauth_result_id: str | None = None


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str | None = None


class SessionStartRequest(BaseModel):
    domain: str = Field(pattern=r"^(general|professional)$")
    content_type: str | None = Field(default=None, pattern=r"^(vocabulary_card|sentence_card|grammar_card)$")
    profession: str | None = Field(default=None, pattern=r"^(none|general_workplace|doctor|nurse|practical_nurse|other)$")
    level: str | None = Field(default=None, pattern=r"^(A1|A2|A1_A2|B1|B2|B1_B2|C1|C2|C1_C2)$")


class AnswerRequest(BaseModel):
    user_answer: str = Field(min_length=1, max_length=500)


class RoleplayCreateRequest(BaseModel):
    scenario_id: str
    level: str
    display_preferences: dict[str, Any] | None = None


class RoleplayTurnRequest(BaseModel):
    user_message: str = Field(min_length=1)


class RoleplayProgressModel(BaseModel):
    user_turns_completed: int
    user_turns_total: int
    stage: str


class RoleplayMessageModel(BaseModel):
    message_id: str
    speaker: str
    text: str
    translation: str | None = None
    emotion: str | None = None
    timestamp: str


class RoleplayUiModel(BaseModel):
    show_input: bool
    allow_submit: bool
    allow_restart: bool
    show_review: bool


class RoleplaySessionResponseModel(BaseModel):
    session_id: str
    created_at: str
    expires_at: str
    status: Literal["active", "completed", "expired"]
    scenario: dict[str, str]
    level: str
    progress: RoleplayProgressModel
    messages: list[RoleplayMessageModel]
    ui: RoleplayUiModel


class StartExamRequest(BaseModel):
    level_band: str = Field(pattern=r"^(A1_A2|B1_B2|C1_C2)$")


class ObjectiveAnswerRequest(BaseModel):
    item_id: str
    question_id: str
    answer: int | bool | str


class WritingAnswerRequest(BaseModel):
    task_id: str
    text: str


class AudioReferenceRequest(BaseModel):
    task_id: str
    audio_ref: str


class SpeakingAnswerRequest(BaseModel):
    item_id: str
    audio_ref: str
    duration_sec: float


class StartConversationRequest(BaseModel):
    task_id: str


class SubmitConversationTurnRequest(BaseModel):
    task_id: str
    turn_id: str
    audio_ref: str
    transcript_text: str | None = None


class GenerateConversationReplyRequest(BaseModel):
    task_id: str


class SubmitExamRequest(BaseModel):
    confirm_incomplete: bool = False


class PronunciationAnalyzeRequest(BaseModel):
    expected_text: str
    transcript: str
    audio_ref: str | None = None


class TtsRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    mode: Literal["system", "conversation", "roleplay", "yki"]
    voice_preference: Literal["male", "female", "neutral"] | None = None
    replayable: bool
    speed: float | None = Field(default=None, ge=0.5, le=2.0)
