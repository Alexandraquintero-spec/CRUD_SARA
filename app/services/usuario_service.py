"""Gestión de usuarios, roles y fichas (solo administrador)."""
from sqlalchemy.orm import Session

from app.core.errors import Conflicto, NoEncontrado, ReglaNegocio
from app.core.security import hashear_contrasena
from app.models import Aprendiz, FichaFormacion, Rol, Usuario
from app.repositories.usuario_repository import (
    AprendizRepository,
    FichaRepository,
    RolRepository,
    UsuarioRepository,
)
from app.schemas.comun import Pagina
from app.schemas.usuario import (
    FichaActualizar,
    FichaEntrada,
    FichaSalida,
    UsuarioActualizar,
    UsuarioEntrada,
    UsuarioSalida,
)


class RolService:
    def __init__(self, db: Session):
        self.roles = RolRepository(db)

    def listar(self) -> list[Rol]:
        return self.roles.listar_todos()


class FichaService:
    def __init__(self, db: Session):
        self.fichas = FichaRepository(db)

    def obtener(self, ficha_id: int) -> FichaFormacion:
        ficha = self.fichas.obtener(ficha_id)
        if ficha is None:
            raise NoEncontrado("La ficha no existe.")
        return ficha

    def listar(self, pagina, tamano, **filtros) -> Pagina[FichaSalida]:
        items, total = self.fichas.listar(pagina, tamano, **filtros)
        return Pagina.crear([FichaSalida.model_validate(f) for f in items], total, pagina, tamano)

    def crear(self, datos: FichaEntrada, actor: Usuario) -> FichaFormacion:
        if self.fichas.existe_numero(datos.numero):
            raise Conflicto(f"Ya existe una ficha con el número {datos.numero}.")
        ficha = self.fichas.agregar(FichaFormacion(**datos.model_dump()), actor.id)
        self.fichas.confirmar()
        return ficha

    def actualizar(self, ficha_id: int, datos: FichaActualizar, actor: Usuario) -> FichaFormacion:
        ficha = self.obtener(ficha_id)
        cambios = datos.model_dump(exclude_unset=True)
        inicio = cambios.get("fecha_inicio", ficha.fecha_inicio)
        fin = cambios.get("fecha_fin", ficha.fecha_fin)
        if fin <= inicio:
            raise ReglaNegocio("La fecha de fin debe ser posterior a la fecha de inicio.")
        self.fichas.actualizar(ficha, cambios, actor.id)
        self.fichas.confirmar()
        return ficha

    def eliminar(self, ficha_id: int, actor: Usuario) -> str:
        ficha = self.obtener(ficha_id)
        if self.fichas.tiene_aprendices(ficha_id):
            self.fichas.eliminar_logico(ficha, actor.id)
            ficha.activa = False
            mensaje = "La ficha tiene aprendices asociados: se inactivó (borrado lógico)."
        else:
            self.fichas.eliminar_fisico(ficha)
            mensaje = "Ficha eliminada."
        self.fichas.confirmar()
        return mensaje


class UsuarioService:
    def __init__(self, db: Session):
        self.usuarios = UsuarioRepository(db)
        self.roles = RolRepository(db)
        self.aprendices = AprendizRepository(db)
        self.fichas = FichaRepository(db)

    def obtener(self, usuario_id: int) -> Usuario:
        usuario = self.usuarios.obtener(usuario_id)
        if usuario is None:
            raise NoEncontrado("El usuario no existe.")
        return usuario

    def listar(self, pagina, tamano, **filtros) -> Pagina[UsuarioSalida]:
        items, total = self.usuarios.listar(pagina, tamano, **filtros)
        return Pagina.crear([UsuarioSalida.desde(u) for u in items], total, pagina, tamano)

    def _validar_ficha(self, ficha_id: int) -> FichaFormacion:
        ficha = self.fichas.obtener(ficha_id)
        if ficha is None:
            raise NoEncontrado("La ficha indicada no existe.")
        if not ficha.activa:
            raise ReglaNegocio("La ficha indicada está inactiva.")
        return ficha

    def crear(self, datos: UsuarioEntrada, actor: Usuario) -> Usuario:
        if self.usuarios.existe_correo(datos.correo):
            raise Conflicto("Ya existe un usuario con ese correo.")
        if self.usuarios.existe_documento(datos.numero_documento):
            raise Conflicto("Ya existe un usuario con ese número de documento.")
        rol = self.roles.por_nombre(datos.rol)
        if rol is None:
            raise NoEncontrado("El rol indicado no existe.")
        if datos.rol == "aprendiz":
            self._validar_ficha(datos.ficha_id)

        usuario = Usuario(
            rol_id=rol.id, nombre_completo=datos.nombre_completo, tipo_documento=datos.tipo_documento,
            numero_documento=datos.numero_documento, correo=datos.correo, telefono=datos.telefono,
            contrasena_hash=hashear_contrasena(datos.contrasena),
        )
        self.usuarios.agregar(usuario, actor.id)
        if datos.rol == "aprendiz":
            self.aprendices.agregar(
                Aprendiz(usuario_id=usuario.id, ficha_id=datos.ficha_id, tipo=datos.tipo_aprendiz), actor.id
            )
        self.usuarios.confirmar()
        return self.usuarios.refrescar(usuario)

    def actualizar(self, usuario_id: int, datos: UsuarioActualizar, actor: Usuario) -> Usuario:
        usuario = self.obtener(usuario_id)
        cambios = datos.model_dump(exclude_unset=True)
        if "correo" in cambios and self.usuarios.existe_correo(cambios["correo"], excluir_id=usuario.id):
            raise Conflicto("Ya existe un usuario con ese correo.")

        datos_aprendiz = {k: cambios.pop(k) for k in ("ficha_id", "tipo_aprendiz", "alimentacion_activa") if k in cambios}
        if datos_aprendiz:
            if usuario.aprendiz is None:
                raise ReglaNegocio("Los datos de ficha y alimentación solo aplican a aprendices.")
            if "ficha_id" in datos_aprendiz:
                self._validar_ficha(datos_aprendiz["ficha_id"])
            if "tipo_aprendiz" in datos_aprendiz:
                datos_aprendiz["tipo"] = datos_aprendiz.pop("tipo_aprendiz")
            self.aprendices.actualizar(usuario.aprendiz, datos_aprendiz, actor.id)

        self.usuarios.actualizar(usuario, cambios, actor.id)
        self.usuarios.confirmar()
        return self.usuarios.refrescar(usuario)

    def cambiar_estado(self, usuario_id: int, activo: bool, actor: Usuario) -> Usuario:
        if usuario_id == actor.id:
            raise ReglaNegocio("No puede activar ni desactivar su propia cuenta.")
        usuario = self.obtener(usuario_id)
        self.usuarios.actualizar(usuario, {"activo": activo}, actor.id)
        self.usuarios.confirmar()
        return usuario

    def cambiar_rol(self, usuario_id: int, nombre_rol: str, actor: Usuario) -> Usuario:
        if usuario_id == actor.id:
            raise ReglaNegocio("No puede cambiar su propio rol.")
        usuario = self.obtener(usuario_id)
        rol = self.roles.por_nombre(nombre_rol)
        if rol is None:
            raise NoEncontrado("El rol indicado no existe.")
        if nombre_rol == "aprendiz" and usuario.aprendiz is None:
            raise ReglaNegocio("Para convertir en aprendiz, registre el usuario con su ficha desde /usuarios.")
        if usuario.aprendiz is not None and nombre_rol != "aprendiz":
            raise ReglaNegocio("Un aprendiz con ficha asignada no puede cambiar a otro rol.")
        self.usuarios.actualizar(usuario, {"rol_id": rol.id}, actor.id)
        self.usuarios.confirmar()
        return self.usuarios.refrescar(usuario)

    def eliminar(self, usuario_id: int, actor: Usuario) -> str:
        if usuario_id == actor.id:
            raise ReglaNegocio("No puede eliminar su propia cuenta.")
        usuario = self.obtener(usuario_id)
        # El usuario siempre tiene historial (auditoría, reservas o ingresos): borrado lógico
        self.usuarios.eliminar_logico(usuario, actor.id)
        self.usuarios.confirmar()
        return "Usuario eliminado (borrado lógico: se conserva su historial)."
