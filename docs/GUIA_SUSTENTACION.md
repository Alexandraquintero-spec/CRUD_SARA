# Guía de sustentación – API REST de SARA

Esta guía tiene cuatro partes:

1. Cómo se construyó el proyecto, contado de forma general.
2. Un guion para presentar.
3. Datos listos para probar la API en **Swagger (`/docs`)** y en **Thunder Client**.
4. Respuestas a las preguntas más probables del instructor sobre el código, con el archivo donde está cada cosa.

---

## 1. Cómo se hizo el proyecto (versión corta para contar)

1. **Partimos del problema.** El servicio de almuerzos del SENA Yamboró funcionaba casi todo a mano: había filas largas, se revisaba en papel quién tenía derecho a comer y el inventario se llevaba en hojas sueltas.
2. **Definimos el flujo del servicio.**
   - El administrador registra a los usuarios.
   - El aprendiz reserva de 7:00 a 9:00 a. m. y paga con el **código QR** que aparece en pantalla.
   - Al mediodía entra al comedor **solo con su rostro**: la pantalla se pone verde o roja.
   - Si un aprendiz cede su almuerzo, el administrador registra el **ingreso manual** de quien lo recibe.
3. **Diseñamos la base de datos en PostgreSQL.** Usa el esquema propio `sara` y tiene 17 tablas. Hicimos tres scripts:
   - **DDL:** estructura, llaves y restricciones.
   - **DML:** datos de prueba.
   - **DCL:** el rol `sara_api`, con el mínimo de permisos.
4. **Construimos la API con FastAPI, organizada por capas.**
   - La capa **routers** recibe la petición HTTP.
   - La capa **services** aplica las reglas del negocio.
   - La capa **repositories** consulta la base de datos con SQLAlchemy.
   - Cada capa solo habla con la que está debajo.
5. **Agregamos la seguridad.**
   - Inicio de sesión con correo y contraseña.
   - Contraseñas cifradas con bcrypt.
   - Tokens JWT: un *access token* de 30 minutos y un *refresh token* de 7 días.
   - Bloqueo de la cuenta tras 5 intentos fallidos.
   - Permisos revisados por rol en cada endpoint: 401 si no hay token o es inválido, 403 si el rol no tiene permiso.
6. **Validamos los datos.**
   - Pydantic revisa el formato (correo, documento, teléfono, fechas, valores).
   - Los servicios revisan lo que depende de la base: duplicados (409), registros que no existen (404) y reglas del negocio (400).
   - Todos los errores responden con la misma estructura y en español.
7. **Documentamos y probamos.**
   - Swagger se genera solo y cada endpoint indica su descripción y el rol requerido.
   - 27 pruebas automáticas con pytest.
   - Una colección de Postman con 140 peticiones (casos de éxito y de error).
8. **Conectamos el frontend.** El inicio de sesión del frontend en React llama a `POST /api/v1/auth/login`.

---

## 2. Guion para la sustentación (12–15 minutos)

| Minutos | Qué mostrar | Qué decir |
|---|---|---|
| 0–2 | Diapositiva o README | Problema, solución y los tres roles (administrador, instructor, aprendiz). |
| 2–4 | Carpeta del proyecto en VS Code | La estructura por capas: `app/core`, `database`, `models`, `schemas`, `repositories`, `services`, `routers`, más `database/`, `docs/` y `tests/`. |
| 4–6 | pgAdmin o `psql` | El esquema `sara`, las 17 tablas, un CHECK, un índice único parcial y el rol `sara_api` sin permisos para borrar tablas. |
| 6–11 | `http://127.0.0.1:8000/docs` | La demostración de la sección 4: login, reservar, pagar, ingreso verde y rojo, ingreso manual y errores 401/403/409/422. |
| 11–13 | Terminal | `pytest -v` (27 pruebas superadas) o la colección de Postman en el Runner. |
| 13–15 | Frontend `http://localhost:5173` | Inicio de sesión real con correo y contraseña y el recorrido por los paneles. |

---

## 3. Antes de sustentar (lista de verificación)

1. Carga la base desde cero, para que los datos de prueba queden como se espera:
   ```powershell
   powershell -ExecutionPolicy Bypass -File database\setup_bd.ps1
   ```
2. En el `.env`:
   - `DB_PASSWORD` es la clave que elegiste para `sara_api`.
   - Pon `VALIDAR_HORARIOS=false`, para poder reservar e ingresar a cualquier hora.
3. Arranca la API: `uvicorn app.main:app --reload`. Abre `http://127.0.0.1:8000/docs`.
4. Opcional: arranca el frontend en otra terminal con `cd frontend` y `npm run dev`.

> **Importante:** los datos de prueba se gastan al probar. Por ejemplo, después de reservar, el aprendiz ya no puede reservar otra vez ese día. Si vas a repetir la demostración, vuelve a ejecutar `setup_bd.ps1`.

### Usuarios de prueba (contraseña de todos: `Sara2026*`)

| Rol | Correo | Para qué sirve en la demostración |
|---|---|---|
| Administrador | `admin@sara.edu.co` | Todo lo de gestión, ingreso facial e ingreso manual |
| Instructor | `instructor@sara.edu.co` | Reservar a cuenta institucional; probar el 403 en reportes |
| Aprendiz | `aprendiz@sara.edu.co` (Yeimy, id 7) | **No tiene reserva hoy**: sirve para el flujo completo |
| Aprendiz beneficiario | `valentina.lopez@soy.sena.edu.co` (id 9) | Reserva sin costo (ya tiene una hoy en los datos de prueba) |
| Aprendiz inactivo | `nicolas.alvarez@soy.sena.edu.co` | Login rechazado por usuario inactivo |

### Datos de prueba de hoy que conviene conocer (base recién cargada)

| Reserva | Dueño | Estado | Sirve para |
|---|---|---|---|
| 73 | Santiago (id 8) | confirmada | — |
| 74 | Valentina (id 9, beneficiaria) | confirmada | — |
| **75** | Juan David (id 10) | **pendiente_pago** | Ingreso facial rojo «sin pago»; ingreso manual rechazado (400) |
| **76** | María José (id 11) | **confirmada** | **Ingreso manual (almuerzo cedido)** |
| 77 | Diana (instructora, id 4) | confirmada (cuenta institucional) | — |

---

## 4. Pruebas en Swagger (`/docs`)

**Cómo autenticarse en Swagger:**
1. Abre `POST /api/v1/auth/login`, presiona **Try it out** y luego **Execute**. El ejemplo ya trae `admin@sara.edu.co` y `Sara2026*`.
2. Copia el valor de `access_token`, sin comillas.
3. Presiona el botón **Authorize** (arriba a la derecha), pega el token y presiona **Authorize**.
4. Para cambiar de usuario: **Authorize › Logout**, haz login con el otro correo y pega el token nuevo.

### Demostración recomendada (en este orden)

| # | Usuario | Endpoint | Cuerpo / parámetros | Resultado esperado |
|---|---|---|---|---|
| 1 | — | `GET /api/v1/usuarios` sin Authorize | — | **401** «No autenticado…» |
| 2 | — | `POST /api/v1/auth/login` | `{"correo": "admin@sara.edu.co", "contrasena": "Incorrecta1"}` | **401** «Correo o contraseña incorrectos.» |
| 3 | — | `POST /api/v1/auth/login` | `{"correo": "admin@sara.edu.co", "contrasena": "Sara2026*"}` | **200** con `access_token` y `refresh_token` |
| 4 | admin | `GET /api/v1/usuarios` | `rol=aprendiz`, `pagina=1`, `tamano=5` | **200** paginado (`items`, `total`, `paginas`) |
| 5 | admin | `POST /api/v1/usuarios` | Bloque A (abajo) | **201**, sin la contraseña en la respuesta |
| 6 | admin | `POST /api/v1/usuarios` (mismo cuerpo otra vez) | Bloque A | **409** correo o documento duplicado |
| 7 | admin | `POST /api/v1/usuarios` | Bloque B (datos malos) | **422** con la lista de campos en español |
| 8 | aprendiz | `GET /api/v1/usuarios` | — | **403** «No tiene permisos…» |
| 9 | aprendiz | `GET /api/v1/menus/hoy` | — | **200** menú del día |
| 10 | aprendiz | `POST /api/v1/reservas` | `{"medio_pago": "qr"}` | **201**, estado `pendiente_pago` y bloque `pago` con `contenido_qr` (anota el `id`) |
| 11 | aprendiz | `POST /api/v1/reservas` otra vez | `{"medio_pago": "qr"}` | **409** «Ya tiene una reserva para hoy…» |
| 12 | admin | `POST /api/v1/ingresos/verificacion-facial` | archivo `docs/cuerpos_prueba/facial_aprendiz_yeimy_id7.json` | **200** `color: "rojo"`, «La reserva no tiene el pago confirmado.» |
| 13 | aprendiz | `POST /api/v1/reservas/{id}/confirmar-pago` | `{"codigo_transaccion": "M12345678"}` | **200** estado `confirmada` |
| 14 | admin | `POST /api/v1/ingresos/verificacion-facial` | el mismo archivo de la prueba 12 | **200** `color: "verde"`, «Ingreso permitido…» |
| 15 | admin | la misma verificación facial otra vez | el mismo archivo | **200** `color: "rojo"`, «Ya registró su ingreso hoy.» |
| 16 | admin | `POST /api/v1/ingresos/verificacion-facial` | `facial_rostro_desconocido.json` | **200** `rojo`, «Rostro no reconocido…» |
| 17 | admin | `POST /api/v1/ingresos/manual` | Bloque C (reserva 76) | **201** ingreso con `metodo: "manual"` |
| 18 | admin | `POST /api/v1/ingresos/manual` otra vez | Bloque C | **409** «Esa reserva ya fue utilizada.» |
| 19 | admin | `POST /api/v1/ingresos/manual` | Bloque C con `"reserva_id": 75` | **400** solo se cede una reserva confirmada |
| 20 | admin | `GET /api/v1/ingresos/aforo` | — | **200** personas dentro y cupos disponibles |
| 21 | admin | `POST /api/v1/movimientos` | Bloque D (salida mayor al stock) | **400** «Stock insuficiente…» |
| 22 | admin | `DELETE /api/v1/productos/1` | — | **200** «…borrado lógico…» (el producto tiene movimientos) |
| 23 | instructor | `GET /api/v1/reportes/resumen` | — | **403** |
| 24 | admin | `GET /api/v1/reportes/resumen` | — | **200** reservas, ingresos, recaudo QR, desperdicio |

> **Cómo pegar los cuerpos de la verificación facial:** el vector tiene 128 números. Abre el archivo `.json` de `docs/cuerpos_prueba/` en VS Code, copia todo el contenido y pégalo en el cuerpo de la petición.

### Bloques de datos

**Bloque A – usuario nuevo válido (aprendiz):**
```json
{
  "rol": "aprendiz",
  "nombre_completo": "Camila Rojas Pérez",
  "tipo_documento": "CC",
  "numero_documento": "1099887766",
  "correo": "camila.rojas@soy.sena.edu.co",
  "telefono": "3104445566",
  "contrasena": "Sara2026*",
  "ficha_id": 1,
  "tipo_aprendiz": "normal"
}
```

**Bloque B – datos inválidos (para el 422):**
```json
{
  "rol": "aprendiz",
  "nombre_completo": "X",
  "tipo_documento": "ZZ",
  "numero_documento": "12ab",
  "correo": "no-es-correo",
  "telefono": "123",
  "contrasena": "debil"
}
```

**Bloque C – ingreso manual por almuerzo cedido:**
```json
{
  "reserva_id": 76,
  "receptor_nombre": "Camilo Ernesto Vargas",
  "receptor_documento": "1023456788",
  "motivo": "La titular cedió su almuerzo por una cita médica"
}
```

**Bloque D – salida de inventario mayor al stock:**
```json
{
  "producto_id": 2,
  "tipo": "salida",
  "cantidad": 999,
  "motivo": "Prueba de stock insuficiente"
}
```

**Otros cuerpos útiles:**
- Cambiar mi contraseña (`PUT /api/v1/auth/me/password`):
  ```json
  {"contrasena_actual": "Sara2026*", "contrasena_nueva": "NuevaClave2026"}
  ```
- Reservar a cuenta institucional, con el usuario instructor (`POST /api/v1/reservas`):
  ```json
  {"medio_pago": "cuenta_institucional"}
  ```
- Abono a la deuda del instructor 3 (`POST /api/v1/deudas/3/pagos`):
  ```json
  {"valor": 5000, "medio_pago": "qr", "observacion": "Abono"}
  ```
- Crear un menú (`POST /api/v1/menus`). La fecha debe ser de hoy en adelante; si ya pasó, la API responde 400:
  ```json
  {"fecha": "2026-12-15", "platos": [{"categoria": "sopa", "nombre": "Crema de ahuyama"}, {"categoria": "plato_fuerte", "nombre": "Pollo a la plancha"}]}
  ```
- Bloqueo de cuenta: haz login 5 veces con una contraseña mala sobre un usuario que hayas creado. A la quinta responde «…quedó bloqueada 15 minutos» y luego rechaza también la contraseña correcta.

---

## 4.1 Cómo demostrar el reconocimiento facial ante el instructor

### Lo primero que hay que explicar (con honestidad)

> «La API **no recibe fotos**. En el comedor, la cámara del kiosco captura el rostro y una librería de visión por computador (por ejemplo, face_recognition con dlib) lo convierte en un **vector de 128 números**, que son los rasgos de la cara. Ese vector es lo que se envía a la API. La API se encarga de identificar a la persona, validar su reserva y su pago, decidir verde o rojo y registrar el intento. Como hoy no tenemos la cámara conectada, **simulamos la cámara** enviando vectores de prueba, igual que lo haría el kiosco.»

Si el instructor pregunta por la cámara, la respuesta es esa: la cámara y la extracción del vector son la parte del kiosco. Lo que entrega este proyecto es la API que recibe ese vector y aplica todas las reglas. No digas que la cámara ya funciona.

### Antes de empezar

1. Base recién cargada (`setup_bd.ps1`) y `VALIDAR_HORARIOS=false`.
2. En la terminal, con el venv activo, genera los cuerpos que vas a usar. Ya están creados en `docs/cuerpos_prueba/`, pero generarlos en vivo impresiona más:
   ```powershell
   python docs/cuerpos_prueba/generar_vector.py 7 --ruido 0.15
   python docs/cuerpos_prueba/generar_vector.py 7 --ruido 0.3
   python docs/cuerpos_prueba/generar_vector.py 21
   python docs/cuerpos_prueba/generar_vector.py 21 --registro 21
   ```

Cada comando muestra en pantalla la similitud con el rostro original. Por ejemplo: «Similitud con el rostro original: 95.63 % (la API acepta desde 90 %)».

### Demostración A – el umbral del 90 % (2 minutos)

Usa el aprendiz `aprendiz@sara.edu.co` (Yeimy, id 7). Primero reserva y paga (pasos 10 y 13 de la sección 4). Luego, con el token del **administrador**, en `POST /api/v1/ingresos/verificacion-facial`:

| Cuerpo | Qué representa | Resultado |
|---|---|---|
| `facial_usuario_7_ruido_0.3.json` | Una captura muy distinta (mala luz, otra persona parecida) | **rojo**, similitud **87 %**: «Rostro no reconocido» |
| `facial_usuario_7_ruido_0.15.json` | Otra foto de la misma persona, con pequeñas diferencias | **verde**, similitud **95,63 %**: «Ingreso permitido» |

Qué decir: «Dos fotos de la misma persona nunca dan el mismo vector exacto. Por eso la API no compara por igualdad, sino por **similitud coseno**, y acepta desde el 90 %, valor configurable con `UMBRAL_SIMILITUD` en el `.env`.»

### Demostración B – un aprendiz nuevo de principio a fin (3 minutos)

Esta es la más completa, porque muestra que el verde depende de **tres cosas**: rostro registrado, reserva y pago.

1. Con el administrador, crea el usuario del **Bloque A** (`POST /api/v1/usuarios`). En una base recién cargada queda con **id 21**.
2. Verifica con `facial_usuario_21.json` → **rojo**, similitud baja: el rostro **no está registrado**.
3. Registra el rostro: `POST /api/v1/biometria` con `registro_usuario_21.json` → **201**.
4. Verifica otra vez → **rojo**, similitud **100 %**, «No tiene reserva para hoy»: ya lo reconoce, pero no reservó.
5. Inicia sesión como `camila.rojas@soy.sena.edu.co` (`Sara2026*`), reserva (`POST /api/v1/reservas`) y paga (`POST /api/v1/reservas/{id}/confirmar-pago`).
6. Verifica otra vez con el token del administrador → **verde**, «Ingreso permitido».
7. Muestra `GET /api/v1/ingresos?fecha=<hoy>`: aparecen los intentos rojos y el verde, con hora, motivo y similitud.

> Si en tu base el usuario nuevo no queda con id 21, genera sus cuerpos con el id real. Por ejemplo, si quedó con id 23: `python docs/cuerpos_prueba/generar_vector.py 23` y `python docs/cuerpos_prueba/generar_vector.py 23 --registro 23`.

### Demostración C – que no se guarda la foto (1 minuto)

En `psql` o pgAdmin:
```sql
SELECT usuario_id, left(vector_cifrado, 50) || '...' AS vector_cifrado
FROM sara.plantilla_biometrica ORDER BY usuario_id LIMIT 3;
```
Se ve algo como `gAAAAABrAhJb...`: el vector está **cifrado con Fernet** y no hay ninguna imagen en la base. Muestra también en VS Code `app/core/biometria.py`:
- `cifrar_vector()` cifra el vector antes de guardarlo.
- `similitud()` es la fórmula de comparación.

Qué decir: «El rostro es un dato sensible según la Ley 1581 de 2012. Por eso se pide la autorización firmada (`autorizacion_firmada` debe ser `true`; si no, la API responde 422), se guarda cifrado y se puede borrar con `DELETE /api/v1/biometria/{usuario_id}`.»

### Preguntas que pueden salir sobre esta parte

- **¿Por qué 128 números?** Es el tamaño del vector que generan librerías como face_recognition (modelo de dlib): cada rostro queda representado por 128 medidas.
- **¿Qué es la similitud coseno?** Mide qué tan parecidos son dos vectores por el ángulo entre ellos. 100 % es idéntico y 0 % no se parecen. Está en `similitud()` de `app/core/biometria.py`.
- **¿Cómo encuentra a la persona?** `BiometriaService.identificar()` descifra las plantillas de los usuarios activos, las compara con el vector recibido y se queda con la más parecida. Si llega al 90 %, la persona queda identificada.
- **¿Qué pasa si alguien pone una foto frente a la cámara?** Eso se controla en el kiosco con una «prueba de vida» (parpadeo o movimiento), que está planteada en el requisito RF18 como mejora del kiosco. La API recibe solo el vector.
- **¿Qué pasa si la cámara falla?** El administrador registra el ingreso manual (`POST /api/v1/ingresos/manual`), que también se usa cuando un aprendiz cede su almuerzo.
- **¿Se guardan los intentos fallidos?** Sí. Cada intento, verde o rojo, queda en `registro_ingreso` con el motivo y la similitud (`IngresoService._registrar()`).

---

## 5. Pruebas en Thunder Client (VS Code)

### Configuración (una sola vez)
1. Instala la extensión **Thunder Client** en VS Code y ábrela con el ícono del rayo.
2. Ve a **Env › New Environment**, llámalo `SARA` y crea dos variables:
   - `baseUrl` = `http://127.0.0.1:8000/api/v1`
   - `token` = (vacío por ahora)
3. Selecciona el environment `SARA` (que aparezca marcado).

### Hacer el login y guardar el token
1. Crea una **New Request**: `POST {{baseUrl}}/auth/login`.
2. En **Body › JSON** escribe: `{"correo": "admin@sara.edu.co", "contrasena": "Sara2026*"}`.
3. Para guardar el token automáticamente, en la pestaña **Tests** agrega:
   - Tipo **Set Env Variable**
   - Valor: `json.access_token`
   - Variable: `{{token}}`

   Si tu versión de Thunder Client no tiene esa opción, copia el `access_token` a mano y pégalo en la variable `token` del environment.
4. Presiona **Send**: debe responder **200**.

### Usar el token en las demás peticiones
- En cada petición protegida, ve a **Auth › Bearer** y escribe `{{token}}`.
- Otra opción: en **Headers**, agrega `Authorization` con el valor `Bearer {{token}}`.

### Peticiones para crear (mismos datos de la sección 4)

| Método | URL | Body |
|---|---|---|
| GET | `{{baseUrl}}/auth/me` | — |
| GET | `{{baseUrl}}/usuarios?rol=aprendiz&pagina=1&tamano=5` | — |
| POST | `{{baseUrl}}/usuarios` | Bloque A |
| GET | `{{baseUrl}}/menus/hoy` | — |
| POST | `{{baseUrl}}/reservas` (con el token del aprendiz) | `{"medio_pago": "qr"}` |
| POST | `{{baseUrl}}/reservas/{id}/confirmar-pago` | `{"codigo_transaccion": "M12345678"}` |
| POST | `{{baseUrl}}/ingresos/verificacion-facial` | contenido de `facial_aprendiz_yeimy_id7.json` |
| POST | `{{baseUrl}}/ingresos/manual` | Bloque C |
| GET | `{{baseUrl}}/ingresos?resultado=denegado` | — |
| GET | `{{baseUrl}}/productos/alertas` | — |
| GET | `{{baseUrl}}/reportes/resumen` | — |

> **Tip:** crea **dos environments**, `SARA-admin` y `SARA-aprendiz`, cada uno con su propio `token`. Así cambias de usuario con un clic.

> **Importar la colección completa:** Thunder Client permite **Collections › menú (≡) › Import** y elegir `docs/SARA_API.postman_collection.json`. Se importan las 140 peticiones con sus cuerpos. Los scripts de Postman (`pm.*`) pueden no funcionar en Thunder Client. Por eso, para la sustentación es más seguro usar las peticiones de esta guía, o la colección directamente en Postman.

---

## 6. Preguntas probables del instructor y cómo responderlas

### Arquitectura

**¿Cómo está organizada la API?**
Por capas, como pide el instructivo:
- `routers/` recibe la petición y valida con los esquemas.
- `services/` aplica las reglas del negocio.
- `repositories/` hace las consultas con SQLAlchemy.
- `models/` describe las tablas.

Un router nunca consulta la base directamente. Por ejemplo, `routers/reservas.py` llama a `ReservaService.crear()`, y este usa `ReservaRepository` y `MenuRepository`.

**¿Dónde se configura la conexión a la base de datos?**
- `app/core/config.py`: la clase `Settings` (pydantic-settings) lee el `.env` y arma la URL `postgresql+psycopg://…` en la propiedad `database_url`.
- `app/database/connection.py`: crea el `engine` con `search_path=sara` y la función `get_db()`, que entrega una sesión por petición y la cierra al terminar.

**¿Por qué FastAPI?**
- Valida los datos con Pydantic automáticamente.
- Genera Swagger sin trabajo extra.
- Maneja la inyección de dependencias con `Depends`, que usamos para la sesión de base de datos y para los permisos.

### Seguridad

**¿Cómo funciona el login?**
`services/auth_service.py › AuthService.login()`:
1. Busca al usuario por correo.
2. Revisa si está bloqueado (`bloqueado_hasta`).
3. Verifica la contraseña con `bcrypt.checkpw` (función `verificar_contrasena` en `core/security.py`).
4. Si falla, suma `intentos_fallidos`. Al quinto intento bloquea la cuenta `MINUTOS_BLOQUEO` minutos.
5. Si el usuario está inactivo, lo rechaza.
6. Si todo está bien, reinicia los intentos y devuelve dos tokens.

El mensaje de error es el mismo si el correo no existe o si la contraseña está mal, para no revelar qué correos están registrados.

**¿Cómo guardan las contraseñas?**
Con bcrypt (`hashear_contrasena` en `core/security.py`, 12 rondas). En la base solo queda el hash (`contrasena_hash`), y ningún esquema de salida (`UsuarioSalida`) incluye ese campo. La política de 8 caracteres con mayúscula, minúscula y número se valida con una expresión regular (`PATRON_CONTRASENA`).

**¿Qué es el JWT y qué lleva?**
Un token firmado con `JWT_SECRET` (HS256). Se crea en `_crear_token()` y lleva:
- `sub`: el id del usuario;
- `rol`;
- `type`: `access` o `refresh`;
- `jti`: un identificador único;
- `iat` y `exp`: cuándo se creó y cuándo vence.

El access token dura 30 minutos y el refresh token 7 días. `decodificar_token()` revisa la firma, la expiración y que el tipo sea el esperado. Por eso un refresh token no sirve para entrar a los endpoints.

**¿Cómo protegen cada endpoint por rol?**
En `app/core/permissions.py`:
- `get_current_user()` lee el encabezado `Authorization: Bearer …`, decodifica el token y carga el usuario activo. Si no hay token o es inválido, responde **401**.
- `require_roles("administrador")` es una dependencia que compara el rol del usuario. Si no coincide, responde **403**.

En los routers se usa así: `actor: Usuario = Depends(solo_admin)`.

**¿Un administrador puede quitarse el rol o desactivarse a sí mismo?**
No. `UsuarioService.cambiar_rol()` y `cambiar_estado()` comparan `usuario_id == actor.id` y lanzan `ReglaNegocio` (400).

**¿Dónde están las claves?**
En el archivo `.env`, que está en `.gitignore`. En GitHub solo está `.env.example` con valores de ejemplo.

**¿Cómo funciona el CORS?**
En `app/main.py`, `CORSMiddleware` solo acepta los orígenes de la variable `CORS_ORIGINS` (el frontend en `localhost:5173`).

### Errores y validaciones

**¿Cómo logran que todos los errores tengan la misma forma?**
En `app/core/errors.py`:
- Hay excepciones propias: `NoAutenticado` (401), `SinPermiso` (403), `NoEncontrado` (404), `Conflicto` (409) y `ReglaNegocio` (400).
- `registrar_manejadores()` las convierte en `{"error": {"codigo", "mensaje", "detalles"}}`.
- También traduce al español los errores de validación de Pydantic (422), convierte un `IntegrityError` de la base en 409 y cualquier error inesperado en un 500 genérico, sin mostrar detalles técnicos.

**¿Dónde se valida el formato y dónde las reglas?**
- **Formato:** en `app/schemas/`, con Pydantic. Por ejemplo, en `schemas/comun.py`:
  - documento: `^[0-9]{6,15}$`;
  - teléfono: `^3[0-9]{9}$`;
  - nombre: solo letras;
  - correo: `EmailStr`;
  - valores: `gt=0`.
- **Reglas que dependen de la base:** en los servicios. Ejemplos: correo repetido → 409; ficha que no existe → 404; reservar fuera de horario → 400.
- Los esquemas de entrada usan `extra="forbid"`, así que rechazan campos que no existen. Los de entrada y salida están separados (`UsuarioEntrada` y `UsuarioSalida`, por ejemplo).

### Reglas del negocio

**¿Cómo funciona la reserva?** `services/reserva_service.py › crear()`:
1. Solo aprendices e instructores pueden reservar.
2. Revisa el horario de 7:00 a 9:00 a. m. con `reloj.en_franja()`, si `VALIDAR_HORARIOS` está activo.
3. Verifica que no exista otra reserva hoy (`activa_del_dia`).
4. Verifica que haya un menú publicado.
5. **Aprendiz:** revisa que la ficha esté activa y la alimentación habilitada.
   - Si es beneficiario, la reserva vale $0 y queda confirmada.
   - Si no, toma el precio vigente y queda `pendiente_pago`.
6. **Instructor:** puede pagar con QR o cargarlo a su cuenta institucional.
7. Genera una referencia única (`SARA-{id}-{fecha}-{código}`) y devuelve los datos del QR (`_pago_qr`).

**¿Cómo se confirma el pago?**
`confirmar_pago()`: la reserva debe ser del día y estar `pendiente_pago`. Guarda el `codigo_transaccion`, que es único en la base, y la pasa a `confirmada`.

**¿Cómo funciona el reconocimiento facial?**
La API no recibe fotos: recibe un **vector de 128 números** (los rasgos del rostro que extrae la cámara).
- `core/biometria.py` cifra el vector con **Fernet** (`cifrar_vector`) antes de guardarlo y compara dos vectores con la **similitud coseno** (`similitud`, de 0 a 100).
- `BiometriaService.identificar()` compara el vector recibido con todas las plantillas y se queda con la más parecida.
- `IngresoService.verificar_facial()`: si la similitud es mayor o igual a 90 y la reserva está confirmada, en horario y con aforo menor a 110, responde **verde** y marca la reserva como `consumida`. Si no, responde **rojo** con el motivo.
- Todos los intentos se guardan en `registro_ingreso`.

**¿Y el ingreso manual?**
`IngresoService.manual()`: el administrador indica la reserva del titular y los datos de quien recibe el almuerzo. Valida que la reserva sea de hoy, esté confirmada y sin usar, que el receptor sea otra persona y que haya aforo. Registra el ingreso con `metodo = 'manual'`.

**¿Qué es el borrado lógico y dónde lo usan?**
En lugar de borrar la fila, se marca `eliminado = TRUE` (`BaseRepository.eliminar_logico`). Se usa en usuarios, fichas y productos que ya tienen movimientos, para no perder el historial. Si un producto no tiene movimientos, se borra físicamente (`ProductoService.eliminar`).

**¿Cómo guardan quién hizo cada cambio (auditoría)?**
Todas las tablas tienen `creado_por`, `creado_en`, `actualizado_por` y `actualizado_en`. `BaseRepository.agregar()` llena `creado_por` con el id del usuario del token, y `marcar_actualizado()` llena los campos de actualización.

**¿Cómo funciona la paginación?**
La dependencia `paginacion()` en `routers/deps.py` recibe `pagina` y `tamano` (máximo 100). `BaseRepository._paginar()` cuenta el total y usa `offset` y `limit`. La respuesta es `Pagina` (`items`, `total`, `pagina`, `tamano`, `paginas`).

**¿Cómo evitan que el stock quede negativo?**
- En el servicio: `MovimientoService.registrar()` bloquea la fila con `SELECT … FOR UPDATE` (`ProductoRepository.bloquear`) y rechaza una salida mayor a la cantidad disponible.
- En la base: el `CHECK (cantidad >= 0)` lo impide aunque alguien escriba directamente en ella.

### Base de datos

**¿Qué restricciones tiene la base?**
- PK y FK en todas las tablas.
- `UNIQUE` en correo, documento, número de ficha, código de producto, referencia de pago y código de transacción.
- `CHECK`, por ejemplo: tipo de documento en `('CC','TI','CE','PP')`, documento con expresión regular, valor mayor que 0, entregados ≤ preparados y similitud entre 0 y 100.
- Valores por defecto como `now()`, `TRUE` y `'nueva'`.

**¿Qué es un índice único parcial y para qué lo usaron?**
Es un índice único que solo aplica a las filas que cumplen una condición. Por ejemplo, `uq_reserva_usuario_fecha ON reserva(usuario_id, fecha) WHERE estado <> 'cancelada'`: impide dos reservas activas de la misma persona el mismo día, pero permite volver a reservar si cancela. También hay uno para «un solo menú publicado por fecha» y otro para «un solo precio activo por tipo».

**¿Por qué la API no se conecta como `postgres`?**
Por el principio de mínimos privilegios. `03_dcl.sql` crea `sara_api`, que solo tiene:
- `SELECT`, `INSERT` y `UPDATE` en las tablas;
- `DELETE` solo donde el negocio lo permite.

No puede crear ni borrar tablas. Se demuestra con `DROP TABLE sara.usuario;` usando ese rol: responde «must be owner of table usuario».

### Pruebas

**¿Cómo probaron la API?**
- **pytest** (`tests/`, 27 pruebas): login, token expirado, roles (403), bloqueo por intentos, política de contraseña, duplicados, flujo completo de reserva, pago e ingreso, ingreso manual, inventario y deudas. Se ejecuta con `pytest -v`.
- **Postman** (`docs/SARA_API.postman_collection.json`, 140 peticiones): casos de éxito y de error en cada módulo. Se ejecuta con el Runner.

---

## 7. Dónde se cumple cada punto del instructivo

| Punto del instructivo | Dónde está |
|---|---|
| FastAPI + PostgreSQL 16 o superior | `requirements.txt`, `app/database/connection.py` |
| Esquema propio, DDL/DML/DCL | `database/01_ddl.sql`, `02_dml.sql`, `03_dcl.sql` |
| Prefijo `/api/v1`, recursos en plural, CRUD | `app/main.py` (`PREFIJO`), `app/routers/*` |
| Al menos 6 endpoints de procesos de negocio | reservar, confirmar pago, cancelar, verificación facial, ingreso manual, salida, publicar menú, abonos, movimientos, reportes |
| Paginación y filtros | `routers/deps.py`, `repositories/*.listar()` |
| Reglas de negocio en servicios | `app/services/*` |
| Borrado lógico y auditoría | `repositories/base.py` |
| Login, JWT con refresh, bcrypt, bloqueo, cambio de contraseña | `services/auth_service.py`, `core/security.py`, `routers/auth.py` |
| 3 roles, 401/403, solo el admin gestiona usuarios | `core/permissions.py`, `routers/usuarios.py` |
| Errores uniformes en español | `core/errors.py` |
| Esquemas de entrada y salida separados | `app/schemas/*` |
| Swagger con el rol por endpoint | `http://127.0.0.1:8000/docs` |
| `.env` fuera del repositorio, CORS restringido | `.gitignore`, `.env.example`, `app/main.py` |
| Pruebas | `tests/`, `docs/SARA_API.postman_collection.json` |
