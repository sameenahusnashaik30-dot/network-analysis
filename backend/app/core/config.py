import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "SENTINEL-X"
    APP_ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./sentinel_x.db"
    JWT_SECRET: str = "sentinel_x_super_secret_jwt_key_2026_sdn_prototype"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    SDN_CONTROLLER_URL: str = "http://localhost:8080"
    MODEL_PATH: str = "./models"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    LOG_LEVEL: str = "INFO"
    DEMO_MODE: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
