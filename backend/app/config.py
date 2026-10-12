from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ClinicFlow API"
    app_version: str = "1.0.0"
    database_url: str = "postgresql+psycopg://clinic:clinic@localhost:5432/clinic"
    # Two bookings for the same doctor clash if they start within this many minutes.
    slot_minutes: int = 30
    clinic_timezone: str = "Asia/Kolkata"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
