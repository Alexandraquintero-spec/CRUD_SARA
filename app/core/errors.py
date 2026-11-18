"""Errores de negocio y manejadores globales.

Todas las respuestas de error tienen la misma estructura:
{"error": {"codigo": 404, "mensaje": "...", "detalles": [...]}}
Nunca se exponen trazas, consultas SQL ni detalles técnicos al cliente.
"""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("sara")


class AppError(Exception):
    status_code = 400

    def __init__(self, mensaje: str, detalles: list | None = None):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.detalles = detalles or []


class SolicitudInvalida(AppError):
    status_code = 400


class NoAutenticado(AppError):
    status_code = 401


class SinPermiso(AppError):
    status_code = 403


class NoEncontrado(AppError):
    status_code = 404


class Conflicto(AppError):
    status_code = 409


class ReglaNegocio(AppError):
    """Regla de negocio incumplida (horario, aforo, saldo, etc.)."""
    status_code = 400


def _respuesta(status: int, mensaje: str, detalles: list | None = None, headers: dict | None = None):
    return JSONResponse(
        status_code=status,
        content={"error": {"codigo": status, "mensaje": mensaje, "detalles": detalles or []}},
        headers=headers,
    )


_MENSAJES_PYDANTIC = {
    "missing": "Este campo es obligatorio.",
    "string_too_short": "El texto es demasiado corto.",
    "string_too_long": "El texto es demasiado largo.",
    "string_pattern_mismatch": "El formato no es válido.",
    "value_error": "Valor no válido.",
    "greater_than": "Debe ser mayor que {gt}.",
    "greater_than_equal": "Debe ser mayor o igual que {ge}.",
    "less_than_equal": "Debe ser menor o igual que {le}.",
    "int_parsing": "Debe ser un número entero.",
    "float_parsing": "Debe ser un número.",
    "decimal_parsing": "Debe ser un número.",
    "date_from_datetime_parsing": "Debe ser una fecha válida (AAAA-MM-DD).",
    "date_parsing": "Debe ser una fecha válida (AAAA-MM-DD).",
    "bool_parsing": "Debe ser verdadero o falso.",
    "literal_error": "Valor no permitido. Opciones: {expected}.",
    "enum": "Valor no permitido. Opciones: {expected}.",
    "json_invalid": "El cuerpo de la solicitud no es un JSON válido.",
    "extra_forbidden": "Campo no permitido.",
}

_HTTP_MENSAJES = {
    401: "No autenticado. Envíe un token válido.",
    403: "No tiene permisos para realizar esta acción.",
    404: "Recurso no encontrado.",
    405: "Método no permitido.",
}


def registrar_manejadores(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError):
        headers = {"WWW-Authenticate": "Bearer"} if exc.status_code == 401 else None
        return _respuesta(exc.status_code, exc.mensaje, exc.detalles, headers)

    @app.exception_handler(RequestValidationError)
    async def _validacion(_: Request, exc: RequestValidationError):
        detalles = []
        for err in exc.errors():
            campo = ".".join(str(p) for p in err.get("loc", []) if p not in ("body", "query", "path"))
            plantilla = _MENSAJES_PYDANTIC.get(err.get("type", ""))
            if err.get("type") == "value_error":
                # Mensajes propios de los validadores (ya vienen en español)
                mensaje = str(err.get("msg", "")).removeprefix("Value error, ")
            elif plantilla:
                try:
                    mensaje = plantilla.format(**(err.get("ctx") or {}))
                except (KeyError, IndexError):
                    mensaje = plantilla
            else:
                mensaje = "Valor no válido."
            detalles.append({"campo": campo or "cuerpo", "mensaje": mensaje})
        return _respuesta(422, "Los datos enviados no son válidos.", detalles)

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException):
        mensaje = _HTTP_MENSAJES.get(exc.status_code, "Solicitud no válida.")
        headers = {"WWW-Authenticate": "Bearer"} if exc.status_code == 401 else None
        return _respuesta(exc.status_code, mensaje, headers=headers)

    @app.exception_handler(IntegrityError)
    async def _integridad(_: Request, exc: IntegrityError):
        logger.warning("Violación de integridad: %s", exc.orig)
        return _respuesta(409, "El registro entra en conflicto con datos existentes (valor duplicado o relación inválida).")

    @app.exception_handler(SQLAlchemyError)
    async def _bd(_: Request, exc: SQLAlchemyError):
        logger.exception("Error de base de datos")
        return _respuesta(500, "Ocurrió un error interno. Intente más tarde.")

    @app.exception_handler(Exception)
    async def _general(_: Request, exc: Exception):
        logger.exception("Error no controlado")
        return _respuesta(500, "Ocurrió un error interno. Intente más tarde.")
