from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.schemas.comun import EntradaBase, NombrePersona, NumeroDocumento, SalidaBase, TextoCorto

CategoriaPlato = Literal["sopa", "plato_fuerte", "acompanante", "bebida"]


# ── Menú ─────────────────────────────────────────────────────────────
class PlatoEntrada(EntradaBase):
    categoria: CategoriaPlato
    nombre: TextoCorto = Field(examples=["Sancocho de gallina"])


class MenuEntrada(EntradaBase):
    fecha: date
    descripcion: str | None = Field(default=None, max_length=200)
    platos: list[PlatoEntrada] = Field(min_length=1, max_length=4)

    @field_validator("platos")
    @classmethod
    def _categorias_unicas(cls, v: list[PlatoEntrada]):
        categorias = [p.categoria for p in v]
        if len(categorias) != len(set(categorias)):
            raise ValueError("No puede repetir la categoría de un plato en el mismo menú.")
        return v


class MenuActualizar(EntradaBase):
    descripcion: str | None = Field(default=None, max_length=200)
    platos: list[PlatoEntrada] | None = Field(default=None, min_length=1, max_length=4)

    @field_validator("platos")
    @classmethod
    def _categorias_unicas(cls, v):
        if v is not None and len({p.categoria for p in v}) != len(v):
            raise ValueError("No puede repetir la categoría de un plato en el mismo menú.")
        return v


class PlatoSalida(SalidaBase):
    id: int
    categoria: str
    nombre: str


class MenuSalida(SalidaBase):
    id: int
    fecha: date
    descripcion: str | None
    estado: str
    publicado_en: datetime | None
    platos: list[PlatoSalida]
    creado_por: int | None
    creado_en: datetime
    actualizado_en: datetime | None


# ── Precios ──────────────────────────────────────────────────────────
class PrecioEntrada(EntradaBase):
    tipo: Literal["comunidad_sena", "visitante"]
    valor: Decimal = Field(gt=0, max_digits=10, decimal_places=2, examples=[5000])
    vigente_desde: date | None = None


class PrecioSalida(SalidaBase):
    id: int
    tipo: str
    valor: Decimal
    vigente_desde: date
    activo: bool
    creado_por: int | None
    creado_en: datetime


# ── Reservas ─────────────────────────────────────────────────────────
class ReservaEntrada(EntradaBase):
    medio_pago: Literal["nequi", "cuenta_institucional"] = Field(
        default="nequi",
        description="Aprendiz: siempre nequi (o sin costo si es beneficiario). Instructor: nequi o cuenta_institucional.",
    )


class ConfirmarPagoEntrada(EntradaBase):
    codigo_transaccion: str = Field(
        min_length=6, max_length=30, pattern=r"^[A-Za-z0-9-]+$",
        description="Código de la transacción que muestra Nequi al pagar", examples=["M1234567"],
    )


class ReservaSalida(SalidaBase):
    id: int
    usuario_id: int
    usuario_nombre: str
    menu_id: int
    fecha: date
    valor: Decimal
    medio_pago: str
    referencia_pago: str
    codigo_transaccion: str | None
    estado: str
    pagada_en: datetime | None
    cancelada_en: datetime | None
    creado_en: datetime

    @classmethod
    def desde(cls, r) -> "ReservaSalida":
        return cls(
            id=r.id, usuario_id=r.usuario_id, usuario_nombre=r.usuario.nombre_completo, menu_id=r.menu_id,
            fecha=r.fecha, valor=r.valor, medio_pago=r.medio_pago, referencia_pago=r.referencia_pago,
            codigo_transaccion=r.codigo_transaccion,
            estado=r.estado, pagada_en=r.pagada_en, cancelada_en=r.cancelada_en, creado_en=r.creado_en,
        )


class PagoNequi(BaseModel):
    referencia: str
    valor: Decimal
    contenido_qr: str = Field(description="Texto que el frontend convierte en el QR de Nequi que se muestra en pantalla")
    instrucciones: list[str]


class ReservaCreadaSalida(BaseModel):
    reserva: ReservaSalida
    pago: PagoNequi | None = Field(description="Datos del QR de Nequi; null si el almuerzo no tiene costo")


# ── Biometría ────────────────────────────────────────────────────────
class BiometriaEntrada(EntradaBase):
    usuario_id: int = Field(gt=0)
    vector_facial: list[float] = Field(
        min_length=128, max_length=512, description="Vector de características faciales (embedding). No se guarda la foto."
    )
    autorizacion_firmada: bool = Field(description="Debe ser true: autorización de tratamiento de datos (Ley 1581 de 2012)")

    @field_validator("autorizacion_firmada")
    @classmethod
    def _autorizacion(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Sin la autorización firmada no se puede registrar el rostro.")
        return v


class BiometriaSalida(SalidaBase):
    id: int
    usuario_id: int
    autorizacion_firmada: bool
    fecha_autorizacion: date
    creado_por: int | None
    creado_en: datetime


# ── Ingresos al comedor ─────────────────────────────────────────────
class VerificacionFacialEntrada(EntradaBase):
    vector_facial: list[float] = Field(min_length=128, max_length=512, description="Embedding capturado por la cámara")


class IngresoManualEntrada(EntradaBase):
    reserva_id: int = Field(gt=0, description="Reserva del aprendiz que cede su almuerzo")
    receptor_nombre: NombrePersona = Field(description="Aprendiz que recibe el almuerzo")
    receptor_documento: NumeroDocumento
    motivo: str = Field(min_length=5, max_length=200, examples=["El aprendiz cedió su almuerzo por cita médica"])


class IngresoSalida(SalidaBase):
    id: int
    usuario_id: int | None
    usuario_nombre: str | None
    reserva_id: int | None
    fecha: date
    hora_ingreso: datetime
    hora_salida: datetime | None
    metodo: str
    resultado: str
    motivo: str
    similitud: Decimal | None
    receptor_nombre: str | None
    receptor_documento: str | None
    creado_por: int | None

    @classmethod
    def desde(cls, i) -> "IngresoSalida":
        return cls(
            id=i.id, usuario_id=i.usuario_id, usuario_nombre=i.usuario.nombre_completo if i.usuario else None,
            reserva_id=i.reserva_id, fecha=i.fecha, hora_ingreso=i.hora_ingreso, hora_salida=i.hora_salida,
            metodo=i.metodo, resultado=i.resultado, motivo=i.motivo, similitud=i.similitud,
            receptor_nombre=i.receptor_nombre, receptor_documento=i.receptor_documento, creado_por=i.creado_por,
        )


class ResultadoVerificacion(BaseModel):
    permitido: bool
    color: Literal["verde", "rojo"]
    mensaje: str
    usuario_nombre: str | None
    similitud: Decimal | None
    registro: IngresoSalida


class AforoSalida(BaseModel):
    fecha: date
    dentro: int
    capacidad: int
    disponible: int
    porcentaje: float


# ── Deudas de instructores ──────────────────────────────────────────
class PagoDeudaEntrada(EntradaBase):
    valor: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    medio_pago: Literal["nequi", "efectivo", "transferencia"] = "nequi"
    observacion: str | None = Field(default=None, max_length=200)


class PagoDeudaSalida(SalidaBase):
    id: int
    instructor_id: int
    valor: Decimal
    medio_pago: str
    observacion: str | None
    creado_por: int | None
    creado_en: datetime


class DeudaSalida(BaseModel):
    instructor_id: int
    instructor_nombre: str
    almuerzos: int
    total_consumido: Decimal
    total_pagado: Decimal
    saldo: Decimal
