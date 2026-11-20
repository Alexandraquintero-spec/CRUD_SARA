from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.permissions import ADMIN, TODOS, require_roles
from app.database import get_db
from app.models import Usuario
from app.routers.deps import IdPath, Paginacion, paginacion, rol
from app.schemas.comun import Mensaje, Pagina, respuestas
from app.schemas.servicio import MenuActualizar, MenuEntrada, MenuSalida, PrecioEntrada, PrecioSalida
from app.services.menu_service import MenuService, PrecioService

solo_admin = require_roles(ADMIN)
autenticado = require_roles(*TODOS)

# ── Menús ────────────────────────────────────────────────────────────
router = APIRouter(prefix="/menus", tags=["Menú del día"])


@router.get("/hoy", response_model=MenuSalida, summary="Menú publicado de hoy",
            description="Devuelve el menú publicado para la fecha actual.\n\n" + rol(*TODOS),
            responses=respuestas(401, 404))
def menu_hoy(_: Usuario = Depends(autenticado), db: Session = Depends(get_db)):
    return MenuService(db).de_hoy()


@router.get("", response_model=Pagina[MenuSalida], summary="Listar menús",
            description="Lista paginada de menús con filtros por estado y rango de fechas.\n\n" + rol(ADMIN),
            responses=respuestas(401, 403, 422))
def listar_menus(
    p: Paginacion = Depends(paginacion),
    estado: Literal["borrador", "publicado", "historico"] | None = Query(None),
    desde: date | None = Query(None, description="Fecha inicial (AAAA-MM-DD)"),
    hasta: date | None = Query(None, description="Fecha final (AAAA-MM-DD)"),
    _: Usuario = Depends(solo_admin), db: Session = Depends(get_db),
):
    return MenuService(db).listar(p.pagina, p.tamano, estado=estado, desde=desde, hasta=hasta)


@router.post("", response_model=MenuSalida, status_code=status.HTTP_201_CREATED, summary="Crear menú",
             description="Crea un menú en estado borrador con sus platos (sopa, plato fuerte, acompañante, bebida). "
                         "No se permiten fechas pasadas ni categorías repetidas.\n\n" + rol(ADMIN),
             responses=respuestas(400, 401, 403, 422))
def crear_menu(datos: MenuEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return MenuService(db).crear(datos, actor)


@router.get("/{menu_id}", response_model=MenuSalida, summary="Consultar menú",
            description="Consulta un menú por su id.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 422))
def obtener_menu(menu_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return MenuService(db).obtener(menu_id)


@router.put("/{menu_id}", response_model=MenuSalida, summary="Actualizar menú",
            description="Edita la descripción o los platos. Solo se permite mientras el menú está en borrador.\n\n" + rol(ADMIN),
            responses=respuestas(401, 403, 404, 409, 422))
def actualizar_menu(datos: MenuActualizar, menu_id: IdPath, actor: Usuario = Depends(solo_admin),
                    db: Session = Depends(get_db)):
    return MenuService(db).actualizar(menu_id, datos, actor)


@router.post("/{menu_id}/publicar", response_model=MenuSalida, summary="Publicar menú",
             description="Publica el menú para que los comensales puedan reservar. Solo puede haber un menú publicado "
                         "por fecha y debe incluir el plato fuerte.\n\n" + rol(ADMIN),
             responses=respuestas(400, 401, 403, 404, 409, 422))
def publicar_menu(menu_id: IdPath, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return MenuService(db).publicar(menu_id, actor)


@router.delete("/{menu_id}", response_model=Mensaje, summary="Eliminar menú",
               description="Si el menú tiene reservas pasa al histórico (borrado lógico); si no, se elimina.\n\n" + rol(ADMIN),
               responses=respuestas(401, 403, 404, 422))
def eliminar_menu(menu_id: IdPath, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return Mensaje(mensaje=MenuService(db).eliminar(menu_id, actor))


# ── Precios ──────────────────────────────────────────────────────────
precios_router = APIRouter(prefix="/precios", tags=["Precios"])


@precios_router.get("/vigentes", response_model=list[PrecioSalida], summary="Precios vigentes",
                    description="Precio actual del almuerzo para comunidad SENA y visitantes.\n\n" + rol(*TODOS),
                    responses=respuestas(401))
def precios_vigentes(_: Usuario = Depends(autenticado), db: Session = Depends(get_db)):
    return PrecioService(db).vigentes()


@precios_router.get("", response_model=Pagina[PrecioSalida], summary="Historial de precios",
                    description="Lista paginada del historial de precios.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 422))
def listar_precios(
    p: Paginacion = Depends(paginacion),
    tipo: Literal["comunidad_sena", "visitante"] | None = Query(None),
    activo: bool | None = Query(None),
    _: Usuario = Depends(solo_admin), db: Session = Depends(get_db),
):
    return PrecioService(db).listar(p.pagina, p.tamano, tipo=tipo, activo=activo)


@precios_router.post("", response_model=PrecioSalida, status_code=status.HTTP_201_CREATED, summary="Registrar precio",
                     description="Registra un nuevo precio; reemplaza al vigente del mismo tipo, que queda en el historial.\n\n" + rol(ADMIN),
                     responses=respuestas(401, 403, 422))
def crear_precio(datos: PrecioEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return PrecioService(db).crear(datos, actor)


@precios_router.get("/{precio_id}", response_model=PrecioSalida, summary="Consultar precio",
                    description="Consulta un precio por su id.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 422))
def obtener_precio(precio_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return PrecioService(db).obtener(precio_id)


@precios_router.delete("/{precio_id}", response_model=Mensaje, summary="Eliminar precio del historial",
                       description="Elimina un precio inactivo del historial. El precio vigente no se puede eliminar (409).\n\n" + rol(ADMIN),
                       responses=respuestas(401, 403, 404, 409, 422))
def eliminar_precio(precio_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return Mensaje(mensaje=PrecioService(db).eliminar(precio_id))
