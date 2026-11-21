"""Configuración de pruebas.

Requisitos: la base bd_sara creada con database/01_ddl.sql, 02_dml.sql y 03_dcl.sql,
y el archivo .env configurado. Las pruebas desactivan la validación de horarios
para poder ejecutarse a cualquier hora.
"""
import math
import os
import uuid

os.environ["VALIDAR_HORARIOS"] = "false"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

CONTRASENA = "Sara2026*"
API = "/api/v1"


def vector(semilla: int, dim: int = 128) -> list[float]:
    """Mismo generador determinístico usado en 02_dml.sql y en Postman."""
    out = []
    for k in range(dim):
        x = math.sin((semilla + 1) * (k + 1) * 12.9898) * 43758.5453
        out.append(round(x - math.floor(x) - 0.5, 6))
    return out


def unico() -> str:
    return uuid.uuid4().hex[:8]


def documento() -> str:
    return str(uuid.uuid4().int)[:10]


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


def _token(client: TestClient, correo: str) -> dict:
    r = client.post(f"{API}/auth/login", json={"correo": correo, "contrasena": CONTRASENA})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture(scope="session")
def admin(client) -> dict:
    return _token(client, "admin@sara.edu.co")


@pytest.fixture(scope="session")
def instructor(client) -> dict:
    return _token(client, "instructor@sara.edu.co")


@pytest.fixture(scope="session")
def aprendiz(client) -> dict:
    return _token(client, "aprendiz@sara.edu.co")


@pytest.fixture()
def nuevo_aprendiz(client, admin):
    """Crea un aprendiz nuevo (ficha 1) y devuelve (id, headers)."""
    correo = f"apr.{unico()}@soy.sena.edu.co"
    r = client.post(f"{API}/usuarios", headers=admin, json={
        "rol": "aprendiz", "nombre_completo": "Aprendiz De Prueba", "tipo_documento": "CC",
        "numero_documento": documento(), "correo": correo, "telefono": "3001112233",
        "contrasena": CONTRASENA, "ficha_id": 1,
    })
    assert r.status_code == 201, r.text
    return r.json()["id"], _token(client, correo)
