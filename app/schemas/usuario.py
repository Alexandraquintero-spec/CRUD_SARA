from datetime import date, datetime
from typing import Literal

from pydantic import EmailStr, Field, field_validator, model_validator

from app.core.security import MENSAJE_POLITICA, cumple_politica
from app.schemas.comun import (
    EntradaBase,
    NombrePersona,
    NumeroDocumento,
    SalidaBase,
    Telefono,
    TipoDocumento,
)

NombreRol = Literal["administrador", "instructor", "aprendiz"]


# ── Roles ────────────────────────────────────────────────────────────
class RolSalida(SalidaBase):
    id: int
    nombre: str
    descripcion: str


# ── Fichas ───────────────────────────────────────────────────────────
class FichaEntrada(EntradaBase):
    numero: str = Field(pattern=r"^[0-9]{6,10}$", examples=["2879453"])
    programa: str = Field(min_length=5, max_length=150, examples=["Cocina"])
    nivel: Literal["Técnico", "Tecnólogo"]
    jornada: Literal["mañana", "tarde", "noche", "mixta"]
    instructor_lider: NombrePersona
    fecha_inicio: date
    fecha_fin: date

    @model_validator(mode="after")
    def _fechas(self):
        if self.fecha_fin <= self.fecha_inicio:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio.")
        return self


class FichaActualizar(EntradaBase):
    programa: str | None = Field(default=None, min_length=5, max_length=150)
    nivel: Literal["Técnico", "Tecnólogo"] | None = None
    jornada: Literal["mañana", "tarde", "noche", "mixta"] | None = None
    instructor_lider: NombrePersona | None = None
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    activa: bool | None = None


class FichaSalida(SalidaBase):
    id: int
    numero: str
    programa: str
    nivel: str
    jornada: str
    instructor_lider: str
    fecha_inicio: date
    fecha_fin: date
    activa: bool
    creado_en: datetime
    actualizado_en: datetime | None


# ── Usuarios ─────────────────────────────────────────────────────────
class UsuarioEntrada(EntradaBase):
    rol: NombreRol
    nombre_completo: NombrePersona = Field(examples=["Laura Gómez Pérez"])
    tipo_documento: TipoDocumento
    numero_documento: NumeroDocumento = Field(examples=["1023456789"])
    correo: EmailStr = Field(examples=["laura.gomez@soy.sena.edu.co"])
    telefono: Telefono | None = Field(default=None, examples=["3104567890"])
    contrasena: str = Field(min_length=8, max_length=72, description="Contraseña inicial asignada por el administrador")
    # Solo para aprendices
    ficha_id: int | None = Field(default=None, gt=0)
    tipo_aprendiz: Literal["normal", "beneficiario"] = "normal"

    @field_validator("contrasena")
    @classmethod
    def _politica(cls, v: str) -> str:
        if not cumple_politica(v):
            raise ValueError(MENSAJE_POLITICA)
        return v

    @field_validator("correo")
    @classmethod
    def _minusculas(cls, v: str) -> str:
        return v.lower()

    @model_validator(mode="after")
    def _ficha_aprendiz(self):
        if self.rol == "aprendiz" and self.ficha_id is None:
            raise ValueError("Para registrar un aprendiz debe indicar la ficha (ficha_id).")
        return self


class UsuarioActualizar(EntradaBase):
    nombre_completo: NombrePersona | None = None
    telefono: Telefono | None = None
    correo: EmailStr | None = None
    ficha_id: int | None = Field(default=None, gt=0)
    tipo_aprendiz: Literal["normal", "beneficiario"] | None = None
    alimentacion_activa: bool | None = None

    @field_validator("correo")
    @classmethod
    def _minusculas(cls, v: str | None) -> str | None:
        return v.lower() if v else v


class EstadoUsuarioEntrada(EntradaBase):
    activo: bool


class RolUsuarioEntrada(EntradaBase):
    rol: NombreRol


class AprendizSalida(SalidaBase):
    ficha_id: int
    ficha_numero: str
    programa: str
    tipo: str
    alimentacion_activa: bool


class UsuarioSalida(SalidaBase):
    """Nunca incluye la contraseña ni su hash."""
    id: int
    nombre_completo: str
    tipo_documento: str
    numero_documento: str
    correo: str
    telefono: str | None
    rol: str
    activo: bool
    ultimo_acceso: datetime | None
    aprendiz: AprendizSalida | None = None
    creado_por: int | None
    creado_en: datetime
    actualizado_por: int | None
    actualizado_en: datetime | None

    @classmethod
    def desde(cls, u) -> "UsuarioSalida":
        aprendiz = None
        if u.aprendiz is not None:
            aprendiz = AprendizSalida(
                ficha_id=u.aprendiz.ficha_id,
                ficha_numero=u.aprendiz.ficha.numero,
                programa=u.aprendiz.ficha.programa,
                tipo=u.aprendiz.tipo,
                alimentacion_activa=u.aprendiz.alimentacion_activa,
            )
        return cls(
            id=u.id, nombre_completo=u.nombre_completo, tipo_documento=u.tipo_documento,
            numero_documento=u.numero_documento, correo=u.correo, telefono=u.telefono,
            rol=u.rol.nombre, activo=u.activo, ultimo_acceso=u.ultimo_acceso, aprendiz=aprendiz,
            creado_por=u.creado_por, creado_en=u.creado_en,
            actualizado_por=u.actualizado_por, actualizado_en=u.actualizado_en,
        )
