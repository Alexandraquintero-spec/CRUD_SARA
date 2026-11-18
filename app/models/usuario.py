from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import AuditoriaMixin


class Rol(AuditoriaMixin, Base):
    __tablename__ = "rol"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(30))
    descripcion: Mapped[str] = mapped_column(String(200))


class Usuario(AuditoriaMixin, Base):
    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rol_id: Mapped[int] = mapped_column(ForeignKey("rol.id"))
    nombre_completo: Mapped[str] = mapped_column(String(120))
    tipo_documento: Mapped[str] = mapped_column(String(2))
    numero_documento: Mapped[str] = mapped_column(String(15))
    correo: Mapped[str] = mapped_column(String(120))
    telefono: Mapped[str | None] = mapped_column(String(10))
    contrasena_hash: Mapped[str] = mapped_column(String(60))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    eliminado: Mapped[bool] = mapped_column(Boolean, default=False)
    intentos_fallidos: Mapped[int] = mapped_column(SmallInteger, default=0)
    bloqueado_hasta: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ultimo_acceso: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    rol: Mapped[Rol] = relationship(lazy="joined")
    aprendiz: Mapped["Aprendiz | None"] = relationship(back_populates="usuario", uselist=False, lazy="joined")


class FichaFormacion(AuditoriaMixin, Base):
    __tablename__ = "ficha_formacion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    numero: Mapped[str] = mapped_column(String(10))
    programa: Mapped[str] = mapped_column(String(150))
    nivel: Mapped[str] = mapped_column(String(15))
    jornada: Mapped[str] = mapped_column(String(10))
    instructor_lider: Mapped[str] = mapped_column(String(120))
    fecha_inicio: Mapped[date] = mapped_column(Date)
    fecha_fin: Mapped[date] = mapped_column(Date)
    activa: Mapped[bool] = mapped_column(Boolean, default=True)
    eliminado: Mapped[bool] = mapped_column(Boolean, default=False)


class Aprendiz(AuditoriaMixin, Base):
    __tablename__ = "aprendiz"

    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"), primary_key=True)
    ficha_id: Mapped[int] = mapped_column(ForeignKey("ficha_formacion.id"))
    tipo: Mapped[str] = mapped_column(String(12), default="normal")
    alimentacion_activa: Mapped[bool] = mapped_column(Boolean, default=True)

    usuario: Mapped[Usuario] = relationship(back_populates="aprendiz")
    ficha: Mapped[FichaFormacion] = relationship(lazy="joined")
