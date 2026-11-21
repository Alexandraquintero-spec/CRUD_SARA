from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.permissions import ADMIN, INSTRUCTOR, require_roles
from app.database import get_db
from app.models import Usuario
from app.routers.deps import IdPath, Paginacion, paginacion, rol
from app.schemas.comun import Mensaje, Pagina, respuestas
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
from app.services.inventario_service import CategoriaService, MovimientoService, ProductoService

solo_admin = require_roles(ADMIN)
cocina = require_roles(ADMIN, INSTRUCTOR)

# ── Categorías ──────────────────────────────────────────────────────
categorias_router = APIRouter(prefix="/categorias", tags=["Inventario - Categorías"])


@categorias_router.get("", response_model=Pagina[CategoriaSalida], summary="Listar categorías",
                       description="Lista paginada de categorías de insumos.\n\n" + rol(ADMIN, INSTRUCTOR),
                       responses=respuestas(401, 403, 422))
def listar_categorias(p: Paginacion = Depends(paginacion), activa: bool | None = Query(None),
                      buscar: str | None = Query(None, min_length=2, max_length=60),
                      _: Usuario = Depends(cocina), db: Session = Depends(get_db)):
    return CategoriaService(db).listar(p.pagina, p.tamano, activa=activa, buscar=buscar)


@categorias_router.post("", response_model=CategoriaSalida, status_code=status.HTTP_201_CREATED, summary="Crear categoría",
                        description="Crea una categoría. El nombre es único.\n\n" + rol(ADMIN),
                        responses=respuestas(401, 403, 409, 422))
def crear_categoria(datos: CategoriaEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return CategoriaService(db).crear(datos, actor)


@categorias_router.get("/{categoria_id}", response_model=CategoriaSalida, summary="Consultar categoría",
                       description="Consulta una categoría.\n\n" + rol(ADMIN, INSTRUCTOR), responses=respuestas(401, 403, 404, 422))
def obtener_categoria(categoria_id: IdPath, _: Usuario = Depends(cocina), db: Session = Depends(get_db)):
    return CategoriaService(db).obtener(categoria_id)


@categorias_router.put("/{categoria_id}", response_model=CategoriaSalida, summary="Actualizar categoría",
                       description="Actualiza una categoría.\n\n" + rol(ADMIN), responses=respuestas(401, 403, 404, 409, 422))
def actualizar_categoria(datos: CategoriaActualizar, categoria_id: IdPath, actor: Usuario = Depends(solo_admin),
                         db: Session = Depends(get_db)):
    return CategoriaService(db).actualizar(categoria_id, datos, actor)


@categorias_router.delete("/{categoria_id}", response_model=Mensaje, summary="Eliminar categoría",
                          description="Con productos asociados se inactiva (borrado lógico); sin productos se elimina.\n\n" + rol(ADMIN),
                          responses=respuestas(401, 403, 404, 422))
def eliminar_categoria(categoria_id: IdPath, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return Mensaje(mensaje=CategoriaService(db).eliminar(categoria_id, actor))


# ── Productos ───────────────────────────────────────────────────────
productos_router = APIRouter(prefix="/productos", tags=["Inventario - Productos"])


@productos_router.get("/alertas", response_model=list[AlertaProducto], summary="Alertas de inventario",
                      description="Productos con stock bajo, por vencer (7 días) o vencidos.\n\n" + rol(ADMIN, INSTRUCTOR),
                      responses=respuestas(401, 403))
def alertas(_: Usuario = Depends(cocina), db: Session = Depends(get_db)):
    return ProductoService(db).alertas()


@productos_router.get("", response_model=Pagina[ProductoSalida], summary="Listar productos",
                      description="Lista paginada con filtros por categoría, origen, estado, stock bajo y búsqueda.\n\n" + rol(ADMIN, INSTRUCTOR),
                      responses=respuestas(401, 403, 422))
def listar_productos(
    p: Paginacion = Depends(paginacion),
    categoria_id: int | None = Query(None, gt=0),
    origen: Literal["proveedor", "insumo_sena"] | None = Query(None),
    activo: bool | None = Query(None),
    stock_bajo: bool | None = Query(None, description="true: solo productos en o por debajo del stock mínimo"),
    buscar: str | None = Query(None, min_length=2, max_length=60),
    _: Usuario = Depends(cocina), db: Session = Depends(get_db),
):
    return ProductoService(db).listar(p.pagina, p.tamano, categoria_id=categoria_id, origen=origen, activo=activo,
                                      stock_bajo=stock_bajo, buscar=buscar)


@productos_router.post("", response_model=ProductoSalida, status_code=status.HTTP_201_CREATED, summary="Crear producto",
                       description="Registra un insumo. El código es único; si trae cantidad se genera el movimiento de "
                                   "inventario inicial.\n\n" + rol(ADMIN),
                       responses=respuestas(400, 401, 403, 404, 409, 422))
def crear_producto(datos: ProductoEntrada, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return ProductoSalida.desde(ProductoService(db).crear(datos, actor))


@productos_router.get("/{producto_id}", response_model=ProductoSalida, summary="Consultar producto",
                      description="Consulta un producto.\n\n" + rol(ADMIN, INSTRUCTOR), responses=respuestas(401, 403, 404, 422))
def obtener_producto(producto_id: IdPath, _: Usuario = Depends(cocina), db: Session = Depends(get_db)):
    return ProductoSalida.desde(ProductoService(db).obtener(producto_id))


@productos_router.put("/{producto_id}", response_model=ProductoSalida, summary="Actualizar producto",
                      description="Actualiza datos del producto. La cantidad solo cambia con movimientos.\n\n" + rol(ADMIN),
                      responses=respuestas(400, 401, 403, 404, 422))
def actualizar_producto(datos: ProductoActualizar, producto_id: IdPath, actor: Usuario = Depends(solo_admin),
                        db: Session = Depends(get_db)):
    return ProductoSalida.desde(ProductoService(db).actualizar(producto_id, datos, actor))


@productos_router.delete("/{producto_id}", response_model=Mensaje, summary="Eliminar producto",
                         description="Si el producto tiene movimientos se aplica **borrado lógico**; si no, se elimina.\n\n" + rol(ADMIN),
                         responses=respuestas(401, 403, 404, 422))
def eliminar_producto(producto_id: IdPath, actor: Usuario = Depends(solo_admin), db: Session = Depends(get_db)):
    return Mensaje(mensaje=ProductoService(db).eliminar(producto_id, actor))


# ── Movimientos ─────────────────────────────────────────────────────
movimientos_router = APIRouter(prefix="/movimientos", tags=["Inventario - Movimientos"])


@movimientos_router.post("", response_model=MovimientoSalida, status_code=status.HTTP_201_CREATED,
                         summary="Registrar movimiento",
                         description="Entrada, salida, merma o ajuste. Actualiza el stock y nunca permite que quede negativo.\n\n"
                                     + rol(ADMIN, INSTRUCTOR),
                         responses=respuestas(400, 401, 403, 404, 422))
def registrar_movimiento(datos: MovimientoEntrada, actor: Usuario = Depends(cocina), db: Session = Depends(get_db)):
    return MovimientoSalida.desde(MovimientoService(db).registrar(datos, actor))


@movimientos_router.get("", response_model=Pagina[MovimientoSalida], summary="Listar movimientos",
                        description="Kárdex paginado con filtros por producto, tipo y fechas.\n\n" + rol(ADMIN, INSTRUCTOR),
                        responses=respuestas(401, 403, 422))
def listar_movimientos(
    p: Paginacion = Depends(paginacion),
    producto_id: int | None = Query(None, gt=0),
    tipo: Literal["entrada", "salida", "merma", "ajuste"] | None = Query(None),
    desde: date | None = Query(None),
    hasta: date | None = Query(None),
    _: Usuario = Depends(cocina), db: Session = Depends(get_db),
):
    return MovimientoService(db).listar(p.pagina, p.tamano, producto_id=producto_id, tipo=tipo, desde=desde, hasta=hasta)


@movimientos_router.get("/{movimiento_id}", response_model=MovimientoSalida, summary="Consultar movimiento",
                        description="Consulta un movimiento de inventario.\n\n" + rol(ADMIN, INSTRUCTOR),
                        responses=respuestas(401, 403, 404, 422))
def obtener_movimiento(movimiento_id: IdPath, _: Usuario = Depends(cocina), db: Session = Depends(get_db)):
    return MovimientoSalida.desde(MovimientoService(db).obtener(movimiento_id))
