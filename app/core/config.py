"""Configuración central de la API. Todos los valores salen del archivo .env."""
from datetime import time
from functools import lru_cache
from zoneinfo import ZoneInfo

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Base de datos
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "bd_sara"
    DB_SCHEMA: str = "sara"
    DB_USER: str = "sara_api"
    DB_PASSWORD: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cifrado de plantillas faciales (Fernet)
    CLAVE_BIOMETRIA: str

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    # Seguridad de inicio de sesión
    MAX_INTENTOS_LOGIN: int = 5
    MINUTOS_BLOQUEO: int = 15

    # Reglas del servicio
    ZONA_HORARIA: str = "America/Bogota"
    HORA_INICIO_RESERVA: time = time(7, 0)
    HORA_FIN_RESERVA: time = time(9, 0)
    HORA_INICIO_ALMUERZO: time = time(12, 0)
    HORA_FIN_ALMUERZO: time = time(13, 30)
    AFORO_MAXIMO: int = 110
    UMBRAL_SIMILITUD: float = 90
    VALIDAR_HORARIOS: bool = True

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def tz(self) -> ZoneInfo:
        return ZoneInfo(self.ZONA_HORARIA)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
