from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.permissions import ADMIN, require_roles
from app.database import get_db
from app.models import Usuario
from app.routers.deps import IdPath, Paginacion, paginacion, rol
from app.schemas.comun import Mensaje, Pagina, respuestas
from app.schemas.usuario import (
    EstadoUsuarioEntrada,
    FichaActualizar,
    FichaEntrada,
    FichaSalida,
    RolSalida,
    RolUsuarioEntrada,
    UsuarioActualizar,
    UsuarioEntrada,
    UsuarioSalida,
)
from app.services.usuario_service import FichaService, RolService, UsuarioService

solo_admin = require_roles(ADMIN)

# ── Usuarios ─────────────────────────────────────────────────────────
router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("", response_model=Pagina[UsuarioSalida], summary="Listar usuarios",
            description="Lista paginada de usuarios con filtros por rol, estado, ficha y búsqueda por nombre, documento o correo.\n\n" + rol(ADMIN),
            responses=respuestas(401, 403, 422))
def listar_usuarios(
    p: Paginacion = Depends(paginacion),
    rol_: Literal["administrador", "instructor", "aprendiz"] | None = Query(None, alias="rol", description="Filtrar por rol"),
    activo: bool | None = Query(None, description="Filtrar por estado"),
    ficha_id: int | None = Query(None, gt=0, description="Filtrar aprendices por ficha"),
    buscar: str | None = Query(None, min_length=2, max_length=60, description="Texto a buscar"),
    _: Usuario = Depends(solo_admin), db: Session = Depends(get_db),
):
    return UsuarioService(db).listar(p.pagina, p.tamano, rol=rol_, activo=activo, ficha_id=ficha_id, buscar=buscar)


@router.post("", response_model=UsuarioSalida, status_code=status.HTTP_201_CREATED, summary="Registrar usuario",
             description="El administrador registra un usuario (no existe autorregistro). Para aprendices se exige `ficha_id`. "
                         "Correo y documento deben ser únicos (409).\n\n" + rol(ADMIN),
             responses=respuestas(400, 401, 403, 404, 409, 422))
def crear_usuario(datos: UsuarioEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return UsuarioSalida.desde(UsuarioService(db).crear(datos, actor))


@router.get("/{usuario_id}", response_model=UsuarioSalida, summary="Consultar usuario",
            description="Consulta un usuario por su id.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 422))
def obtener_usuario(usuario_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return UsuarioSalida.desde(UsuarioService(db).obtener(usuario_id))


@router.put("/{usuario_id}", response_model=UsuarioSalida, summary="Actualizar usuario",
            description="Actualiza datos básicos. Para aprendices también ficha, tipo (normal/beneficiario) y alimentación activa. "
                        "El rol y el estado se cambian con sus endpoints propios.\n\n" + rol(ADMIN),
            responses=respuestas(400, 401, 403, 404, 409, 422))
def actualizar_usuario(datos: UsuarioActualizar, usuario_id: IdPath, actor: Usuario = Depends(solo_admin),
                       db: Session = Depends(get_db)):
    return UsuarioSalida.desde(UsuarioService(db).actualizar(usuario_id, datos, actor))


@router.patch("/{usuario_id}/estado", response_model=UsuarioSalida, summary="Activar o desactivar usuario",
              description="Activa o desactiva un usuario. Un usuario inactivo no puede iniciar sesión. "
                          "Nadie puede desactivar su propia cuenta.\n\n" + rol(ADMIN),
              responses=respuestas(400, 401, 403, 404, 422))
def cambiar_estado(datos: EstadoUsuarioEntrada, usuario_id: IdPath, actor: Usuario = Depends(solo_admin),
                   db: Session = Depends(get_db)):
    return UsuarioSalida.desde(UsuarioService(db).cambiar_estado(usuario_id, datos.activo, actor))


@router.patch("/{usuario_id}/rol", response_model=UsuarioSalida, summary="Cambiar rol de usuario",
              description="Asigna otro rol al usuario. Nadie puede cambiar su propio rol.\n\n" + rol(ADMIN),
              responses=respuestas(400, 401, 403, 404, 422))
def cambiar_rol(datos: RolUsuarioEntrada, usuario_id: IdPath, actor: Usuario = Depends(solo_admin),
                db: Session = Depends(get_db)):
    return UsuarioSalida.desde(UsuarioService(db).cambiar_rol(usuario_id, datos.rol, actor))


@router.delete("/{usuario_id}", response_model=Mensaje, summary="Eliminar usuario (borrado lógico)",
               description="Marca el usuario como eliminado y lo inactiva; se conserva su historial de reservas e ingresos.\n\n" + rol(ADMIN),
               responses=respuestas(400, 401, 403, 404, 422))
def eliminar_usuario(usuario_id: IdPath, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return Mensaje(mensaje=UsuarioService(db).eliminar(usuario_id, actor))


# ── Roles ────────────────────────────────────────────────────────────
roles_router = APIRouter(prefix="/roles", tags=["Roles"])


@roles_router.get("", response_model=list[RolSalida], summary="Listar roles",
                  description="Roles del sistema: administrador, instructor y aprendiz.\n\n" + rol(ADMIN),
                  responses=respuestas(401, 403))
def listar_roles(_: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return RolService(db).listar()


# ── Fichas ───────────────────────────────────────────────────────────
fichas_router = APIRouter(prefix="/fichas", tags=["Fichas de formación"])


@fichas_router.get("", response_model=Pagina[FichaSalida], summary="Listar fichas",
                   description="Lista paginada de fichas con filtros por estado, jornada y búsqueda por número o programa.\n\n" + rol(ADMIN),
                   responses=respuestas(401, 403, 422))
def listar_fichas(
    p: Paginacion = Depends(paginacion),
    activa: bool | None = Query(None),
    jornada: Literal["mañana", "tarde", "noche", "mixta"] | None = Query(None),
    buscar: str | None = Query(None, min_length=2, max_length=60),
    _: Usuario = Depends(solo_admin), db: Session = Depends(get_db),
):
    return FichaService(db).listar(p.pagina, p.tamano, activa=activa, jornada=jornada, buscar=buscar)


@fichas_router.post("", response_model=FichaSalida, status_code=status.HTTP_201_CREATED, summary="Crear ficha",
                    description="Registra una ficha de formación. El número es único.\n\n" + rol(ADMIN),
                    responses=respuestas(401, 403, 409, 422))
def crear_ficha(datos: FichaEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return FichaService(db).crear(datos, actor)


@fichas_router.get("/{ficha_id}", response_model=FichaSalida, summary="Consultar ficha",
                   description="Consulta una ficha por su id.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 422))
def obtener_ficha(ficha_id: IdPath, _: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return FichaService(db).obtener(ficha_id)


@fichas_router.put("/{ficha_id}", response_model=FichaSalida, summary="Actualizar ficha",
                   description="Actualiza los datos de la ficha (el número no se modifica).\n\n" + rol(ADMIN),
                   responses=respuestas(400, 401, 403, 404, 422))
def actualizar_ficha(datos: FichaActualizar, ficha_id: IdPath, actor: Usuario = Depends(solo_admin),
                     db: Session = Depends(get_db)):
    return FichaService(db).actualizar(ficha_id, datos, actor)


@fichas_router.delete("/{ficha_id}", response_model=Mensaje, summary="Eliminar ficha",
                      description="Si la ficha tiene aprendices se aplica borrado lógico; si no, se elimina.\n\n" + rol(ADMIN),
                      responses=respuestas(401, 403, 404, 422))
def eliminar_ficha(ficha_id: IdPath, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return Mensaje(mensaje=FichaService(db).eliminar(ficha_id, actor))
