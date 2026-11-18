"""Dependencias de autenticación y autorización por rol.

- Sin token o token inválido/expirado  -> 401
- Token válido pero rol sin permiso    -> 403
"""
from collections.abc import Callable

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.errors import NoAutenticado, SinPermiso
from app.core.security import decodificar_token
from app.database import get_db
from app.models import Usuario

_bearer = HTTPBearer(auto_error=False, description="Pegue aquí el access_token obtenido en /auth/login")

ADMIN = "administrador"
INSTRUCTOR = "instructor"
APRENDIZ = "aprendiz"
TODOS = (ADMIN, INSTRUCTOR, APRENDIZ)


def get_current_user(
    credenciales: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    from app.services.auth_service import AuthService  # import diferido: evita ciclo core <-> services

    if credenciales is None or credenciales.scheme.lower() != "bearer":
        raise NoAutenticado("No autenticado. Envíe el token en el encabezado Authorization: Bearer <token>.")
    payload = decodificar_token(credenciales.credentials, "access")
    try:
        usuario_id = int(payload.get("sub", 0))
    except (TypeError, ValueError):
        raise NoAutenticado("Token inválido.")
    return AuthService(db).usuario_activo(usuario_id)


def require_roles(*roles: str) -> Callable[..., Usuario]:
    def _verificar(usuario: Usuario = Depends(get_current_user)) -> Usuario:
        if usuario.rol.nombre not in roles:
            raise SinPermiso("No tiene permisos para realizar esta acción.")
        return usuario

    return _verificar
