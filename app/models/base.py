"""Columnas de auditoría compartidas por todas las tablas."""
from datetime import datetime

from sqlalchemy import DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column


class AuditoriaMixin:
    creado_por: Mapped[int | None] = mapped_column(Integer)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actualizado_por: Mapped[int | None] = mapped_column(Integer)
    actualizado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
