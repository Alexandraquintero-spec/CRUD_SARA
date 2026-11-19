"""Menú del día y precios."""
from sqlalchemy.orm import Session

from app.core import reloj
from app.core.errors import Conflicto, NoEncontrado, ReglaNegocio
from app.models import Menu, PlatoMenu, Precio, Usuario
from app.repositories.servicio_repository import MenuRepository, PrecioRepository
from app.schemas.comun import Pagina
from app.schemas.servicio import MenuActualizar, MenuEntrada, MenuSalida, PrecioEntrada, PrecioSalida


class MenuService:
    def __init__(self, db: Session):
        self.menus = MenuRepository(db)

    def obtener(self, menu_id: int) -> Menu:
        menu = self.menus.obtener(menu_id)
        if menu is None:
            raise NoEncontrado("El menú no existe.")
        return menu

    def de_hoy(self) -> Menu:
        menu = self.menus.publicado_en(reloj.hoy())
        if menu is None:
            raise NoEncontrado("Aún no se ha publicado el menú de hoy.")
        return menu

    def listar(self, pagina, tamano, **filtros) -> Pagina[MenuSalida]:
        items, total = self.menus.listar(pagina, tamano, **filtros)
        return Pagina.crear([MenuSalida.model_validate(m) for m in items], total, pagina, tamano)

    def crear(self, datos: MenuEntrada, actor: Usuario) -> Menu:
        if datos.fecha < reloj.hoy():
            raise ReglaNegocio("No se puede crear un menú para una fecha pasada.")
        menu = Menu(fecha=datos.fecha, descripcion=datos.descripcion)
        menu.platos = [PlatoMenu(categoria=p.categoria, nombre=p.nombre, creado_por=actor.id) for p in datos.platos]
        self.menus.agregar(menu, actor.id)
        self.menus.confirmar()
        return menu

    def actualizar(self, menu_id: int, datos: MenuActualizar, actor: Usuario) -> Menu:
        menu = self.obtener(menu_id)
        if menu.estado != "borrador":
            raise Conflicto("Solo se puede editar un menú en estado borrador.")
        cambios = datos.model_dump(exclude_unset=True)
        if "platos" in cambios:
            self.menus.reemplazar_platos(menu, cambios.pop("platos"), actor.id)
        self.menus.actualizar(menu, cambios, actor.id)
        self.menus.confirmar()
        return self.menus.refrescar(menu)

    def publicar(self, menu_id: int, actor: Usuario) -> Menu:
        menu = self.obtener(menu_id)
        if menu.estado != "borrador":
            raise Conflicto("El menú ya fue publicado o está en el histórico.")
        if menu.fecha < reloj.hoy():
            raise ReglaNegocio("No se puede publicar un menú de una fecha pasada.")
        if "plato_fuerte" not in {p.categoria for p in menu.platos}:
            raise ReglaNegocio("El menú debe tener al menos el plato fuerte para publicarse.")
        if self.menus.publicado_en(menu.fecha) is not None:
            raise Conflicto("Ya existe un menú publicado para esa fecha.")
        self.menus.actualizar(menu, {"estado": "publicado", "publicado_en": reloj.ahora()}, actor.id)
        self.menus.confirmar()
        return menu

    def eliminar(self, menu_id: int, actor: Usuario) -> str:
        menu = self.obtener(menu_id)
        if self.menus.tiene_reservas(menu_id):
            # Tiene movimientos (reservas): se conserva y pasa al histórico
            self.menus.actualizar(menu, {"estado": "historico"}, actor.id)
            mensaje = "El menú tiene reservas asociadas: se movió al histórico (borrado lógico)."
        else:
            self.menus.eliminar_fisico(menu)
            mensaje = "Menú eliminado."
        self.menus.confirmar()
        return mensaje


class PrecioService:
    def __init__(self, db: Session):
        self.precios = PrecioRepository(db)

    def obtener(self, precio_id: int) -> Precio:
        precio = self.precios.obtener(precio_id)
        if precio is None:
            raise NoEncontrado("El precio no existe.")
        return precio

    def vigente(self, tipo: str) -> Precio:
        precio = self.precios.activo(tipo)
        if precio is None:
            raise ReglaNegocio(f"No hay un precio vigente configurado para '{tipo}'.")
        return precio

    def vigentes(self) -> list[Precio]:
        return self.precios.vigentes()

    def listar(self, pagina, tamano, **filtros) -> Pagina[PrecioSalida]:
        items, total = self.precios.listar(pagina, tamano, **filtros)
        return Pagina.crear([PrecioSalida.model_validate(p) for p in items], total, pagina, tamano)

    def crear(self, datos: PrecioEntrada, actor: Usuario) -> Precio:
        """El nuevo precio reemplaza al vigente del mismo tipo; el anterior queda en el historial."""
        anterior = self.precios.activo(datos.tipo)
        if anterior is not None:
            self.precios.actualizar(anterior, {"activo": False}, actor.id)
        precio = Precio(tipo=datos.tipo, valor=datos.valor, vigente_desde=datos.vigente_desde or reloj.hoy())
        self.precios.agregar(precio, actor.id)
        self.precios.confirmar()
        return precio

    def eliminar(self, precio_id: int) -> str:
        precio = self.obtener(precio_id)
        if precio.activo:
            raise Conflicto("No se puede eliminar el precio vigente. Registre un precio nuevo para reemplazarlo.")
        self.precios.eliminar_fisico(precio)
        self.precios.confirmar()
        return "Precio eliminado del historial."
