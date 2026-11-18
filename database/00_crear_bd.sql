-- =====================================================================
-- SARA · Sistema de Alimentación y Reservas del Aprendiz
-- 00_crear_bd.sql — Creación de la base de datos
-- Ejecutar conectado a la base "postgres" con un superusuario:
--   psql -U postgres -f database/00_crear_bd.sql
-- =====================================================================

DROP DATABASE IF EXISTS bd_sara;

CREATE DATABASE bd_sara
    WITH ENCODING = 'UTF8'
         TEMPLATE = template0
         LC_COLLATE = 'C'
         LC_CTYPE = 'C';

COMMENT ON DATABASE bd_sara IS 'SARA - Sistema de Alimentación y Reservas del Aprendiz (Gastronomía SENA)';
