from datetime import date
from decimal import Decimal

from sqlalchemy import and_, exists, func, select

from app.models import (
    Menu,
    PagoDeuda,
    PlantillaBiometrica,
    PlatoMenu,
    Precio,
    RegistroIngreso,
    Reserva,
    Rol,
    Usuario,
)
from app.repositories.base import BaseRepository


class MenuRepository(BaseRepository[Menu]):
    model = Menu

    def publicado_en(self, fecha: date) -> Menu | None:
        return self.db.scalar(select(Menu).where(Menu.fecha == fecha, Menu.estado == "publicado"))

    def tiene_reservas(self, menu_id: int) -> bool:
        return bool(self.db.scalar(select(exists().where(Reserva.menu_id == menu_id))))

    def reemplazar_platos(self, menu: Menu, platos: list[dict], usuario_id: int) -> None:
        menu.platos.clear()
        self.db.flush()
        for p in platos:
            menu.platos.append(PlatoMenu(categoria=p["categoria"], nombre=p["nombre"], creado_por=usuario_id))
        self.db.flush()

    def listar(
        self, pagina: int, tamano: int, estado: str | None = None, desde: date | None = None, hasta: date | None = None
    ) -> tuple[list[Menu], int]:
        stmt = self._base()
        if estado:
            stmt = stmt.where(Menu.estado == estado)
        if desde:
            stmt = stmt.where(Menu.fecha >= desde)
        if hasta:
            stmt = stmt.where(Menu.fecha <= hasta)
        return self._paginar(stmt.order_by(Menu.fecha.desc()), pagina, tamano)


class PrecioRepository(BaseRepository[Precio]):
    model = Precio

    def activo(self, tipo: str) -> Precio | None:
        return self.db.scalar(select(Precio).where(Precio.tipo == tipo, Precio.activo.is_(True)))

    def vigentes(self) -> list[Precio]:
        return list(self.db.scalars(select(Precio).where(Precio.activo.is_(True)).order_by(Precio.tipo)).all())

    def listar(self, pagina: int, tamano: int, tipo: str | None = None, activo: bool | None = None):
        stmt = self._base()
        if tipo:
            stmt = stmt.where(Precio.tipo == tipo)
        if activo is not None:
            stmt = stmt.where(Precio.activo.is_(activo))
        return self._paginar(stmt.order_by(Precio.creado_en.desc()), pagina, tamano)


class ReservaRepository(BaseRepository[Reserva]):
    model = Reserva

    def activa_del_dia(self, usuario_id: int, fecha: date) -> Reserva | None:
        return self.db.scalar(
            select(Reserva).where(Reserva.usuario_id == usuario_id, Reserva.fecha == fecha, Reserva.estado != "cancelada")
        )

    def listar(
        self, pagina: int, tamano: int, usuario_id: int | None = None, estado: str | None = None,
        desde: date | None = None, hasta: date | None = None, medio_pago: str | None = None,
    ):
        stmt = self._base()
        if usuario_id:
            stmt = stmt.where(Reserva.usuario_id == usuario_id)
        if estado:
            stmt = stmt.where(Reserva.estado == estado)
        if medio_pago:
            stmt = stmt.where(Reserva.medio_pago == medio_pago)
        if desde:
            stmt = stmt.where(Reserva.fecha >= desde)
        if hasta:
            stmt = stmt.where(Reserva.fecha <= hasta)
        return self._paginar(stmt.order_by(Reserva.fecha.desc(), Reserva.id.desc()), pagina, tamano)

    def deudas_instructores(self) -> list[dict]:
        """Almuerzos a cuenta institucional vs. abonos por instructor."""
        consumo = (
            select(
                Reserva.usuario_id.label("uid"),
                func.count(Reserva.id).label("almuerzos"),
                func.coalesce(func.sum(Reserva.valor), 0).label("consumido"),
            )
            .where(Reserva.medio_pago == "cuenta_institucional", Reserva.estado != "cancelada")
            .group_by(Reserva.usuario_id)
            .subquery()
        )
        pagos = (
            select(PagoDeuda.instructor_id.label("uid"), func.coalesce(func.sum(PagoDeuda.valor), 0).label("pagado"))
            .group_by(PagoDeuda.instructor_id)
            .subquery()
        )
        stmt = (
            select(
                Usuario.id, Usuario.nombre_completo,
                func.coalesce(consumo.c.almuerzos, 0), func.coalesce(consumo.c.consumido, 0),
                func.coalesce(pagos.c.pagado, 0),
            )
            .join(Rol, Rol.id == Usuario.rol_id)
            .outerjoin(consumo, consumo.c.uid == Usuario.id)
            .outerjoin(pagos, pagos.c.uid == Usuario.id)
            .where(Rol.nombre == "instructor", Usuario.eliminado.is_(False))
            .order_by(Usuario.nombre_completo)
        )
        return [
            {"instructor_id": r[0], "instructor_nombre": r[1], "almuerzos": int(r[2]),
             "total_consumido": Decimal(r[3]), "total_pagado": Decimal(r[4])}
            for r in self.db.execute(stmt).all()
        ]

    def conteo_por_estado(self, desde: date, hasta: date) -> dict:
        filas = self.db.execute(
            select(Reserva.estado, func.count()).where(Reserva.fecha.between(desde, hasta)).group_by(Reserva.estado)
        ).all()
        return {estado: total for estado, total in filas}

    def recaudo_qr(self, desde: date, hasta: date) -> Decimal:
        valor = self.db.scalar(
            select(func.coalesce(func.sum(Reserva.valor), 0)).where(
                Reserva.fecha.between(desde, hasta), Reserva.medio_pago == "qr", Reserva.pagada_en.is_not(None),
                Reserva.estado != "cancelada",
            )
        )
        return Decimal(valor or 0)

    def por_dia(self, desde: date, hasta: date) -> dict:
        filas = self.db.execute(
            select(Reserva.fecha, func.count())
            .where(Reserva.fecha.between(desde, hasta), Reserva.estado != "cancelada")
            .group_by(Reserva.fecha)
        ).all()
        return {f: t for f, t in filas}


class PagoDeudaRepository(BaseRepository[PagoDeuda]):
    model = PagoDeuda

    def de_instructor(self, instructor_id: int) -> list[PagoDeuda]:
        return list(self.db.scalars(
            select(PagoDeuda).where(PagoDeuda.instructor_id == instructor_id).order_by(PagoDeuda.creado_en.desc())
        ).all())


class BiometriaRepository(BaseRepository[PlantillaBiometrica]):
    model = PlantillaBiometrica

    def de_usuario(self, usuario_id: int) -> PlantillaBiometrica | None:
        return self.db.scalar(select(PlantillaBiometrica).where(PlantillaBiometrica.usuario_id == usuario_id))

    def todas_activas(self) -> list[PlantillaBiometrica]:
        stmt = (
            select(PlantillaBiometrica)
            .join(Usuario, Usuario.id == PlantillaBiometrica.usuario_id)
            .where(Usuario.activo.is_(True), Usuario.eliminado.is_(False))
        )
        return list(self.db.scalars(stmt).all())


class IngresoRepository(BaseRepository[RegistroIngreso]):
    model = RegistroIngreso

    def dentro_ahora(self, fecha: date) -> int:
        return self.db.scalar(
            select(func.count()).where(
                RegistroIngreso.fecha == fecha, RegistroIngreso.resultado == "permitido",
                RegistroIngreso.hora_salida.is_(None),
            )
        ) or 0

    def permitido_de_reserva(self, reserva_id: int) -> RegistroIngreso | None:
        return self.db.scalar(
            select(RegistroIngreso).where(
                RegistroIngreso.reserva_id == reserva_id, RegistroIngreso.resultado == "permitido"
            )
        )

    def listar(
        self, pagina: int, tamano: int, fecha: date | None = None, resultado: str | None = None,
        metodo: str | None = None, usuario_id: int | None = None,
    ):
        stmt = self._base()
        if fecha:
            stmt = stmt.where(RegistroIngreso.fecha == fecha)
        if resultado:
            stmt = stmt.where(RegistroIngreso.resultado == resultado)
        if metodo:
            stmt = stmt.where(RegistroIngreso.metodo == metodo)
        if usuario_id:
            stmt = stmt.where(RegistroIngreso.usuario_id == usuario_id)
        return self._paginar(stmt.order_by(RegistroIngreso.hora_ingreso.desc()), pagina, tamano)

    def conteos(self, desde: date, hasta: date) -> dict:
        fila = self.db.execute(
            select(
                func.count().filter(RegistroIngreso.resultado == "permitido"),
                func.count().filter(RegistroIngreso.resultado == "denegado"),
                func.count().filter(and_(RegistroIngreso.metodo == "manual", RegistroIngreso.resultado == "permitido")),
            ).where(RegistroIngreso.fecha.between(desde, hasta))
        ).one()
        return {"permitidos": fila[0], "denegados": fila[1], "manuales": fila[2]}

    def por_dia(self, desde: date, hasta: date) -> dict:
        filas = self.db.execute(
            select(RegistroIngreso.fecha, func.count())
            .where(RegistroIngreso.fecha.between(desde, hasta), RegistroIngreso.resultado == "permitido")
            .group_by(RegistroIngreso.fecha)
        ).all()
        return {f: t for f, t in filas}
