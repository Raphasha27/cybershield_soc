from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CyberShield API"
    api_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql://postgres:password@db:5432/cybershield",
        alias="DATABASE_URL",
    )
    jwt_secret_key: str = Field(default="change-me", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    cors_origins: str = Field(default="*", alias="CORS_ORIGINS")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)


settings = Settings()
