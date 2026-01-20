"""Add authentication fields to users table

Revision ID: 0002_add_auth_fields
Revises: 0001_initial
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002_add_auth_fields'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # Add password_hash and name columns to users table
    op.add_column('users', sa.Column('password_hash', sa.String(), nullable=True))
    op.add_column('users', sa.Column('name', sa.String(), nullable=True))


def downgrade():
    op.drop_column('users', 'name')
    op.drop_column('users', 'password_hash')
