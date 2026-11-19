"""Esquemas y tipos reutilizables: paginación, errores y formatos validados."""
from math import ceil
from typing import Annotated, Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

T = TypeVar("T")

# ── Tipos con formato validado ────────────────────────────────────────
TipoDocumento = Literal["CC", "TI", "CE", "PP"]
NumeroDocumento = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^[0-9]{6,15}$")]
Telefono = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^3[0-9]{9}$")]
NombrePersona = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=3, max_length=120, pattern=r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$")
]
TextoCorto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class EntradaBase(BaseModel):
    """Los esquemas de entrada rechazan campos que no existen."""
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class SalidaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Pagina(BaseModel, Generic[T]):
    items: list[T]
    total: int = Field(description="Total de registros que cumplen el filtro")
    pagina: int
    tamano: int
    paginas: int

    @classmethod
    def crear(cls, items: list, total: int, pagina: int, tamano: int):
        return cls(items=items, total=total, pagina=pagina, tamano=tamano, paginas=ceil(total / tamano) if total else 0)


class Mensaje(BaseModel):
    mensaje: str


# ── Estructura de error (solo para la documentación Swagger) ─────────
class DetalleError(BaseModel):
    campo: str
    mensaje: str


class CuerpoError(BaseModel):
    codigo: int
    mensaje: str
    detalles: list[DetalleError] = []


class RespuestaError(BaseModel):
    error: CuerpoError


def respuestas(*codigos: int) -> dict:
    """Genera la sección 'responses' de Swagger con la estructura uniforme de error."""
    descripcion = {
        400: "Regla de negocio incumplida",
        401: "Token ausente, inválido o expirado",
        403: "El rol del usuario no tiene permiso",
        404: "Recurso no encontrado",
        409: "Conflicto: valor duplicado o estado no permitido",
        422: "Datos de entrada con formato inválido",
    }
    return {c: {"model": RespuestaError, "description": descripcion[c]} for c in codigos}
