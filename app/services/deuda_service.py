"""Deuda de instructores por almuerzos cargados a la cuenta institucional."""
from sqlalchemy.orm import Session

from app.core.errors import NoEncontrado, ReglaNegocio
from app.models import PagoDeuda, Usuario
from app.repositories.servicio_repository import PagoDeudaRepository, ReservaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.servicio import DeudaSalida, PagoDeudaEntrada


class DeudaService:
    def __init__(self, db: Session):
        self.reservas = ReservaRepository(db)
        self.pagos = PagoDeudaRepository(db)
        self.usuarios = UsuarioRepository(db)

    def listar(self, solo_con_saldo: bool = False) -> list[DeudaSalida]:
        deudas = [
            DeudaSalida(**d, saldo=d["total_consumido"] - d["total_pagado"])
            for d in self.reservas.deudas_instructores()
        ]
        return [d for d in deudas if d.saldo > 0] if solo_con_saldo else deudas

    def de_instructor(self, instructor_id: int) -> DeudaSalida:
        for d in self.listar():
            if d.instructor_id == instructor_id:
                return d
        raise NoEncontrado("El instructor no existe.")

    def pagos_de(self, instructor_id: int) -> list[PagoDeuda]:
        self.de_instructor(instructor_id)
        return self.pagos.de_instructor(instructor_id)

    def registrar_pago(self, instructor_id: int, datos: PagoDeudaEntrada, actor: Usuario) -> PagoDeuda:
        deuda = self.de_instructor(instructor_id)
        if deuda.saldo <= 0:
            raise ReglaNegocio("El instructor no tiene deuda pendiente.")
        if datos.valor > deuda.saldo:
            raise ReglaNegocio(f"El pago supera el saldo pendiente (${deuda.saldo:,.0f}).".replace(",", "."))
        pago = PagoDeuda(instructor_id=instructor_id, **datos.model_dump())
        self.pagos.agregar(pago, actor.id)
        self.pagos.confirmar()
        return pago
