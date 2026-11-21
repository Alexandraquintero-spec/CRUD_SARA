from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.permissions import ADMIN, INSTRUCTOR, require_roles
from app.database import get_db
from app.models import Usuario
from app.routers.deps import IdPath, Paginacion, paginacion, rol
from app.schemas.comun import Mensaje, Pagina, respuestas
from app.schemas.servicio import (
    AforoSalida,
    BiometriaEntrada,
    BiometriaSalida,
    DeudaSalida,
    IngresoManualEntrada,
    IngresoSalida,
    PagoDeudaEntrada,
    PagoDeudaSalida,
    ResultadoVerificacion,
    VerificacionFacialEntrada,
)
from app.services.deuda_service import DeudaService
from app.services.ingreso_service import BiometriaService, IngresoService

solo_admin = require_roles(ADMIN)
admin_o_instructor = require_roles(ADMIN, INSTRUCTOR)

# ── Ingresos al comedor ─────────────────────────────────────────────
router = APIRouter(prefix="/ingresos", tags=["Ingreso al comedor"])


@router.post("/verificacion-facial", response_model=ResultadoVerificacion, summary="Verificar ingreso por rostro",
             description=(
                 "La cámara del comedor envía el vector facial capturado. El sistema identifica a la persona y responde:\n\n"
                 "- **verde**: tiene reserva confirmada para hoy, está en horario (12:00-1:30 p. m.) y hay aforo (110).\n"
                 "- **rojo**: se niega el ingreso y se indica el motivo (sin reserva, sin pago, ya ingresó, aforo completo, "
                 "rostro no reconocido o fuera de horario).\n\nTodos los intentos quedan registrados.\n\n" + rol(ADMIN)
             ),
             responses=respuestas(401, 403, 422))
def verificacion_facial(datos: VerificacionFacialEntrada, actor: Usuario = Depends(solo_admin),
                        db: Session = Depends(get_db)):
    return IngresoService(db).verificar_facial(datos.vector_facial, actor)


@router.post("/manual", response_model=IngresoSalida, status_code=status.HTTP_201_CREATED,
             summary="Ingreso manual (almuerzo cedido)",
             description="El administrador autoriza el ingreso de otro aprendiz cuando el titular de una reserva confirmada "
                         "de hoy le cede su almuerzo. Queda registrado quién recibió y el motivo.\n\n" + rol(ADMIN),
             responses=respuestas(400, 401, 403, 404, 409, 422))
def ingreso_manual(datos: IngresoManualEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return IngresoSalida.desde(IngresoService(db).manual(datos, actor))


@router.get("/aforo", response_model=AforoSalida, summary="Aforo actual",
            description="Personas dentro del comedor en este momento frente a la capacidad máxima.\n\n" + rol(ADMIN, INSTRUCTOR),
            responses=respuestas(401, 403))
def aforo(_: Usuario = Depends(admin_o_instructor), db: Session = Depends(get_db)):
    return IngresoService(db).aforo()


@router.get("", response_model=Pagina[IngresoSalida], summary="Bitácora de ingresos",
            description="Lista paginada de intentos de ingreso con filtros por fecha, resultado y método.\n\n" + rol(ADMIN),
            responses=respuestas(401, 403, 422))
def listar_ingresos(
    p: Paginacion = Depends(paginacion),
    fecha: date | None = Query(None),
    resultado: Literal["permitido", "denegado"] | None = Query(None),
    metodo: Literal["facial", "manual"] | None = Query(None),
    usuario_id: int | None = Query(None, gt=0),
    _: Usuario = Depends(solo_admin), db: Session = Depends(get_db),
):
    return IngresoService(db).listar(p.pagina, p.tamano, fecha=fecha, resultado=resultado, metodo=metodo,
                                     usuario_id=usuario_id)


@router.get("/{registro_id}", response_model=IngresoSalida, summary="Consultar registro de ingreso",
            description="Consulta un registro de la bitácora.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 422))
def obtener_ingreso(registro_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return IngresoSalida.desde(IngresoService(db).obtener(registro_id))


@router.post("/{registro_id}/salida", response_model=IngresoSalida, summary="Registrar salida",
             description="Registra la salida del comedor y libera un cupo del aforo.\n\n" + rol(ADMIN),
             responses=respuestas(400, 401, 403, 404, 409, 422))
def registrar_salida(registro_id: IdPath, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return IngresoSalida.desde(IngresoService(db).salida(registro_id, actor))


# ── Biometría ────────────────────────────────────────────────────────
biometria_router = APIRouter(prefix="/biometria", tags=["Registro facial"])


@biometria_router.post("", response_model=BiometriaSalida, status_code=status.HTTP_201_CREATED,
                       summary="Registrar rostro",
                       description="Registra la plantilla facial cifrada de un aprendiz o instructor. Requiere la autorización "
                                   "firmada de tratamiento de datos. No se guarda la fotografía.\n\n" + rol(ADMIN),
                       responses=respuestas(400, 401, 403, 404, 409, 422))
def registrar_rostro(datos: BiometriaEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return BiometriaService(db).registrar(datos, actor)


@biometria_router.get("/{usuario_id}", response_model=BiometriaSalida, summary="Consultar registro facial",
                      description="Indica si el usuario tiene rostro registrado (no devuelve el vector).\n\n" + rol(ADMIN),
                      responses=respuestas(401, 403, 404, 422))
def estado_rostro(usuario_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return BiometriaService(db).estado(usuario_id)


@biometria_router.delete("/{usuario_id}", response_model=Mensaje, summary="Eliminar rostro",
                         description="Elimina definitivamente el dato biométrico (derecho de supresión, Ley 1581).\n\n" + rol(ADMIN),
                         responses=respuestas(401, 403, 404, 422))
def eliminar_rostro(usuario_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return Mensaje(mensaje=BiometriaService(db).eliminar(usuario_id))


# ── Deudas de instructores ──────────────────────────────────────────
deudas_router = APIRouter(prefix="/deudas", tags=["Deudas de instructores"])


@deudas_router.get("", response_model=list[DeudaSalida], summary="Reporte de deudas",
                   description="Almuerzos cargados a cuenta institucional, abonos y saldo de cada instructor.\n\n" + rol(ADMIN),
                   responses=respuestas(401, 403, 422))
def listar_deudas(solo_con_saldo: bool = Query(False, description="Mostrar solo instructores con saldo pendiente"),
                  _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return DeudaService(db).listar(solo_con_saldo)


@deudas_router.get("/mia", response_model=DeudaSalida, summary="Mi deuda",
                   description="Saldo del instructor autenticado.\n\n" + rol(INSTRUCTOR), responses=respuestas(401, 403))
def mi_deuda(actor: Usuario = Depends(require_roles(INSTRUCTOR)), db: Session = Depends(get_db)):
    return DeudaService(db).de_instructor(actor.id)


@deudas_router.get("/{instructor_id}/pagos", response_model=list[PagoDeudaSalida], summary="Abonos de un instructor",
                   description="Historial de abonos del instructor.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 422))
def pagos_instructor(instructor_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return DeudaService(db).pagos_de(instructor_id)


@deudas_router.post("/{instructor_id}/pagos", response_model=PagoDeudaSalida, status_code=status.HTTP_201_CREATED,
                    summary="Registrar abono",
                    description="Registra un abono a la deuda. No puede superar el saldo pendiente.\n\n" + rol(ADMIN),
                    responses=respuestas(400, 401, 403, 404, 422))
def registrar_abono(datos: PagoDeudaEntrada, instructor_id: IdPath, actor: Usuario = Depends(solo_admin),
                    db: Session = Depends(get_db)):
    return DeudaService(db).registrar_pago(instructor_id, datos, actor)
