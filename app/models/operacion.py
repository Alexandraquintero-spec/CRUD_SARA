"""Inventario, visitantes, observaciones y control de producción."""
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import AuditoriaMixin
from app.models.usuario import Usuario


class CategoriaProducto(AuditoriaMixin, Base):
    __tablename__ = "categoria_producto"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(60))
    descripcion: Mapped[str | None] = mapped_column(String(200))
    activa: Mapped[bool] = mapped_column(Boolean, default=True)


class Producto(AuditoriaMixin, Base):
    __tablename__ = "producto"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categoria_producto.id"))
    codigo: Mapped[str] = mapped_column(String(20))
    nombre: Mapped[str] = mapped_column(String(100))
    unidad_medida: Mapped[str] = mapped_column(String(10))
    origen: Mapped[str] = mapped_column(String(15))
    cantidad: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    stock_minimo: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    fecha_vencimiento: Mapped[date | None] = mapped_column(Date)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    eliminado: Mapped[bool] = mapped_column(Boolean, default=False)

    categoria: Mapped[CategoriaProducto] = relationship(lazy="joined")


class MovimientoInventario(AuditoriaMixin, Base):
    __tablename__ = "movimiento_inventario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("producto.id"))
    tipo: Mapped[str] = mapped_column(String(10))
    cantidad: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    cantidad_resultante: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    motivo: Mapped[str] = mapped_column(String(200))

    producto: Mapped[Producto] = relationship(lazy="joined")


class Visitante(AuditoriaMixin, Base):
    __tablename__ = "visitante"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre_completo: Mapped[str] = mapped_column(String(120))
    tipo_documento: Mapped[str] = mapped_column(String(2))
    numero_documento: Mapped[str] = mapped_column(String(15))
    entidad: Mapped[str | None] = mapped_column(String(120))
    fecha: Mapped[date] = mapped_column(Date)
    valor_pagado: Mapped[Decimal] = mapped_column(Numeric(10, 2))


class Observacion(AuditoriaMixin, Base):
    __tablename__ = "observacion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"))
    categoria: Mapped[str] = mapped_column(String(15))
    descripcion: Mapped[str] = mapped_column(String(500))
    estado: Mapped[str] = mapped_column(String(12), default="nueva")
    respuesta: Mapped[str | None] = mapped_column(String(500))
    respondida_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    usuario: Mapped[Usuario] = relationship(lazy="joined")


class ControlProduccion(AuditoriaMixin, Base):
    __tablename__ = "control_produccion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fecha: Mapped[date] = mapped_column(Date)
    almuerzos_preparados: Mapped[int] = mapped_column(Integer)
    almuerzos_entregados: Mapped[int] = mapped_column(Integer, default=0)
    observaciones: Mapped[str | None] = mapped_column(String(300))
