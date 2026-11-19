from datetime import date

from decimal import Decimal

from sqlalchemy import exists, func, or_, select

from app.models import (
    Aprendiz,
    CategoriaProducto,
    ControlProduccion,
    FichaFormacion,
    MovimientoInventario,
    Observacion,
    Producto,
    RegistroIngreso,
    Reserva,
    Visitante,
)
from app.repositories.base import BaseRepository


class CategoriaRepository(BaseRepository[CategoriaProducto]):
    model = CategoriaProducto

    def existe_nombre(self, nombre: str, excluir_id: int | None = None) -> bool:
        cond = [func.lower(CategoriaProducto.nombre) == nombre.lower()]
        if excluir_id:
            cond.append(CategoriaProducto.id != excluir_id)
        return bool(self.db.scalar(select(exists().where(*cond))))

    def tiene_productos(self, categoria_id: int) -> bool:
        return bool(self.db.scalar(select(exists().where(Producto.categoria_id == categoria_id))))

    def listar(self, pagina: int, tamano: int, activa: bool | None = None, buscar: str | None = None):
        stmt = self._base()
        if activa is not None:
            stmt = stmt.where(CategoriaProducto.activa.is_(activa))
        if buscar:
            stmt = stmt.where(func.lower(CategoriaProducto.nombre).like(f"%{buscar.lower()}%"))
        return self._paginar(stmt.order_by(CategoriaProducto.nombre), pagina, tamano)


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def existe_codigo(self, codigo: str) -> bool:
        return bool(self.db.scalar(select(exists().where(Producto.codigo == codigo))))

    def tiene_movimientos(self, producto_id: int) -> bool:
        return bool(self.db.scalar(select(exists().where(MovimientoInventario.producto_id == producto_id))))

    def bloquear(self, producto_id: int) -> Producto | None:
        """Obtiene el producto con bloqueo de fila para actualizar el stock sin carreras."""
        return self.db.scalar(
            select(Producto).where(Producto.id == producto_id, Producto.eliminado.is_(False)).with_for_update(of=Producto)
        )

    def listar(
        self, pagina: int, tamano: int, categoria_id: int | None = None, origen: str | None = None,
        activo: bool | None = None, stock_bajo: bool | None = None, buscar: str | None = None,
    ):
        stmt = self._base()
        if categoria_id:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if origen:
            stmt = stmt.where(Producto.origen == origen)
        if activo is not None:
            stmt = stmt.where(Producto.activo.is_(activo))
        if stock_bajo:
            stmt = stmt.where(Producto.cantidad <= Producto.stock_minimo)
        if buscar:
            patron = f"%{buscar.lower()}%"
            stmt = stmt.where(or_(func.lower(Producto.nombre).like(patron), func.lower(Producto.codigo).like(patron)))
        return self._paginar(stmt.order_by(Producto.nombre), pagina, tamano)

    def para_alertas(self, limite_vencimiento: date) -> list[Producto]:
        stmt = self._base().where(
            Producto.activo.is_(True),
            or_(Producto.cantidad <= Producto.stock_minimo, Producto.fecha_vencimiento <= limite_vencimiento),
        ).order_by(Producto.nombre)
        return list(self.db.scalars(stmt).unique().all())


class MovimientoRepository(BaseRepository[MovimientoInventario]):
    model = MovimientoInventario

    def listar(
        self, pagina: int, tamano: int, producto_id: int | None = None, tipo: str | None = None,
        desde: date | None = None, hasta: date | None = None,
    ):
        stmt = self._base()
        if producto_id:
            stmt = stmt.where(MovimientoInventario.producto_id == producto_id)
        if tipo:
            stmt = stmt.where(MovimientoInventario.tipo == tipo)
        if desde:
            stmt = stmt.where(func.date(MovimientoInventario.creado_en) >= desde)
        if hasta:
            stmt = stmt.where(func.date(MovimientoInventario.creado_en) <= hasta)
        return self._paginar(stmt.order_by(MovimientoInventario.creado_en.desc()), pagina, tamano)


class VisitanteRepository(BaseRepository[Visitante]):
    model = Visitante

    def listar(self, pagina: int, tamano: int, fecha: date | None = None, buscar: str | None = None):
        stmt = self._base()
        if fecha:
            stmt = stmt.where(Visitante.fecha == fecha)
        if buscar:
            patron = f"%{buscar.lower()}%"
            stmt = stmt.where(or_(func.lower(Visitante.nombre_completo).like(patron), Visitante.numero_documento.like(patron)))
        return self._paginar(stmt.order_by(Visitante.fecha.desc(), Visitante.id.desc()), pagina, tamano)

    def resumen(self, desde: date, hasta: date) -> tuple[int, Decimal]:
        fila = self.db.execute(
            select(func.count(), func.coalesce(func.sum(Visitante.valor_pagado), 0)).where(Visitante.fecha.between(desde, hasta))
        ).one()
        return fila[0], Decimal(fila[1])


class ObservacionRepository(BaseRepository[Observacion]):
    model = Observacion

    def listar(
        self, pagina: int, tamano: int, usuario_id: int | None = None, estado: str | None = None,
        categoria: str | None = None,
    ):
        stmt = self._base()
        if usuario_id:
            stmt = stmt.where(Observacion.usuario_id == usuario_id)
        if estado:
            stmt = stmt.where(Observacion.estado == estado)
        if categoria:
            stmt = stmt.where(Observacion.categoria == categoria)
        return self._paginar(stmt.order_by(Observacion.creado_en.desc()), pagina, tamano)


class ProduccionRepository(BaseRepository[ControlProduccion]):
    model = ControlProduccion

    def existe_fecha(self, fecha: date) -> bool:
        return bool(self.db.scalar(select(exists().where(ControlProduccion.fecha == fecha))))

    def listar(self, pagina: int, tamano: int, desde: date | None = None, hasta: date | None = None):
        stmt = self._base()
        if desde:
            stmt = stmt.where(ControlProduccion.fecha >= desde)
        if hasta:
            stmt = stmt.where(ControlProduccion.fecha <= hasta)
        return self._paginar(stmt.order_by(ControlProduccion.fecha.desc()), pagina, tamano)

    def totales(self, desde: date, hasta: date) -> tuple[int, int]:
        fila = self.db.execute(
            select(
                func.coalesce(func.sum(ControlProduccion.almuerzos_preparados), 0),
                func.coalesce(func.sum(ControlProduccion.almuerzos_entregados), 0),
            ).where(ControlProduccion.fecha.between(desde, hasta))
        ).one()
        return int(fila[0]), int(fila[1])


class ReporteRepository(BaseRepository[FichaFormacion]):
    model = FichaFormacion

    def por_grupo(self, desde: date, hasta: date) -> list[dict]:
        reservas = (
            select(Aprendiz.ficha_id.label("fid"), func.count(Reserva.id).label("n"))
            .join(Reserva, Reserva.usuario_id == Aprendiz.usuario_id)
            .where(Reserva.fecha.between(desde, hasta), Reserva.estado != "cancelada")
            .group_by(Aprendiz.ficha_id).subquery()
        )
        ingresos = (
            select(Aprendiz.ficha_id.label("fid"), func.count(RegistroIngreso.id).label("n"))
            .join(RegistroIngreso, RegistroIngreso.usuario_id == Aprendiz.usuario_id)
            .where(RegistroIngreso.fecha.between(desde, hasta), RegistroIngreso.resultado == "permitido")
            .group_by(Aprendiz.ficha_id).subquery()
        )
        aprendices = (
            select(Aprendiz.ficha_id.label("fid"), func.count().label("n")).group_by(Aprendiz.ficha_id).subquery()
        )
        stmt = (
            select(
                FichaFormacion.numero, FichaFormacion.programa,
                func.coalesce(aprendices.c.n, 0), func.coalesce(reservas.c.n, 0), func.coalesce(ingresos.c.n, 0),
            )
            .outerjoin(aprendices, aprendices.c.fid == FichaFormacion.id)
            .outerjoin(reservas, reservas.c.fid == FichaFormacion.id)
            .outerjoin(ingresos, ingresos.c.fid == FichaFormacion.id)
            .where(FichaFormacion.eliminado.is_(False))
            .order_by(FichaFormacion.numero)
        )
        return [
            {"ficha": r[0], "programa": r[1], "aprendices": r[2], "reservas": r[3], "ingresos": r[4]}
            for r in self.db.execute(stmt).all()
        ]
