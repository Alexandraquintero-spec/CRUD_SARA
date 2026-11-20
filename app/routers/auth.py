from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user
from app.database import get_db
from app.models import Usuario
from app.schemas.auth import CambioContrasenaEntrada, LoginEntrada, RefreshEntrada, TokenSalida
from app.schemas.comun import Mensaje, respuestas
from app.schemas.usuario import UsuarioSalida
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/login",
    response_model=TokenSalida,
    summary="Iniciar sesión",
    description=(
        "Inicia sesión con **correo y contraseña** y devuelve un access token (JWT con expiración) "
        "y un refresh token. Tras 5 intentos fallidos la cuenta se bloquea temporalmente. "
        "Los usuarios inactivos no pueden ingresar.\n\n**Rol requerido:** ninguno (endpoint público)."
    ),
    responses=respuestas(401, 422),
)
def login(datos: LoginEntrada, db: Session = Depends(get_db)):
    return AuthService(db).login(datos)


@router.post(
    "/refresh",
    response_model=TokenSalida,
    summary="Renovar el access token",
    description="Recibe el refresh token y entrega un nuevo par de tokens.\n\n**Rol requerido:** ninguno (requiere refresh token válido).",
    responses=respuestas(401, 422),
)
def refresh(datos: RefreshEntrada, db: Session = Depends(get_db)):
    return AuthService(db).refrescar(datos.refresh_token)


@router.get(
    "/me",
    response_model=UsuarioSalida,
    summary="Consultar mi perfil",
    description="Devuelve los datos del usuario autenticado (sin contraseña).\n\n**Rol requerido:** cualquier usuario autenticado.",
    responses=respuestas(401),
)
def perfil(usuario: Usuario = Depends(get_current_user)):
    return UsuarioSalida.desde(usuario)


@router.put(
    "/me/password",
    response_model=Mensaje,
    summary="Cambiar mi contraseña",
    description=(
        "Cambia la contraseña del usuario autenticado. Requiere la contraseña actual. "
        "La nueva debe tener mínimo 8 caracteres con mayúscula, minúscula y número.\n\n"
        "**Rol requerido:** cualquier usuario autenticado."
    ),
    responses=respuestas(400, 401, 422),
)
def cambiar_contrasena(
    datos: CambioContrasenaEntrada, usuario: Usuario = Depends(get_current_user), db: Session = Depends(get_db)
):
    AuthService(db).cambiar_contrasena(usuario, datos)
    return Mensaje(mensaje="Contraseña actualizada correctamente.")
