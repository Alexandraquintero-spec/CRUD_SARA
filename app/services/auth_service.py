"""Autenticación: inicio de sesión, bloqueo por intentos, refresh y cambio de contraseña."""
from datetime import timedelta

from sqlalchemy.orm import Session

from app.core import reloj
from app.core.config import settings
from app.core.errors import NoAutenticado, ReglaNegocio
from app.core.security import (
    crear_access_token,
    crear_refresh_token,
    decodificar_token,
    hashear_contrasena,
    verificar_contrasena,
)
from app.models import Usuario
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import CambioContrasenaEntrada, LoginEntrada, TokenSalida

CREDENCIALES_INVALIDAS = "Correo o contraseña incorrectos."


class AuthService:
    def __init__(self, db: Session):
        self.usuarios = UsuarioRepository(db)

    def _tokens(self, usuario: Usuario) -> TokenSalida:
        return TokenSalida(
            access_token=crear_access_token(usuario.id, usuario.rol.nombre),
            refresh_token=crear_refresh_token(usuario.id, usuario.rol.nombre),
            expira_en=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            rol=usuario.rol.nombre,
        )

    def login(self, datos: LoginEntrada) -> TokenSalida:
        usuario = self.usuarios.por_correo(datos.correo)
        # Mismo mensaje si el correo no existe o la contraseña falla (no revela qué correos existen)
        if usuario is None:
            raise NoAutenticado(CREDENCIALES_INVALIDAS)

        ahora = reloj.ahora()
        if usuario.bloqueado_hasta and usuario.bloqueado_hasta > ahora:
            minutos = max(1, int((usuario.bloqueado_hasta - ahora).total_seconds() // 60) + 1)
            raise NoAutenticado(
                f"Cuenta bloqueada temporalmente por intentos fallidos. Intente de nuevo en {minutos} minuto(s)."
            )

        if not verificar_contrasena(datos.contrasena, usuario.contrasena_hash):
            usuario.intentos_fallidos += 1
            if usuario.intentos_fallidos >= settings.MAX_INTENTOS_LOGIN:
                usuario.bloqueado_hasta = ahora + timedelta(minutes=settings.MINUTOS_BLOQUEO)
                usuario.intentos_fallidos = 0
                self.usuarios.confirmar()
                raise NoAutenticado(
                    f"Superó {settings.MAX_INTENTOS_LOGIN} intentos fallidos. "
                    f"La cuenta quedó bloqueada {settings.MINUTOS_BLOQUEO} minutos."
                )
            self.usuarios.confirmar()
            raise NoAutenticado(CREDENCIALES_INVALIDAS)

        if not usuario.activo:
            raise NoAutenticado("El usuario está inactivo. Comuníquese con el administrador.")

        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        usuario.ultimo_acceso = ahora
        self.usuarios.confirmar()
        return self._tokens(usuario)

    def refrescar(self, refresh_token: str) -> TokenSalida:
        payload = decodificar_token(refresh_token, "refresh")
        usuario = self.usuario_activo(int(payload["sub"]))
        return self._tokens(usuario)

    def usuario_activo(self, usuario_id: int) -> Usuario:
        usuario = self.usuarios.obtener(usuario_id)
        if usuario is None or not usuario.activo:
            raise NoAutenticado("El usuario no existe o está inactivo.")
        return usuario

    def cambiar_contrasena(self, usuario: Usuario, datos: CambioContrasenaEntrada) -> None:
        if not verificar_contrasena(datos.contrasena_actual, usuario.contrasena_hash):
            raise ReglaNegocio("La contraseña actual no es correcta.")
        if verificar_contrasena(datos.contrasena_nueva, usuario.contrasena_hash):
            raise ReglaNegocio("La nueva contraseña debe ser diferente a la actual.")
        usuario.contrasena_hash = hashear_contrasena(datos.contrasena_nueva)
        self.usuarios.marcar_actualizado(usuario, usuario.id)
        self.usuarios.confirmar()
