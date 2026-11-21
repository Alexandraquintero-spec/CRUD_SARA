"""Autenticación, tokens, roles y validaciones de seguridad."""
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings
from tests.conftest import API, CONTRASENA, documento, unico


def test_login_exitoso_no_expone_contrasena(client, admin):
    r = client.get(f"{API}/auth/me", headers=admin)
    assert r.status_code == 200
    cuerpo = r.json()
    assert cuerpo["rol"] == "administrador"
    assert "contrasena" not in cuerpo and "contrasena_hash" not in cuerpo


def test_login_credenciales_invalidas(client):
    r = client.post(f"{API}/auth/login", json={"correo": "admin@sara.edu.co", "contrasena": "Incorrecta1"})
    assert r.status_code == 401
    assert r.json()["error"]["mensaje"] == "Correo o contraseña incorrectos."


def test_login_correo_mal_formado_422_en_espanol(client):
    r = client.post(f"{API}/auth/login", json={"correo": "no-es-correo", "contrasena": "x"})
    assert r.status_code == 422
    error = r.json()["error"]
    assert error["mensaje"] == "Los datos enviados no son válidos."
    assert error["detalles"][0]["campo"] == "correo"


def test_sin_token_401(client):
    r = client.get(f"{API}/usuarios")
    assert r.status_code == 401
    assert set(r.json()["error"]) == {"codigo", "mensaje", "detalles"}


def test_token_expirado_401(client):
    vencido = jwt.encode(
        {"sub": "1", "rol": "administrador", "type": "access", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
        settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM,
    )
    r = client.get(f"{API}/usuarios", headers={"Authorization": f"Bearer {vencido}"})
    assert r.status_code == 401
    assert "expirado" in r.json()["error"]["mensaje"]


def test_token_manipulado_401(client):
    r = client.get(f"{API}/usuarios", headers={"Authorization": "Bearer abc.def.ghi"})
    assert r.status_code == 401


def test_refresh_token(client):
    r = client.post(f"{API}/auth/login", json={"correo": "admin@sara.edu.co", "contrasena": CONTRASENA})
    refresh = r.json()["refresh_token"]
    r2 = client.post(f"{API}/auth/refresh", json={"refresh_token": refresh})
    assert r2.status_code == 200 and r2.json()["access_token"]
    # El refresh token no sirve como access token
    r3 = client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {refresh}"})
    assert r3.status_code == 401


def test_rol_sin_permiso_403(client, aprendiz, instructor):
    assert client.get(f"{API}/usuarios", headers=aprendiz).status_code == 403
    assert client.post(f"{API}/menus", headers=instructor, json={}).status_code in (403, 422)
    assert client.get(f"{API}/reportes/resumen", headers=instructor).status_code == 403


def test_politica_contrasena(client, admin):
    r = client.post(f"{API}/usuarios", headers=admin, json={
        "rol": "instructor", "nombre_completo": "Prueba Politica", "tipo_documento": "CC",
        "numero_documento": documento(), "correo": f"pol.{unico()}@sara.edu.co", "contrasena": "debil",
    })
    assert r.status_code == 422
    assert any("contrasena" == d["campo"] for d in r.json()["error"]["detalles"])


def test_bloqueo_tras_5_intentos_y_usuario_inactivo(client, admin):
    correo = f"bloq.{unico()}@sara.edu.co"
    r = client.post(f"{API}/usuarios", headers=admin, json={
        "rol": "instructor", "nombre_completo": "Prueba Bloqueo", "tipo_documento": "CC",
        "numero_documento": documento(), "correo": correo, "contrasena": CONTRASENA,
    })
    assert r.status_code == 201
    uid = r.json()["id"]
    for _ in range(5):
        r = client.post(f"{API}/auth/login", json={"correo": correo, "contrasena": "Mala12345"})
        assert r.status_code == 401
    assert "bloqueada" in r.json()["error"]["mensaje"]
    # Aun con la contraseña correcta sigue bloqueado
    r = client.post(f"{API}/auth/login", json={"correo": correo, "contrasena": CONTRASENA})
    assert r.status_code == 401 and "bloqueada" in r.json()["error"]["mensaje"]

    # Usuario inactivo no puede iniciar sesión
    correo2 = f"inac.{unico()}@sara.edu.co"
    uid2 = client.post(f"{API}/usuarios", headers=admin, json={
        "rol": "instructor", "nombre_completo": "Prueba Inactivo", "tipo_documento": "CC",
        "numero_documento": documento(), "correo": correo2, "contrasena": CONTRASENA,
    }).json()["id"]
    assert client.patch(f"{API}/usuarios/{uid2}/estado", headers=admin, json={"activo": False}).status_code == 200
    r = client.post(f"{API}/auth/login", json={"correo": correo2, "contrasena": CONTRASENA})
    assert r.status_code == 401 and "inactivo" in r.json()["error"]["mensaje"]
    assert uid


def test_admin_no_puede_cambiarse_rol_ni_desactivarse(client, admin):
    assert client.patch(f"{API}/usuarios/1/rol", headers=admin, json={"rol": "aprendiz"}).status_code == 400
    assert client.patch(f"{API}/usuarios/1/estado", headers=admin, json={"activo": False}).status_code == 400


def test_cambiar_mi_contrasena(client, nuevo_aprendiz):
    _, headers = nuevo_aprendiz
    r = client.put(f"{API}/auth/me/password", headers=headers,
                   json={"contrasena_actual": "Otra1234", "contrasena_nueva": "NuevaClave2026"})
    assert r.status_code == 400
    r = client.put(f"{API}/auth/me/password", headers=headers,
                   json={"contrasena_actual": CONTRASENA, "contrasena_nueva": "NuevaClave2026"})
    assert r.status_code == 200
