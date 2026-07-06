from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "VocaBoost AI Service"
    app_env: str = "development"
    app_port: int = 8000
    openrouter_api_key: str = "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"
    openrouter_model: str = "openai/gpt-oss-20b:free"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_site_url: str = "http://localhost:3000"
    openrouter_app_name: str = "VocaBoost"
    database_url: str = "{ODBC Driver 18 for SQL Server};Server=localhost,1433;Database=ToeicVocabularyPlatform;Uid=sa;Pwd=123;Encrypt=no;TrustServerCertificate=yes;"
    ai_internal_token: str = "your_internal_shared_secret"


@lru_cache
def get_settings() -> Settings:
    return Settings()
