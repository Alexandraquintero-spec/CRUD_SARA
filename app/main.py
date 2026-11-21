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

**Flujo del servicio**
1. El administrador registra usuarios, fichas, el menú del día y los precios.
2. El aprendiz reserva entre 7:00 y 9:00 a. m. y paga con el **QR de Nequi que muestra el sistema** (no sale del ambiente).
3. Al mediodía ingresa al comedor por **reconocimiento facial**: verde = tiene reserva; rojo = se niega con el motivo.
4. Si un aprendiz cede su almuerzo, el administrador registra el **ingreso manual** del receptor.

**Autenticación:** todos los endpoints son privados excepto `POST /api/v1/auth/login`.
Use el botón **Authorize** con el `access_token` recibido.

**Roles:** administrador, instructor y aprendiz. 401 = sin token o token inválido; 403 = rol sin permiso.
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
