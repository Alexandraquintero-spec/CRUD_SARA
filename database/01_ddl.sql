-- =====================================================================
-- SARA · Sistema de Alimentación y Reservas del Aprendiz
-- 01_ddl.sql — Lenguaje de Definición de Datos (DDL)
-- Ejecutar conectado a bd_sara:
--   psql -U postgres -d bd_sara -f database/01_ddl.sql
--
-- Todas las tablas viven en el esquema propio "sara" (no en public).
-- Cada tabla tiene columnas de auditoría: creado_por, creado_en,
-- actualizado_por, actualizado_en.
-- =====================================================================

DROP SCHEMA IF EXISTS sara CASCADE;
CREATE SCHEMA sara;
COMMENT ON SCHEMA sara IS 'Esquema del sistema SARA';

SET search_path TO sara;

-- ---------------------------------------------------------------------
-- 1. ROL
-- ---------------------------------------------------------------------
CREATE TABLE rol (
    id              SMALLSERIAL  PRIMARY KEY,
    nombre          VARCHAR(30)  NOT NULL,
    descripcion     VARCHAR(200) NOT NULL,
    creado_por      INTEGER,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_por INTEGER,
    actualizado_en  TIMESTAMPTZ,
    CONSTRAINT uq_rol_nombre UNIQUE (nombre),
    CONSTRAINT ck_rol_nombre CHECK (nombre IN ('administrador', 'instructor', 'aprendiz'))
);
COMMENT ON TABLE rol IS 'Roles del sistema: administrador, instructor y aprendiz';

-- ---------------------------------------------------------------------
-- 2. USUARIO
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
    id                SERIAL       PRIMARY KEY,
    rol_id            SMALLINT     NOT NULL REFERENCES rol(id),
    nombre_completo   VARCHAR(120) NOT NULL,
    tipo_documento    VARCHAR(2)   NOT NULL,
    numero_documento  VARCHAR(15)  NOT NULL,
    correo            VARCHAR(120) NOT NULL,
    telefono          VARCHAR(10),
    contrasena_hash   VARCHAR(60)  NOT NULL,
    activo            BOOLEAN      NOT NULL DEFAULT TRUE,
    eliminado         BOOLEAN      NOT NULL DEFAULT FALSE,
    intentos_fallidos SMALLINT     NOT NULL DEFAULT 0,
    bloqueado_hasta   TIMESTAMPTZ,
    ultimo_acceso     TIMESTAMPTZ,
    creado_por        INTEGER      REFERENCES usuario(id),
    creado_en         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_por   INTEGER      REFERENCES usuario(id),
    actualizado_en    TIMESTAMPTZ,
    CONSTRAINT uq_usuario_documento UNIQUE (numero_documento),
    CONSTRAINT uq_usuario_correo UNIQUE (correo),
    CONSTRAINT ck_usuario_tipo_doc CHECK (tipo_documento IN ('CC', 'TI', 'CE', 'PP')),
    CONSTRAINT ck_usuario_num_doc CHECK (numero_documento ~ '^[0-9]{6,15}$'),
    CONSTRAINT ck_usuario_correo CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT ck_usuario_telefono CHECK (telefono IS NULL OR telefono ~ '^3[0-9]{9}$'),
    CONSTRAINT ck_usuario_intentos CHECK (intentos_fallidos >= 0)
);
COMMENT ON TABLE usuario IS 'Usuarios que acceden al sistema (registrados por el administrador)';
COMMENT ON COLUMN usuario.contrasena_hash IS 'Hash bcrypt; la contraseña nunca se guarda en texto plano';
COMMENT ON COLUMN usuario.bloqueado_hasta IS 'Bloqueo temporal tras 5 intentos fallidos de inicio de sesión';

ALTER TABLE rol ADD CONSTRAINT fk_rol_creado_por FOREIGN KEY (creado_por) REFERENCES usuario(id);
ALTER TABLE rol ADD CONSTRAINT fk_rol_actualizado_por FOREIGN KEY (actualizado_por) REFERENCES usuario(id);

CREATE INDEX ix_usuario_rol ON usuario(rol_id);
CREATE INDEX ix_usuario_activo ON usuario(activo) WHERE eliminado = FALSE;

-- ---------------------------------------------------------------------
-- 3. FICHA DE FORMACIÓN
-- ---------------------------------------------------------------------
CREATE TABLE ficha_formacion (
    id               SERIAL       PRIMARY KEY,
    numero           VARCHAR(10)  NOT NULL,
    programa         VARCHAR(150) NOT NULL,
    nivel            VARCHAR(15)  NOT NULL,
    jornada          VARCHAR(10)  NOT NULL,
    instructor_lider VARCHAR(120) NOT NULL,
    fecha_inicio     DATE         NOT NULL,
    fecha_fin        DATE         NOT NULL,
    activa           BOOLEAN      NOT NULL DEFAULT TRUE,
    eliminado        BOOLEAN      NOT NULL DEFAULT FALSE,
    creado_por       INTEGER      REFERENCES usuario(id),
    creado_en        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_por  INTEGER      REFERENCES usuario(id),
    actualizado_en   TIMESTAMPTZ,
    CONSTRAINT uq_ficha_numero UNIQUE (numero),
    CONSTRAINT ck_ficha_numero CHECK (numero ~ '^[0-9]{6,10}$'),
    CONSTRAINT ck_ficha_nivel CHECK (nivel IN ('Técnico', 'Tecnólogo')),
    CONSTRAINT ck_ficha_jornada CHECK (jornada IN ('mañana', 'tarde', 'noche', 'mixta')),
    CONSTRAINT ck_ficha_fechas CHECK (fecha_fin > fecha_inicio)
);
COMMENT ON TABLE ficha_formacion IS 'Fichas (grupos) de formación del Centro';

-- ---------------------------------------------------------------------
-- 4. APRENDIZ (extiende a usuario)
-- ---------------------------------------------------------------------
CREATE TABLE aprendiz (
    usuario_id          INTEGER     PRIMARY KEY REFERENCES usuario(id),
    ficha_id            INTEGER     NOT NULL REFERENCES ficha_formacion(id),
    tipo                VARCHAR(12) NOT NULL DEFAULT 'normal',
    alimentacion_activa BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_por          INTEGER     REFERENCES usuario(id),
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_por     INTEGER     REFERENCES usuario(id),
    actualizado_en      TIMESTAMPTZ,
    CONSTRAINT ck_aprendiz_tipo CHECK (tipo IN ('normal', 'beneficiario'))
);
COMMENT ON TABLE aprendiz IS 'Datos académicos del aprendiz; beneficiario = almuerzo sin costo';
CREATE INDEX ix_aprendiz_ficha ON aprendiz(ficha_id);

-- ---------------------------------------------------------------------
-- 5. MENÚ DEL DÍA y PLATOS
-- ---------------------------------------------------------------------
CREATE TABLE menu (
    id              SERIAL       PRIMARY KEY,
    fecha           DATE         NOT NULL,
    descripcion     VARCHAR(200),
    estado          VARCHAR(10)  NOT NULL DEFAULT 'borrador',
    publicado_en    TIMESTAMPTZ,
    creado_por      INTEGER      REFERENCES usuario(id),
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_por INTEGER      REFERENCES usuario(id),
    actualizado_en  TIMESTAMPTZ,
    CONSTRAINT ck_menu_estado CHECK (estado IN ('borrador', 'publicado', 'historico'))
);
COMMENT ON TABLE menu IS 'Menú del almuerzo por fecha; solo un menú publicado por día';
CREATE UNIQUE INDEX uq_menu_publicado_fecha ON menu(fecha) WHERE estado = 'publicado';
CREATE INDEX ix_menu_fecha ON menu(fecha);

CREATE TABLE plato_menu (
    id              SERIAL       PRIMARY KEY,
    menu_id         INTEGER      NOT NULL REFERENCES menu(id) ON DELETE CASCADE,
    categoria       VARCHAR(15)  NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    creado_por      INTEGER      REFERENCES usuario(id),
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_por INTEGER      REFERENCES usuario(id),
    actualizado_en  TIMESTAMPTZ,
    CONSTRAINT uq_plato_menu_categoria UNIQUE (menu_id, categoria),
    CONSTRAINT ck_plato_categoria CHECK (categoria IN ('sopa', 'plato_fuerte', 'acompanante', 'bebida'))
);
COMMENT ON TABLE plato_menu IS 'Componentes del menú: sopa, plato fuerte, acompañante y bebida';

-- ---------------------------------------------------------------------
-- 6. PRECIO
-- ---------------------------------------------------------------------
CREATE TABLE precio (
    id              SERIAL        PRIMARY KEY,
    tipo            VARCHAR(15)   NOT NULL,
    valor           NUMERIC(10,2) NOT NULL,
    vigente_desde   DATE          NOT NULL DEFAULT CURRENT_DATE,
    activo          BOOLEAN       NOT NULL DEFAULT TRUE,
    creado_por      INTEGER       REFERENCES usuario(id),
    creado_en       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    actualizado_por INTEGER       REFERENCES usuario(id),
    actualizado_en  TIMESTAMPTZ,
    CONSTRAINT ck_precio_tipo CHECK (tipo IN ('comunidad_sena', 'visitante')),
    CONSTRAINT ck_precio_valor CHECK (valor > 0)
);
COMMENT ON TABLE precio IS 'Precio del almuerzo por tipo de comensal; un único precio activo por tipo';
CREATE UNIQUE INDEX uq_precio_activo_tipo ON precio(tipo) WHERE activo = TRUE;

-- ---------------------------------------------------------------------
-- 7. RESERVA (pago con código QR dentro del sistema)
-- ---------------------------------------------------------------------
CREATE TABLE reserva (
    id              SERIAL        PRIMARY KEY,
    usuario_id      INTEGER       NOT NULL REFERENCES usuario(id),
    menu_id         INTEGER       NOT NULL REFERENCES menu(id),
    fecha           DATE          NOT NULL,
    valor           NUMERIC(10,2) NOT NULL,
    medio_pago      VARCHAR(25)   NOT NULL,
    referencia_pago VARCHAR(40)   NOT NULL,
    codigo_transaccion VARCHAR(30),
    estado          VARCHAR(15)   NOT NULL DEFAULT 'pendiente_pago',
    pagada_en       TIMESTAMPTZ,
    cancelada_en    TIMESTAMPTZ,
    creado_por      INTEGER       REFERENCES usuario(id),
    creado_en       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    actualizado_por INTEGER       REFERENCES usuario(id),
    actualizado_en  TIMESTAMPTZ,
    CONSTRAINT uq_reserva_referencia UNIQUE (referencia_pago),
    CONSTRAINT uq_reserva_transaccion UNIQUE (codigo_transaccion),
    CONSTRAINT ck_reserva_valor CHECK (valor >= 0),
    CONSTRAINT ck_reserva_medio CHECK (medio_pago IN ('qr', 'sin_costo', 'cuenta_institucional')),
    CONSTRAINT ck_reserva_estado CHECK (estado IN ('pendiente_pago', 'confirmada', 'cancelada', 'consumida', 'no_consumida')),
    CONSTRAINT ck_reserva_pago CHECK (estado <> 'confirmada' OR pagada_en IS NOT NULL OR medio_pago = 'cuenta_institucional')
);
COMMENT ON TABLE reserva IS 'Reserva diaria del almuerzo (7:00-9:00 a. m.); el pago se hace con el código QR que muestra el sistema';
CREATE UNIQUE INDEX uq_reserva_usuario_fecha ON reserva(usuario_id, fecha) WHERE estado <> 'cancelada';
CREATE INDEX ix_reserva_fecha_estado ON reserva(fecha, estado);

-- ---------------------------------------------------------------------
-- 8. PAGO DE DEUDA (instructores con cuenta institucional)
-- ---------------------------------------------------------------------
CREATE TABLE pago_deuda (
    id              SERIAL        PRIMARY KEY,
    instructor_id   INTEGER       NOT NULL REFERENCES usuario(id),
    valor           NUMERIC(10,2) NOT NULL,
    medio_pago      VARCHAR(15)   NOT NULL DEFAULT 'qr',
    observacion     VARCHAR(200),
    creado_por      INTEGER       REFERENCES usuario(id),
    creado_en       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    actualizado_por INTEGER       REFERENCES usuario(id),
    actualizado_en  TIMESTAMPTZ,
    CONSTRAINT ck_pago_deuda_valor CHECK (valor > 0),
    CONSTRAINT ck_pago_deuda_medio CHECK (medio_pago IN ('qr', 'efectivo', 'transferencia'))
);
COMMENT ON TABLE pago_deuda IS 'Abonos de instructores a la deuda de almuerzos tomados a cuenta institucional';
CREATE INDEX ix_pago_deuda_instructor ON pago_deuda(instructor_id);

-- ---------------------------------------------------------------------
-- 9. PLANTILLA BIOMÉTRICA (reconocimiento facial)
-- ---------------------------------------------------------------------
CREATE TABLE plantilla_biometrica (
    id                   SERIAL      PRIMARY KEY,
    usuario_id           INTEGER     NOT NULL REFERENCES usuario(id),
    vector_cifrado       TEXT        NOT NULL,
    autorizacion_firmada BOOLEAN     NOT NULL,
    fecha_autorizacion   DATE        NOT NULL DEFAULT CURRENT_DATE,
    creado_por           INTEGER     REFERENCES usuario(id),
    creado_en            TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_por      INTEGER     REFERENCES usuario(id),
    actualizado_en       TIMESTAMPTZ,
    CONSTRAINT uq_plantilla_usuario UNIQUE (usuario_id),
    CONSTRAINT ck_plantilla_autorizacion CHECK (autorizacion_firmada = TRUE)
);
COMMENT ON TABLE plantilla_biometrica IS 'Plantilla facial cifrada (no se guarda la foto). Requiere autorización firmada (Ley 1581 de 2012)';

-- ---------------------------------------------------------------------
-- 10. REGISTRO DE INGRESO AL COMEDOR
-- ---------------------------------------------------------------------
CREATE TABLE registro_ingreso (
    id                 SERIAL       PRIMARY KEY,
    usuario_id         INTEGER      REFERENCES usuario(id),
    reserva_id         INTEGER      REFERENCES reserva(id),
    fecha              DATE         NOT NULL DEFAULT CURRENT_DATE,
    hora_ingreso       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    hora_salida        TIMESTAMPTZ,
    metodo             VARCHAR(10)  NOT NULL,
    resultado          VARCHAR(10)  NOT NULL,
    motivo             VARCHAR(200) NOT NULL,
    similitud          NUMERIC(5,2),
    receptor_nombre    VARCHAR(120),
    receptor_documento VARCHAR(15),
    creado_por         INTEGER      REFERENCES usuario(id),
    creado_en          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_por    INTEGER      REFERENCES usuario(id),
    actualizado_en     TIMESTAMPTZ,
    CONSTRAINT ck_ingreso_metodo CHECK (metodo IN ('facial', 'manual')),
    CONSTRAINT ck_ingreso_resultado CHECK (resultado IN ('permitido', 'denegado')),
    CONSTRAINT ck_ingreso_similitud CHECK (similitud IS NULL OR similitud BETWEEN 0 AND 100),
    CONSTRAINT ck_ingreso_salida CHECK (hora_salida IS NULL OR hora_salida >= hora_ingreso),
    CONSTRAINT ck_ingreso_receptor_doc CHECK (receptor_documento IS NULL OR receptor_documento ~ '^[0-9]{6,15}$'),
    CONSTRAINT ck_ingreso_manual CHECK (metodo <> 'manual' OR receptor_nombre IS NOT NULL)
);
COMMENT ON TABLE registro_ingreso IS 'Bitácora de ingresos: verde (permitido) / rojo (denegado con motivo). Manual = almuerzo cedido autorizado por el administrador';
CREATE INDEX ix_ingreso_fecha ON registro_ingreso(fecha, resultado);
CREATE INDEX ix_ingreso_usuario ON registro_ingreso(usuario_id);

-- ---------------------------------------------------------------------
-- 11. INVENTARIO
-- ---------------------------------------------------------------------
CREATE TABLE categoria_producto (
    id              SERIAL       PRIMARY KEY,
    nombre          VARCHAR(60)  NOT NULL,
    descripcion     VARCHAR(200),
    activa          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_por      INTEGER      REFERENCES usuario(id),
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_por INTEGER      REFERENCES usuario(id),
    actualizado_en  TIMESTAMPTZ,
    CONSTRAINT uq_categoria_nombre UNIQUE (nombre)
);
COMMENT ON TABLE categoria_producto IS 'Categorías de insumos (granos, cárnicos, lácteos, etc.)';

CREATE TABLE producto (
    id                SERIAL        PRIMARY KEY,
    categoria_id      INTEGER       NOT NULL REFERENCES categoria_producto(id),
    codigo            VARCHAR(20)   NOT NULL,
    nombre            VARCHAR(100)  NOT NULL,
    unidad_medida     VARCHAR(10)   NOT NULL,
    origen            VARCHAR(15)   NOT NULL,
    cantidad          NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_minimo      NUMERIC(12,2) NOT NULL DEFAULT 0,
    fecha_vencimiento DATE,
    activo            BOOLEAN       NOT NULL DEFAULT TRUE,
    eliminado         BOOLEAN       NOT NULL DEFAULT FALSE,
    creado_por        INTEGER       REFERENCES usuario(id),
    creado_en         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    actualizado_por   INTEGER       REFERENCES usuario(id),
    actualizado_en    TIMESTAMPTZ,
    CONSTRAINT uq_producto_codigo UNIQUE (codigo),
    CONSTRAINT ck_producto_unidad CHECK (unidad_medida IN ('kg', 'g', 'l', 'ml', 'unidad', 'paquete')),
    CONSTRAINT ck_producto_origen CHECK (origen IN ('proveedor', 'insumo_sena')),
    CONSTRAINT ck_producto_cantidad CHECK (cantidad >= 0),
    CONSTRAINT ck_producto_stock_min CHECK (stock_minimo >= 0)
);
COMMENT ON TABLE producto IS 'Insumos de cocina; borrado lógico cuando tiene movimientos';
CREATE INDEX ix_producto_categoria ON producto(categoria_id);
CREATE INDEX ix_producto_vencimiento ON producto(fecha_vencimiento) WHERE eliminado = FALSE;

CREATE TABLE movimiento_inventario (
    id                  SERIAL        PRIMARY KEY,
    producto_id         INTEGER       NOT NULL REFERENCES producto(id),
    tipo                VARCHAR(10)   NOT NULL,
    cantidad            NUMERIC(12,2) NOT NULL,
    cantidad_resultante NUMERIC(12,2) NOT NULL,
    motivo              VARCHAR(200)  NOT NULL,
    creado_por          INTEGER       REFERENCES usuario(id),
    creado_en           TIMESTAMPTZ   NOT NULL DEFAULT now(),
    actualizado_por     INTEGER       REFERENCES usuario(id),
    actualizado_en      TIMESTAMPTZ,
    CONSTRAINT ck_mov_tipo CHECK (tipo IN ('entrada', 'salida', 'merma', 'ajuste')),
    CONSTRAINT ck_mov_cantidad CHECK (cantidad > 0),
    CONSTRAINT ck_mov_resultante CHECK (cantidad_resultante >= 0)
);
COMMENT ON TABLE movimiento_inventario IS 'Entradas, salidas, mermas y ajustes; el stock nunca queda negativo';
CREATE INDEX ix_mov_producto_fecha ON movimiento_inventario(producto_id, creado_en);

-- ---------------------------------------------------------------------
-- 12. VISITANTE
-- ---------------------------------------------------------------------
CREATE TABLE visitante (
    id               SERIAL        PRIMARY KEY,
    nombre_completo  VARCHAR(120)  NOT NULL,
    tipo_documento   VARCHAR(2)    NOT NULL,
    numero_documento VARCHAR(15)   NOT NULL,
    entidad          VARCHAR(120),
    fecha            DATE          NOT NULL DEFAULT CURRENT_DATE,
    valor_pagado     NUMERIC(10,2) NOT NULL,
    creado_por       INTEGER       REFERENCES usuario(id),
    creado_en        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    actualizado_por  INTEGER       REFERENCES usuario(id),
    actualizado_en   TIMESTAMPTZ,
    CONSTRAINT ck_visitante_tipo_doc CHECK (tipo_documento IN ('CC', 'TI', 'CE', 'PP')),
    CONSTRAINT ck_visitante_num_doc CHECK (numero_documento ~ '^[0-9]{6,15}$'),
    CONSTRAINT ck_visitante_valor CHECK (valor_pagado > 0)
);
COMMENT ON TABLE visitante IS 'Personas externas que almuerzan pagando la tarifa de visitante';
CREATE INDEX ix_visitante_fecha ON visitante(fecha);

-- ---------------------------------------------------------------------
-- 13. OBSERVACIÓN (buzón de sugerencias)
-- ---------------------------------------------------------------------
CREATE TABLE observacion (
    id               SERIAL       PRIMARY KEY,
    usuario_id       INTEGER      NOT NULL REFERENCES usuario(id),
    categoria        VARCHAR(15)  NOT NULL,
    descripcion      VARCHAR(500) NOT NULL,
    estado           VARCHAR(12)  NOT NULL DEFAULT 'nueva',
    respuesta        VARCHAR(500),
    respondida_en    TIMESTAMPTZ,
    creado_por       INTEGER      REFERENCES usuario(id),
    creado_en        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_por  INTEGER      REFERENCES usuario(id),
    actualizado_en   TIMESTAMPTZ,
    CONSTRAINT ck_obs_categoria CHECK (categoria IN ('menu', 'servicio', 'instalaciones', 'horario', 'otro')),
    CONSTRAINT ck_obs_estado CHECK (estado IN ('nueva', 'revisada', 'implementada')),
    CONSTRAINT ck_obs_descripcion CHECK (char_length(descripcion) >= 10)
);
COMMENT ON TABLE observacion IS 'Sugerencias y observaciones de los comensales sobre el servicio';
CREATE INDEX ix_obs_estado ON observacion(estado);

-- ---------------------------------------------------------------------
-- 14. CONTROL DE PRODUCCIÓN DIARIA
-- ---------------------------------------------------------------------
CREATE TABLE control_produccion (
    id                    SERIAL       PRIMARY KEY,
    fecha                 DATE         NOT NULL,
    almuerzos_preparados  INTEGER      NOT NULL,
    almuerzos_entregados  INTEGER      NOT NULL DEFAULT 0,
    observaciones         VARCHAR(300),
    creado_por            INTEGER      REFERENCES usuario(id),
    creado_en             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_por       INTEGER      REFERENCES usuario(id),
    actualizado_en        TIMESTAMPTZ,
    CONSTRAINT uq_produccion_fecha UNIQUE (fecha),
    CONSTRAINT ck_produccion_preparados CHECK (almuerzos_preparados > 0),
    CONSTRAINT ck_produccion_entregados CHECK (almuerzos_entregados >= 0 AND almuerzos_entregados <= almuerzos_preparados)
);
COMMENT ON TABLE control_produccion IS 'Almuerzos preparados vs. entregados por día (control de desperdicio)';
