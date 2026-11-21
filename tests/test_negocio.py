"""Reglas de negocio: usuarios, reservas con Nequi, ingreso facial/manual, inventario y deudas."""
from tests.conftest import API, CONTRASENA, documento, unico, vector


# ── Usuarios ─────────────────────────────────────────────────────────
def test_correo_duplicado_409(client, admin):
    r = client.post(f"{API}/usuarios", headers=admin, json={
        "rol": "instructor", "nombre_completo": "Duplicado Correo", "tipo_documento": "CC",
        "numero_documento": documento(), "correo": "admin@sara.edu.co", "contrasena": CONTRASENA,
    })
    assert r.status_code == 409


def test_aprendiz_requiere_ficha_y_ficha_inexistente_404(client, admin):
    base = {"rol": "aprendiz", "nombre_completo": "Sin Ficha", "tipo_documento": "CC",
            "numero_documento": documento(), "correo": f"sf.{unico()}@sara.edu.co", "contrasena": CONTRASENA}
    assert client.post(f"{API}/usuarios", headers=admin, json=base).status_code == 422
    assert client.post(f"{API}/usuarios", headers=admin, json={**base, "ficha_id": 99999}).status_code == 404


def test_usuario_inexistente_404_y_paginacion(client, admin):
    assert client.get(f"{API}/usuarios/999999", headers=admin).status_code == 404
    r = client.get(f"{API}/usuarios?rol=aprendiz&pagina=1&tamano=5", headers=admin)
    cuerpo = r.json()
    assert r.status_code == 200 and len(cuerpo["items"]) <= 5 and cuerpo["total"] >= 10
    assert all(u["rol"] == "aprendiz" for u in cuerpo["items"])


def test_ficha_con_aprendices_borrado_logico(client, admin):
    r = client.post(f"{API}/fichas", headers=admin, json={
        "numero": str(documento())[:8], "programa": "Cocina de prueba", "nivel": "Técnico", "jornada": "mañana",
        "instructor_lider": "Carlos Mejia", "fecha_inicio": "2026-01-01", "fecha_fin": "2027-06-30",
    })
    assert r.status_code == 201
    fid = r.json()["id"]
    assert client.post(f"{API}/usuarios", headers=admin, json={
        "rol": "aprendiz", "nombre_completo": "Aprendiz Ficha", "tipo_documento": "CC",
        "numero_documento": documento(), "correo": f"af.{unico()}@sara.edu.co", "contrasena": CONTRASENA, "ficha_id": fid,
    }).status_code == 201
    r = client.delete(f"{API}/fichas/{fid}", headers=admin)
    assert r.status_code == 200 and "lógico" in r.json()["mensaje"]
    assert client.get(f"{API}/fichas/{fid}", headers=admin).status_code == 404


# ── Reservas, pago Nequi e ingreso facial ───────────────────────────
def test_flujo_completo_reserva_nequi_e_ingreso_facial(client, admin, nuevo_aprendiz):
    uid, headers = nuevo_aprendiz
    semilla = 5000 + uid
    # Registro facial con autorización
    assert client.post(f"{API}/biometria", headers=admin, json={
        "usuario_id": uid, "vector_facial": vector(semilla), "autorizacion_firmada": True}).status_code == 201
    assert client.post(f"{API}/biometria", headers=admin, json={
        "usuario_id": uid, "vector_facial": vector(semilla), "autorizacion_firmada": True}).status_code == 409

    # Sin reserva -> rojo
    r = client.post(f"{API}/ingresos/verificacion-facial", headers=admin, json={"vector_facial": vector(semilla)})
    assert r.json()["color"] == "rojo" and "reserva" in r.json()["mensaje"]

    # Reserva -> pendiente de pago con QR de Nequi
    r = client.post(f"{API}/reservas", headers=headers, json={"medio_pago": "nequi"})
    assert r.status_code == 201, r.text
    reserva = r.json()["reserva"]
    assert reserva["estado"] == "pendiente_pago" and r.json()["pago"]["contenido_qr"].startswith("NEQUI|SARA|")
    # Una sola reserva por día
    assert client.post(f"{API}/reservas", headers=headers, json={}).status_code == 409

    # Con pago pendiente -> rojo
    r = client.post(f"{API}/ingresos/verificacion-facial", headers=admin, json={"vector_facial": vector(semilla)})
    assert r.json()["color"] == "rojo" and "pago" in r.json()["mensaje"]

    # Confirmar pago
    r = client.post(f"{API}/reservas/{reserva['id']}/confirmar-pago", headers=headers,
                    json={"codigo_transaccion": f"M{unico()}"})
    assert r.status_code == 200 and r.json()["estado"] == "confirmada"

    # Verde
    r = client.post(f"{API}/ingresos/verificacion-facial", headers=admin, json={"vector_facial": vector(semilla)})
    assert r.json()["color"] == "verde", r.json()
    registro_id = r.json()["registro"]["id"]
    # Segundo intento -> rojo: ya ingresó
    r = client.post(f"{API}/ingresos/verificacion-facial", headers=admin, json={"vector_facial": vector(semilla)})
    assert r.json()["color"] == "rojo" and "Ya registró" in r.json()["mensaje"]
    # Salida
    assert client.post(f"{API}/ingresos/{registro_id}/salida", headers=admin).status_code == 200
    assert client.post(f"{API}/ingresos/{registro_id}/salida", headers=admin).status_code == 409


def test_rostro_desconocido_rojo(client, admin):
    r = client.post(f"{API}/ingresos/verificacion-facial", headers=admin, json={"vector_facial": vector(987654)})
    assert r.status_code == 200 and r.json()["color"] == "rojo" and r.json()["usuario_nombre"] is None


def test_biometria_sin_autorizacion_422(client, admin, nuevo_aprendiz):
    uid, _ = nuevo_aprendiz
    r = client.post(f"{API}/biometria", headers=admin, json={
        "usuario_id": uid, "vector_facial": vector(1), "autorizacion_firmada": False})
    assert r.status_code == 422


def test_ingreso_manual_almuerzo_cedido(client, admin, nuevo_aprendiz):
    uid, headers = nuevo_aprendiz
    reserva = client.post(f"{API}/reservas", headers=headers, json={}).json()["reserva"]
    # Pendiente de pago: no se puede ceder
    body = {"reserva_id": reserva["id"], "receptor_nombre": "Camilo Vargas", "receptor_documento": "1023456788",
            "motivo": "El titular tuvo una cita médica"}
    assert client.post(f"{API}/ingresos/manual", headers=admin, json=body).status_code == 400
    client.post(f"{API}/reservas/{reserva['id']}/confirmar-pago", headers=headers, json={"codigo_transaccion": f"M{unico()}"})
    r = client.post(f"{API}/ingresos/manual", headers=admin, json=body)
    assert r.status_code == 201 and r.json()["metodo"] == "manual" and r.json()["receptor_nombre"] == "Camilo Vargas"
    assert client.post(f"{API}/ingresos/manual", headers=admin, json=body).status_code == 409


def test_aprendiz_no_usa_cuenta_institucional_ni_ve_reservas_ajenas(client, nuevo_aprendiz):
    _, headers = nuevo_aprendiz
    r = client.post(f"{API}/reservas", headers=headers, json={"medio_pago": "cuenta_institucional"})
    assert r.status_code == 400
    assert client.get(f"{API}/reservas/1", headers=headers).status_code == 403


def test_admin_no_reserva_y_cancelacion(client, admin, nuevo_aprendiz):
    assert client.post(f"{API}/reservas", headers=admin, json={}).status_code == 403
    _, headers = nuevo_aprendiz
    rid = client.post(f"{API}/reservas", headers=headers, json={}).json()["reserva"]["id"]
    r = client.post(f"{API}/reservas/{rid}/cancelar", headers=headers)
    assert r.status_code == 200 and r.json()["estado"] == "cancelada"
    assert client.post(f"{API}/reservas/{rid}/cancelar", headers=headers).status_code == 409


# ── Inventario ──────────────────────────────────────────────────────
def test_inventario_stock_no_negativo_y_borrado_logico(client, admin, instructor):
    codigo = f"TST-{unico().upper()}"
    r = client.post(f"{API}/productos", headers=admin, json={
        "categoria_id": 1, "codigo": codigo, "nombre": "Producto prueba", "unidad_medida": "kg",
        "origen": "proveedor", "cantidad": 10, "stock_minimo": 2})
    assert r.status_code == 201
    pid = r.json()["id"]
    assert client.post(f"{API}/productos", headers=admin, json={
        "categoria_id": 1, "codigo": codigo, "nombre": "Repetido", "unidad_medida": "kg", "origen": "proveedor"}).status_code == 409
    # Salida mayor al stock -> 400
    r = client.post(f"{API}/movimientos", headers=instructor, json={
        "producto_id": pid, "tipo": "salida", "cantidad": 50, "motivo": "Prueba"})
    assert r.status_code == 400
    r = client.post(f"{API}/movimientos", headers=instructor, json={
        "producto_id": pid, "tipo": "salida", "cantidad": 4, "motivo": "Preparación"})
    assert r.status_code == 201 and r.json()["cantidad_resultante"] == "6.00"
    # Instructor no puede crear productos
    assert client.post(f"{API}/productos", headers=instructor, json={}).status_code in (403, 422)
    # Tiene movimientos -> borrado lógico
    r = client.delete(f"{API}/productos/{pid}", headers=admin)
    assert "lógico" in r.json()["mensaje"]
    assert client.get(f"{API}/productos/{pid}", headers=admin).status_code == 404


# ── Deudas ──────────────────────────────────────────────────────────
def test_abono_no_supera_saldo(client, admin):
    deuda = next(d for d in client.get(f"{API}/deudas", headers=admin).json() if d["instructor_id"] == 3)
    exceso = float(deuda["saldo"]) + 1000
    r = client.post(f"{API}/deudas/3/pagos", headers=admin, json={"valor": exceso})
    assert r.status_code == 400
    assert client.post(f"{API}/deudas/999999/pagos", headers=admin, json={"valor": 1000}).status_code == 404


# ── Menú y observaciones ────────────────────────────────────────────
def test_menu_publicacion_y_categorias(client, admin):
    r = client.post(f"{API}/menus", headers=admin, json={
        "fecha": "2026-01-01", "platos": [{"categoria": "sopa", "nombre": "Sopa"}]})
    assert r.status_code == 400  # fecha pasada
    r = client.post(f"{API}/menus", headers=admin, json={
        "fecha": "2030-01-01", "platos": [{"categoria": "sopa", "nombre": "A"}, {"categoria": "sopa", "nombre": "B"}]})
    assert r.status_code == 422  # categoría repetida
    r = client.post(f"{API}/menus", headers=admin, json={
        "fecha": "2030-01-02", "platos": [{"categoria": "sopa", "nombre": "Crema de pollo"}]})
    mid = r.json()["id"]
    assert client.post(f"{API}/menus/{mid}/publicar", headers=admin).status_code == 400  # sin plato fuerte
    client.delete(f"{API}/menus/{mid}", headers=admin)


def test_observacion_flujo(client, admin, aprendiz):
    r = client.post(f"{API}/observaciones", headers=aprendiz, json={"categoria": "menu", "descripcion": "corto"})
    assert r.status_code == 422
    oid = client.post(f"{API}/observaciones", headers=aprendiz, json={
        "categoria": "menu", "descripcion": "Me gustaría más variedad de jugos naturales."}).json()["id"]
    assert client.post(f"{API}/observaciones/{oid}/implementar", headers=admin).status_code == 409
    assert client.post(f"{API}/observaciones/{oid}/responder", headers=admin,
                       json={"respuesta": "Gracias, lo tendremos en cuenta."}).json()["estado"] == "revisada"
    assert client.post(f"{API}/observaciones/{oid}/implementar", headers=admin).json()["estado"] == "implementada"


def test_reporte_rango_invalido(client, admin):
    r = client.get(f"{API}/reportes/resumen?desde=2026-12-01&hasta=2026-01-01", headers=admin)
    assert r.status_code == 400
