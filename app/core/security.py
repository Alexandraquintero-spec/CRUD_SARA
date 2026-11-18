"""Hash de contraseñas con bcrypt y emisión/validación de tokens JWT."""
import re
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings
from app.core.errors import NoAutenticado

# Política: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
PATRON_CONTRASENA = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")
MENSAJE_POLITICA = (
    "La contraseña debe tener mínimo 8 caracteres e incluir al menos una mayúscula, "
    "una minúscula y un número."
)


def cumple_politica(contrasena: str) -> bool:
    return bool(PATRON_CONTRASENA.match(contrasena))


def hashear_contrasena(contrasena: str) -> str:
    return bcrypt.hashpw(contrasena.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verificar_contrasena(contrasena: str, contrasena_hash: str) -> bool:
    try:
        return bcrypt.checkpw(contrasena.encode("utf-8"), contrasena_hash.encode("utf-8"))
    except ValueError:
        return False


def _crear_token(usuario_id: int, rol: str, tipo: str, expira: timedelta) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario_id),
        "rol": rol,
        "type": tipo,
        "jti": uuid.uuid4().hex,
        "iat": ahora,
        "exp": ahora + expira,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def crear_access_token(usuario_id: int, rol: str) -> str:
    return _crear_token(usuario_id, rol, "access", timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))


def crear_refresh_token(usuario_id: int, rol: str) -> str:
    return _crear_token(usuario_id, rol, "refresh", timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))


def decodificar_token(token: str, tipo_esperado: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise NoAutenticado("El token ha expirado. Inicie sesión nuevamente.")
    except jwt.InvalidTokenError:
        raise NoAutenticado("Token inválido.")
    if payload.get("type") != tipo_esperado:
        raise NoAutenticado("Tipo de token inválido.")
    return payload
