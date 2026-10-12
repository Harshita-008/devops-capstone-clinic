from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ClinicFlow API"
    app_version: str = "1.0.0"
    database_url: str = "postgresql+psycopg://clinic:clinic@localhost:5432/clinic"
    # Length of one appointment slot. Two bookings for the same doctor inside this window clash.
    slot_minutes: int = 30
    clinic_timezone: str = "Asia/Kolkata"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
