from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool, text

from app import models  # noqa: F401  registers the tables on Base.metadata
from app.config import settings
from app.db import Base

# Any fixed number works, as long as every replica uses the same one.
MIGRATION_LOCK_ID = 7243001

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    context.configure(url=settings.database_url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        # Pods that start together take turns; the lock is released when this connection closes.
        if connection.dialect.name == "postgresql":
            connection.execute(text("SELECT pg_advisory_lock(:id)"), {"id": MIGRATION_LOCK_ID})
            connection.commit()
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
