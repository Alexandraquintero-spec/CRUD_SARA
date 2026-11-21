from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.schemas.comun import EntradaBase, NombrePersona, NumeroDocumento, SalidaBase, TipoDocumento

UnidadMedida = Literal["kg", "g", "l", "ml", "unidad", "paquete"]


# ── Categorías de producto ──────────────────────────────────────────
class CategoriaEntrada(EntradaBase):
    nombre: str = Field(min_length=3, max_length=60, examples=["Granos"])
    descripcion: str | None = Field(default=None, max_length=200)


class CategoriaActualizar(EntradaBase):
    nombre: str | None = Field(default=None, min_length=3, max_length=60)
    descripcion: str | None = Field(default=None, max_length=200)
    activa: bool | None = None


class CategoriaSalida(SalidaBase):
    id: int
    nombre: str
    descripcion: str | None
    activa: bool
    creado_en: datetime


# ── Productos ───────────────────────────────────────────────────────
class ProductoEntrada(EntradaBase):
    categoria_id: int = Field(gt=0)
    codigo: str = Field(pattern=r"^[A-Z0-9-]{3,20}$", examples=["GRA-001"])
    nombre: str = Field(min_length=2, max_length=100, examples=["Arroz blanco"])
    unidad_medida: UnidadMedida
    origen: Literal["proveedor", "insumo_sena"]
    cantidad: Decimal = Field(default=Decimal(0), ge=0, max_digits=12, decimal_places=2)
    stock_minimo: Decimal = Field(default=Decimal(0), ge=0, max_digits=12, decimal_places=2)
    fecha_vencimiento: date | None = None


class ProductoActualizar(EntradaBase):
    """La cantidad no se edita aquí: solo cambia mediante movimientos de inventario."""
    categoria_id: int | None = Field(default=None, gt=0)
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    unidad_medida: UnidadMedida | None = None
    origen: Literal["proveedor", "insumo_sena"] | None = None
    stock_minimo: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    fecha_vencimiento: date | None = None
    activo: bool | None = None


class ProductoSalida(SalidaBase):
    id: int
    categoria_id: int
    categoria: str
    codigo: str
    nombre: str
    unidad_medida: str
    origen: str
    cantidad: Decimal
    stock_minimo: Decimal
    fecha_vencimiento: date | None
    activo: bool
    creado_por: int | None
    creado_en: datetime
    actualizado_por: int | None
    actualizado_en: datetime | None

    @classmethod
    def desde(cls, p) -> "ProductoSalida":
        return cls(
            id=p.id, categoria_id=p.categoria_id, categoria=p.categoria.nombre, codigo=p.codigo, nombre=p.nombre,
            unidad_medida=p.unidad_medida, origen=p.origen, cantidad=p.cantidad, stock_minimo=p.stock_minimo,
            fecha_vencimiento=p.fecha_vencimiento, activo=p.activo, creado_por=p.creado_por, creado_en=p.creado_en,
            actualizado_por=p.actualizado_por, actualizado_en=p.actualizado_en,
        )


class AlertaProducto(BaseModel):
    producto_id: int
    codigo: str
    nombre: str
    tipo_alerta: Literal["stock_bajo", "por_vencer", "vencido"]
    detalle: str


# ── Movimientos ─────────────────────────────────────────────────────
class MovimientoEntrada(EntradaBase):
    producto_id: int = Field(gt=0)
    tipo: Literal["entrada", "salida", "merma", "ajuste"]
    cantidad: Decimal = Field(gt=0, max_digits=12, decimal_places=2, description="Para 'ajuste' es la nueva cantidad total")
    motivo: str = Field(min_length=3, max_length=200, examples=["Compra al proveedor"])


class MovimientoSalida(SalidaBase):
    id: int
    producto_id: int
    producto: str
    tipo: str
    cantidad: Decimal
    cantidad_resultante: Decimal
    motivo: str
    creado_por: int | None
    creado_en: datetime

    @classmethod
    def desde(cls, m) -> "MovimientoSalida":
        return cls(
            id=m.id, producto_id=m.producto_id, producto=m.producto.nombre, tipo=m.tipo, cantidad=m.cantidad,
            cantidad_resultante=m.cantidad_resultante, motivo=m.motivo, creado_por=m.creado_por, creado_en=m.creado_en,
        )


# ── Visitantes ──────────────────────────────────────────────────────
class VisitanteEntrada(EntradaBase):
    nombre_completo: NombrePersona
    tipo_documento: TipoDocumento
    numero_documento: NumeroDocumento
    entidad: str | None = Field(default=None, max_length=120)


class VisitanteActualizar(EntradaBase):
    nombre_completo: NombrePersona | None = None
    entidad: str | None = Field(default=None, max_length=120)


class VisitanteSalida(SalidaBase):
    id: int
    nombre_completo: str
    tipo_documento: str
    numero_documento: str
    entidad: str | None
    fecha: date
    valor_pagado: Decimal
    creado_por: int | None
    creado_en: datetime


# ── Observaciones ───────────────────────────────────────────────────
class ObservacionEntrada(EntradaBase):
    categoria: Literal["menu", "servicio", "instalaciones", "horario", "otro"]
    descripcion: str = Field(min_length=10, max_length=500)


class RespuestaObservacionEntrada(EntradaBase):
    respuesta: str = Field(min_length=5, max_length=500)


class ObservacionSalida(SalidaBase):
    id: int
    usuario_id: int
    usuario_nombre: str
    categoria: str
    descripcion: str
    estado: str
    respuesta: str | None
    respondida_en: datetime | None
    creado_en: datetime

    @classmethod
    def desde(cls, o) -> "ObservacionSalida":
        return cls(
            id=o.id, usuario_id=o.usuario_id, usuario_nombre=o.usuario.nombre_completo, categoria=o.categoria,
            descripcion=o.descripcion, estado=o.estado, respuesta=o.respuesta, respondida_en=o.respondida_en,
            creado_en=o.creado_en,
        )


# ── Control de producción ───────────────────────────────────────────
class ProduccionEntrada(EntradaBase):
    fecha: date
    almuerzos_preparados: int = Field(gt=0, le=1000)
    almuerzos_entregados: int = Field(default=0, ge=0, le=1000)
    observaciones: str | None = Field(default=None, max_length=300)

    @model_validator(mode="after")
    def _entregados(self):
        if self.almuerzos_entregados > self.almuerzos_preparados:
            raise ValueError("Los almuerzos entregados no pueden superar a los preparados.")
        return self


class ProduccionActualizar(EntradaBase):
    almuerzos_preparados: int | None = Field(default=None, gt=0, le=1000)
    almuerzos_entregados: int | None = Field(default=None, ge=0, le=1000)
    observaciones: str | None = Field(default=None, max_length=300)


class ProduccionSalida(SalidaBase):
    id: int
    fecha: date
    almuerzos_preparados: int
    almuerzos_entregados: int
    observaciones: str | None
    creado_por: int | None
    creado_en: datetime
    actualizado_en: datetime | None


# ── Reportes ────────────────────────────────────────────────────────
class ResumenSalida(BaseModel):
    desde: date
    hasta: date
    reservas: int
    reservas_confirmadas: int
    reservas_canceladas: int
    ingresos_permitidos: int
    ingresos_denegados: int
    ingresos_manuales: int
    recaudo_nequi: Decimal
    visitantes: int
    recaudo_visitantes: Decimal
    almuerzos_preparados: int
    almuerzos_entregados: int
    desperdicio_estimado: int


class AlmuerzosDia(BaseModel):
    fecha: date
    reservas: int
    ingresos: int


class GrupoReporte(BaseModel):
    ficha: str
    programa: str
    aprendices: int
    reservas: int
    ingresos: int
