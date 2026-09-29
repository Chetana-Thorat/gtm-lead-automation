from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Find the repository root based on this file's location.
PROJECT_ROOT = Path(__file__).resolve().parents[3]

ENV_FILE = PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    database_url: str
    n8n_inquiry_webhook_url: str

    allowed_origins: str = (
        "http://localhost:3000,http://localhost:3001"
    )

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]


settings = Settings()