"""Inventario de insumos: categorías, productos, movimientos y alertas."""
from datetime import timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core import reloj
from app.core.errors import Conflicto, NoEncontrado, ReglaNegocio
from app.models import CategoriaProducto, MovimientoInventario, Producto, Usuario
from app.repositories.operacion_repository import CategoriaRepository, MovimientoRepository, ProductoRepository
from app.schemas.comun import Pagina
from app.schemas.operacion import (
    AlertaProducto,
    CategoriaActualizar,
    CategoriaEntrada,
    CategoriaSalida,
    MovimientoEntrada,
    MovimientoSalida,
    ProductoActualizar,
    ProductoEntrada,
    ProductoSalida,
)

DIAS_ALERTA_VENCIMIENTO = 7


class CategoriaService:
    def __init__(self, db: Session):
        self.categorias = CategoriaRepository(db)

    def obtener(self, categoria_id: int) -> CategoriaProducto:
        categoria = self.categorias.obtener(categoria_id)
        if categoria is None:
            raise NoEncontrado("La categoría no existe.")
        return categoria

    def listar(self, pagina, tamano, **filtros) -> Pagina[CategoriaSalida]:
        items, total = self.categorias.listar(pagina, tamano, **filtros)
        return Pagina.crear([CategoriaSalida.model_validate(c) for c in items], total, pagina, tamano)

    def crear(self, datos: CategoriaEntrada, actor: Usuario) -> CategoriaProducto:
        if self.categorias.existe_nombre(datos.nombre):
            raise Conflicto("Ya existe una categoría con ese nombre.")
        categoria = self.categorias.agregar(CategoriaProducto(**datos.model_dump()), actor.id)
        self.categorias.confirmar()
        return categoria

    def actualizar(self, categoria_id: int, datos: CategoriaActualizar, actor: Usuario) -> CategoriaProducto:
        categoria = self.obtener(categoria_id)
        cambios = datos.model_dump(exclude_unset=True)
        if "nombre" in cambios and self.categorias.existe_nombre(cambios["nombre"], excluir_id=categoria_id):
            raise Conflicto("Ya existe una categoría con ese nombre.")
        self.categorias.actualizar(categoria, cambios, actor.id)
        self.categorias.confirmar()
        return categoria

    def eliminar(self, categoria_id: int, actor: Usuario) -> str:
        categoria = self.obtener(categoria_id)
        if self.categorias.tiene_productos(categoria_id):
            self.categorias.actualizar(categoria, {"activa": False}, actor.id)
            mensaje = "La categoría tiene productos asociados: se inactivó (borrado lógico)."
        else:
            self.categorias.eliminar_fisico(categoria)
            mensaje = "Categoría eliminada."
        self.categorias.confirmar()
        return mensaje


class ProductoService:
    def __init__(self, db: Session):
        self.productos = ProductoRepository(db)
        self.categorias = CategoriaRepository(db)
        self.movimientos = MovimientoRepository(db)

    def obtener(self, producto_id: int) -> Producto:
        producto = self.productos.obtener(producto_id)
        if producto is None:
            raise NoEncontrado("El producto no existe.")
        return producto

    def listar(self, pagina, tamano, **filtros) -> Pagina[ProductoSalida]:
        items, total = self.productos.listar(pagina, tamano, **filtros)
        return Pagina.crear([ProductoSalida.desde(p) for p in items], total, pagina, tamano)

    def _validar_categoria(self, categoria_id: int) -> None:
        categoria = self.categorias.obtener(categoria_id)
        if categoria is None:
            raise NoEncontrado("La categoría indicada no existe.")
        if not categoria.activa:
            raise ReglaNegocio("La categoría indicada está inactiva.")

    def crear(self, datos: ProductoEntrada, actor: Usuario) -> Producto:
        if self.productos.existe_codigo(datos.codigo):
            raise Conflicto(f"Ya existe un producto con el código {datos.codigo}.")
        self._validar_categoria(datos.categoria_id)
        if datos.fecha_vencimiento and datos.fecha_vencimiento < reloj.hoy():
            raise ReglaNegocio("No se puede registrar un producto ya vencido.")
        producto = self.productos.agregar(Producto(**datos.model_dump()), actor.id)
        if datos.cantidad > 0:
            self.movimientos.agregar(
                MovimientoInventario(
                    producto_id=producto.id, tipo="entrada", cantidad=datos.cantidad,
                    cantidad_resultante=datos.cantidad, motivo="Inventario inicial",
                ),
                actor.id,
            )
        self.productos.confirmar()
        return self.productos.refrescar(producto)

    def actualizar(self, producto_id: int, datos: ProductoActualizar, actor: Usuario) -> Producto:
        producto = self.obtener(producto_id)
        cambios = datos.model_dump(exclude_unset=True)
        if "categoria_id" in cambios:
            self._validar_categoria(cambios["categoria_id"])
        self.productos.actualizar(producto, cambios, actor.id)
        self.productos.confirmar()
        return self.productos.refrescar(producto)

    def eliminar(self, producto_id: int, actor: Usuario) -> str:
        producto = self.obtener(producto_id)
        if self.productos.tiene_movimientos(producto_id):
            self.productos.eliminar_logico(producto, actor.id)
            mensaje = "El producto tiene movimientos: se aplicó borrado lógico (se conserva el historial)."
        else:
            self.productos.eliminar_fisico(producto)
            mensaje = "Producto eliminado."
        self.productos.confirmar()
        return mensaje

    def alertas(self) -> list[AlertaProducto]:
        hoy = reloj.hoy()
        alertas: list[AlertaProducto] = []
        for p in self.productos.para_alertas(hoy + timedelta(days=DIAS_ALERTA_VENCIMIENTO)):
            if p.cantidad <= p.stock_minimo:
                alertas.append(AlertaProducto(
                    producto_id=p.id, codigo=p.codigo, nombre=p.nombre, tipo_alerta="stock_bajo",
                    detalle=f"Quedan {p.cantidad} {p.unidad_medida} (mínimo {p.stock_minimo}).",
                ))
            if p.fecha_vencimiento and p.fecha_vencimiento < hoy:
                alertas.append(AlertaProducto(
                    producto_id=p.id, codigo=p.codigo, nombre=p.nombre, tipo_alerta="vencido",
                    detalle=f"Venció el {p.fecha_vencimiento:%d/%m/%Y}.",
                ))
            elif p.fecha_vencimiento and p.fecha_vencimiento <= hoy + timedelta(days=DIAS_ALERTA_VENCIMIENTO):
                alertas.append(AlertaProducto(
                    producto_id=p.id, codigo=p.codigo, nombre=p.nombre, tipo_alerta="por_vencer",
                    detalle=f"Vence el {p.fecha_vencimiento:%d/%m/%Y}.",
                ))
        return alertas


class MovimientoService:
    def __init__(self, db: Session):
        self.movimientos = MovimientoRepository(db)
        self.productos = ProductoRepository(db)

    def obtener(self, movimiento_id: int) -> MovimientoInventario:
        mov = self.movimientos.obtener(movimiento_id)
        if mov is None:
            raise NoEncontrado("El movimiento no existe.")
        return mov

    def listar(self, pagina, tamano, **filtros) -> Pagina[MovimientoSalida]:
        items, total = self.movimientos.listar(pagina, tamano, **filtros)
        return Pagina.crear([MovimientoSalida.desde(m) for m in items], total, pagina, tamano)

    def registrar(self, datos: MovimientoEntrada, actor: Usuario) -> MovimientoInventario:
        producto = self.productos.bloquear(datos.producto_id)
        if producto is None:
            raise NoEncontrado("El producto no existe.")
        if not producto.activo:
            raise ReglaNegocio("No se pueden registrar movimientos de un producto inactivo.")

        actual = Decimal(producto.cantidad)
        if datos.tipo == "entrada":
            resultante = actual + datos.cantidad
        elif datos.tipo == "ajuste":
            resultante = datos.cantidad
        else:  # salida o merma
            if datos.cantidad > actual:
                raise ReglaNegocio(
                    f"Stock insuficiente: hay {actual} {producto.unidad_medida} y se intenta retirar {datos.cantidad}."
                )
            resultante = actual - datos.cantidad

        self.productos.actualizar(producto, {"cantidad": resultante}, actor.id)
        mov = MovimientoInventario(
            producto_id=producto.id, tipo=datos.tipo, cantidad=datos.cantidad,
            cantidad_resultante=resultante, motivo=datos.motivo,
        )
        self.movimientos.agregar(mov, actor.id)
        self.movimientos.confirmar()
        return self.movimientos.refrescar(mov)
