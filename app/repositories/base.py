"""Repositorio base: acceso a datos, paginación y columnas de auditoría.

Es la única capa que habla con la base de datos. Los servicios usan los
repositorios y nunca escriben consultas SQL.
"""
from datetime import datetime, timezone
from typing import Generic, TypeVar

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.database import Base

M = TypeVar("M", bound=Base)


class BaseRepository(Generic[M]):
    model: type[M]

    def __init__(self, db: Session):
        self.db = db

    # ── Lectura ──────────────────────────────────────────────────────
    def obtener(self, id_: int) -> M | None:
        obj = self.db.get(self.model, id_)
        if obj is not None and getattr(obj, "eliminado", False):
            return None
        return obj

    def _base(self) -> Select:
        stmt = select(self.model)
        if hasattr(self.model, "eliminado"):
            stmt = stmt.where(self.model.eliminado.is_(False))
        return stmt

    def _paginar(self, stmt: Select, pagina: int, tamano: int) -> tuple[list[M], int]:
        total = self.db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery()))
        items = self.db.scalars(stmt.offset((pagina - 1) * tamano).limit(tamano)).unique().all()
        return list(items), total or 0

    # ── Escritura (con auditoría) ────────────────────────────────────
    def agregar(self, obj: M, usuario_id: int | None) -> M:
        if hasattr(obj, "creado_por"):
            obj.creado_por = usuario_id
        self.db.add(obj)
        self.db.flush()
        return obj

    def marcar_actualizado(self, obj: M, usuario_id: int | None) -> M:
        obj.actualizado_por = usuario_id
        obj.actualizado_en = datetime.now(timezone.utc)
        self.db.flush()
        return obj

    def actualizar(self, obj: M, datos: dict, usuario_id: int | None) -> M:
        for campo, valor in datos.items():
            setattr(obj, campo, valor)
        return self.marcar_actualizado(obj, usuario_id)

    def eliminar_fisico(self, obj: M) -> None:
        self.db.delete(obj)
        self.db.flush()

    def eliminar_logico(self, obj: M, usuario_id: int | None) -> M:
        obj.eliminado = True
        if hasattr(obj, "activo"):
            obj.activo = False
        return self.marcar_actualizado(obj, usuario_id)

    # ── Transacción ──────────────────────────────────────────────────
    def confirmar(self) -> None:
        self.db.commit()

    def revertir(self) -> None:
        self.db.rollback()

    def refrescar(self, obj: M) -> M:
        self.db.refresh(obj)
        return obj
