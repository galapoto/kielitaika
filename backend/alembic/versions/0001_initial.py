"""initial tables for users, logs, recharge"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("email", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "grammar_logs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("original_text", sa.Text(), nullable=False),
        sa.Column("corrected_text", sa.Text(), nullable=True),
        sa.Column("mistakes", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "pronunciation_logs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("transcript", sa.Text(), nullable=False),
        sa.Column("expected_text", sa.Text(), nullable=True),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("issues", sa.JSON(), nullable=True),
        sa.Column("audio_path", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "usage_logs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("feature", sa.String(), nullable=False, index=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "daily_recharge",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("date", sa.DateTime(), nullable=False, index=True),
        sa.Column("vocab_json", sa.JSON(), nullable=True),
        sa.Column("grammar_json", sa.JSON(), nullable=True),
        sa.Column("challenge_json", sa.JSON(), nullable=True),
        sa.Column("topic", sa.String(), nullable=True),
        sa.Column("completed", sa.String(), nullable=True, default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "user_daily_state",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("date", sa.DateTime(), nullable=False, index=True),
        sa.Column("vocab_done", sa.String(), default="false"),
        sa.Column("grammar_done", sa.String(), default="false"),
        sa.Column("challenge_done", sa.String(), default="false"),
        sa.Column("conversation_done", sa.String(), default="false"),
        sa.Column("xp_earned", sa.Integer(), default=0),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "recharge_history",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
        sa.Column("vocab_learned", sa.JSON(), nullable=True),
        sa.Column("grammar_learned", sa.JSON(), nullable=True),
        sa.Column("challenge_result", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("recharge_history")
    op.drop_table("user_daily_state")
    op.drop_table("daily_recharge")
    op.drop_table("usage_logs")
    op.drop_table("pronunciation_logs")
    op.drop_table("grammar_logs")
    op.drop_table("users")
