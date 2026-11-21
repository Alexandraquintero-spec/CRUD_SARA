# SARA · API REST del Sistema de Alimentación y Reservas del Aprendiz

API REST del servicio de alimentación del área de **Gastronomía del SENA**, construida con **FastAPI** y **PostgreSQL**.
Este repositorio también trae el **frontend** (React + Vite) en la carpeta `frontend/`.

## Descripción

SARA organiza el almuerzo de aprendices e instructores:

1. El **administrador** registra los usuarios (no hay autorregistro), las fichas, el menú del día y los precios.
2. El **aprendiz** reserva entre **7:00 y 9:00 a. m.** y paga con el **QR de Nequi que muestra el sistema**, así que no sale del ambiente de formación. Los aprendices **beneficiarios** no pagan.
3. Al mediodía (12:00 m. a 1:30 p. m.) entra al comedor por **reconocimiento facial**:
   - 🟢 **verde**: tiene reserva confirmada y puede seguir;
   - 🔴 **rojo**: no puede entrar y el sistema dice por qué (sin reserva, sin pago, ya entró, aforo completo o rostro no reconocido).

   No hay boleta ni código QR para entrar.
4. Si un aprendiz que reservó le **cede su almuerzo** a otro, el administrador registra el **ingreso manual** del que lo recibe.
5. Los **instructores** pueden cargar el almuerzo a su **cuenta institucional**. Esto genera una deuda que luego abonan.
6. Además, el sistema gestiona el inventario de insumos, los visitantes, las observaciones de los comensales, el control de producción y los reportes.

## Integrantes

| Nombre | Rol en el proyecto | Rama |
|---|---|---|
| _(completar)_ | | |
| _(completar)_ | | |
| _(completar)_ | | |

Ficha **3312744** · Análisis y Desarrollo de Software · SENA

## Tecnologías

- Python 3.11 o superior (probado con 3.13)
- FastAPI, SQLAlchemy 2, psycopg 3, Pydantic 2 y pydantic-settings
- PostgreSQL 16 o superior (probado con 18)
- PyJWT para el access token y el refresh token
- bcrypt para las contraseñas
- cryptography (Fernet) para las plantillas faciales
- pytest y Postman (newman) para las pruebas

## Estructura

```
api_gastronomia/
├── app/
│   ├── main.py            # Crea la app, configura CORS, registra los manejadores de error y los routers
│   ├── core/              # Configuración (.env), seguridad (JWT/bcrypt), permisos por rol, errores, reloj, biometría
│   ├── database/          # Conexión a PostgreSQL (esquema "sara")
│   ├── models/            # Modelos ORM (tablas)
│   ├── schemas/           # Esquemas Pydantic de entrada y de salida, separados
│   ├── repositories/      # Acceso a datos: la única capa que consulta la base
│   ├── services/          # Reglas de negocio
│   └── routers/           # Endpoints /api/v1 documentados en Swagger
├── database/
│   ├── 00_crear_bd.sql    # Crea la base bd_sara
│   ├── 01_ddl.sql         # Esquema, tablas, PK/FK, CHECK, UNIQUE, índices y auditoría
│   ├── 02_dml.sql         # Datos de prueba (10 o más por tabla principal)
│   ├── 03_dcl.sql         # Rol sara_api de mínimos privilegios
│   └── setup_bd.ps1       # Ejecuta los 4 scripts en orden (Windows)
├── docs/                  # Anexos y colección Postman
├── tests/                 # Pruebas automáticas (pytest)
├── frontend/              # Página web (React + Vite + HeroUI)
├── requirements.txt
├── .env.example
└── README.md
```

Cada capa solo llama a la capa de abajo: **routers → services → repositories → base de datos**.

## Cómo ejecutar

### 1. Base de datos

Con PostgreSQL instalado y en ejecución, abra PowerShell en la carpeta del proyecto y ejecute:

```powershell
powershell -ExecutionPolicy Bypass -File database\setup_bd.ps1
```

El script pide la contraseña del usuario `postgres` y la clave que tendrá el rol `sara_api`, y ejecuta `00`, `01`, `02` y `03` en orden.

Si prefiere hacerlo a mano:

```powershell
psql -U postgres -f database/00_crear_bd.sql
psql -U postgres -d bd_sara -f database/01_ddl.sql
psql -U postgres -d bd_sara -f database/02_dml.sql
psql -U postgres -d bd_sara -v clave_api=SuClaveSegura -f database/03_dcl.sql
```

### 2. API (primera terminal)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env      # luego edite DB_PASSWORD, JWT_SECRET y, si quiere, VALIDAR_HORARIOS
uvicorn app.main:app --reload
```

- Swagger: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>

> Para probar fuera del horario real (en la sustentación o con Postman), ponga `VALIDAR_HORARIOS=false` en el `.env`.

### 3. Frontend (segunda terminal)

```powershell
cd frontend
npm install
npm run dev
```

Abra <http://localhost:5173>. El inicio de sesión usa la API (`POST /api/v1/auth/login`) con correo y contraseña. Si la API no está en ejecución, la pantalla ofrece un **modo demostración** para recorrer el prototipo.

### 4. Pruebas

```powershell
pytest -q
```

La colección **docs/SARA_API.postman_collection.json** se importa en Postman y se ejecuta completa, en orden, con el *Collection Runner*. Trae 140 solicitudes que cubren:

- casos exitosos;
- datos inválidos;
- duplicados;
- recursos no encontrados;
- sin token y token expirado;
- rol sin permiso;
- cada regla de negocio.

## Usuarios de prueba

La contraseña de **todos** es `Sara2026*` (en la base solo se guarda su hash bcrypt).

| Rol | Correo | Observación |
|---|---|---|
| Administrador | `admin@sara.edu.co` | Gestiona todo el sistema |
| Administrador | `coordinacion@sara.edu.co` | Segundo administrador |
| Instructor | `instructor@sara.edu.co` | Tiene deuda en cuenta institucional |
| Aprendiz | `aprendiz@sara.edu.co` | Ficha 3312744; no tiene reserva hoy, así que sirve para probar el flujo |
| Aprendiz beneficiario | `valentina.lopez@soy.sena.edu.co` | Almuerzo sin costo |
| Aprendiz inactivo | `nicolas.alvarez@soy.sena.edu.co` | No puede iniciar sesión |

## Seguridad implementada

- **Inicio de sesión**
  - Se entra con correo y contraseña.
  - Se emiten un access token JWT con expiración y un refresh token.
  - Todos los endpoints son privados, excepto `/auth/login` (y `/auth/refresh`, que exige un refresh token válido).
- **Contraseñas**
  - Se guardan con hash bcrypt y nunca se devuelven.
  - Deben tener mínimo 8 caracteres, con mayúscula, minúscula y número.
  - Tras **5 intentos fallidos** la cuenta se bloquea 15 minutos.
  - Cada usuario puede cambiar su propia contraseña.
- **Roles y permisos**
  - Hay 3 roles y el permiso se revisa en cada endpoint: **401** si no hay token o es inválido, **403** si el rol no tiene permiso.
  - Solo el administrador gestiona usuarios y roles.
  - Nadie puede cambiar su propio rol ni desactivar su propia cuenta.
  - Los usuarios inactivos no pueden entrar.
- **Configuración**
  - Los secretos van en `.env`, que no se sube al repositorio.
  - CORS solo acepta los orígenes autorizados.
- **Errores**
  - Todos tienen la misma estructura en español: `{"error": {"codigo", "mensaje", "detalles"}}`.
  - No se exponen trazas ni SQL.
- **Base de datos**
  - Esquema propio `sara`.
  - Rol `sara_api` sin DDL y con DELETE solo donde el negocio lo permite.
  - Borrado lógico en los registros que tienen movimientos.
  - Columnas de auditoría en todas las tablas: `creado_por`, `creado_en`, `actualizado_por`, `actualizado_en`.

## Endpoints principales (`/api/v1`)

| Módulo | Endpoints |
|---|---|
| Autenticación | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `PUT /auth/me/password` |
| Usuarios, roles y fichas | CRUD `/usuarios`, `PATCH /usuarios/{id}/estado`, `PATCH /usuarios/{id}/rol`, `GET /roles`, CRUD `/fichas` |
| Menú y precios | CRUD `/menus`, `POST /menus/{id}/publicar`, `GET /menus/hoy`, `/precios`, `GET /precios/vigentes` |
| Reservas y Nequi | `POST /reservas`, `GET /reservas/{id}/pago`, `POST /reservas/{id}/confirmar-pago`, `POST /reservas/{id}/cancelar` |
| Ingreso al comedor | `POST /ingresos/verificacion-facial`, `POST /ingresos/manual`, `POST /ingresos/{id}/salida`, `GET /ingresos/aforo`, `GET /ingresos` |
| Biometría | `POST /biometria`, `GET/DELETE /biometria/{usuario_id}` |
| Deudas | `GET /deudas`, `GET /deudas/mia`, `GET/POST /deudas/{instructor_id}/pagos` |
| Inventario | CRUD `/categorias`, CRUD `/productos`, `GET /productos/alertas`, `/movimientos` |
| Operación | CRUD `/visitantes`, `/observaciones` (más `responder` e `implementar`), CRUD `/control-produccion` |
| Reportes | `GET /reportes/resumen`, `GET /reportes/almuerzos-por-dia`, `GET /reportes/grupos` |

Todas las listas tienen paginación (`pagina`, `tamano`) y filtros. Swagger documenta en cada endpoint su descripción, parámetros, cuerpo, respuestas, códigos de estado y rol requerido.
