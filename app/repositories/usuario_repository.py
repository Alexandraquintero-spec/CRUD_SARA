from sqlalchemy import exists, func, or_, select

from app.models import Aprendiz, FichaFormacion, Reserva, Rol, Usuario
from app.repositories.base import BaseRepository


class RolRepository(BaseRepository[Rol]):
    model = Rol

    def listar_todos(self) -> list[Rol]:
        return list(self.db.scalars(select(Rol).order_by(Rol.id)).all())

    def por_nombre(self, nombre: str) -> Rol | None:
        return self.db.scalar(select(Rol).where(Rol.nombre == nombre))


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def por_correo(self, correo: str) -> Usuario | None:
        return self.db.scalar(
            select(Usuario).where(func.lower(Usuario.correo) == correo.lower(), Usuario.eliminado.is_(False))
        )

    def existe_correo(self, correo: str, excluir_id: int | None = None) -> bool:
        stmt = select(exists().where(func.lower(Usuario.correo) == correo.lower()))
        if excluir_id:
            stmt = select(exists().where(func.lower(Usuario.correo) == correo.lower(), Usuario.id != excluir_id))
        return bool(self.db.scalar(stmt))

    def existe_documento(self, numero: str) -> bool:
        return bool(self.db.scalar(select(exists().where(Usuario.numero_documento == numero))))

    def tiene_movimientos(self, usuario_id: int) -> bool:
        return bool(self.db.scalar(select(exists().where(Reserva.usuario_id == usuario_id))))

    def listar(
        self, pagina: int, tamano: int, rol: str | None = None, activo: bool | None = None,
        ficha_id: int | None = None, buscar: str | None = None,
    ) -> tuple[list[Usuario], int]:
        stmt = self._base().join(Rol)
        if rol:
            stmt = stmt.where(Rol.nombre == rol)
        if activo is not None:
            stmt = stmt.where(Usuario.activo.is_(activo))
        if ficha_id:
            stmt = stmt.join(Aprendiz, Aprendiz.usuario_id == Usuario.id).where(Aprendiz.ficha_id == ficha_id)
        if buscar:
            patron = f"%{buscar.lower()}%"
            stmt = stmt.where(or_(
                func.lower(Usuario.nombre_completo).like(patron),
                Usuario.numero_documento.like(patron),
                func.lower(Usuario.correo).like(patron),
            ))
        return self._paginar(stmt.order_by(Usuario.id), pagina, tamano)

    def instructores(self) -> list[Usuario]:
        stmt = self._base().join(Rol).where(Rol.nombre == "instructor").order_by(Usuario.nombre_completo)
        return list(self.db.scalars(stmt).unique().all())


class AprendizRepository(BaseRepository[Aprendiz]):
    model = Aprendiz


class FichaRepository(BaseRepository[FichaFormacion]):
    model = FichaFormacion

    def existe_numero(self, numero: str) -> bool:
        return bool(self.db.scalar(select(exists().where(FichaFormacion.numero == numero))))

    def tiene_aprendices(self, ficha_id: int) -> bool:
        return bool(self.db.scalar(select(exists().where(Aprendiz.ficha_id == ficha_id))))

    def listar(
        self, pagina: int, tamano: int, activa: bool | None = None, jornada: str | None = None, buscar: str | None = None
    ) -> tuple[list[FichaFormacion], int]:
        stmt = self._base()
        if activa is not None:
            stmt = stmt.where(FichaFormacion.activa.is_(activa))
        if jornada:
            stmt = stmt.where(FichaFormacion.jornada == jornada)
        if buscar:
            patron = f"%{buscar.lower()}%"
            stmt = stmt.where(or_(FichaFormacion.numero.like(patron), func.lower(FichaFormacion.programa).like(patron)))
        return self._paginar(stmt.order_by(FichaFormacion.numero), pagina, tamano)
