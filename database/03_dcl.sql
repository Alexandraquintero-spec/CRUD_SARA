-- =====================================================================
-- SARA · Sistema de Alimentación y Reservas del Aprendiz
-- 03_dcl.sql — Lenguaje de Control de Datos (DCL)
-- Ejecutar conectado a bd_sara con un superusuario:
--   psql -U postgres -d bd_sara -v clave_api=SuClaveSegura -f database/03_dcl.sql
--
-- Crea el rol "sara_api", con el que se conecta la API. Es diferente de
-- "postgres" y solo tiene los privilegios mínimos:
--   * Puede conectarse a bd_sara y usar el esquema sara.
--   * SELECT, INSERT, UPDATE en las tablas del negocio.
--   * DELETE solo donde la API hace borrado físico controlado.
--   * NO puede crear, alterar ni borrar tablas (sin DDL), ni crear
--     roles o bases de datos, ni es superusuario.
--   * Rol "sara_lectura" opcional para consultas/reportes (solo SELECT).
-- =====================================================================

\if :{?clave_api}
\else
    \echo 'AVISO: no se indicó clave_api; se usa la clave de ejemplo Sara_Api_2026 (cámbiela).'
    \set clave_api Sara_Api_2026
\endif

-- 1. Roles de base de datos -------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sara_api') THEN
        CREATE ROLE sara_api LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sara_lectura') THEN
        CREATE ROLE sara_lectura NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;
END
$$;

ALTER ROLE sara_api WITH PASSWORD :'clave_api';
ALTER ROLE sara_api CONNECTION LIMIT 20;
ALTER ROLE sara_api SET search_path = sara;
COMMENT ON ROLE sara_api IS 'Usuario de aplicación de la API SARA (mínimos privilegios)';

-- 2. Quitar privilegios por defecto -----------------------------------
REVOKE ALL ON DATABASE bd_sara FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA sara FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA sara FROM sara_api, sara_lectura;

-- 3. Conexión y uso del esquema ---------------------------------------
GRANT CONNECT ON DATABASE bd_sara TO sara_api, sara_lectura;
GRANT USAGE ON SCHEMA sara TO sara_api, sara_lectura;

-- 4. Privilegios sobre tablas -----------------------------------------
-- Lectura de catálogos (la API no modifica los roles)
GRANT SELECT ON sara.rol TO sara_api;

-- Lectura y escritura sin borrado físico (se usa borrado lógico)
GRANT SELECT, INSERT, UPDATE ON
    sara.usuario,
    sara.aprendiz,
    sara.ficha_formacion,
    sara.reserva,
    sara.pago_deuda,
    sara.registro_ingreso,
    sara.producto,
    sara.movimiento_inventario,
    sara.categoria_producto,
    sara.menu,
    sara.precio,
    sara.visitante,
    sara.observacion,
    sara.control_produccion,
    sara.plato_menu,
    sara.plantilla_biometrica
TO sara_api;

-- Borrado físico controlado: solo donde la regla de negocio lo permite
GRANT DELETE ON
    sara.ficha_formacion,       -- fichas sin aprendices
    sara.menu,                  -- menús sin reservas
    sara.plato_menu,            -- reemplazo de platos de un menú en borrador
    sara.precio,                -- precios inactivos del historial
    sara.producto,              -- productos sin movimientos
    sara.categoria_producto,    -- categorías sin productos
    sara.visitante,             -- anulación de registros del día
    sara.observacion,           -- observaciones nuevas
    sara.control_produccion,
    sara.plantilla_biometrica   -- derecho de supresión (Ley 1581)
TO sara_api;

-- Secuencias para los SERIAL
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sara TO sara_api;

-- Rol de solo lectura para reportes
GRANT SELECT ON ALL TABLES IN SCHEMA sara TO sara_lectura;

-- 5. Verificación ----------------------------------------------------
SELECT grantee, table_name, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privilegios
FROM information_schema.role_table_grants
WHERE table_schema = 'sara' AND grantee = 'sara_api'
GROUP BY grantee, table_name
ORDER BY table_name;
