"""SARA · API REST del Sistema de Alimentación y Reservas del Aprendiz.

Ejecutar:  uvicorn app.main:app --reload
Swagger:   http://127.0.0.1:8000/docs
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import registrar_manejadores
from app.routers import auth, ingresos, inventario, menus, operacion, reservas, usuarios

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

DESCRIPCION = """
API REST de **SARA** para el servicio de alimentación del área de Gastronomía del SENA.
"""

app = FastAPI(
    title="SARA · API Gastronomía SENA",
    description=DESCRIPCION,
    version="1.0.0",
    contact={"name": "Equipo SARA - ADSO 3312744"},
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

registrar_manejadores(app)

PREFIJO = "/api/v1"
for r in (
    auth.router,
    usuarios.router, usuarios.roles_router, usuarios.fichas_router,
    menus.router, menus.precios_router,
    reservas.router,
    ingresos.router, ingresos.biometria_router, ingresos.deudas_router,
    inventario.categorias_router, inventario.productos_router, inventario.movimientos_router,
    operacion.visitantes_router, operacion.observaciones_router, operacion.produccion_router, operacion.reportes_router,
):
    app.include_router(r, prefix=PREFIJO)


@app.get("/", include_in_schema=False)
def raiz():
    return {"mensaje": "API SARA en funcionamiento. Documentación en /docs"}
