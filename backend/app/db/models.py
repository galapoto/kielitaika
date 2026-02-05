"""ORM models placeholder."""

from datetime import datetime
import uuid
import json
from sqlalchemy import Column, DateTime, String, Text, ForeignKey, Integer, Float, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # Nullable for existing users
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class GrammarLog(Base):
    """Store grammar error logs for users."""
    __tablename__ = "grammar_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    original_text = Column(Text, nullable=False)
    corrected_text = Column(Text)
    mistakes = Column(JSON)  # List of error dicts
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = relationship("User", backref="grammar_logs")


class PronunciationLog(Base):
    """Store pronunciation analysis logs for users."""
    __tablename__ = "pronunciation_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    transcript = Column(Text, nullable=False)
    expected_text = Column(Text)
    score = Column(Float)  # 0-4 scale
    issues = Column(JSON)  # List of pronunciation issues
    audio_path = Column(String)  # Path to audio file if stored
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = relationship("User", backref="pronunciation_logs")


class UsageLog(Base):
    """Track feature usage for subscription limits."""
    __tablename__ = "usage_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    feature = Column(String, nullable=False, index=True)  # e.g., "conversation", "yki_exam"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = relationship("User", backref="usage_logs")


class DailyRecharge(Base):
    """Store daily recharge packs for users."""
    __tablename__ = "daily_recharge"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)  # Date of recharge
    vocab_json = Column(JSON)  # List of vocabulary items
    grammar_json = Column(JSON)  # Grammar bite data
    challenge_json = Column(JSON)  # Mini challenge data
    topic = Column(String)  # Next conversation topic
    completed = Column(String, default="false")  # "true" or "false" as string for SQLite compatibility
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = relationship("User", backref="daily_recharges")


class UserDailyState(Base):
    """Track daily completion state for streaks and XP."""
    __tablename__ = "user_daily_state"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)  # Date
    vocab_done = Column(String, default="false")
    grammar_done = Column(String, default="false")
    challenge_done = Column(String, default="false")
    conversation_done = Column(String, default="false")
    xp_earned = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = relationship("User", backref="daily_states")


class RechargeHistory(Base):
    """Store recharge completion history for analytics."""
    __tablename__ = "recharge_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    vocab_learned = Column(JSON)  # List of vocab items learned
    grammar_learned = Column(JSON)  # Grammar bite completed
    challenge_result = Column(JSON)  # Challenge completion data
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = relationship("User", backref="recharge_history")


class RoleplayAttempt(Base):
    __tablename__ = "roleplay_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    client_session_id = Column(String, nullable=False, unique=True, index=True)
    profession_field = Column(String, nullable=False, index=True)
    cefr_level = Column(String, nullable=False)
    scenario_id = Column(String, nullable=True, index=True)
    scenario_title = Column(String, nullable=True)
    session_start_time = Column(DateTime, nullable=False)
    session_end_time = Column(DateTime, nullable=False)
    session_duration = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", backref="roleplay_attempts")
    turns = relationship("RoleplayTurn", backref="attempt", cascade="all, delete-orphan")
    score = relationship("RoleplayScore", backref="attempt", uselist=False, cascade="all, delete-orphan")


class RoleplayTurn(Base):
    __tablename__ = "roleplay_turns"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    attempt_id = Column(String, ForeignKey("roleplay_attempts.id"), nullable=False, index=True)
    turn_index = Column(Integer, nullable=False)
    ai_transcript = Column(Text, nullable=False)
    user_transcript = Column(Text, nullable=False)
    ai_timestamp = Column(DateTime, nullable=True)
    user_timestamp = Column(DateTime, nullable=True)


class RoleplayScore(Base):
    __tablename__ = "roleplay_scores"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    attempt_id = Column(String, ForeignKey("roleplay_attempts.id"), nullable=False, unique=True, index=True)
    overall_score = Column(Float, nullable=False)
    fluency_score = Column(Float, nullable=False)
    grammar_score = Column(Float, nullable=False)
    vocabulary_score = Column(Float, nullable=False)
    relevance_score = Column(Float, nullable=False)
    cefr_estimate = Column(String, nullable=True)
    feedback_fi = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
