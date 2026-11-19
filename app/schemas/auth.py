from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.security import MENSAJE_POLITICA, cumple_politica
from app.schemas.comun import EntradaBase


class LoginEntrada(EntradaBase):
    correo: EmailStr = Field(examples=["admin@sara.edu.co"])
    contrasena: str = Field(min_length=1, max_length=72, examples=["Sara2026*"])


class RefreshEntrada(EntradaBase):
    refresh_token: str = Field(min_length=10)


class TokenSalida(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expira_en: int = Field(description="Segundos de vigencia del access token")
    rol: str


class CambioContrasenaEntrada(EntradaBase):
    contrasena_actual: str = Field(min_length=1, max_length=72)
    contrasena_nueva: str = Field(min_length=8, max_length=72, examples=["NuevaClave2026"])

    @field_validator("contrasena_nueva")
    @classmethod
    def _politica(cls, v: str) -> str:
        if not cumple_politica(v):
            raise ValueError(MENSAJE_POLITICA)
        return v
