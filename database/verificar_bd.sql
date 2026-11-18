-- =====================================================================
-- SARA · Verificación de la base de datos
-- Cuenta los registros de cada tabla del esquema sara después de
-- ejecutar 00_crear_bd.sql, 01_ddl.sql, 02_dml.sql y 03_dcl.sql:
--   psql -U postgres -d bd_sara -f database/verificar_bd.sql
-- =====================================================================

SELECT 'rol' AS tabla, count(*) AS registros FROM sara.rol
UNION ALL SELECT 'usuario', count(*) FROM sara.usuario
UNION ALL SELECT 'ficha_formacion', count(*) FROM sara.ficha_formacion
UNION ALL SELECT 'aprendiz', count(*) FROM sara.aprendiz
UNION ALL SELECT 'menu', count(*) FROM sara.menu
UNION ALL SELECT 'plato_menu', count(*) FROM sara.plato_menu
UNION ALL SELECT 'precio', count(*) FROM sara.precio
UNION ALL SELECT 'reserva', count(*) FROM sara.reserva
UNION ALL SELECT 'pago_deuda', count(*) FROM sara.pago_deuda
UNION ALL SELECT 'plantilla_biometrica', count(*) FROM sara.plantilla_biometrica
UNION ALL SELECT 'registro_ingreso', count(*) FROM sara.registro_ingreso
UNION ALL SELECT 'categoria_producto', count(*) FROM sara.categoria_producto
UNION ALL SELECT 'producto', count(*) FROM sara.producto
UNION ALL SELECT 'movimiento_inventario', count(*) FROM sara.movimiento_inventario
UNION ALL SELECT 'visitante', count(*) FROM sara.visitante
UNION ALL SELECT 'observacion', count(*) FROM sara.observacion
UNION ALL SELECT 'control_produccion', count(*) FROM sara.control_produccion;
