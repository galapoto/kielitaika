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
