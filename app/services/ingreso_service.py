"""Ingreso al comedor por reconocimiento facial y registro manual del administrador.

- Verde (permitido): el rostro coincide, hay reserva confirmada para hoy y hay aforo.
- Rojo (denegado): se registra el intento con el motivo.
- Manual: el administrador autoriza el ingreso de otro aprendiz cuando el titular
  de la reserva le cede su almuerzo.
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core import biometria, reloj
from app.core.config import settings
from app.core.errors import Conflicto, NoEncontrado, ReglaNegocio
from app.models import PlantillaBiometrica, RegistroIngreso, Usuario
from app.repositories.servicio_repository import BiometriaRepository, IngresoRepository, ReservaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.comun import Pagina
from app.schemas.servicio import (
    AforoSalida,
    BiometriaEntrada,
    IngresoManualEntrada,
    IngresoSalida,
    ResultadoVerificacion,
)


class BiometriaService:
    def __init__(self, db: Session):
        self.plantillas = BiometriaRepository(db)
        self.usuarios = UsuarioRepository(db)

    def estado(self, usuario_id: int) -> PlantillaBiometrica:
        plantilla = self.plantillas.de_usuario(usuario_id)
        if plantilla is None:
            raise NoEncontrado("El usuario no tiene rostro registrado.")
        return plantilla

    def registrar(self, datos: BiometriaEntrada, actor: Usuario) -> PlantillaBiometrica:
        usuario = self.usuarios.obtener(datos.usuario_id)
        if usuario is None:
            raise NoEncontrado("El usuario no existe.")
        if not usuario.activo:
            raise ReglaNegocio("No se puede registrar el rostro de un usuario inactivo.")
        if usuario.rol.nombre == "administrador":
            raise ReglaNegocio("Solo se registra el rostro de aprendices e instructores.")
        if self.plantillas.de_usuario(usuario.id) is not None:
            raise Conflicto("El usuario ya tiene un rostro registrado. Elimínelo antes de registrarlo de nuevo.")
        plantilla = PlantillaBiometrica(
            usuario_id=usuario.id,
            vector_cifrado=biometria.cifrar_vector(datos.vector_facial),
            autorizacion_firmada=True,
            fecha_autorizacion=reloj.hoy(),
        )
        self.plantillas.agregar(plantilla, actor.id)
        self.plantillas.confirmar()
        return plantilla

    def eliminar(self, usuario_id: int) -> str:
        plantilla = self.estado(usuario_id)
        # Derecho de supresión (Ley 1581): el dato biométrico se borra físicamente
        self.plantillas.eliminar_fisico(plantilla)
        self.plantillas.confirmar()
        return "Rostro eliminado. El dato biométrico se borró definitivamente."

    def identificar(self, vector: list[float]) -> tuple[int | None, float]:
        mejor_id, mejor = None, 0.0
        for p in self.plantillas.todas_activas():
            guardado = biometria.descifrar_vector(p.vector_cifrado)
            if guardado is None:
                continue
            valor = biometria.similitud(vector, guardado)
            if valor > mejor:
                mejor_id, mejor = p.usuario_id, valor
        return mejor_id, mejor


class IngresoService:
    def __init__(self, db: Session):
        self.ingresos = IngresoRepository(db)
        self.reservas = ReservaRepository(db)
        self.usuarios = UsuarioRepository(db)
        self.biometria = BiometriaService(db)

    def _en_horario(self) -> bool:
        return not settings.VALIDAR_HORARIOS or reloj.en_franja(
            settings.HORA_INICIO_ALMUERZO, settings.HORA_FIN_ALMUERZO
        )

    def aforo(self) -> AforoSalida:
        hoy = reloj.hoy()
        dentro = self.ingresos.dentro_ahora(hoy)
        capacidad = settings.AFORO_MAXIMO
        return AforoSalida(
            fecha=hoy, dentro=dentro, capacidad=capacidad, disponible=max(0, capacidad - dentro),
            porcentaje=round(dentro * 100 / capacidad, 1),
        )

    def _registrar(self, actor: Usuario, **campos) -> RegistroIngreso:
        ahora = reloj.ahora()
        registro = RegistroIngreso(fecha=ahora.date(), hora_ingreso=ahora, **campos)
        self.ingresos.agregar(registro, actor.id)
        return registro

    def verificar_facial(self, vector: list[float], actor: Usuario) -> ResultadoVerificacion:
        usuario_id, sim = self.biometria.identificar(vector)
        similitud = Decimal(str(sim))
        usuario = self.usuarios.obtener(usuario_id) if usuario_id and sim >= settings.UMBRAL_SIMILITUD else None
        reserva = None

        if usuario is None:
            usuario_id, motivo = None, "Rostro no reconocido. Acérquese al administrador."
        elif not self._en_horario():
            motivo = (f"Fuera del horario de almuerzo ({settings.HORA_INICIO_ALMUERZO:%H:%M} - "
                      f"{settings.HORA_FIN_ALMUERZO:%H:%M}).")
        elif not usuario.activo:
            motivo = "Usuario inactivo."
        else:
            reserva = self.reservas.activa_del_dia(usuario.id, reloj.hoy())
            if reserva is None:
                motivo = "No tiene reserva para hoy."
            elif reserva.estado == "pendiente_pago":
                motivo = "La reserva no tiene el pago confirmado."
            elif reserva.estado == "consumida":
                motivo = "Ya registró su ingreso hoy."
            elif reserva.estado != "confirmada":
                motivo = f"La reserva está en estado '{reserva.estado}'."
            elif self.ingresos.dentro_ahora(reloj.hoy()) >= settings.AFORO_MAXIMO:
                motivo = "Aforo completo. Espere a que se libere un cupo."
            else:
                motivo = "Ingreso permitido. ¡Buen provecho!"

        permitido = motivo.startswith("Ingreso permitido")
        if permitido:
            self.reservas.actualizar(reserva, {"estado": "consumida"}, actor.id)
        registro = self._registrar(
            actor, usuario_id=usuario_id, reserva_id=reserva.id if reserva else None, metodo="facial",
            resultado="permitido" if permitido else "denegado", motivo=motivo, similitud=similitud,
        )
        self.ingresos.confirmar()
        registro = self.ingresos.refrescar(registro)
        return ResultadoVerificacion(
            permitido=permitido, color="verde" if permitido else "rojo", mensaje=motivo,
            usuario_nombre=usuario.nombre_completo if usuario else None, similitud=similitud,
            registro=IngresoSalida.desde(registro),
        )

    def manual(self, datos: IngresoManualEntrada, actor: Usuario) -> RegistroIngreso:
        reserva = self.reservas.obtener(datos.reserva_id)
        if reserva is None:
            raise NoEncontrado("La reserva no existe.")
        if reserva.fecha != reloj.hoy():
            raise ReglaNegocio("Solo se puede ceder una reserva del día de hoy.")
        if reserva.estado == "consumida":
            raise Conflicto("Esa reserva ya fue utilizada.")
        if reserva.estado != "confirmada":
            raise ReglaNegocio("Solo se puede ceder una reserva confirmada (pagada).")
        if datos.receptor_documento == reserva.usuario.numero_documento:
            raise ReglaNegocio("El receptor debe ser una persona diferente al titular de la reserva.")
        if not self._en_horario():
            raise ReglaNegocio("Fuera del horario de almuerzo.")
        if self.ingresos.dentro_ahora(reloj.hoy()) >= settings.AFORO_MAXIMO:
            raise ReglaNegocio("Aforo completo. Espere a que se libere un cupo.")

        self.reservas.actualizar(reserva, {"estado": "consumida"}, actor.id)
        registro = self._registrar(
            actor, usuario_id=reserva.usuario_id, reserva_id=reserva.id, metodo="manual", resultado="permitido",
            motivo=f"Almuerzo cedido: {datos.motivo}", receptor_nombre=datos.receptor_nombre,
            receptor_documento=datos.receptor_documento,
        )
        self.ingresos.confirmar()
        return self.ingresos.refrescar(registro)

    def salida(self, registro_id: int, actor: Usuario) -> RegistroIngreso:
        registro = self.ingresos.obtener(registro_id)
        if registro is None:
            raise NoEncontrado("El registro de ingreso no existe.")
        if registro.resultado != "permitido":
            raise ReglaNegocio("Solo se registra la salida de un ingreso permitido.")
        if registro.hora_salida is not None:
            raise Conflicto("La salida ya fue registrada.")
        self.ingresos.actualizar(registro, {"hora_salida": reloj.ahora()}, actor.id)
        self.ingresos.confirmar()
        return registro

    def obtener(self, registro_id: int) -> RegistroIngreso:
        registro = self.ingresos.obtener(registro_id)
        if registro is None:
            raise NoEncontrado("El registro de ingreso no existe.")
        return registro

    def listar(self, pagina, tamano, **filtros) -> Pagina[IngresoSalida]:
        items, total = self.ingresos.listar(pagina, tamano, **filtros)
        return Pagina.crear([IngresoSalida.desde(i) for i in items], total, pagina, tamano)
