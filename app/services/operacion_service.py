"""Visitantes, observaciones, control de producción y reportes."""
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core import reloj
from app.core.errors import Conflicto, NoEncontrado, ReglaNegocio, SinPermiso
from app.core.permissions import ADMIN
from app.models import ControlProduccion, Observacion, Usuario, Visitante
from app.repositories.operacion_repository import (
    ObservacionRepository,
    ProduccionRepository,
    ReporteRepository,
    VisitanteRepository,
)
from app.repositories.servicio_repository import IngresoRepository, ReservaRepository
from app.schemas.comun import Pagina
from app.schemas.operacion import (
    AlmuerzosDia,
    GrupoReporte,
    ObservacionEntrada,
    ObservacionSalida,
    ProduccionActualizar,
    ProduccionEntrada,
    ProduccionSalida,
    ResumenSalida,
    VisitanteActualizar,
    VisitanteEntrada,
    VisitanteSalida,
)
from app.services.menu_service import PrecioService

MAX_DIAS_REPORTE = 366


class VisitanteService:
    def __init__(self, db: Session):
        self.visitantes = VisitanteRepository(db)
        self.precios = PrecioService(db)

    def obtener(self, visitante_id: int) -> Visitante:
        v = self.visitantes.obtener(visitante_id)
        if v is None:
            raise NoEncontrado("El visitante no existe.")
        return v

    def listar(self, pagina, tamano, **filtros) -> Pagina[VisitanteSalida]:
        items, total = self.visitantes.listar(pagina, tamano, **filtros)
        return Pagina.crear([VisitanteSalida.model_validate(v) for v in items], total, pagina, tamano)

    def crear(self, datos: VisitanteEntrada, actor: Usuario) -> Visitante:
        precio = self.precios.vigente("visitante")
        visitante = Visitante(**datos.model_dump(), fecha=reloj.hoy(), valor_pagado=precio.valor)
        self.visitantes.agregar(visitante, actor.id)
        self.visitantes.confirmar()
        return visitante

    def actualizar(self, visitante_id: int, datos: VisitanteActualizar, actor: Usuario) -> Visitante:
        visitante = self.obtener(visitante_id)
        self.visitantes.actualizar(visitante, datos.model_dump(exclude_unset=True), actor.id)
        self.visitantes.confirmar()
        return visitante

    def eliminar(self, visitante_id: int) -> str:
        visitante = self.obtener(visitante_id)
        if visitante.fecha != reloj.hoy():
            raise ReglaNegocio("Solo se pueden anular registros de visitantes del día (los anteriores ya están en reportes).")
        self.visitantes.eliminar_fisico(visitante)
        self.visitantes.confirmar()
        return "Registro de visitante anulado."


class ObservacionService:
    def __init__(self, db: Session):
        self.observaciones = ObservacionRepository(db)

    def obtener(self, obs_id: int, actor: Usuario) -> Observacion:
        obs = self.observaciones.obtener(obs_id)
        if obs is None:
            raise NoEncontrado("La observación no existe.")
        if actor.rol.nombre != ADMIN and obs.usuario_id != actor.id:
            raise SinPermiso("Solo puede consultar sus propias observaciones.")
        return obs

    def listar(self, actor: Usuario, pagina, tamano, **filtros) -> Pagina[ObservacionSalida]:
        if actor.rol.nombre != ADMIN:
            filtros["usuario_id"] = actor.id
        items, total = self.observaciones.listar(pagina, tamano, **filtros)
        return Pagina.crear([ObservacionSalida.desde(o) for o in items], total, pagina, tamano)

    def crear(self, datos: ObservacionEntrada, actor: Usuario) -> Observacion:
        obs = Observacion(usuario_id=actor.id, **datos.model_dump())
        self.observaciones.agregar(obs, actor.id)
        self.observaciones.confirmar()
        return self.observaciones.refrescar(obs)

    def responder(self, obs_id: int, respuesta: str, actor: Usuario) -> Observacion:
        obs = self.obtener(obs_id, actor)
        if obs.estado == "implementada":
            raise Conflicto("La observación ya fue implementada.")
        self.observaciones.actualizar(
            obs, {"respuesta": respuesta, "estado": "revisada", "respondida_en": reloj.ahora()}, actor.id
        )
        self.observaciones.confirmar()
        return obs

    def implementar(self, obs_id: int, actor: Usuario) -> Observacion:
        obs = self.obtener(obs_id, actor)
        if obs.estado != "revisada":
            raise Conflicto("Solo se puede marcar como implementada una observación revisada (con respuesta).")
        self.observaciones.actualizar(obs, {"estado": "implementada"}, actor.id)
        self.observaciones.confirmar()
        return obs

    def eliminar(self, obs_id: int, actor: Usuario) -> str:
        obs = self.obtener(obs_id, actor)
        if obs.estado != "nueva":
            raise Conflicto("Solo se puede eliminar una observación que aún no ha sido revisada.")
        self.observaciones.eliminar_fisico(obs)
        self.observaciones.confirmar()
        return "Observación eliminada."


class ProduccionService:
    def __init__(self, db: Session):
        self.produccion = ProduccionRepository(db)

    def obtener(self, prod_id: int) -> ControlProduccion:
        p = self.produccion.obtener(prod_id)
        if p is None:
            raise NoEncontrado("El registro de producción no existe.")
        return p

    def listar(self, pagina, tamano, **filtros) -> Pagina[ProduccionSalida]:
        items, total = self.produccion.listar(pagina, tamano, **filtros)
        return Pagina.crear([ProduccionSalida.model_validate(p) for p in items], total, pagina, tamano)

    def crear(self, datos: ProduccionEntrada, actor: Usuario) -> ControlProduccion:
        if datos.fecha > reloj.hoy():
            raise ReglaNegocio("No se puede registrar la producción de una fecha futura.")
        if self.produccion.existe_fecha(datos.fecha):
            raise Conflicto("Ya existe el registro de producción de esa fecha.")
        prod = self.produccion.agregar(ControlProduccion(**datos.model_dump()), actor.id)
        self.produccion.confirmar()
        return prod

    def actualizar(self, prod_id: int, datos: ProduccionActualizar, actor: Usuario) -> ControlProduccion:
        prod = self.obtener(prod_id)
        cambios = datos.model_dump(exclude_unset=True)
        preparados = cambios.get("almuerzos_preparados", prod.almuerzos_preparados)
        entregados = cambios.get("almuerzos_entregados", prod.almuerzos_entregados)
        if entregados > preparados:
            raise ReglaNegocio("Los almuerzos entregados no pueden superar a los preparados.")
        self.produccion.actualizar(prod, cambios, actor.id)
        self.produccion.confirmar()
        return prod

    def eliminar(self, prod_id: int) -> str:
        prod = self.obtener(prod_id)
        self.produccion.eliminar_fisico(prod)
        self.produccion.confirmar()
        return "Registro de producción eliminado."


class ReporteService:
    def __init__(self, db: Session):
        self.reservas = ReservaRepository(db)
        self.ingresos = IngresoRepository(db)
        self.visitantes = VisitanteRepository(db)
        self.produccion = ProduccionRepository(db)
        self.reportes = ReporteRepository(db)

    @staticmethod
    def _rango(desde: date | None, hasta: date | None) -> tuple[date, date]:
        hasta = hasta or reloj.hoy()
        desde = desde or hasta - timedelta(days=29)
        if desde > hasta:
            raise ReglaNegocio("La fecha 'desde' no puede ser posterior a 'hasta'.")
        if (hasta - desde).days > MAX_DIAS_REPORTE:
            raise ReglaNegocio(f"El rango del reporte no puede superar {MAX_DIAS_REPORTE} días.")
        return desde, hasta

    def resumen(self, desde: date | None, hasta: date | None) -> ResumenSalida:
        desde, hasta = self._rango(desde, hasta)
        estados = self.reservas.conteo_por_estado(desde, hasta)
        ingresos = self.ingresos.conteos(desde, hasta)
        n_visit, recaudo_visit = self.visitantes.resumen(desde, hasta)
        preparados, entregados = self.produccion.totales(desde, hasta)
        return ResumenSalida(
            desde=desde, hasta=hasta,
            reservas=sum(estados.values()),
            reservas_confirmadas=estados.get("confirmada", 0) + estados.get("consumida", 0),
            reservas_canceladas=estados.get("cancelada", 0),
            ingresos_permitidos=ingresos["permitidos"], ingresos_denegados=ingresos["denegados"],
            ingresos_manuales=ingresos["manuales"],
            recaudo_qr=self.reservas.recaudo_qr(desde, hasta),
            visitantes=n_visit, recaudo_visitantes=recaudo_visit,
            almuerzos_preparados=preparados, almuerzos_entregados=entregados,
            desperdicio_estimado=max(0, preparados - entregados),
        )

    def por_dia(self, desde: date | None, hasta: date | None) -> list[AlmuerzosDia]:
        desde, hasta = self._rango(desde, hasta)
        reservas = self.reservas.por_dia(desde, hasta)
        ingresos = self.ingresos.por_dia(desde, hasta)
        dias = sorted(set(reservas) | set(ingresos))
        return [AlmuerzosDia(fecha=d, reservas=reservas.get(d, 0), ingresos=ingresos.get(d, 0)) for d in dias]

    def por_grupo(self, desde: date | None, hasta: date | None) -> list[GrupoReporte]:
        desde, hasta = self._rango(desde, hasta)
        return [GrupoReporte(**g) for g in self.reportes.por_grupo(desde, hasta)]
