"""Cifrado y comparación de plantillas faciales.

Solo se guarda el vector de características (embedding) cifrado con Fernet
(AES-128 + HMAC). Nunca se almacena la fotografía.
"""
import json
import math

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings

_fernet = Fernet(settings.CLAVE_BIOMETRIA.encode())


def cifrar_vector(vector: list[float]) -> str:
    return _fernet.encrypt(json.dumps([round(x, 6) for x in vector]).encode()).decode()


def descifrar_vector(cifrado: str) -> list[float] | None:
    try:
        return json.loads(_fernet.decrypt(cifrado.encode()))
    except (InvalidToken, ValueError):
        return None


def similitud(a: list[float], b: list[float]) -> float:
    """Similitud coseno expresada de 0 a 100."""
    if len(a) != len(b):
        return 0.0
    punto = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return round(max(0.0, punto / (na * nb)) * 100, 2)
