"""Dependencias comunes de los routers."""
from dataclasses import dataclass
from datetime import date
from typing import Annotated

from fastapi import Path, Query

IdPath = Annotated[int, Path(gt=0, description="Identificador del registro")]
Desde = Annotated[date | None, Query(description="Fecha inicial AAAA-MM-DD (por defecto: 30 días atrás)")]
Hasta = Annotated[date | None, Query(description="Fecha final AAAA-MM-DD (por defecto: hoy)")]


@dataclass
class Paginacion:
    pagina: int
    tamano: int


def paginacion(
    pagina: int = Query(1, ge=1, description="Número de página (inicia en 1)"),
    tamano: int = Query(10, ge=1, le=100, description="Registros por página (máximo 100)"),
) -> Paginacion:
    return Paginacion(pagina, tamano)


def rol(*roles: str) -> str:
    """Texto estándar para la descripción Swagger."""
    return "**Rol requerido:** " + ", ".join(roles) + "."
