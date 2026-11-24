"""Menú, precios, reservas, pagos de deuda, biometría e ingresos al comedor."""
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import AuditoriaMixin
from app.models.usuario import Usuario


class Menu(AuditoriaMixin, Base):
    __tablename__ = "menu"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fecha: Mapped[date] = mapped_column(Date)
    descripcion: Mapped[str | None] = mapped_column(String(200))
    estado: Mapped[str] = mapped_column(String(10), default="borrador")
    publicado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    platos: Mapped[list["PlatoMenu"]] = relationship(
        back_populates="menu", cascade="all, delete-orphan", lazy="selectin", order_by="PlatoMenu.id"
    )


class PlatoMenu(AuditoriaMixin, Base):
    __tablename__ = "plato_menu"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    menu_id: Mapped[int] = mapped_column(ForeignKey("menu.id", ondelete="CASCADE"))
    categoria: Mapped[str] = mapped_column(String(15))
    nombre: Mapped[str] = mapped_column(String(100))

    menu: Mapped[Menu] = relationship(back_populates="platos")


class Precio(AuditoriaMixin, Base):
    __tablename__ = "precio"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tipo: Mapped[str] = mapped_column(String(15))
    valor: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    vigente_desde: Mapped[date] = mapped_column(Date)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)


class Reserva(AuditoriaMixin, Base):
    __tablename__ = "reserva"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"))
    menu_id: Mapped[int] = mapped_column(ForeignKey("menu.id"))
    fecha: Mapped[date] = mapped_column(Date)
    valor: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    medio_pago: Mapped[str] = mapped_column(String(25))
    referencia_pago: Mapped[str] = mapped_column(String(40))
    codigo_transaccion: Mapped[str | None] = mapped_column(String(30))
    estado: Mapped[str] = mapped_column(String(15), default="pendiente_pago")
    pagada_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelada_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    usuario: Mapped[Usuario] = relationship(lazy="joined")


class PagoDeuda(AuditoriaMixin, Base):
    __tablename__ = "pago_deuda"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    instructor_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"))
    valor: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    medio_pago: Mapped[str] = mapped_column(String(15), default="qr")
    observacion: Mapped[str | None] = mapped_column(String(200))


class PlantillaBiometrica(AuditoriaMixin, Base):
    __tablename__ = "plantilla_biometrica"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"))
    vector_cifrado: Mapped[str] = mapped_column(Text)
    autorizacion_firmada: Mapped[bool] = mapped_column(Boolean)
    fecha_autorizacion: Mapped[date] = mapped_column(Date)


class RegistroIngreso(AuditoriaMixin, Base):
    __tablename__ = "registro_ingreso"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuario.id"))
    reserva_id: Mapped[int | None] = mapped_column(ForeignKey("reserva.id"))
    fecha: Mapped[date] = mapped_column(Date)
    hora_ingreso: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    hora_salida: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metodo: Mapped[str] = mapped_column(String(10))
    resultado: Mapped[str] = mapped_column(String(10))
    motivo: Mapped[str] = mapped_column(String(200))
    similitud: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    receptor_nombre: Mapped[str | None] = mapped_column(String(120))
    receptor_documento: Mapped[str | None] = mapped_column(String(15))

    usuario: Mapped[Usuario | None] = relationship(lazy="joined")
