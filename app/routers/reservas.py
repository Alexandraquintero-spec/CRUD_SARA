from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.permissions import APRENDIZ, INSTRUCTOR, TODOS, require_roles
from app.database import get_db
from app.models import Usuario
from app.routers.deps import IdPath, Paginacion, paginacion, rol
from app.schemas.comun import Pagina, respuestas
from app.schemas.servicio import ConfirmarPagoEntrada, PagoQR, ReservaCreadaSalida, ReservaEntrada, ReservaSalida
from app.services.reserva_service import ReservaService

autenticado = require_roles(*TODOS)
comensal = require_roles(APRENDIZ, INSTRUCTOR)

router = APIRouter(prefix="/reservas", tags=["Reservas y pago con código QR"])


@router.post("", response_model=ReservaCreadaSalida, status_code=status.HTTP_201_CREATED, summary="Reservar almuerzo",
             description=(
                 "Crea la reserva del almuerzo de hoy. Reglas: horario de 7:00 a 9:00 a. m., una reserva por día, "
                 "menú publicado, ficha activa y alimentación habilitada.\n\n"
                 "- Aprendiz beneficiario: sin costo, queda **confirmada**.\n"
                 "- Aprendiz normal: queda **pendiente_pago** y la respuesta trae los datos del **código QR de pago** que el "
                 "sistema muestra en pantalla.\n"
                 "- Instructor: código QR o cuenta institucional (genera deuda).\n\n"
                 "No se genera boleta: el ingreso al comedor es por reconocimiento facial.\n\n" + rol(APRENDIZ, INSTRUCTOR)
             ),
             responses=respuestas(400, 401, 403, 409, 422))
def crear_reserva(datos: ReservaEntrada, actor: Usuario = Depends(comensal), db: Session = Depends(get_db)):
    return ReservaService(db).crear(datos, actor)


@router.get("", response_model=Pagina[ReservaSalida], summary="Listar reservas",
            description="El administrador ve todas; aprendices e instructores solo las propias. Filtros por estado, "
                        "medio de pago y rango de fechas.\n\n" + rol(*TODOS),
            responses=respuestas(401, 422))
def listar_reservas(
    p: Paginacion = Depends(paginacion),
    estado: Literal["pendiente_pago", "confirmada", "cancelada", "consumida", "no_consumida"] | None = Query(None),
    medio_pago: Literal["qr", "sin_costo", "cuenta_institucional"] | None = Query(None),
    desde: date | None = Query(None),
    hasta: date | None = Query(None),
    usuario_id: int | None = Query(None, gt=0, description="Solo para administrador"),
    actor: Usuario = Depends(autenticado), db: Session = Depends(get_db),
):
    return ReservaService(db).listar(actor, p.pagina, p.tamano, estado=estado, medio_pago=medio_pago,
                                     desde=desde, hasta=hasta, usuario_id=usuario_id)


@router.get("/{reserva_id}", response_model=ReservaSalida, summary="Consultar reserva",
            description="Consulta una reserva. Aprendices e instructores solo pueden ver las propias (403).\n\n" + rol(*TODOS),
            responses=respuestas(401, 403, 404, 422))
def obtener_reserva(reserva_id: IdPath, actor: Usuario = Depends(autenticado), db: Session = Depends(get_db)):
    return ReservaSalida.desde(ReservaService(db).obtener(reserva_id, actor))


@router.get("/{reserva_id}/pago", response_model=PagoQR, summary="Datos del código QR de pago",
            description="Vuelve a entregar los datos del código QR de pago de una reserva pendiente de pago.\n\n" + rol(*TODOS),
            responses=respuestas(401, 403, 404, 409, 422))
def datos_pago(reserva_id: IdPath, actor: Usuario = Depends(autenticado), db: Session = Depends(get_db)):
    return ReservaService(db).pago_pendiente(reserva_id, actor)


@router.post("/{reserva_id}/confirmar-pago", response_model=ReservaSalida, summary="Confirmar pago con código QR",
             description="Registra el código de la transacción del pago y deja la reserva **confirmada**.\n\n" + rol(*TODOS),
             responses=respuestas(400, 401, 403, 404, 409, 422))
def confirmar_pago(datos: ConfirmarPagoEntrada, reserva_id: IdPath, actor: Usuario = Depends(autenticado),
                   db: Session = Depends(get_db)):
    return ReservaSalida.desde(ReservaService(db).confirmar_pago(reserva_id, datos.codigo_transaccion, actor))


@router.post("/{reserva_id}/cancelar", response_model=ReservaSalida, summary="Cancelar reserva",
             description="Cancela una reserva pendiente o confirmada antes de que inicie el servicio de almuerzo.\n\n" + rol(*TODOS),
             responses=respuestas(400, 401, 403, 404, 409, 422))
def cancelar_reserva(reserva_id: IdPath, actor: Usuario = Depends(autenticado), db: Session = Depends(get_db)):
    return ReservaSalida.desde(ReservaService(db).cancelar(reserva_id, actor))

