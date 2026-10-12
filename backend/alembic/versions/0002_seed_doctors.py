"""Seed the clinic's starting doctors

Revision ID: 0002_seed_doctors
Revises: 0001_create_clinic_tables
Create Date: 2026-10-12
"""

import sqlalchemy as sa
from alembic import op

revision = "0002_seed_doctors"
down_revision = "0001_create_clinic_tables"
branch_labels = None
depends_on = None

doctors = sa.table(
    "doctors",
    sa.column("full_name", sa.String),
    sa.column("specialization", sa.String),
    sa.column("room", sa.String),
)

SEED = [
    {"full_name": "Dr. Ananya Rao", "specialization": "General Medicine", "room": "101"},
    {"full_name": "Dr. Vikram Mehta", "specialization": "Cardiology", "room": "204"},
    {"full_name": "Dr. Sara Thomas", "specialization": "Pediatrics", "room": "110"},
    {"full_name": "Dr. Karan Singh", "specialization": "Orthopedics", "room": "305"},
]


def upgrade():
    op.bulk_insert(doctors, SEED)


def downgrade():
    names = [d["full_name"] for d in SEED]
    op.execute(doctors.delete().where(doctors.c.full_name.in_(names)))
