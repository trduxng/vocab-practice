from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "VocaBoost AI Service"
    app_env: str = "development"
    app_port: int = 8000
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-oss-20b:free"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_site_url: str = "http://localhost:3000"
    openrouter_app_name: str = "VocaBoost"
    database_url: str = ""
    ai_internal_token: str = "your_internal_shared_secret"


@lru_cache
def get_settings() -> Settings:
    return Settings()
