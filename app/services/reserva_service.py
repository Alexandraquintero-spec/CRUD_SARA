"""Reserva del almuerzo con pago mediante el QR de Nequi mostrado en el sistema.

Reglas:
- Se reserva de 7:00 a 9:00 a. m. (configurable), una sola reserva por persona y día.
- Debe existir un menú publicado para hoy.
- El aprendiz debe tener la ficha activa y la alimentación habilitada.
- Aprendiz beneficiario: almuerzo sin costo (queda confirmada de inmediato).
- Aprendiz normal: paga con Nequi; la reserva queda "pendiente_pago" hasta confirmar el pago.
- Instructor: paga con Nequi o lo carga a su cuenta institucional (genera deuda).
- No hay boleta: el ingreso al comedor es por reconocimiento facial.
"""
import secrets
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core import reloj
from app.core.config import settings
from app.core.errors import Conflicto, NoEncontrado, ReglaNegocio, SinPermiso
from app.core.permissions import ADMIN, APRENDIZ, INSTRUCTOR
from app.models import Reserva, Usuario
from app.repositories.servicio_repository import MenuRepository, ReservaRepository
from app.schemas.comun import Pagina
from app.schemas.servicio import PagoNequi, ReservaCreadaSalida, ReservaEntrada, ReservaSalida
from app.services.menu_service import PrecioService


class ReservaService:
    def __init__(self, db: Session):
        self.reservas = ReservaRepository(db)
        self.menus = MenuRepository(db)
        self.precios = PrecioService(db)

    # ── Consultas ────────────────────────────────────────────────────
    def obtener(self, reserva_id: int, actor: Usuario) -> Reserva:
        reserva = self.reservas.obtener(reserva_id)
        if reserva is None:
            raise NoEncontrado("La reserva no existe.")
        if actor.rol.nombre != ADMIN and reserva.usuario_id != actor.id:
            raise SinPermiso("Solo puede consultar sus propias reservas.")
        return reserva

    def listar(self, actor: Usuario, pagina, tamano, **filtros) -> Pagina[ReservaSalida]:
        if actor.rol.nombre != ADMIN:
            filtros["usuario_id"] = actor.id  # aprendices e instructores solo ven las suyas
        items, total = self.reservas.listar(pagina, tamano, **filtros)
        return Pagina.crear([ReservaSalida.desde(r) for r in items], total, pagina, tamano)

    # ── Crear reserva ────────────────────────────────────────────────
    def _pago_nequi(self, reserva: Reserva) -> PagoNequi:
        valor = int(reserva.valor)
        return PagoNequi(
            referencia=reserva.referencia_pago,
            valor=reserva.valor,
            contenido_qr=f"NEQUI|SARA|{reserva.referencia_pago}|{valor}",
            instrucciones=[
                "Abra la app Nequi en su celular.",
                "Elija «Pagar con QR» y escanee el código que aparece en pantalla.",
                f"Confirme el pago de ${valor:,}".replace(",", ".") + " en Nequi.",
                "Ingrese el código de la transacción en SARA para confirmar la reserva.",
            ],
        )

    def crear(self, datos: ReservaEntrada, actor: Usuario) -> ReservaCreadaSalida:
        rol = actor.rol.nombre
        if rol not in (APRENDIZ, INSTRUCTOR):
            raise SinPermiso("Solo aprendices e instructores pueden reservar almuerzo.")

        if settings.VALIDAR_HORARIOS and not reloj.en_franja(settings.HORA_INICIO_RESERVA, settings.HORA_FIN_RESERVA):
            raise ReglaNegocio(
                f"Las reservas solo se reciben entre las {settings.HORA_INICIO_RESERVA:%H:%M} "
                f"y las {settings.HORA_FIN_RESERVA:%H:%M}."
            )

        hoy = reloj.hoy()
        if self.reservas.activa_del_dia(actor.id, hoy) is not None:
            raise Conflicto("Ya tiene una reserva para hoy. Solo se permite una reserva por día.")

        menu = self.menus.publicado_en(hoy)
        if menu is None:
            raise ReglaNegocio("Aún no se ha publicado el menú de hoy; no es posible reservar.")

        ahora = reloj.ahora()
        if rol == APRENDIZ:
            aprendiz = actor.aprendiz
            if aprendiz is None or not aprendiz.ficha.activa or aprendiz.ficha.eliminado:
                raise ReglaNegocio("Su ficha de formación no está activa.")
            if not aprendiz.alimentacion_activa:
                raise ReglaNegocio("Su servicio de alimentación está deshabilitado. Comuníquese con el administrador.")
            if datos.medio_pago == "cuenta_institucional":
                raise ReglaNegocio("La cuenta institucional solo está disponible para instructores.")
            if aprendiz.tipo == "beneficiario":
                valor, medio, estado, pagada = Decimal(0), "sin_costo", "confirmada", ahora
            else:
                valor, medio, estado, pagada = self.precios.vigente("comunidad_sena").valor, "nequi", "pendiente_pago", None
        else:
            valor = self.precios.vigente("comunidad_sena").valor
            if datos.medio_pago == "cuenta_institucional":
                medio, estado, pagada = "cuenta_institucional", "confirmada", None
            else:
                medio, estado, pagada = "nequi", "pendiente_pago", None

        referencia = f"SARA-{actor.id}-{hoy:%Y%m%d}-{secrets.token_hex(2).upper()}"
        reserva = Reserva(
            usuario_id=actor.id, menu_id=menu.id, fecha=hoy, valor=valor, medio_pago=medio,
            referencia_pago=referencia, estado=estado, pagada_en=pagada,
        )
        self.reservas.agregar(reserva, actor.id)
        self.reservas.confirmar()
        reserva = self.reservas.refrescar(reserva)
        pago = self._pago_nequi(reserva) if medio == "nequi" else None
        return ReservaCreadaSalida(reserva=ReservaSalida.desde(reserva), pago=pago)

    # ── Confirmar pago ───────────────────────────────────────────────
    def confirmar_pago(self, reserva_id: int, codigo_transaccion: str, actor: Usuario) -> Reserva:
        reserva = self.obtener(reserva_id, actor)
        if reserva.estado != "pendiente_pago":
            raise Conflicto("La reserva no está pendiente de pago.")
        if reserva.fecha != reloj.hoy():
            raise ReglaNegocio("Solo se pueden pagar las reservas del día.")
        self.reservas.actualizar(
            reserva,
            {"estado": "confirmada", "pagada_en": reloj.ahora(), "codigo_transaccion": codigo_transaccion.upper()},
            actor.id,
        )
        self.reservas.confirmar()
        return reserva

    def pago_pendiente(self, reserva_id: int, actor: Usuario) -> PagoNequi:
        reserva = self.obtener(reserva_id, actor)
        if reserva.estado != "pendiente_pago" or reserva.medio_pago != "nequi":
            raise Conflicto("La reserva no tiene un pago con Nequi pendiente.")
        return self._pago_nequi(reserva)

    # ── Cancelar ─────────────────────────────────────────────────────
    def cancelar(self, reserva_id: int, actor: Usuario) -> Reserva:
        reserva = self.obtener(reserva_id, actor)
        if reserva.estado not in ("pendiente_pago", "confirmada"):
            raise Conflicto(f"No se puede cancelar una reserva en estado '{reserva.estado}'.")
        if reserva.fecha < reloj.hoy():
            raise ReglaNegocio("No se puede cancelar una reserva de un día anterior.")
        if (
            settings.VALIDAR_HORARIOS and reserva.fecha == reloj.hoy()
            and reloj.ahora().timetz().replace(tzinfo=None) >= settings.HORA_INICIO_ALMUERZO
        ):
            raise ReglaNegocio("Ya inició el servicio de almuerzo; la reserva no se puede cancelar.")
        self.reservas.actualizar(reserva, {"estado": "cancelada", "cancelada_en": reloj.ahora()}, actor.id)
        self.reservas.confirmar()
        return reserva
