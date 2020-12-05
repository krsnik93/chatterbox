"""Add MessageSeen table.

Revision ID: 878d8c9db0e2
Revises: 55575d97157a
Create Date: 2020-11-09 17:25:20.539303

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "878d8c9db0e2"
down_revision = "55575d97157a"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "message_seen",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("message_id", sa.Integer(), nullable=False),
        sa.Column("seen_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["message_id"],
            ["message.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("message_seen")
    # ### end Alembic commands ###
