"""Fecha y hora oficiales del servicio (zona horaria de Colombia)."""
from datetime import date, datetime, time

from app.core.config import settings


def ahora() -> datetime:
    return datetime.now(settings.tz)


def hoy() -> date:
    return ahora().date()


def en_franja(inicio: time, fin: time, momento: datetime | None = None) -> bool:
    actual = (momento or ahora()).timetz().replace(tzinfo=None)
    return inicio <= actual <= fin
