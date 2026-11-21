from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.permissions import ADMIN, APRENDIZ, INSTRUCTOR, TODOS, require_roles
from app.database import get_db
from app.models import Usuario
from app.routers.deps import IdPath, Desde, Hasta, Paginacion, paginacion, rol
from app.schemas.comun import Mensaje, Pagina, respuestas
from app.schemas.operacion import (
    AlmuerzosDia,
    GrupoReporte,
    ObservacionEntrada,
    ObservacionSalida,
    ProduccionActualizar,
    ProduccionEntrada,
    ProduccionSalida,
    RespuestaObservacionEntrada,
    ResumenSalida,
    VisitanteActualizar,
    VisitanteEntrada,
    VisitanteSalida,
)
from app.services.operacion_service import ObservacionService, ProduccionService, ReporteService, VisitanteService

solo_admin = require_roles(ADMIN)
autenticado = require_roles(*TODOS)
comensal = require_roles(APRENDIZ, INSTRUCTOR)

# ── Visitantes ──────────────────────────────────────────────────────
visitantes_router = APIRouter(prefix="/visitantes", tags=["Visitantes"])


@visitantes_router.get("", response_model=Pagina[VisitanteSalida], summary="Listar visitantes",
                       description="Lista paginada con filtros por fecha y búsqueda por nombre o documento.\n\n" + rol(ADMIN),
                       responses=respuestas(401, 403, 422))
def listar_visitantes(p: Paginacion = Depends(paginacion), fecha: date | None = Query(None),
                      buscar: str | None = Query(None, min_length=2, max_length=60),
                      _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return VisitanteService(db).listar(p.pagina, p.tamano, fecha=fecha, buscar=buscar)


@visitantes_router.post("", response_model=VisitanteSalida, status_code=status.HTTP_201_CREATED,
                        summary="Registrar visitante",
                        description="Registra el almuerzo de un visitante externo con la tarifa vigente de visitante.\n\n" + rol(ADMIN),
                        responses=respuestas(400, 401, 403, 422))
def crear_visitante(datos: VisitanteEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return VisitanteService(db).crear(datos, actor)


@visitantes_router.get("/{visitante_id}", response_model=VisitanteSalida, summary="Consultar visitante",
                       description="Consulta un registro de visitante.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 422))
def obtener_visitante(visitante_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return VisitanteService(db).obtener(visitante_id)


@visitantes_router.put("/{visitante_id}", response_model=VisitanteSalida, summary="Actualizar visitante",
                       description="Corrige el nombre o la entidad del visitante.\n\n" + rol(ADMIN),
                       responses=respuestas(401, 403, 404, 422))
def actualizar_visitante(datos: VisitanteActualizar, visitante_id: IdPath, actor: Usuario = Depends(solo_admin),
                         db: Session = Depends(get_db)):
    return VisitanteService(db).actualizar(visitante_id, datos, actor)


@visitantes_router.delete("/{visitante_id}", response_model=Mensaje, summary="Anular registro de visitante",
                          description="Anula un registro del día actual.\n\n" + rol(ADMIN),
                          responses=respuestas(400, 401, 403, 404, 422))
def eliminar_visitante(visitante_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return Mensaje(mensaje=VisitanteService(db).eliminar(visitante_id))


# ── Observaciones ───────────────────────────────────────────────────
observaciones_router = APIRouter(prefix="/observaciones", tags=["Observaciones y sugerencias"])


@observaciones_router.post("", response_model=ObservacionSalida, status_code=status.HTTP_201_CREATED,
                           summary="Enviar observación",
                           description="El comensal envía una observación o sugerencia sobre el servicio.\n\n" + rol(APRENDIZ, INSTRUCTOR),
                           responses=respuestas(401, 403, 422))
def crear_observacion(datos: ObservacionEntrada, actor: Usuario = Depends(comensal), db: Session = Depends(get_db)):
    return ObservacionSalida.desde(ObservacionService(db).crear(datos, actor))


@observaciones_router.get("", response_model=Pagina[ObservacionSalida], summary="Listar observaciones",
                          description="El administrador ve todas; los demás solo las propias.\n\n" + rol(*TODOS),
                          responses=respuestas(401, 422))
def listar_observaciones(
    p: Paginacion = Depends(paginacion),
    estado: Literal["nueva", "revisada", "implementada"] | None = Query(None),
    categoria: Literal["menu", "servicio", "instalaciones", "horario", "otro"] | None = Query(None),
    actor: Usuario = Depends(autenticado), db: Session = Depends(get_db),
):
    return ObservacionService(db).listar(actor, p.pagina, p.tamano, estado=estado, categoria=categoria)


@observaciones_router.get("/{obs_id}", response_model=ObservacionSalida, summary="Consultar observación",
                          description="Consulta una observación (solo las propias si no es administrador).\n\n" + rol(*TODOS),
                          responses=respuestas(401, 403, 404, 422))
def obtener_observacion(obs_id: IdPath, actor: Usuario = Depends(autenticado), db: Session = Depends(get_db)):
    return ObservacionSalida.desde(ObservacionService(db).obtener(obs_id, actor))


@observaciones_router.post("/{obs_id}/responder", response_model=ObservacionSalida, summary="Responder observación",
                           description="El administrador responde y la observación pasa a **revisada**.\n\n" + rol(ADMIN),
                           responses=respuestas(401, 403, 404, 409, 422))
def responder_observacion(datos: RespuestaObservacionEntrada, obs_id: IdPath, actor: Usuario = Depends(solo_admin),
                          db: Session = Depends(get_db)):
    return ObservacionSalida.desde(ObservacionService(db).responder(obs_id, datos.respuesta, actor))


@observaciones_router.post("/{obs_id}/implementar", response_model=ObservacionSalida, summary="Marcar como implementada",
                           description="Marca una observación revisada como **implementada**.\n\n" + rol(ADMIN),
                           responses=respuestas(401, 403, 404, 409, 422))
def implementar_observacion(obs_id: IdPath, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return ObservacionSalida.desde(ObservacionService(db).implementar(obs_id, actor))


@observaciones_router.delete("/{obs_id}", response_model=Mensaje, summary="Eliminar observación",
                             description="El autor (o el administrador) elimina una observación que aún no ha sido revisada.\n\n" + rol(*TODOS),
                             responses=respuestas(401, 403, 404, 409, 422))
def eliminar_observacion(obs_id: IdPath, actor: Usuario = Depends(autenticado), db: Session = Depends(get_db)):
    return Mensaje(mensaje=ObservacionService(db).eliminar(obs_id, actor))


# ── Control de producción ───────────────────────────────────────────
produccion_router = APIRouter(prefix="/control-produccion", tags=["Control de producción"])


@produccion_router.get("", response_model=Pagina[ProduccionSalida], summary="Listar producción diaria",
                       description="Almuerzos preparados vs. entregados por día.\n\n" + rol(ADMIN),
                       responses=respuestas(401, 403, 422))
def listar_produccion(p: Paginacion = Depends(paginacion), desde: Desde = None, hasta: Hasta = None,
                      _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return ProduccionService(db).listar(p.pagina, p.tamano, desde=desde, hasta=hasta)


@produccion_router.post("", response_model=ProduccionSalida, status_code=status.HTTP_201_CREATED,
                        summary="Registrar producción del día",
                        description="Un registro por fecha; los entregados no pueden superar a los preparados.\n\n" + rol(ADMIN),
                        responses=respuestas(400, 401, 403, 409, 422))
def crear_produccion(datos: ProduccionEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return ProduccionService(db).crear(datos, actor)


@produccion_router.get("/{prod_id}", response_model=ProduccionSalida, summary="Consultar producción",
                       description="Consulta un registro de producción.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 422))
def obtener_produccion(prod_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return ProduccionService(db).obtener(prod_id)


@produccion_router.put("/{prod_id}", response_model=ProduccionSalida, summary="Actualizar producción",
                       description="Actualiza cantidades u observaciones.\n\n" + rol(ADMIN),
                       responses=respuestas(400, 401, 403, 404, 422))
def actualizar_produccion(datos: ProduccionActualizar, prod_id: IdPath, actor: Usuario = Depends(solo_admin),
                          db: Session = Depends(get_db)):
    return ProduccionService(db).actualizar(prod_id, datos, actor)


@produccion_router.delete("/{prod_id}", response_model=Mensaje, summary="Eliminar producción",
                          description="Elimina un registro de producción.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 422))
def eliminar_produccion(prod_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return Mensaje(mensaje=ProduccionService(db).eliminar(prod_id))


# ── Reportes ────────────────────────────────────────────────────────
reportes_router = APIRouter(prefix="/reportes", tags=["Reportes"])


@reportes_router.get("/resumen", response_model=ResumenSalida, summary="Resumen del servicio",
                     description="Reservas, ingresos, recaudo por Nequi, visitantes y desperdicio en el rango indicado.\n\n" + rol(ADMIN),
                     responses=respuestas(400, 401, 403, 422))
def resumen(desde: Desde = None, hasta: Hasta = None, _: Usuario = Depends(solo_admin),
            db: Session = Depends(get_db)):
    return ReporteService(db).resumen(desde, hasta)


@reportes_router.get("/almuerzos-por-dia", response_model=list[AlmuerzosDia], summary="Almuerzos por día",
                     description="Reservas e ingresos efectivos por día.\n\n" + rol(ADMIN), responses=respuestas(400, 401, 403, 422))
def almuerzos_por_dia(desde: Desde = None, hasta: Hasta = None, _: Usuario = Depends(solo_admin),
                      db: Session = Depends(get_db)):
    return ReporteService(db).por_dia(desde, hasta)


@reportes_router.get("/grupos", response_model=list[GrupoReporte], summary="Consumo por ficha",
                     description="Aprendices, reservas e ingresos por ficha de formación.\n\n" + rol(ADMIN),
                     responses=respuestas(400, 401, 403, 422))
def por_grupo(desde: Desde = None, hasta: Hasta = None, _: Usuario = Depends(solo_admin),
              db: Session = Depends(get_db)):
    return ReporteService(db).por_grupo(desde, hasta)
