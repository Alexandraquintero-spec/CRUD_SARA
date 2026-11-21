-- =====================================================================
-- SARA · Sistema de Alimentación y Reservas del Aprendiz
-- 02_dml.sql — Lenguaje de Manipulación de Datos (datos de prueba)
-- Ejecutar conectado a bd_sara después de 01_ddl.sql:
--   psql -U postgres -d bd_sara -f database/02_dml.sql
--
-- Las fechas son relativas a CURRENT_DATE para que siempre exista el
-- menú publicado de hoy y un historial de los 9 días anteriores.
-- Contraseña de TODOS los usuarios de prueba: Sara2026*
-- (se guarda solo el hash bcrypt).
-- Las plantillas faciales están cifradas con la CLAVE_BIOMETRIA de
-- demostración que aparece en .env.example.
-- =====================================================================

SET search_path TO sara;
BEGIN;

-- Roles
INSERT INTO rol (id, nombre, descripcion) VALUES
    (1, 'administrador', 'Gestiona usuarios, menú, precios, inventario, ingresos y reportes'),
    (2, 'instructor', 'Reserva almuerzo (Nequi o cuenta institucional) y apoya el inventario de cocina'),
    (3, 'aprendiz', 'Reserva su almuerzo, paga con el QR de Nequi e ingresa por reconocimiento facial');

-- Usuarios (contraseña de prueba: Sara2026*)
INSERT INTO usuario (id, rol_id, nombre_completo, tipo_documento, numero_documento, correo, telefono, contrasena_hash, activo, creado_por) VALUES
    (1, 1, 'Alexandra Quintero Ríos', 'CC', '1004567123', 'admin@sara.edu.co', '3104567123', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, NULL),
    (2, 1, 'Mauricio Herrera Lozano', 'CC', '79845123', 'coordinacion@sara.edu.co', '3157845123', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (3, 2, 'Carlos Andrés Mejía', 'CC', '80123456', 'instructor@sara.edu.co', '3001234567', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (4, 2, 'Diana Patricia Rojas', 'CC', '52987654', 'diana.rojas@sara.edu.co', '3012345678', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (5, 2, 'Jorge Iván Castaño', 'CC', '71234890', 'jorge.castano@sara.edu.co', '3023456789', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (6, 2, 'Luz Marina Ospina', 'CC', '43567812', 'luz.ospina@sara.edu.co', '3134567890', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (7, 3, 'Yeimy Quintero Suárez', 'TI', '1023456781', 'aprendiz@sara.edu.co', '3201234567', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (8, 3, 'Santiago Gómez Ruiz', 'CC', '1023456782', 'santiago.gomez@soy.sena.edu.co', '3202345678', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (9, 3, 'Valentina López Mora', 'CC', '1023456783', 'valentina.lopez@soy.sena.edu.co', '3203456789', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (10, 3, 'Juan David Pérez', 'TI', '1023456784', 'juan.perez@soy.sena.edu.co', '3204567890', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (11, 3, 'María José Cárdenas', 'CC', '1023456785', 'maria.cardenas@soy.sena.edu.co', '3205678901', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (12, 3, 'Andrés Felipe Torres', 'CC', '1023456786', 'andres.torres@soy.sena.edu.co', '3206789012', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (13, 3, 'Laura Sofía Ramírez', 'TI', '1023456787', 'laura.ramirez@soy.sena.edu.co', '3207890123', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (14, 3, 'Camilo Ernesto Vargas', 'CC', '1023456788', 'camilo.vargas@soy.sena.edu.co', '3208901234', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (15, 3, 'Daniela Restrepo Gil', 'CC', '1023456789', 'daniela.restrepo@soy.sena.edu.co', '3209012345', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (16, 3, 'Sebastián Muñoz Arias', 'TI', '1023456790', 'sebastian.munoz@soy.sena.edu.co', '3100123456', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (17, 3, 'Isabella Moreno Díaz', 'CC', '1023456791', 'isabella.moreno@soy.sena.edu.co', '3111234567', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (18, 3, 'Mateo Hernández Cruz', 'CC', '1023456792', 'mateo.hernandez@soy.sena.edu.co', '3122345678', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (19, 3, 'Sara Lucía Jiménez', 'TI', '1023456793', 'sara.jimenez@soy.sena.edu.co', '3133456789', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', TRUE, 1),
    (20, 3, 'Nicolás Álvarez Peña', 'CC', '1023456794', 'nicolas.alvarez@soy.sena.edu.co', '3144567890', '$2b$12$0EWDbnF74W8ptWRr1UtZHOiBdBYpawMFNEqfYwtsdUlmRNmWHJeEK', FALSE, 1);

UPDATE rol SET creado_por = 1;

-- Fichas de formación (la 10 está finalizada/inactiva)
INSERT INTO ficha_formacion (id, numero, programa, nivel, jornada, instructor_lider, fecha_inicio, fecha_fin, activa, creado_por) VALUES
    (1, '2879453', 'Cocina', 'Técnico', 'mañana', 'Carlos Andrés Mejía', CURRENT_DATE - 200, CURRENT_DATE + 365, TRUE, 1),
    (2, '2879454', 'Gastronomía', 'Tecnólogo', 'mañana', 'Diana Patricia Rojas', CURRENT_DATE - 200, CURRENT_DATE + 365, TRUE, 1),
    (3, '2879455', 'Panadería', 'Técnico', 'tarde', 'Jorge Iván Castaño', CURRENT_DATE - 200, CURRENT_DATE + 365, TRUE, 1),
    (4, '2879456', 'Pastelería', 'Técnico', 'mañana', 'Luz Marina Ospina', CURRENT_DATE - 200, CURRENT_DATE + 365, TRUE, 1),
    (5, '3312744', 'Análisis y Desarrollo de Software', 'Tecnólogo', 'mixta', 'Carlos Andrés Mejía', CURRENT_DATE - 200, CURRENT_DATE + 365, TRUE, 1),
    (6, '2879457', 'Mesa y Bar', 'Técnico', 'tarde', 'Diana Patricia Rojas', CURRENT_DATE - 200, CURRENT_DATE + 365, TRUE, 1),
    (7, '2879458', 'Cocina', 'Técnico', 'tarde', 'Jorge Iván Castaño', CURRENT_DATE - 200, CURRENT_DATE + 365, TRUE, 1),
    (8, '2879459', 'Gastronomía', 'Tecnólogo', 'mixta', 'Luz Marina Ospina', CURRENT_DATE - 200, CURRENT_DATE + 365, TRUE, 1),
    (9, '2879460', 'Servicios de Barismo', 'Técnico', 'mañana', 'Carlos Andrés Mejía', CURRENT_DATE - 200, CURRENT_DATE + 365, TRUE, 1),
    (10, '2654321', 'Cocina', 'Técnico', 'mañana', 'Diana Patricia Rojas', CURRENT_DATE - 700, CURRENT_DATE - 30, FALSE, 1);

-- Aprendices (9, 13 y 17 son beneficiarios: almuerzo sin costo; 19 con alimentación deshabilitada)
INSERT INTO aprendiz (usuario_id, ficha_id, tipo, alimentacion_activa, creado_por) VALUES
    (7, 5, 'normal', TRUE, 1),
    (8, 1, 'normal', TRUE, 1),
    (9, 2, 'beneficiario', TRUE, 1),
    (10, 3, 'normal', TRUE, 1),
    (11, 4, 'normal', TRUE, 1),
    (12, 1, 'normal', TRUE, 1),
    (13, 2, 'beneficiario', TRUE, 1),
    (14, 6, 'normal', TRUE, 1),
    (15, 7, 'normal', TRUE, 1),
    (16, 8, 'normal', TRUE, 1),
    (17, 9, 'beneficiario', TRUE, 1),
    (18, 5, 'normal', TRUE, 1),
    (19, 1, 'normal', FALSE, 1),
    (20, 10, 'normal', TRUE, 1);

-- Menús publicados: 9 días anteriores y el de hoy (id 10)
INSERT INTO menu (id, fecha, descripcion, estado, publicado_en, creado_por) VALUES
    (1, CURRENT_DATE - 9, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 9) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1),
    (2, CURRENT_DATE - 8, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 8) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1),
    (3, CURRENT_DATE - 7, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 7) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1),
    (4, CURRENT_DATE - 6, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 6) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1),
    (5, CURRENT_DATE - 5, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 5) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1),
    (6, CURRENT_DATE - 4, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 4) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1),
    (7, CURRENT_DATE - 3, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 3) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1),
    (8, CURRENT_DATE - 2, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 2) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1),
    (9, CURRENT_DATE - 1, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 1) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1),
    (10, CURRENT_DATE, 'Almuerzo del día', 'publicado', ((CURRENT_DATE - 0) + TIME '06:30') AT TIME ZONE 'America/Bogota', 1);

INSERT INTO plato_menu (id, menu_id, categoria, nombre, creado_por) VALUES
    (1, 1, 'sopa', 'Sancocho de gallina', 1),
    (2, 1, 'plato_fuerte', 'Pechuga a la plancha', 1),
    (3, 1, 'acompanante', 'Arroz y ensalada fresca', 1),
    (4, 1, 'bebida', 'Jugo de mora', 1),
    (5, 2, 'sopa', 'Crema de ahuyama', 1),
    (6, 2, 'plato_fuerte', 'Sobrebarriga en salsa criolla', 1),
    (7, 2, 'acompanante', 'Papa salada y arroz', 1),
    (8, 2, 'bebida', 'Limonada natural', 1),
    (9, 3, 'sopa', 'Sopa de pasta', 1),
    (10, 3, 'plato_fuerte', 'Pollo sudado', 1),
    (11, 3, 'acompanante', 'Arroz y tajadas de maduro', 1),
    (12, 3, 'bebida', 'Jugo de guayaba', 1),
    (13, 4, 'sopa', 'Ajiaco santafereño', 1),
    (14, 4, 'plato_fuerte', 'Carne asada', 1),
    (15, 4, 'acompanante', 'Arroz y aguacate', 1),
    (16, 4, 'bebida', 'Agua de panela con limón', 1),
    (17, 5, 'sopa', 'Crema de tomate', 1),
    (18, 5, 'plato_fuerte', 'Cerdo en salsa BBQ', 1),
    (19, 5, 'acompanante', 'Puré de papa', 1),
    (20, 5, 'bebida', 'Jugo de lulo', 1),
    (21, 6, 'sopa', 'Sopa de lentejas', 1),
    (22, 6, 'plato_fuerte', 'Filete de tilapia', 1),
    (23, 6, 'acompanante', 'Arroz con coco y patacón', 1),
    (24, 6, 'bebida', 'Limonada de panela', 1),
    (25, 7, 'sopa', 'Mondongo', 1),
    (26, 7, 'plato_fuerte', 'Albóndigas en salsa', 1),
    (27, 7, 'acompanante', 'Arroz y ensalada de repollo', 1),
    (28, 7, 'bebida', 'Jugo de maracuyá', 1),
    (29, 8, 'sopa', 'Crema de champiñones', 1),
    (30, 8, 'plato_fuerte', 'Pollo al horno', 1),
    (31, 8, 'acompanante', 'Arroz y verduras salteadas', 1),
    (32, 8, 'bebida', 'Jugo de piña', 1),
    (33, 9, 'sopa', 'Sopa de arroz', 1),
    (34, 9, 'plato_fuerte', 'Lomo de cerdo', 1),
    (35, 9, 'acompanante', 'Papa criolla y ensalada', 1),
    (36, 9, 'bebida', 'Jugo de fresa', 1),
    (37, 10, 'sopa', 'Sancocho trifásico', 1),
    (38, 10, 'plato_fuerte', 'Pechuga gratinada', 1),
    (39, 10, 'acompanante', 'Arroz y ensalada de la casa', 1),
    (40, 10, 'bebida', 'Jugo de mango', 1);

INSERT INTO menu (id, fecha, descripcion, estado, creado_por) VALUES
    (11, CURRENT_DATE - -1, 'Borrador del menú de mañana', 'borrador', 1);

INSERT INTO plato_menu (id, menu_id, categoria, nombre, creado_por) VALUES
    (41, 11, 'sopa', 'Crema de espinaca', 1),
    (42, 11, 'plato_fuerte', 'Pollo en salsa de champiñones', 1),
    (43, 11, 'acompanante', 'Arroz blanco y ensalada', 1),
    (44, 11, 'bebida', 'Jugo de tomate de árbol', 1);

-- Precios: historial; vigentes $5.000 comunidad SENA y $8.000 visitante
INSERT INTO precio (id, tipo, valor, vigente_desde, activo, creado_por) VALUES
    (1, 'comunidad_sena', 3500, CURRENT_DATE - 720, FALSE, 1),
    (2, 'visitante', 5000, CURRENT_DATE - 720, FALSE, 1),
    (3, 'comunidad_sena', 4000, CURRENT_DATE - 540, FALSE, 1),
    (4, 'visitante', 6000, CURRENT_DATE - 540, FALSE, 1),
    (5, 'comunidad_sena', 4500, CURRENT_DATE - 360, FALSE, 1),
    (6, 'visitante', 7000, CURRENT_DATE - 360, FALSE, 1),
    (7, 'comunidad_sena', 4800, CURRENT_DATE - 180, FALSE, 1),
    (8, 'visitante', 7500, CURRENT_DATE - 180, FALSE, 1),
    (9, 'comunidad_sena', 5000, CURRENT_DATE - 0, TRUE, 1),
    (10, 'visitante', 8000, CURRENT_DATE - 0, TRUE, 1);

-- Reservas: historial de 9 días + reservas de hoy
INSERT INTO reserva (id, usuario_id, menu_id, fecha, valor, medio_pago, referencia_pago, codigo_transaccion, estado, pagada_en, cancelada_en, creado_por) VALUES
    (1, 8, 1, CURRENT_DATE - 9, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 9, 'YYYYMMDD') || '-0001', 'M0000001', 'consumida', ((CURRENT_DATE - 9) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 8),
    (2, 9, 1, CURRENT_DATE - 9, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 9, 'YYYYMMDD') || '-0002', NULL, 'consumida', ((CURRENT_DATE - 9) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 9),
    (3, 10, 1, CURRENT_DATE - 9, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 9, 'YYYYMMDD') || '-0003', 'M0000003', 'consumida', ((CURRENT_DATE - 9) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 10),
    (4, 11, 1, CURRENT_DATE - 9, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 9, 'YYYYMMDD') || '-0004', 'M0000004', 'no_consumida', ((CURRENT_DATE - 9) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 11),
    (5, 12, 1, CURRENT_DATE - 9, 5000, 'nequi', 'SARA-12-' || to_char(CURRENT_DATE - 9, 'YYYYMMDD') || '-0005', 'M0000005', 'consumida', ((CURRENT_DATE - 9) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 12),
    (6, 13, 1, CURRENT_DATE - 9, 0, 'sin_costo', 'SARA-13-' || to_char(CURRENT_DATE - 9, 'YYYYMMDD') || '-0006', NULL, 'consumida', ((CURRENT_DATE - 9) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 13),
    (7, 3, 1, CURRENT_DATE - 9, 5000, 'cuenta_institucional', 'SARA-3-' || to_char(CURRENT_DATE - 9, 'YYYYMMDD') || '-0007', NULL, 'consumida', NULL, NULL, 3),
    (8, 4, 1, CURRENT_DATE - 9, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 9, 'YYYYMMDD') || '-0008', NULL, 'consumida', NULL, NULL, 4),
    (9, 8, 2, CURRENT_DATE - 8, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 8, 'YYYYMMDD') || '-0009', 'M0000009', 'consumida', ((CURRENT_DATE - 8) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 8),
    (10, 9, 2, CURRENT_DATE - 8, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 8, 'YYYYMMDD') || '-000A', NULL, 'consumida', ((CURRENT_DATE - 8) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 9),
    (11, 10, 2, CURRENT_DATE - 8, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 8, 'YYYYMMDD') || '-000B', 'M0000011', 'consumida', ((CURRENT_DATE - 8) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 10),
    (12, 11, 2, CURRENT_DATE - 8, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 8, 'YYYYMMDD') || '-000C', 'M0000012', 'consumida', ((CURRENT_DATE - 8) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 11),
    (13, 12, 2, CURRENT_DATE - 8, 5000, 'nequi', 'SARA-12-' || to_char(CURRENT_DATE - 8, 'YYYYMMDD') || '-000D', 'M0000013', 'no_consumida', ((CURRENT_DATE - 8) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 12),
    (14, 13, 2, CURRENT_DATE - 8, 0, 'sin_costo', 'SARA-13-' || to_char(CURRENT_DATE - 8, 'YYYYMMDD') || '-000E', NULL, 'consumida', ((CURRENT_DATE - 8) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 13),
    (15, 3, 2, CURRENT_DATE - 8, 5000, 'cuenta_institucional', 'SARA-3-' || to_char(CURRENT_DATE - 8, 'YYYYMMDD') || '-000F', NULL, 'consumida', NULL, NULL, 3),
    (16, 4, 2, CURRENT_DATE - 8, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 8, 'YYYYMMDD') || '-0010', NULL, 'consumida', NULL, NULL, 4),
    (17, 8, 3, CURRENT_DATE - 7, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 7, 'YYYYMMDD') || '-0011', 'M0000017', 'no_consumida', ((CURRENT_DATE - 7) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 8),
    (18, 9, 3, CURRENT_DATE - 7, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 7, 'YYYYMMDD') || '-0012', NULL, 'consumida', ((CURRENT_DATE - 7) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 9),
    (19, 10, 3, CURRENT_DATE - 7, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 7, 'YYYYMMDD') || '-0013', 'M0000019', 'consumida', ((CURRENT_DATE - 7) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 10),
    (20, 11, 3, CURRENT_DATE - 7, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 7, 'YYYYMMDD') || '-0014', 'M0000020', 'consumida', ((CURRENT_DATE - 7) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 11),
    (21, 12, 3, CURRENT_DATE - 7, 5000, 'nequi', 'SARA-12-' || to_char(CURRENT_DATE - 7, 'YYYYMMDD') || '-0015', 'M0000021', 'consumida', ((CURRENT_DATE - 7) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 12),
    (22, 13, 3, CURRENT_DATE - 7, 0, 'sin_costo', 'SARA-13-' || to_char(CURRENT_DATE - 7, 'YYYYMMDD') || '-0016', NULL, 'no_consumida', ((CURRENT_DATE - 7) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 13),
    (23, 3, 3, CURRENT_DATE - 7, 5000, 'cuenta_institucional', 'SARA-3-' || to_char(CURRENT_DATE - 7, 'YYYYMMDD') || '-0017', NULL, 'consumida', NULL, NULL, 3),
    (24, 4, 3, CURRENT_DATE - 7, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 7, 'YYYYMMDD') || '-0018', NULL, 'consumida', NULL, NULL, 4),
    (25, 8, 4, CURRENT_DATE - 6, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 6, 'YYYYMMDD') || '-0019', 'M0000025', 'consumida', ((CURRENT_DATE - 6) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 8),
    (26, 9, 4, CURRENT_DATE - 6, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 6, 'YYYYMMDD') || '-001A', NULL, 'no_consumida', ((CURRENT_DATE - 6) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 9),
    (27, 10, 4, CURRENT_DATE - 6, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 6, 'YYYYMMDD') || '-001B', 'M0000027', 'consumida', ((CURRENT_DATE - 6) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 10),
    (28, 11, 4, CURRENT_DATE - 6, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 6, 'YYYYMMDD') || '-001C', 'M0000028', 'consumida', ((CURRENT_DATE - 6) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 11),
    (29, 12, 4, CURRENT_DATE - 6, 5000, 'nequi', 'SARA-12-' || to_char(CURRENT_DATE - 6, 'YYYYMMDD') || '-001D', 'M0000029', 'consumida', ((CURRENT_DATE - 6) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 12),
    (30, 13, 4, CURRENT_DATE - 6, 0, 'sin_costo', 'SARA-13-' || to_char(CURRENT_DATE - 6, 'YYYYMMDD') || '-001E', NULL, 'consumida', ((CURRENT_DATE - 6) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 13),
    (31, 3, 4, CURRENT_DATE - 6, 5000, 'cuenta_institucional', 'SARA-3-' || to_char(CURRENT_DATE - 6, 'YYYYMMDD') || '-001F', NULL, 'consumida', NULL, NULL, 3),
    (32, 4, 4, CURRENT_DATE - 6, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 6, 'YYYYMMDD') || '-0020', NULL, 'consumida', NULL, NULL, 4),
    (33, 8, 5, CURRENT_DATE - 5, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 5, 'YYYYMMDD') || '-0021', 'M0000033', 'consumida', ((CURRENT_DATE - 5) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 8),
    (34, 9, 5, CURRENT_DATE - 5, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 5, 'YYYYMMDD') || '-0022', NULL, 'consumida', ((CURRENT_DATE - 5) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 9),
    (35, 10, 5, CURRENT_DATE - 5, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 5, 'YYYYMMDD') || '-0023', 'M0000035', 'no_consumida', ((CURRENT_DATE - 5) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 10),
    (36, 11, 5, CURRENT_DATE - 5, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 5, 'YYYYMMDD') || '-0024', 'M0000036', 'consumida', ((CURRENT_DATE - 5) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 11),
    (37, 12, 5, CURRENT_DATE - 5, 5000, 'nequi', 'SARA-12-' || to_char(CURRENT_DATE - 5, 'YYYYMMDD') || '-0025', 'M0000037', 'consumida', ((CURRENT_DATE - 5) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 12),
    (38, 13, 5, CURRENT_DATE - 5, 0, 'sin_costo', 'SARA-13-' || to_char(CURRENT_DATE - 5, 'YYYYMMDD') || '-0026', NULL, 'consumida', ((CURRENT_DATE - 5) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 13),
    (39, 3, 5, CURRENT_DATE - 5, 5000, 'cuenta_institucional', 'SARA-3-' || to_char(CURRENT_DATE - 5, 'YYYYMMDD') || '-0027', NULL, 'consumida', NULL, NULL, 3),
    (40, 4, 5, CURRENT_DATE - 5, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 5, 'YYYYMMDD') || '-0028', NULL, 'consumida', NULL, NULL, 4),
    (41, 8, 6, CURRENT_DATE - 4, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 4, 'YYYYMMDD') || '-0029', 'M0000041', 'consumida', ((CURRENT_DATE - 4) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 8),
    (42, 9, 6, CURRENT_DATE - 4, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 4, 'YYYYMMDD') || '-002A', NULL, 'consumida', ((CURRENT_DATE - 4) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 9),
    (43, 10, 6, CURRENT_DATE - 4, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 4, 'YYYYMMDD') || '-002B', 'M0000043', 'consumida', ((CURRENT_DATE - 4) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 10),
    (44, 11, 6, CURRENT_DATE - 4, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 4, 'YYYYMMDD') || '-002C', 'M0000044', 'no_consumida', ((CURRENT_DATE - 4) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 11),
    (45, 12, 6, CURRENT_DATE - 4, 5000, 'nequi', 'SARA-12-' || to_char(CURRENT_DATE - 4, 'YYYYMMDD') || '-002D', 'M0000045', 'consumida', ((CURRENT_DATE - 4) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 12),
    (46, 13, 6, CURRENT_DATE - 4, 0, 'sin_costo', 'SARA-13-' || to_char(CURRENT_DATE - 4, 'YYYYMMDD') || '-002E', NULL, 'consumida', ((CURRENT_DATE - 4) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 13),
    (47, 3, 6, CURRENT_DATE - 4, 5000, 'cuenta_institucional', 'SARA-3-' || to_char(CURRENT_DATE - 4, 'YYYYMMDD') || '-002F', NULL, 'consumida', NULL, NULL, 3),
    (48, 4, 6, CURRENT_DATE - 4, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 4, 'YYYYMMDD') || '-0030', NULL, 'consumida', NULL, NULL, 4),
    (49, 8, 7, CURRENT_DATE - 3, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 3, 'YYYYMMDD') || '-0031', 'M0000049', 'consumida', ((CURRENT_DATE - 3) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 8),
    (50, 9, 7, CURRENT_DATE - 3, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 3, 'YYYYMMDD') || '-0032', NULL, 'consumida', ((CURRENT_DATE - 3) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 9),
    (51, 10, 7, CURRENT_DATE - 3, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 3, 'YYYYMMDD') || '-0033', 'M0000051', 'consumida', ((CURRENT_DATE - 3) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 10),
    (52, 11, 7, CURRENT_DATE - 3, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 3, 'YYYYMMDD') || '-0034', 'M0000052', 'consumida', ((CURRENT_DATE - 3) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 11),
    (53, 12, 7, CURRENT_DATE - 3, 5000, 'nequi', 'SARA-12-' || to_char(CURRENT_DATE - 3, 'YYYYMMDD') || '-0035', 'M0000053', 'cancelada', ((CURRENT_DATE - 3) + TIME '07:20') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 3) + TIME '08:00') AT TIME ZONE 'America/Bogota', 12),
    (54, 13, 7, CURRENT_DATE - 3, 0, 'sin_costo', 'SARA-13-' || to_char(CURRENT_DATE - 3, 'YYYYMMDD') || '-0036', NULL, 'consumida', ((CURRENT_DATE - 3) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 13),
    (55, 3, 7, CURRENT_DATE - 3, 5000, 'cuenta_institucional', 'SARA-3-' || to_char(CURRENT_DATE - 3, 'YYYYMMDD') || '-0037', NULL, 'consumida', NULL, NULL, 3),
    (56, 4, 7, CURRENT_DATE - 3, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 3, 'YYYYMMDD') || '-0038', NULL, 'consumida', NULL, NULL, 4),
    (57, 8, 8, CURRENT_DATE - 2, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 2, 'YYYYMMDD') || '-0039', 'M0000057', 'no_consumida', ((CURRENT_DATE - 2) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 8),
    (58, 9, 8, CURRENT_DATE - 2, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 2, 'YYYYMMDD') || '-003A', NULL, 'consumida', ((CURRENT_DATE - 2) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 9),
    (59, 10, 8, CURRENT_DATE - 2, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 2, 'YYYYMMDD') || '-003B', 'M0000059', 'consumida', ((CURRENT_DATE - 2) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 10),
    (60, 11, 8, CURRENT_DATE - 2, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 2, 'YYYYMMDD') || '-003C', 'M0000060', 'consumida', ((CURRENT_DATE - 2) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 11),
    (61, 12, 8, CURRENT_DATE - 2, 5000, 'nequi', 'SARA-12-' || to_char(CURRENT_DATE - 2, 'YYYYMMDD') || '-003D', 'M0000061', 'consumida', ((CURRENT_DATE - 2) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 12),
    (62, 13, 8, CURRENT_DATE - 2, 0, 'sin_costo', 'SARA-13-' || to_char(CURRENT_DATE - 2, 'YYYYMMDD') || '-003E', NULL, 'no_consumida', ((CURRENT_DATE - 2) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 13),
    (63, 3, 8, CURRENT_DATE - 2, 5000, 'cuenta_institucional', 'SARA-3-' || to_char(CURRENT_DATE - 2, 'YYYYMMDD') || '-003F', NULL, 'consumida', NULL, NULL, 3),
    (64, 4, 8, CURRENT_DATE - 2, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 2, 'YYYYMMDD') || '-0040', NULL, 'consumida', NULL, NULL, 4),
    (65, 8, 9, CURRENT_DATE - 1, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 1, 'YYYYMMDD') || '-0041', 'M0000065', 'consumida', ((CURRENT_DATE - 1) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 8),
    (66, 9, 9, CURRENT_DATE - 1, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 1, 'YYYYMMDD') || '-0042', NULL, 'no_consumida', ((CURRENT_DATE - 1) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 9),
    (67, 10, 9, CURRENT_DATE - 1, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 1, 'YYYYMMDD') || '-0043', 'M0000067', 'consumida', ((CURRENT_DATE - 1) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 10),
    (68, 11, 9, CURRENT_DATE - 1, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 1, 'YYYYMMDD') || '-0044', 'M0000068', 'consumida', ((CURRENT_DATE - 1) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 11),
    (69, 12, 9, CURRENT_DATE - 1, 5000, 'nequi', 'SARA-12-' || to_char(CURRENT_DATE - 1, 'YYYYMMDD') || '-0045', 'M0000069', 'consumida', ((CURRENT_DATE - 1) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 12),
    (70, 13, 9, CURRENT_DATE - 1, 0, 'sin_costo', 'SARA-13-' || to_char(CURRENT_DATE - 1, 'YYYYMMDD') || '-0046', NULL, 'consumida', ((CURRENT_DATE - 1) + TIME '07:20') AT TIME ZONE 'America/Bogota', NULL, 13),
    (71, 3, 9, CURRENT_DATE - 1, 5000, 'cuenta_institucional', 'SARA-3-' || to_char(CURRENT_DATE - 1, 'YYYYMMDD') || '-0047', NULL, 'consumida', NULL, NULL, 3),
    (72, 4, 9, CURRENT_DATE - 1, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 1, 'YYYYMMDD') || '-0048', NULL, 'consumida', NULL, NULL, 4),
    (73, 8, 10, CURRENT_DATE, 5000, 'nequi', 'SARA-8-' || to_char(CURRENT_DATE - 0, 'YYYYMMDD') || '-0049', 'M9000001', 'confirmada', ((CURRENT_DATE - 0) + TIME '07:15') AT TIME ZONE 'America/Bogota', NULL, 8),
    (74, 9, 10, CURRENT_DATE, 0, 'sin_costo', 'SARA-9-' || to_char(CURRENT_DATE - 0, 'YYYYMMDD') || '-004A', NULL, 'confirmada', ((CURRENT_DATE - 0) + TIME '07:15') AT TIME ZONE 'America/Bogota', NULL, 9),
    (75, 10, 10, CURRENT_DATE, 5000, 'nequi', 'SARA-10-' || to_char(CURRENT_DATE - 0, 'YYYYMMDD') || '-004B', NULL, 'pendiente_pago', NULL, NULL, 10),
    (76, 11, 10, CURRENT_DATE, 5000, 'nequi', 'SARA-11-' || to_char(CURRENT_DATE - 0, 'YYYYMMDD') || '-004C', 'M9000002', 'confirmada', ((CURRENT_DATE - 0) + TIME '07:15') AT TIME ZONE 'America/Bogota', NULL, 11),
    (77, 4, 10, CURRENT_DATE, 5000, 'cuenta_institucional', 'SARA-4-' || to_char(CURRENT_DATE - 0, 'YYYYMMDD') || '-004D', NULL, 'confirmada', NULL, NULL, 4);

-- Bitácora de ingresos: verdes, rojos y un ingreso manual (almuerzo cedido)
INSERT INTO registro_ingreso (id, usuario_id, reserva_id, fecha, hora_ingreso, hora_salida, metodo, resultado, motivo, similitud, receptor_nombre, receptor_documento, creado_por) VALUES
    (1, 8, 1, CURRENT_DATE - 9, ((CURRENT_DATE - 9) + TIME '12:13') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 9) + TIME '12:43') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (2, 9, 2, CURRENT_DATE - 9, ((CURRENT_DATE - 9) + TIME '12:14') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 9) + TIME '12:44') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (3, 10, 3, CURRENT_DATE - 9, ((CURRENT_DATE - 9) + TIME '12:15') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 9) + TIME '12:45') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (4, 12, 5, CURRENT_DATE - 9, ((CURRENT_DATE - 9) + TIME '12:17') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 9) + TIME '12:47') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (5, 13, 6, CURRENT_DATE - 9, ((CURRENT_DATE - 9) + TIME '12:18') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 9) + TIME '12:48') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (6, 3, 7, CURRENT_DATE - 9, ((CURRENT_DATE - 9) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 9) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (7, 4, 8, CURRENT_DATE - 9, ((CURRENT_DATE - 9) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 9) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (8, 8, 9, CURRENT_DATE - 8, ((CURRENT_DATE - 8) + TIME '12:13') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 8) + TIME '12:43') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (9, 9, 10, CURRENT_DATE - 8, ((CURRENT_DATE - 8) + TIME '12:14') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 8) + TIME '12:44') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (10, 10, 11, CURRENT_DATE - 8, ((CURRENT_DATE - 8) + TIME '12:15') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 8) + TIME '12:45') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (11, 11, 12, CURRENT_DATE - 8, ((CURRENT_DATE - 8) + TIME '12:16') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 8) + TIME '12:46') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (12, 13, 14, CURRENT_DATE - 8, ((CURRENT_DATE - 8) + TIME '12:18') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 8) + TIME '12:48') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (13, 3, 15, CURRENT_DATE - 8, ((CURRENT_DATE - 8) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 8) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (14, 4, 16, CURRENT_DATE - 8, ((CURRENT_DATE - 8) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 8) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (15, 9, 18, CURRENT_DATE - 7, ((CURRENT_DATE - 7) + TIME '12:14') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 7) + TIME '12:44') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (16, 10, 19, CURRENT_DATE - 7, ((CURRENT_DATE - 7) + TIME '12:15') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 7) + TIME '12:45') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (17, 11, 20, CURRENT_DATE - 7, ((CURRENT_DATE - 7) + TIME '12:16') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 7) + TIME '12:46') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (18, 12, 21, CURRENT_DATE - 7, ((CURRENT_DATE - 7) + TIME '12:17') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 7) + TIME '12:47') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (19, 3, 23, CURRENT_DATE - 7, ((CURRENT_DATE - 7) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 7) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (20, 4, 24, CURRENT_DATE - 7, ((CURRENT_DATE - 7) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 7) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (21, 8, 25, CURRENT_DATE - 6, ((CURRENT_DATE - 6) + TIME '12:13') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 6) + TIME '12:43') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (22, 10, 27, CURRENT_DATE - 6, ((CURRENT_DATE - 6) + TIME '12:15') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 6) + TIME '12:45') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (23, 11, 28, CURRENT_DATE - 6, ((CURRENT_DATE - 6) + TIME '12:16') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 6) + TIME '12:46') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (24, 12, 29, CURRENT_DATE - 6, ((CURRENT_DATE - 6) + TIME '12:17') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 6) + TIME '12:47') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (25, 13, 30, CURRENT_DATE - 6, ((CURRENT_DATE - 6) + TIME '12:18') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 6) + TIME '12:48') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (26, 3, 31, CURRENT_DATE - 6, ((CURRENT_DATE - 6) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 6) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (27, 4, 32, CURRENT_DATE - 6, ((CURRENT_DATE - 6) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 6) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (28, 8, 33, CURRENT_DATE - 5, ((CURRENT_DATE - 5) + TIME '12:13') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 5) + TIME '12:43') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (29, 9, 34, CURRENT_DATE - 5, ((CURRENT_DATE - 5) + TIME '12:14') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 5) + TIME '12:44') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (30, 11, 36, CURRENT_DATE - 5, ((CURRENT_DATE - 5) + TIME '12:16') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 5) + TIME '12:46') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (31, 12, 37, CURRENT_DATE - 5, ((CURRENT_DATE - 5) + TIME '12:17') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 5) + TIME '12:47') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (32, 13, 38, CURRENT_DATE - 5, ((CURRENT_DATE - 5) + TIME '12:18') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 5) + TIME '12:48') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (33, 3, 39, CURRENT_DATE - 5, ((CURRENT_DATE - 5) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 5) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (34, 4, 40, CURRENT_DATE - 5, ((CURRENT_DATE - 5) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 5) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (35, 8, 41, CURRENT_DATE - 4, ((CURRENT_DATE - 4) + TIME '12:13') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 4) + TIME '12:43') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (36, 9, 42, CURRENT_DATE - 4, ((CURRENT_DATE - 4) + TIME '12:14') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 4) + TIME '12:44') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (37, 10, 43, CURRENT_DATE - 4, ((CURRENT_DATE - 4) + TIME '12:15') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 4) + TIME '12:45') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (38, 12, 45, CURRENT_DATE - 4, ((CURRENT_DATE - 4) + TIME '12:17') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 4) + TIME '12:47') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (39, 13, 46, CURRENT_DATE - 4, ((CURRENT_DATE - 4) + TIME '12:18') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 4) + TIME '12:48') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (40, 3, 47, CURRENT_DATE - 4, ((CURRENT_DATE - 4) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 4) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (41, 4, 48, CURRENT_DATE - 4, ((CURRENT_DATE - 4) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 4) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (42, 8, 49, CURRENT_DATE - 3, ((CURRENT_DATE - 3) + TIME '12:13') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 3) + TIME '12:43') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (43, 9, 50, CURRENT_DATE - 3, ((CURRENT_DATE - 3) + TIME '12:14') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 3) + TIME '12:44') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (44, 10, 51, CURRENT_DATE - 3, ((CURRENT_DATE - 3) + TIME '12:15') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 3) + TIME '12:45') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (45, 11, 52, CURRENT_DATE - 3, ((CURRENT_DATE - 3) + TIME '12:16') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 3) + TIME '12:46') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (46, 13, 54, CURRENT_DATE - 3, ((CURRENT_DATE - 3) + TIME '12:18') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 3) + TIME '12:48') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (47, 3, 55, CURRENT_DATE - 3, ((CURRENT_DATE - 3) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 3) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (48, 4, 56, CURRENT_DATE - 3, ((CURRENT_DATE - 3) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 3) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (49, 9, 58, CURRENT_DATE - 2, ((CURRENT_DATE - 2) + TIME '12:14') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 2) + TIME '12:44') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (50, 10, 59, CURRENT_DATE - 2, ((CURRENT_DATE - 2) + TIME '12:15') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 2) + TIME '12:45') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (51, 11, 60, CURRENT_DATE - 2, ((CURRENT_DATE - 2) + TIME '12:16') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 2) + TIME '12:46') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (52, 12, 61, CURRENT_DATE - 2, ((CURRENT_DATE - 2) + TIME '12:17') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 2) + TIME '12:47') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (53, 3, 63, CURRENT_DATE - 2, ((CURRENT_DATE - 2) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 2) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (54, 4, 64, CURRENT_DATE - 2, ((CURRENT_DATE - 2) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 2) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (55, 8, 65, CURRENT_DATE - 1, ((CURRENT_DATE - 1) + TIME '12:13') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 1) + TIME '12:43') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (56, 10, 67, CURRENT_DATE - 1, ((CURRENT_DATE - 1) + TIME '12:15') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 1) + TIME '12:45') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (57, 11, 68, CURRENT_DATE - 1, ((CURRENT_DATE - 1) + TIME '12:16') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 1) + TIME '12:46') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 98.5, NULL, NULL, 1),
    (58, 12, 69, CURRENT_DATE - 1, ((CURRENT_DATE - 1) + TIME '12:17') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 1) + TIME '12:47') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 96.5, NULL, NULL, 1),
    (59, 13, 70, CURRENT_DATE - 1, ((CURRENT_DATE - 1) + TIME '12:18') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 1) + TIME '12:48') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.5, NULL, NULL, 1),
    (60, 3, 71, CURRENT_DATE - 1, ((CURRENT_DATE - 1) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 1) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (61, 4, 72, CURRENT_DATE - 1, ((CURRENT_DATE - 1) + TIME '12:40') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 1) + TIME '13:10') AT TIME ZONE 'America/Bogota', 'facial', 'permitido', 'Ingreso permitido. ¡Buen provecho!', 97.2, NULL, NULL, 1),
    (62, 14, NULL, CURRENT_DATE - 2, ((CURRENT_DATE - 2) + TIME '12:20') AT TIME ZONE 'America/Bogota', NULL, 'facial', 'denegado', 'No tiene reserva para hoy.', 95.1, NULL, NULL, 1),
    (63, 20, NULL, CURRENT_DATE - 3, ((CURRENT_DATE - 3) + TIME '12:20') AT TIME ZONE 'America/Bogota', NULL, 'facial', 'denegado', 'Usuario inactivo.', 94.0, NULL, NULL, 1),
    (64, NULL, NULL, CURRENT_DATE - 4, ((CURRENT_DATE - 4) + TIME '12:20') AT TIME ZONE 'America/Bogota', NULL, 'facial', 'denegado', 'Rostro no reconocido. Acérquese al administrador.', 41.3, NULL, NULL, 1),
    (65, 15, NULL, CURRENT_DATE - 5, ((CURRENT_DATE - 5) + TIME '12:20') AT TIME ZONE 'America/Bogota', NULL, 'facial', 'denegado', 'No tiene reserva para hoy.', 96.0, NULL, NULL, 1),
    (66, NULL, NULL, CURRENT_DATE - 6, ((CURRENT_DATE - 6) + TIME '12:20') AT TIME ZONE 'America/Bogota', NULL, 'facial', 'denegado', 'Rostro no reconocido. Acérquese al administrador.', 37.8, NULL, NULL, 1),
    (67, 12, NULL, CURRENT_DATE - 2, ((CURRENT_DATE - 2) + TIME '12:30') AT TIME ZONE 'America/Bogota', ((CURRENT_DATE - 2) + TIME '13:00') AT TIME ZONE 'America/Bogota', 'manual', 'permitido', 'Almuerzo cedido: el titular tuvo cita médica', NULL, 'Camilo Ernesto Vargas', '1023456788', 1);

-- Abonos de instructores a la cuenta institucional
INSERT INTO pago_deuda (id, instructor_id, valor, medio_pago, observacion, creado_por) VALUES
    (1, 3, 5000, 'nequi', 'Abono semana 1', 1),
    (2, 3, 10000, 'nequi', 'Abono semana 2', 1),
    (3, 3, 5000, 'efectivo', 'Abono en caja', 1),
    (4, 3, 5000, 'transferencia', 'Abono quincena', 1),
    (5, 4, 5000, 'nequi', 'Abono semana 1', 1),
    (6, 4, 5000, 'nequi', 'Abono semana 2', 1),
    (7, 4, 10000, 'transferencia', 'Abono quincena', 1),
    (8, 4, 5000, 'efectivo', 'Abono en caja', 1),
    (9, 3, 5000, 'nequi', 'Abono adicional', 1),
    (10, 4, 5000, 'nequi', 'Abono adicional', 1);

-- Plantillas faciales cifradas (vector de prueba = generador determinístico con semilla = id del usuario)
INSERT INTO plantilla_biometrica (id, usuario_id, vector_cifrado, autorizacion_firmada, fecha_autorizacion, creado_por) VALUES
    (1, 3, 'gAAAAABrAhJbaGA_svkA2-hBDbjpnqnW-24LG5zyjnIxiFFlssDNLYV5qZSpu3CQMLqD6YIlCNZDwfwnmbyGFG4vwmZ_USAr80IdEuRGe4kxbiO_1hh-QIlgLTSRtYz0hbeF8AbQpRFK_vqEIQb0IMFTplKi0QpWKyx8g-PcN77o7Evbliqgx_C81-I-5KugODdA_Gq3gLx49WSkenHJp6Ak6KnxQV3qzoVZue9Y7V9Ij6AGqY2xPKqVjCrIqbJCNRVLDR5q_RBRAG4HxoltptH1d_1aFUS1672O0mGjZBAdQ0MrzYmoIldS4Nwe9x3KIN29KuN1n8LJPUZOyXV2xzK_hY_m-MXlNivN7hnYDPsOacbVkuUPFmGvPkMLE20UexeMzAGKN4bN_Pcfvdt8c_wAwS3lVZZYM-B37xBbz4hE5Zhxk4Dv8AX8Ub-VbT6VAvNc0v9GVq2wvriufA8x5LCr2H6JlhrE3T__gN6cCAX-v3S1zAtLdcwEktcYV-DsLNpqYgr_p9eFzeqMZlkYXqpBTL7ZsF4fvqna6-WuK8uk03k3ZLewlZi-c2hyoB6VMvSMarFK-Nb6WuO0nb0mBivo0t_r0V55cHE2wSjC8qFltsz9mcE8_9WLbcpgHQue7I5uUYhR7XUr9D8oqqDEXluMdm0Dj3gPQbILmndD541JDmJoY8tVte8i3uYj0F95pf-1Q7vzyaBifxGV2kY6dqn3kinaq-DtyvWCI76yJYU8RWurcg-zqcGlheNRYwwMH6PZTmJBTYjgM8GbKPRhYBQrvTkXeBUy34DbDHAgV0kq_hwYUzO7EUQXF1xsy9r7k4tY9YcRD9wA3TIKvffN0JgYkK7EFJcHZOfzaU1tW2hVJF802U3AhzyT672SokmgIzkgiMBizSlElt_-0pZdiha1A22snfQr0qVs86FK4VGz6kcA6ESyC7Fe0s0c3UckXfwAmEAMehKDTNpL2LFIo0CKw_86_3F80ledMa1_XXTXPLDzXVd80w__ENd89WPvvxcfAOMpkNd7YjEb3TGSMivUv4Ts4Kn7pGtsciFkMuJ7MKxdQ917tA2f6vqOaYHHUGbG4bj_8JpnaAGPsMyGT96VnpyktpRcUAFE84AL41tHWNOi9l_SpBG4Avnj1YatY7g9hAgqpvwiiN3Xj774JV7xoODpdPPsAMydUqUXWg_CtOpba8zxxMHUNbg-ZSxOTPU661x7Spx5rnZ9qUIj7RQpWmP8p2Ja6A-rIz3RRY6MF8pR_8NxG0o6X4D7b3AtQkZOddqPItuIQbwcEVZ8yWzCcoMSIdeV2_gK35ywlvYiw5w9GhbItfWXYYe1MEdEWtIe3BrMGOFwvIGms07ftoP9DtjHBXJsnzzhS1ZytKo44r-dv3SyEuUqsYvuC7vpSZAr8oTE_ZCMaKA7Vn8_JyQjqy-EMnAlPbE1qCkIRZsCkClAVP2xlOlbJhJVYZgnkoTqgnK9OovHu_MfxRUslYRALDi6I2uwrWdiUfyQx08MBjf-08lRGV_QpzMRqHQS-oVKG8SBAoigq6dfyDCTE8GrIvhMMS55NVYzZBtuF9evNrzs-gFuNmJ4mAj-w5XNCZHSRICB5pW3VqkCZEZBayrKXcAzHuhvDpvayOdY-0p85eADH3oe6gHpofmOTAoBALHl_xAjOKj0FbTdvGe8rm43WhLG9nfBUmyPbsCUxJYZe7J6fy1WyhNbb0lSE7a0pcO9hdyOkTX4R0qCBZSnp_PlK9Iw_XTjROqEcmefLCZzcl7G64inmPvzL2Cmk4cXCSDZ56yO1ZTnfo99O1gEHR-gnYSHKMeeh25EEjcTBx8xALo1BkivZVBGPUTCADbsYFBaUB_-Ntk8', TRUE, CURRENT_DATE - 60, 1),
    (2, 4, 'gAAAAABrAhJbWy3wVnCgmUUIe_jSn4UAB3DW0GhUIG6lDmwYhAxYb8ikGJ5RMh3cy5THqXMCT2iACs5iZfjfuKWh7lms357fvqWG1cO7YugDntl5_zOr7mKXUE6y3dAwdtwY2sLVzI2PIPd2VBrDMMlpzmgZuKLrmk83MrfxTNa8skHL1H5zBQC2b-z06_WGULQIyHSd1TahIHrw1nCyidRvyS0GlW198Kp-90Y5yTR4CeCDPwwy_8C600nONuaDJCzZ3QBO-apNrD0jRN0w7Kx1cWmXK6YtbByadYgewqkFuhop2Otub63OZHAZ4AkNwxaI0lNHR2hriJF0pWaUl7Sieog8lnjHK2TLVPH5N1g-B47T7HiiSjtSuc_Gcg0Dvhoth_nR-LM-mpsQjVL1YKq8dkos6dN9DjY8_1NG_QokaDru1F0koKtRAv1S5od5mDBWxr2UB8rXz-XRBWbBCMXGhLLRHJi4EI0cOlgOldikAd9EwY1KS-V2ULBAi-kOXUN2gaZVOqzmGWPps1m0308ZIojNxNMvF8K4tFxTOUKWCFDT8CHBw3g5RdCOBtC0uQND4xzsNaOy_eY0261dusCxZlX-B3DQxNNrNJrqwBZ75VhPOsMtAwzVD2I_rQs7tt4Ad0B5WCXOkhJx6Yr0vmmRdtGz041I0_occTM1ZEP3IPkNQvcOGwiBFl6Kj1-0Qo54NpmI_9y2GqCVC7JTQYAWZfRR6WPmCr2qwG1WX-uq90xB8PozL9bApDjGFotxOZfTqVDxMqVXuMCuFN4Wdrm86a2qQ1Rkw64GCT5bdY1w2xNihgc5ElG2z9N2k4nOVvanhKok492tIB0T-Mk0PX9Ca3AwKvIswHuZ_nptjROk4wtIAeL_JJbU6VJMy761-igtgJrqBJ-qLlZBZ7WRAnV3CLSj2cf6qMkyQgpGVcqJG8afzjbCXxw2ELIjQhrFIZLvh6Yplxr9vGy1LbZ0744m8Ti2NZ_4E0siv0H_0NHx627yeYrILJHNHaoOleIXUTQH5XpPYdmqmrSmIs_8q0Wc9jta8vcndS8aYd5NecczH92ZdYCF-GE-leiZcnSca2DEQ4IG7DhYbRRpLlbK16DSAdLWICj7xlkc5WW3MzROQZPnSKFYeKrpqI-nAAZjWvbnT3yCDhoHZ89rvlF8STU1p6eFem7seh_HHGGxHY4rZWOimMXIKkUqVrQQ9_5hr1LBnCag-KqCedhGiUJbAva-zPzsYM8tPq0ioFheHONknYHFvw1jMH99N8uthikcAT6EczJF2b2Q0QqP2ov6XAYNDaiYpiEZDsIBmZcO_rY_96-ZJ0OznM0oywg1XXf6jqnEY3Uzk1SkWAqBbxLQ5Aa_GpzVlfEX-DTOFL0j9NcJFIjpqwWCo4XJkciyD1BeeLZnvJxKA-XMzs8pOSvgzmJZ-PEEoDx72eofo3I9ENVMuVLglYSj3xvyVBeq3duIFwm5wkAeto_8RA5tDDkCflmxG0s6TfkMQnGmI7ECe802NP7sAhXc9nIresi7ZWqNAcjeByKBeO1U3dnm7QvecNFrqod3HL4YJ7p8F21GZAWkxMo08trSZi7sr82lu6jpOh5jBXTsIZDzuAJ6XjfhnGc_e-NbPKRpsnRmH7wOpMtmmNRbnYLKe7uvzmWLI2JrIINW2x3VBt09mUG6nBSZPi1Q0f6ag96C5JnsXI3VuCIUEt0iJvWe5G1zZfbWpbQPeK-gvgq8UDXTlBGOdy9m44UxDN_J_grdfZZODkcF_g1U7u6ahRJZuyJXI4dT1dcAFJ8o1L1TV9K7mwheTkh7PW_DajZ-W-ijAhtDmK6xhCBmEtvVAl0NEjU=', TRUE, CURRENT_DATE - 60, 1),
    (3, 5, 'gAAAAABrAhJbPJvP24f9SM9xTpdY4IGhONH7tsJ3gNvwaQHv7k9NkjjzFt6L3emuKib_lMZKCviOWkpabkE-OewVcZ7NTWoFcWUkmbZFHWufmef5PDdG-IIzwwF7km9EoKK48z6h45tBatuXYz6sF6ENx_ta0W3rf35C_CIUhz1ybRLTzLDBnaZGdgqHQpBO8hRiL79QF0kmBTrLlA1TERQQjjspfsksebpjyIAymr-qwE1BAkib3QKi9kNUrju8Yib7-02ZUkq65MrebS6CjPUTeOXT2fZ4nSRYJqqaW9LSt-yOK_-AlLY1k-sAHcLhaeT4977d1vffzTZwrCD_wVEInbWBkMW-uKi3hzWxrh-sS7cVp0a5-fOWBe1oYEP774XyCHPF-hkDXG7nkLj_Y63cw8TpsTqTSPB71mpnyUWyHXItAXQ49BlpP88EbI1XQ1i6FnwZSshRZ2WHpBBSed2akJj_HFdvR4WC1XxhYz82zF3yu-onZkxNxZB3vkYfopanDb1ZXjcOuJsp8jMIpr33xAkfkXyJ1ajG_0opIslg5F8ojKt3-B2W1W6L9_gtFP669eMvpyLCbFGjhy9ll__SSN-AC0HY8D4mi4v9pyrgiE7dDUXF5FX-ddLr5fuMUlVuMcwdDIjyUtNNWBnPtquBsWjv4UhLKIxwUWObk0wYYDSxVh7z4cIEPiem59YQrZjfu71b5juem0ClO1HXhbous6YU8tQzbOPAuXO0kvo5bmoJ3k_Tpmwa-pK6qFBLTCIyFRFiowFIXArwpR-RD_fpMTGvo0d6ucvz4jLcsJDBRv6etAmmk16W2b8TKairDbXVWcOaF6FgPYDnMFdgVxgNlFY-bcb5xJqaMYKVVyUSGBG__5HsL99EL_Qy2KGlWLXjno7PcvnEr1CHYYdbRqCLzv3TC8cPjSx4rbDZh0CSPDNoLyi1sZhl7e4MfHEbcseZljmNujc_bAap36vfXB1ACH3-aTrMTtetFOdMhoPbmicBnlbLKFCGylh1ab4QLI1o9c4YmsD0VO7f72udp0ocsaL4_ZPb8CuLnfybz1G3caGlH0yidF8_hRrAXr5vkhaT0u0NFaQl93XU9V_tZgCvn3oStHrX-ZK49irXt3cTuptmBbU_ModHyUQfBnOu7kyPAagIFMJrododr8QmPu0b_1KsXJyvnB7x0fMoDOAn_vbvHapphSqumf73RhxgWsX7hR4G4EHjloUpm_-aVJFaDBPxbEIPBlGcu8s0oEWqT9IzuX2c5N5___d-cnsPCyDFHyUSQWraDI1OCSgXzvgzJ17hMu3gUsXkWqxexNgz3qalgSZCyhhy9q57peu9rZBucFZ7cP5Ptb90S4OOHlfKGfcZG6MmpUP4STssFLZR7uF4TX0GUuJX2SWhS2g6mwU-K9sNn_MKrseIThfnRHkLg2fYNkie2lHEWyeI4lNLzuWQ_yL3lJL_Cz9KokBfDXO_QSK3p09B9Tgdb2B1kLzKClUK8ojEd_wpzmPcQYIJng6zGq1jxqsesNftwrr9mgkqY_N-4bBJ9TC3cyBMHO4khma2Ec06thwz0Ap69VfFq5gtRfpk0edaKdt4Q8ARicddnWtFR4h4j94vHtbhCdjcHk5xY9xlgWpocongOm_j8A7Za_YSjbokW0ii6ZAjRJ01o0IphXW2AebAWzGLcxVeku3yWpzNv7ICCdQrx9I4OYRpS3qWpyP1RBhPOeeWR7aCTpmSGoMaiz3zKO0BcCArwgYPba8tzLsvN1RGGmyq7YUgAubVToafnTVOjPsfx1kVs2O1imNibYhWIy3rJRIr_EJ_2n6clq6VMowVa1cNlPxhDZnhWB1qbvt1gRzLhHsBFtjnoNMt', TRUE, CURRENT_DATE - 60, 1),
    (4, 6, 'gAAAAABrAhJbCU1pZ4GbMo5qRI_BHG7Q-UDicqADkhZfGWwrvGc5xN6_yPe-J2RcqHxIMraScZsZjVnUmkdy7gYCrecKGFAGJfL2NVqSoSZqhVuzSNCIgylAT7fTpZ1PA4g3DtOuqGMOIbZ3KdyCmNUDJzFmvqzseOWuYY54sI4YKOymIDj3_yu9oCuWHlzA1IRhxhVilafABQQThn5BFtxUfdV_S46eMajtaRMy9RTnljoZEk_hiPqeYvqvd6mHi0AftpDeHrrrzkFE97Bj8_gCuVN8ookNc44YtQnGTABar_I5UlmrmCUjwL1jVZj6oxqLGZpeJ2T-oSO5_z8NAQmXdfOE8-I3zag308Ku2mAjd6wnqulf3hqFbshNq-mRZ1N8HqwnIMa4E35mXscw7WfsBaebknEjusPSN6e7mqxOeShryxqDlyp7q8ujRQd5v9fz0nPmUlE2c9jkZZIJDNaBeMmj8B_oR5eOFptDoVrHcfqyDdieX3obtGoWyU6x3kYQRMcilM2wyJwG3qaU4tURhVEG2fBNQBfkngcZYAifysc7iB-qIiCAn4ywkNVpvqhZI_g00JpaAVqvJF9J1IQWR7yPP8WEpZo91w-ytQK8imVdsmIcXkB3hWr20QNEldTa2UySq-FLgGNUcoq-YMSpg5OFT5Av9RJFEFviSxA-h3XbaTo2f3jyfsfkwMKVQFGhHfSUFtfZXz5MuETey654dyjAEF4njvXDJS1LY8Ybk64Iuh-IAkKv2ZZwvFVM8RN7GyCGk_toVHiMh57pbm7Mh3KPgkSUl1mtE8FZFz5y-gj90lCNep8zV3WPbafdD5BZlgOzwookQTA9sr1zvA-RMzlV0kMHnbFjEnMhSONJ9mnV32QNFREDv1lkeL_lRl0nw-4rllrtvSC7UbG2DJ0K_qqiPK-Qc8KtPy8lVpJjE2mXbewv5Mc36SbFgDdnmkuDLH7Y9a3UrK8llpfqKVDxf1qxmbTMGPTq_CreYrVy7Eujl8HlefSLLEf70iVyBWZlHSVXb6OqIfLVxEYxR7abE0I6APY43bBtnqTW9iqIFyhtBCw0AZbXvGyr70HB7a8zbTKchnD9GehVk56eCoNJk3yIHaOHDsA_8uUDcwy-ZLThX6dNAApAu7OHrjR2qqYk90vVzVb5u5SXzr91qRQ--8C-b91C2nxPp193_qdZyad_sOjUqFG8DiP9BFEPVjaL3e3shlnEtLDTvL6n1XwDzbDdnP_HKZP4e8n97oOTh7j1RKJohXS09PUu7TXgfP1oxdTy6r_4RsE1gj9xUJsJJLzYjwZAO9BHrT2pwzDVUtfgdIIszpDvwlVlqMXfhOgQXlSvF3qKR_XFzeLKi1WqHEH73hoBRDxTL_FjQpbQOvlmgvBtJGyU9c_sH1RokF5DyHcF5zRZI09g3H2CtDaBiBTCc-zE4jrJRRQqHkcWhmJoXXs_Gn0pEjwcqUKNld2Zsze6b-yPJf_Q8lEJOnfs8yTT69xXWDVhna1UYonQ-Y4v84aiXXWMelsetwxbyucqFfWdfpp77RD0lGA-uw8EF943sCD_iexNmeTY0_64475nzwcWIvtl8u3AA1L5EVD9YR1viLnZgLUOiTLq7j5upbA8Kg2SgLhkZB2WlGj0ujnMeVenLIff9QQjk5mUD8oW5gypzItsmlOHbJL3Yew0AvIHvUuxtHDmTDxaIgJX0PtX3AkJlJX8t33AYSVKkwY17-n22RSO14qE5nncpP1J8Uzcc3UAP33a2w9y_vSCSD27uIz0KORYVBS-jUd73bykVNc2sYu-OE-7-XRpbupxygujCXQYVKjKPZgwBxgM1mi0IkoyTCERZ4SLaIlT1Sjle67Y3-Q5', TRUE, CURRENT_DATE - 60, 1),
    (5, 7, 'gAAAAABrAhJbzmUbvu5u5kuc--aILtFHzNRtpH4IUK7SRnPC6y8d7NQA1ClcMvUCnNXGP9hJB7ZNDJfYLIwC3d1heGSX8aqQzdCl1BBaXIcT2ONWFFl0uySaIUzLI1KLSVXhLMJFt-2sTU5upssjppl4C4p-LizhIe5WcunyE6xjQaqfbqoqpZxU_m8JMN66lAPgI_xBXQfDq7BL-jpMEGfDDVgQK_Ja_oajZQzV3vjdy4zvh8Rvc2zKTup2FsAM2YuOhJmk79WvSsUC2okk8zX1rLrzU6DE_OrRuyaI0JZupfaSue35_bQYJIZ_Fs03wJ4PWK73-faBsjLIy7GcH2H9WomgskBJSjMCv_rVVyDg_ni9isNlUJpKukv8UTah1HDPATAbH-saNT-TSohH9W9NV4qbE0fwuy5Yjw2wyiv17sGBpLBOx8lsdKZPc_AbYSn2wToa9LEkMXMs_itVxDejWRvcEapuy6hbAkcLu7-snGrT4phjeqCilETkhVFeX5pBgNmNNzE1NhOMIHHzKq2FViJ86We_69nsnYKxqv_ZwvpQWdmbNfr40Ia7fNTlqCAprY2eq08-8qwhngwUwRulUjNBnx7hUzbyzWV2k4jvkP_O9090J0-Z4-l5iE5nY6J21Bt5YJSujlFVUO9gIfL_9SMvYn2a7RDVXMFtFBE-hA0DZm0pmhWuapY7x1xiDa8RYu9kUnOaA42DoSiWuEOZkn5WvJvDx8W95DOq0U1MrButrrtpZZVa-Kl1q_Tg23qBo5BBOKz0u_zFhNbP0lMhDk9N4G9S6GZzb6Eb-mGTnSmhc5RKZg8EY5rOg9KrLhgmP46lLun4bUDTmXYHeB4B9K2fsqb7S5LFkZxwaftJkpjyzGX7yUHHTZRMASonAgZ9BaN59h_QYbIkcKYqpISD-pTiviwVcgJHiHj_76LPO6yuKz8qLIfBvWRz9K9TeMsc-ECuw_K6KICkXnFzbT5ziRzYsfOkhiAcfrDWnv4DrWbY5Knpie00iDJ-Ee73APS5k47RMrRtKiDNyH8rNGWVRaePa3l-wwUJBokPBtdTRAdon62p75IMVccggAS2HJrj8tiD6FcFahZQUgUhxN5QjJXfh1nGvx_Tt4XgccnriyEQQJ3s4uo9meCDTM3zEQdhTBUHm8gb4IhHq0r3wt9OeBLTa2bltOrCppc3FLUtHvoiwFCBv9fMru3iFnHoN-nwDPu3AvoDbtHqcnOmdUlgbDw4rUe6yzGqiSEJiIxOk9M9lbVJ4uV4VOuIUIC_2i1Jvto4Ci12BWZ84iDgvHathGG5Pf3mf7rJy8tOeM67s1RzAmjZ3enigzFO62JbBWTCrfqxd7aIL7iqdG7vGvt3kTOgUuvhzf6pq6D_yuhH3N0OJ4LyhxOc2ku5hlYbYzD2ARqwjOq7Sqi2IkQJqlgzpPcAPSXpNgri4WTfFKgjIu9Eb2harpJ_epCF5o2dCpJ7Q-Eoa8M3kguJhdNmgreWaHGiIb43dvFHqISkj-nhg-0t5eJlTJisGdUyf8MLBkPA6Au9H0VIm-omKznZN6SoB7ZumowWQINcXY2NUitK5NjpMmCAOcG5QDFFVAgVmmT3RE6xVl7VZxAP-i-rBTxVrxZLbACqrK5wSdsfej4C4TuZBKQPzow_m-VYEDevllIz28UF-gE5rOW6KjNh_lr2rMW-cbYGVLWycGf4WLdmpxO1AOeXNKKjkr5y4-e427BMc4Ipvh8OWsAqW7Wd1w5S_CDCFudcLo3Qr7qcxVlpDV032ZcrnAUpnGhyWVR02gZAqsWpA2ZF_C388fxRhebTo-mKAiGzw-3y6l_Tpyz5NIU2G81IqTi0kVfTu6OgMfjBZyvL2saz', TRUE, CURRENT_DATE - 60, 1),
    (6, 8, 'gAAAAABrAhJbDYkcM-h-4C2vxoILOxfi7qr0VZfq6k-oFaSB0LVtHLBcuozGnajURKP3_xoBpG5XFHa4288TP4CDri2p1OwfUVtGM6wJg4Gax9n0hmm4__W3tdVMUieNgwRwog1jBZIDUp4M8Woto8F57DuBypr_mOD7QzG9rdosDmMSUXudOeT9qiSDOKHZdzP_83bMa0lrHWJBdRIJw-DqiEuOtuaLVWSfGGFvSdua8wsLNZXxeuP4JAK2U5APfATIDLOhqSJev_HMOlm8oB9EquB6oNlLmihAY9wpidScNslvlB2yWCq6uKhg6KpJsJrL8Q_doJbPGinamLGVOHOR_M96dwS9dEtetGIxXN2f1rnIchqhM9A_kXuVJFUXOcsJAEd_fHDzUIchFmihYNb3e3LrmPYwqnQLKLo72wCIOcNRDb_fQfl27GkyUc1qDEZm6zUqSngo5Jou2cNgwAgNPM95tHjYOHdi_-dbMvfiyXGy-KknMGHVOsgM1k9hjMlYfV1mK6CK__YJQu0yKTmDf94sHi0KlDCp3wox1hLRm8GFZvRVrBCCOQLntAUvITn1Pivg9J3hVmi63DJI1Ww8pvl-VhH6WL3tAjHLxZFYoavaARDNJ-fZCik99iT9ZcncqKgdV2HPJ_S2DAYiSAsdgmJPE9KJaO3cJJg3V0FMywWPwP0T5POMs1LvYoHnaJB9LQqNRjBvA8CrPYZS1siCwgAJCPJVI7v2o7tJxsTZetB0kYrlkhwGKSvspIfCPTt5t18IoFquM4y6f-TESkoL9v3qIz3kFzhR-8f1UqKMttPHUYCMYw653p4XXyU-f5XDmL30njr7zXpPsv5O4oM1pcgb9ibq9_EI5eMMgNekRz0Wb9b4WdxHgP2iA6nCwA1BXus9mcec4nBvyWFlE30-_M46iIyZNj6h65vacJBa5yv43EsdOoF1Lob8BJUPp38FT6w3HDxUcSzukXf86aIZO9NGFKzicFaW8MDe5X_Wrh_-koYe6URh6Ssm4UMBnjbeWm-90jgr8u7srlcjhMPVwK1JBJSL-6-s9j-Wr3yLHiqdV3tBxTVHzsoGGx8jTnAGnfe46L3O53sudgquL2qn1_YzwWTNLx05nno3mfis-OzT1jlbd_BmxloK4kXGccrjGVvaI-OBTu7ZojTQhrJEf0_Ac_u1YC7T5aEY61KOdKBUIPXpuyzA4C9AQbe29BdpqXutY10ULTNj3qHwTAskWin_X-ne5M82_EqqVQN_t2G_t7jOpTpy7y-QrLWaM7-fFSK16AUeMxN4DESpUQ_qOmKfW0ryMZVD33MfGyb_-sQD6Mb_ZMjaecbsK8N8wKKD-g4wFR_ZquWw_icFmRVaKw5rHUlZSa6vttXf0Gjcz1lnY4TTVXotBJ9pDhqLOQc4nRAeT2NdOFBXkPjXd4PDnP_rEWMr42oke8Wiw4kIq4Hy3kRQHmhcna3a7y7QG7AXJjgzbKTCxr6ChO5WtyIC68rqa0uRPs9DUseXV8--0gd86WPSXj3VDoz7D2x8CtSeO-5Fa_6cPu0_NWeScayhrb2pcs0Ng0k86nYirVMBcjqmH1QE60xC2GQiybOJT6PHQK_sN7KaYu7_2HCAGGyrhN59_CSPnlke4n6lGPLVY2KZ3vPQf18t13mGtUl7t7FuopV8-e2CjPSyuaL79WC8MGdmNoqdUXaPIZuZVrY0zYmpUcety5H0fU7qp10U45rTpxTMhh0UExHpRQeWRtxWCm1dHOL4iC5AvuhXTLC02sTpw1HHDl_St0w0cJw7Z3Y9bPEVKooAYU5gg6_Ol27DRYOExOQ5u0Ks5S0CEEx5gXsiZBm2tyrG6q3Vs0JjLl-1p0HgI_xZ', TRUE, CURRENT_DATE - 60, 1),
    (7, 9, 'gAAAAABrAhJb7YDmOrcDtc2-gM9Tcmn81wTQMEEjdH4hNkS6vyt_CU2UO6PWD3CjW86GyOakhNVZxGh11W7jfP1GgoJGPQW7AviWH1U4-y70JBqrrTMiQklEBTjQc8p7N4U9nAF7BX75Zc1TdFcvm3-zVP65_gkpHJuNjDjRF6eEpSyH3QlcH8BpQlamZmX8QaxFlXbywJ7zLohlZT4q_btgDuVEeOtXY_BEUQaUjcK0PXL9xTiFSr6cSDwvZ02W6IdxI3q6pyHNlrJ-2amNvxvLrH2WLhVw2cWk8SZTZqWWnFv7i0BsrzRpc16FRNMtGzXwYcWiiF1Jy9bLdfxnY_KUZmt_9XUQW3R_h-Y4rzXOFt_l_KWcEOVcodb_BTzyO7wiMMd0cxGSgxZyTxzrfl_QdVgnaxNi1jOGv3ItqxosR7fNtiLXNVEK-_8K6w99XF6IuoovruBo3-goyteXL4taFn3NDQX5rCZyWpPpdhIoE1vtLhgvO-DtR-dAlqbe2qhtv0eF54RHrqwcHpqnfqw3PLVk29aqvbKLASJcbM6--6o_yOsHjfHz5WwB0joWCYgWfgy_wUeNTYXyTqNTJvFBhCvZcskSxGcxdf6GG5HrB03IxsK_R3c8N_D0rRQziJGRV8fUvlIgU-VLDowuTFnwHIbf3O96H2PYWnwGMLzD79qq3kV0V98ZbShYAddU9Dw5itqBOHAZv7UfN6AJDCZo5M7s0LEZWs1ZpYZod_fIDH0YqfYAuCZYuQJBR_6yQgG7kwTSAtK_qhWIr1SkZG8934anhD74-OZD0o74iPwt89PDBsnXs7dqTlCPruY-7Dgb9_uB0VpMGHD6eSpJ9yCBBZVSqa9epmaoM70bE5huRfktV9nrVCJpzQvLSQVg9VOPfUV4JC1_8EggZT1AHtMtHhPgBT9GIKgPV9466S8ZqimDpzZvNR_EgYi5M-_A0rVQRBF3658jKpTebnE09BYxZ89_Y4pDAODo1wgL2IIoOEJD-T-4SFKx8A1mCqsafvWM-nWOLNhhYqG5_LeQbC_KErDEHZDppHgAuShItgxDtlQhnCsOAiRS_ptG7VLmlqFGO3TF9yCWeOyGbrWYvW_tTa5frprSXNMhy0eb9cqxzmaEO5yTvZ6urcDEm_JCMrBWDhNcgiiCojAQUgI3C0ielmSNplGFJlkAmRR9KID22RPIuTOjX28na3Ya1lTR-fWZtFZ8NxOzrAzPYw984i02nOA6acydClf1GJMLwGVNVZBUYbfjs0enZHO6-GDekBqDyKBve6uSO1c-aNsQnaUmx2misBbdgNLXom68HRMq5TEoxfEC6rKx9yyEZ0orbf5pwfqZYNJxzZgg4FE1mNC43gencDlWdPSolfKkx2RlK8axnuRUcrcfE_0I7mE9Zs_sygixHNOSieV0ndweS-dZy_UCAXY0BgAFe8cd8z_Kx4rgjhDLpXMiNQaLlEpRIslVj1H-xRFBffFwydWdFl36DlItzLpCkMGHbg_r1vXsjH8SpYv0h-JwnFSkuf5m5tDAG6z7nxYImbmbd-J_lS9zZ0m4lkC39ujzTQ-CudqYGzfqEisZtM4lyx4Nr9LK9M7ZK5555BV_aS7pH67nT2iBLqnZ8dK2HFs7f86t_3IsI6ZVtUcKU1gKeLv9U0X3Lq4Ts356jZ4hgIiDvVtOk_BUzGeZ0_fcSVAcJ0p3EIPUiv6ojQxMAoss_SruS3tyqG5tbVMi9dNJ3DAOYk_kuwmXJQtRE89iFe8ilfriaZcW6xpVzuVtuJN0uE39WMxBNbz_-Su-AadV4visdS9zEUHriT9rNRqau9XskC5Pijgke7cIH6nyn5UNE5GoqGNfDiw5jyDQLyi7', TRUE, CURRENT_DATE - 60, 1),
    (8, 10, 'gAAAAABrAhJbgIjSLmD8sYcqJt09-iTTdK4r5cd90mIMdiQJHW8C5u0fLlcYkScxpAJ9sQF2I7RNHrF13MmnImN0xyR9RMyxvQ8_ohO-jBCDOfyOD1TpBWZhwHa7uDDyM0vyZyoRvHEeNjgvImB_p59qwNLRguKsV70VLY7ZPqaolR0Qe09_EkxdSr2yMFU2lQSQzGNny_gA4GYfgCliBMyjF-TmipKQakrAGAYi8cGH18nwM39HXxnQ7Tuy_O6Dws7G_lknV8JCBissuwgjH9ZdJpCZcpeS6ES0052_EBO4DniOAoliDk326mGMNY845ueBV-N32lZ_IIZSJRIFLqOSTb8FBcL8gZox9HCjWh-syfkj0jrVEALys7U3FK-4U0d7m6n3USFHC-q586sJUKiu7LCU7SJ-R6uDzurGGAXhcJcgJunEJF9YFd5M0C8FjUjiOPZgURD5VZsBX1Vndx-pZy6kJk6DnXPeoaj9LE03AXBpKlCRK2GPMqnVCj9I5Mn-fk9r0uIV1SXbARNS5IiAgFWsZN5z06L0XaTZZsWALcFH2GjkA0I9-XFxahQTN1Mz9hbgUJLIerIpMy6uyGC0E80V2WrEvyOwRlhaRPnqH-7RDfa43Pcsi63oLcvix-PS0zGz4DEHtxPoaaZZ_DYCcCjWbQ2IzKEYvJWClkVM9b7QzVPl3J627h5GhfXhmInhw6y8TopKnRiWlEHuF2tXs-WlsqUJjE_-Ubaek2YJFX-YiFYEVGKNu-pbioPQUWxlyXP8cfdd-c5L0h9GGBATxEvuJHuUpr0L3KzQqih6eQJtQhVrHWYDaUrZ4U0UF5KAcNyfxIcTHyQ9ObG1uwCI3-iHFd9WNl073N6Z20bpnzJuS9n8rEDzzaX0QnTfeT3CN4V3e351HQDPdNm4hNwr04pPDjIQHnIyO1Aeogf0yZmynwl6MJPHFzhKUqnuu6rbB1AOiNpHT6yHrIqMpW1K0on9ClvBB1-FS8zetogxwLn1evyJtpC_S1whT6tLknbwwCiw4faDb5FVqgxTKSK1FhwVuoTypWBCTqHoKZo5bGWbHpGLD2a-LMeKAG5IHHTZSMlLvQqxXb7erBEt81CLfL5FhToATaGePN6OM399HkCUUjsKwy1iWgOu0f7tggqJzH7qSFUy5I0O3SDYZWrx4NTX2Us0Ew0WSzUc2H7mRU_kVVfSXhSxi-cUpJzWG0mri483EJU4QzAkro5tZDMWFWoEn1XMRodaYNQcH3QRgPljlvvxqjFdudK5B-Af7OjmGDUl0WCDmUJEEAL-Rq0e3fCFQuRTHjha5PItBeGl4ZAxqfg1a3xab0JlrIWeYwINeBSXajOkhvmh3HdN1vfU4O1dxdPOmHi3C2hQta_I_ErnjxPYHCuy7beIO-dQCh9Q3zHlSDdR6dfITcJzVl_soYzWsAoMC337AtyHXYInv-SAfMKZnHfQiiAFtNtBAC_0RB9v9ANPHiBaljkHentOZ9a_NOwQgDcoH0oaJZO3EpYZLmgHzsUyKgOqxnrxTDu0eqrxSg_NElj0BA9XZk5FFf-dXuAOJLoMq23tnERA1TnrYBRqCVH0xSg8sAO2976v_npr9FmCwMJh5v7Ymby1h1Bh6gt9X_LUwcsILrqteyTk73NFpmtDziyhdPYh7OKAXTGmu6odzfvApzbQMfYIp2oOyJLH8Dit2gNwrW2iRlfwyURT8GGo5MF1ElL3h0txzeqplNcDmjT-UOLnFJBFchgFjVciR3Wt7zz5Tbq0KUY7zmU4qqa4p6dTVoKVi0wTFl6pRxjRCV6312VgsxvbQelMdaUM8OoMOyc9bTyTJKoZTmGaFrLrrg-MWGYQWZnoaR1sv4Uj', TRUE, CURRENT_DATE - 60, 1),
    (9, 11, 'gAAAAABrAhJbci1WWTkQFP2u0fdLthrdJxCi7Jly2uoQhKhDoLGOwLdtYY_GFci8OM9Y24K40OUP_OdDErbTvU65flNES8TmxtVhLOiS9cdX1r9uFjPhSxxooMxlQ3n9wrixVxhPfsCKmugHrypdhI2CXa2lB518yiHxmghr9BvCYA5X1U4214R5Wd9kMn-T9PN3lQOuvlOIa2XcfhMIIaFlWAO4mawOTm_3kpcsfnDQgu4npeb8FK1rcVgWVDk9vUdWCu2GeL4T1ixSUCCbV3VsagED4TwNahcWtVl0l2wGm6dO9S7ZC4dhmmtChXIRWD0P2rH7GjdjIG71VQUWMs3JfH2LOeIa7h5PoSrcR_lugCpfrA0NILD0H8PpSfS65VMg7GNMIovn5i0v4OS0Ht3cNE7QFy7XpHkBtxJT9VLyiO1L70LoaI_0WdIvReUvFyY4f_40fFQoRtNSMPi6TrrPYo0ko9UfjJ7Rlvx0WWyEGgHcAEOhaEDCVuIvs1_Qy3pDZewj42BghSuHBByt5-opNMffpDWtPsb6TCIPwHWP2Ob7spT0Ivf6AEcCzR-LGqzPW00W-fl8zSasRajfAuwLL4jhFSVfE6GMS4DsHuse5WtvjI317M_hDs_Z1GnYRn_gJSKl7yTdw_EDQSTOXfSma66mzFJKy8oaR4LrYnmytxPGjBJbyTtN_ujtfdzR8Ne6okA3W9gxZo03j4HycS6p54oBSzH-kJTnouavjtOhJBJ7e1tBXjABts6Dk4uBwzokRQUzRhB8bysGVavQEBp4cLXt1uB3o67Gb71sz8ll0NldQuzGkXdRvm7XNdh2cRoxcYMkKBBNI-JJfRxxNiRs8WSyGdmhxflXETEpuXC7ahnJHUQdip_VzDwu8eUtmsPI-wsWB1oc5OzvJBYlu1tEBiKFIne-8_Xvk5KyDYo7Ilv3mC95b24xPef8gsazYNBHgfrCZhBUJU036eVYyc2481ov2LwoLuw-2gJyqgVPJDMwS7tlQ-y9aEHORJa_2U2XrtzIG6SyAJALeOrpF789bFsi9onxlKEFfngftuzYAKyPVfiPK51v3z7I7Ag4-rjt_PRYQwS0e1VXXiHmZVCKXvI98vfA028YMmJf0GzIV2ExpKitm6QFc-988q-Q2kGJJqNNl0HGQqBa7GFxt03aydLq6lVBvxTV2xl5qpaU-ZJf3agZ5T1NbTkzFXRGgChMMYM0dN9DE5YXALYnFIlNrEv4MJK9gUoWa5BDI7OATVMPiQgXfjtOGFnY0JxsNEl_1QlWo8MqKv62uSy7Zk1ZUL673I8Oqyzt1q00wZ3iCKQs3-1sDdz9PQpPnSz_w3aqfrsn2m1TULfzF-Hr8OtK6-vlp4f2Mxn1j7kZbrAbVrCDsIEcBAXMTf3DeUVdZXfJd-P5rKqfFm36PHYWOHcXNMtv8ZNX7UjIvvZ6nc70_HpTfbcagrY478hT1uIKHM5Pw3vy051oeXq7H5yGYosMfEThgaG4YRKNYJS5hETrgoVPRi4L2t9MhxnX4xoKNihtF73RKvO6bmdlTqhob6iMCrsFhElojaoFJY2T1QST4OBh3hfe-3HIsjf7MIzcgR3nncOjBiOu39TpDg4suKgkzOsg5emfCth7kRyv4d9sNEiwRroN8eW96d_d7DXCKJfbna7mRgJ1CyxrmuanysZ3wP7pusS_Y-zl1f56D0xZN5L9VjS9AWTtPUDzu-4mB1N7HZi3ePhFZqLCDS8CSdIPUf1vyNLNoR6qlNwQp6rUSYqkvHsP5o2uUnd__Zmh8F_ZmJ6mVGqdLriU1eTb5_mn8AgnRUCUtuWuucI7-voYLH6bn4uDWbi19mqNLSMBelB3IwAKVCHu', TRUE, CURRENT_DATE - 60, 1),
    (10, 12, 'gAAAAABrAhJbWId_Kmy7MiIYZFy75cuzk0VTpbzxZgQOzIGjgdUcf-J7sYRfGS3mpdJ3GhSFk4PvzTyUhs0aqLGhsW8MrI6OtZvjYTGyIQSSJ2F8Tqk1r7WO9c-SMlFGp1MOs_p_TNKpN_f64-kkxvLRMqIU9L7cDjpXPebUEC5Giwhg7WiYgJ_I7tuSTOJ0AHbtlZvo7ysTrN-Fr40CTZZxZ6L-VglvzFaGNN7m0sFrosSFmAaD8l_TsEblEG_NOE7IY8pqg0C6tjNkUMCLYJFK3lv3x5xjKSdgUOIW7kiv4qqYaKfubI5eyDmsL1aCQpVWzlUMCujjVfrUyMQzClfrnALX7A2nLmCSREvW_nNIOePnh9_686EcJgwVmJqlQF53aF8waYm5Ds1MJ8JMUm09ohXo4PFXUMrhIE6RE1Vsoxvw5df1_6axu87opj6zMMUDsznEtMiOscZO02HVANKpOPs7mDJPD-eXC5rteG9PO1-JaElifYTE70Ytw_rSPwQ1oOfVFoGn6apevKWrqWtdrIE_8gTaBNyJwJqcyeU42OXitoRy6iOZ8rlBYJxWoZ6H_UEMfSbxWAVtbfm47-MM-sTe67spnhOxLnsKX9EcNs7BNdZY3rdzZLiSrcJCP5wDB1q2fatdw5Xinq2e1gq20_j2dOgCSd3VL_-obcX4JSaalw3QAi4XD4EDNegTTpu4S1WBNfwvojNPN6k992nYSrRu58maiI-RjNQsOBxPoNXYPDaUFkdlFuyLJK4L_HVchLbjJbM2aQrO30dzDeAz6HM3Fl4HNUqMSQ55sHt44aKYI_bgryZjn_ILq93KnYok91oIF7bYctNTEp3wzQnJMwexXwRKESjdljvb9Ubquuo_ucvEa-p0HIe9lWQQn-jYv0rYgkP3O0vg3eg4sgab10XqeV8LZK2P62jhAKQMNf0D9MkxADpGekBTQZ8z-KpcoQXUGHe0Amu90m4-lBOodmw19gR_TcLsUT1u7j4k6KvA951wkVR1Q2Xf6GMqaBUx04RoYf45-2igA5kK44Pd4TVlFo2u5kok0vH8Bd4Tq3sNkLQtKEtwtcmr-txTOzpiHQmzA0xMqzX_emh_N5VTyfA1-zzwRgNOjRWOQCRWGYpouyqdmFXWp3rl04klsHlNOdBLkeXhyPCnkyKkooyEkFOqHUcpucesahnSxlaezNp816SO43H_6G7mHw3VTnqZeXU8LjsunZPPMv8hDxeUQ4-vUck2y15V_mhKXH51w2Saq7ttPAe7TsLLL01tlLGxTlepr5b2ipY4DhahQOWGgdwqXsh43DZv-dZwcEIsfCBINy2NgtxT60zkI9NZPtbLVBbXWRjjmX4bvaZhpNff4PsU7yEwNt-iRbqcZxyEQ8LiaGXOX6na7mfhqpP5GsBwPaibYs7oJiMTDcMfqO2O-k2CxZwuKjn0VLow5tei1eOUAkashOn13JOj4-27kmL4NwFPc9B4weS9KfxVLKFKjIbViIx17aKtVkfXVCl13fUVRrqbqskYviYZ1k8ZKaqo_Vl-EJU-HQSOkPAorWvOxvopqT8G7sc7zQ9DE5E7DxpbjebXHSRefMzr68Sgdg8AzASSoy23dI1my8Mj6KScoIVfRaxhGzUT2K91dZ6H6MO03fBimFsCd02lL-r9jF8tVtISbZ0iov1D4PoS71JsLspXJl3h1wfClPUsSDsK8cHlUz8KBS1l3onslGLgPObqd9CPZYxGsHLEYeATo-vy8Sxt_iM57VGqVd3ttcusr-NeD3j-n9megQ6OnFJ15Dw6KszitUVVpnMM_7cOaKog3IGHQEt9l19UnI847ptSW_S3IkHvjYM=', TRUE, CURRENT_DATE - 60, 1),
    (11, 13, 'gAAAAABrAhJbckUEsZQ7EM5NpDB4cfKWsubCBR0c2Gan24NDy1e_vLfWmuTXQL6uL0UIJauxDu9jUG9Uaa1GEhG1XXlpxESri6UK9jhwu0nc5f92Bd6HCFwkwYKnOLyHp5s2XWmokNw6qMYsiHsG-OrzelEsKo7B8zX5kRbl_rIQELTqrK-Lxo4OCaI3FK92G_wKvVVbunn2tW2dl7jTNe_1qTtZtFNEa9VEU8r1ueEBVDSv2EcDw4ycsdscyjS-_tyku_GglSlISVqKGtL-gDnHELqelPit8t-KpoTVblNVCEgQpvQkn98FzLuO2LJ5J7MwJQXHWp5e8-94bG-WwbG_tCGXr5R1SZxfcB_1_wufvbgQs8XVa6GlK5Qz_61AQmUG0YUimjgU5capIdXHN9Hj-D1y9S7HodbbSk2MpF6imSC2pNFH0Y4OYvFwnc6sPSpEq-NvYXkQqKwgmk064WlHiB6lf32g9FZhWh8vGnjt1fBpIE_WPFzVUztSFdstY_l4mhAwxcaDS1ePv9gwTSp7b7HB4nH0YNyKtV_0AhqNbdVx76jPOMEUGR5s2pqESx_ln8BCg_3bjgJt8YkZ8nzqXFwMOc_TKu0peYty001eX-DYDL6TgBefLg1XyTKY5JCzimZ6-SaiGeOGQmmnVEViw7w3JXTsKjTiHfjSaxGZAlN--KDbLkEyh3sZBpA-5F4g0R3izamfoDdBGJ3p-FdQyBzV1qmLoMULPY5oSpI4oSqXsCKUZ4McAXbucz9jM2Hk69UCA1A2DfD_Pz27kUVLLFgPI6j0GfIXPKa0Ns7kzbVrR3WCRebWgTQgSkfUPPLluSeAN_-lkqbsUQcu6HsmXwXKYGTP8gUfnPXdjg5Aph0rkrdLF5ynrkKzlbhuGhN5hx_DlHS01_gVc8sZnWWOEWjoHF-8UYWhjjElIM6jmJkgKap9gg_p3EYSD1o_BOMNqRSO04GqfRILf-sXIlocwBMI42e4tPXRzH9AdIYQbTnpVLVtBCuUQnG049anxK2ux76M-nEqqhZu4zx2EePacELZ__HpIQofBC2rtPoVJMb0kMRMbdr2s9yw-eaczskepGmoN2Ux3Ozyu9EdTrMjx45pyJCLMXM_HyR8g9Il7LyLrwaG6xf3mnBKhEp3h6SzyVeItWYI0amvTayYI5ozj6W1VJ3r8OezGtHUm9n8KCrj7SPW6YF5q5mS6_e1ddeQSUCW0wlQRjq8MiURnY_LFqzhpilIQ7oEXecs74E227r-dgK9dylmiePs8ooMeX6UFlTi_lpTy9hQe3RUtNBiC5gBdAl_B0MUUxsqlOL1Spg-6dtdD0ht-YILuHZ6n1wIadW7LfN_KPpw4H_8zMedUsUYY1Xqe7xytFXAI251LebFw4BQfs_f3RMjnSNzApJsk0lI41DiuRzNmT_-hi2KGyckiUmyaIW2rOVnQoxz7EjiBX0KoVmB4wB0L7kkLMD17VZ73vIIqFCnFGecmy3hZG9aVMszkiX3gBBx7AVSSzmoBGo3bInUQGa6R8pre0euprE14svSBqUVig5BK9WC_QgzNQmkWOSBAnILL3T7USIzHRgV8DKLsF83rxx9mjIKRNGSUMbYeaIwCd4Rp7vMKBgskdZbormOC6I3S1hMviJUBxYUCKTetrpiKcixlI6xwYDySjxVS_6ybxoJOvOXPrqWqqQ6Cxem83YIm0zAKQzQP1XqkmHPXK3JBHZZvUbyJmKUqMl6gH0vNihB439LOzZQjLnHHQozxF6hY5HIGsyUoZ_-aMxC4ESsagrttuILW77EoW4cIpBZ6FgM0NxD2EHcw7yfaFc8T66lqPKev1P7rkxbr0YBx2qQyieLdkz1otTeLKPG', TRUE, CURRENT_DATE - 60, 1),
    (12, 14, 'gAAAAABrAhJbO8l67UzapCQhYVElSHRTrN2g3jIGjuQBkGE_KPRQCw0geRPqHeT0DbF_gQMqxbqBP3UnVvrYmllSBwGlyZ0e8SZv7fknAcc_U2LSdvDccXHWJO54NfEhhNBqVH9ytoMyo8rHeonDtyBsJD98ijq_LJ62bQDPmaoc3os3GZa60jzazDKYOY-QaZ1vVuUXFmuIxSNnzyVLnMLvlcNSzgE3XQ6JQZ0iPcv2_mkFkqQX5WikMYZ-OC0-K82W2siH8-j8FFnaAJEWGG8mH0zWGf6HT0A9RvHcZSBpZV7txTIxrShzDg5PewRzaAxZA0B5788Gg0nKc-mzICiO6AgyzLbm-Bkr1Xyj9btgH7zkE-cAxq9G5tYNP8VZ4Q1jJROsxDAXN_q-sxu7OaXD_sDWefX53CiKphWDQM2NOlYXay7mGQ0fyfRpycvFPq2nOSDLi0LNSL9jR7cAHY-pjAIBkATZ5BPY099TiM-zOgo8htE0dPtxpKpupxWUTCZuoBFZzhiF45X5xmKqMv3nQExbzWCDRWkC46H6ZK2qJlr2a3Es1r76ZkhoSmyYZW7VsnSVi7r2bCHEN54qw9mxZgNEGwd09eDoAEU9c5_UnS3HPi5i-dgScykxF49K4MA9ENg6S5eiFftjagl2m7RjVFW-9detwXydsvNXN64R56GVp2pdgsfOywEqMr_kuEOz-iFdz5c15R5qO5pNWIQzIpJ0k4kk_-L9M0nqe1eZJogKTJPsq09KgvnK4exG5nCGzZCrtsbQfhVNfw2Sz0b_q94I61lI3yCng7QzeQNMZt1zRvqQazi3oVcZ-fH5Wzo3o4o1hqlnJOHRfTkU7yKLA73XR5VA0IWtTKQh3QDmLKH9WRx3UrYYO9EG6nbaOS1RbWuJtDPKT-Hp_8BBfKR6cyDdwAKMI-C6pU3tTp68iKSnBomHQyi6jSIqr0pKILD5GaV3L-6gvnGClYrXLjoeUUOdc2BUVb8WcSkS8j8a77km_qUVswyT9tidkENNWCb1rg_nvL-rblSuoeuCLXmY75zu7zrz5GF-1IbBYOJ6UK2BztTn9LHQRSAShzIRafv8QEpJ_PPZ3EJXqUCu-17_BA2uoqU4hxvH9EeMG6dgvNOFwSs57pfeqS9FZgGgfWXvoNGKHYZfXIl4XNiV3tqb-9hip7o-Sbhyt04GIt3bOFPn4LDaAxPPEpuhVtlKi0x22rDLn1frR6vghPIoPVTNimmtP3vj7kq3o-ZDFEpo6IGgNa9T3CKtcUYusL9sfPHa1-lVf27xaUrauCVh6skbVcxaeIzQUJJvzAeECLMMsN5ZCiAmRgS6fAkLWDsi6RtEtfCsKqlqAJA24GM0bgmFVIRAbp9I_jCzyVZrwYbqlscVOAw5NPmFe7obVfDZx6CCBWY1jTTTKYUknB6T6wW13t4iW9xBNhRTy8z8DiBYB6yxTduZWOXxfd7BDNkpJsbI7tkH2dbgF1WMym5XjRvSPk5981nWUNa6n92ee14uOKtOKvxpNrwCS6aKxopQ1-C9Q0sZqa_8dEV9GK-cqzrLVIdyvT5vuJyqEbsc4l6WnO7lxwq2lA2tzJj_YkvqlB-j1QnrPo13LuCb4JW1K2fgGVhg1BxQL57542Uh7IsKmrG5xnpSL_avV0KKF6rpvMH3v30n6sK80vDVv3y6RXS8mjBw_oj5Pm_hhhKpe58lOS8iyQqc1CkeQ3fC2CGoFg9fbbALAsG-wvfZxeS3b_y1-HP-q9h2syuYOdoHKlMjsj64SPCB_ycew-UiBRofKQUwvYC11dJPMr8hMNG9WY1i2osa8drKtNGqIoU6Y4Cox8AmAvfCif53aK6zMSiUybsW1_IkDWYa', TRUE, CURRENT_DATE - 60, 1),
    (13, 15, 'gAAAAABrAhJb12vB2JlrLrehivtvJKwMMi9_Wo10wG2IBawRPO2H47C4JZYg2T2kgc6MUSKuG8EUVn-XA-GxWVegjuk3wYl3M67F63FX1zb3B7hU1F8qUW9-swxTFvp3Uo279N2JFMB6XH9qRj9aePkZkFbH0E6_D3L4wRtIit3mFU23PVNaD_wXKijkv2jHtzy3vUJ2Mo9yS16ruNqT0BgtK9dB7yJjinqqXfFoNrj_woucoQucUm0T0l11jCED5lwrW3qCl6PEOiTB7ppkiD_MTecwXoGKwejf2ykne524zP8JWBwyFwnMsVObn36C6tWNbxj3Zvo-_VM3w3uS0QQg4jiTMy7rkBGyEwlGMC9urAXKZAwUAmMT4Ue4Zs31mDlnvTOhBQyfS6iUjUbScChWAMiPHQCVm9sCCSvrZwRXw4rZm7fAt1NT9FNcuhjNyf5OrrY3P-vukFOOuX7FizxRKRuq7QLlXM06-o48vN6FzhNFx1WwlC-hhUhuetQyNIvBH4GPf7T_GR3YwHLCzZqimiRsfhva8vXQFc_I4y0sDPAsuXTJfSrxmsOHMaj-a4oKbwhYJ_ht5o7vBN9tbSlYuqPYYzEb_dLdBlTHyIUF5YR-sKkQ1KufUC6wwByzAlLSXovPyJRm6aYcb22vlwHeVEy1IdTodhv3wzvZqW520DInJrRC0jdrIdb0XsNTffv2LD3QiLJdbaA1tUGPvtQNlPOTUe0diz7MR1HE99_M3_z-rj2eBsdXZsX9k5uecNALwXvrEmSxdPgj0-HuOAIqnk-7GHnkaoAlmZE9-7z4jfThlViXGJhmmhmX_1iBEHFLJTkFGXv5ntew4C5yrSqkfuIVmjkL3o0q86NkCEfUhbJIZo1o85Qdx27OHvu59HgPDyaH31RzSaHjlIALEezg9X2zgUZ_iR8_ClpRjf6A_G2VKlB9X00PbXlEG8NfSDoklxH37pdAA1iV6fg0QVEnYYdCskUsmXnBj8siBEyqEbGljwedIlxftaWGtk8rnCj7kQRcTiudHwAGiOlwYjSpkbPclJcCUf64WH6eAC9H3c2ZRE1a8K95i4Ps_KgRGoYz88yMsFa-n8f9hKk3ulX2M0t80fi-75lOIZElosLKppy4l8v-mllHrUJE-4ujG_IjEjWGz2ZUYriuZPT3WNa2OpyE8YvDeRn9b5uR4e87GZ1TsefnbKi8AIGvzfPcjoBdGYc7CCC3O_XZAOHX0ILRh-76jHbqewVI9fJ6NXXYwdNPf-82_27cOEBbK2gOI6Lv265QdRwmiWXGe6VC3etBlSZKcQ7CwbBF7tlP2unM8Uy43KI1rmErELG57VJCD4MpFg4D_dyEGhHnO1jueAzDm92pJA4x7jN8JO9Iq12KNWSVm3W9RfbiQC1ErmujU7Nq1MhbuLZEhuI5MIXUzWpiotZXe-nkJP0JYMT554m7p2DEb1AZlmJ2-4UFhlZ3YZiaj4GcpR85e3xbP8sMctFqE87sN6mCApeSj6FDbcWd2SJPSm0m7eYZdVXIdnAwpO6Dg24Fo4q7zQfW-YcVqrHzqIPypJc90UPbB3R0dyJhp_nl4ILqTdfHIdCX0IGdvKowl4jxih9j9rx8HcmW2kTe35GFiYuaUnBHA8emSmfII2V8mdG3vkcyVagP5MFyT0LJ1RMUck4dDGBQbbfM003EeMzW3Ct0DIFsDjq5eM2-a8J3jHwllUugD0WEUW0d-qNy5AkTdk6L4bnpbtUxeo1wE06sJbWIy_yPeg9Vi23ByfqR4tSsx4Gf5GrgHzBT0Ip66o53heUVbMVVjgmAYZvldD2bIR207db8mfGmsQH2XDAHpS7fDECivg_wX9oNNA2K8nZlHmNy', TRUE, CURRENT_DATE - 60, 1),
    (14, 16, 'gAAAAABrAhJbsjp-ladDNjs47UFUW6QISfWgDvnfzJWebklz0nDUiZ1kIz2lbqOSKPhkbVd4FtQjf4myeInbkzMWVth7BzXni08MBuQ24Iegn3_Gtz-FPOu2sLwwQDK8epSeXgPJHps0ymeQEnOMwKOz-RKT7c3RilmvLV715saxlktwCf4IwwPFMGYbJLgAIjqEQ1WBaTM1B085nm2jzcptVYQS_KvIepjtHFzBQlcIbPshkc6Qqi3M3YTtZhGlfwvqzDUlUZaogMLoAd_ow1sR2LCprrHSwj0P4vxn29LUIliHZBADDeiremoAnO3r1LBUA3WxB_0gEl4s0hqXCHeMTM-cc08IGbEBeSL4GY_qZUxa_U8P-4YvKoOXbj8rwpdREYcC2nDc5pgk3BQT0CgdIHzyPxgkgqpH-nK55rieQd95Ou80ptbC1M-LDrnxtZNYg0ccthzJlOntXyMXt3HTTltgoiWug0ImQpvmURssnrzKdcYZfr7Cti5nfpDjz5oZWIuDy8hyDLMJIrKETDWxeK5qWgcRp1l1BXV_2o3Yi4L8u-Tj6ZEC13Dy2xYbNtPb8widovwu7WeR_qM4h5-XVIUYbhqcaTR_GP-rtTu63sDDWuyiMiL48pUuAIK3onqZVA2QQyavd0SL-os-03lwT7_zVSq_XLtQHBI-11C6Xo_dKl38PkeiAmcxt0qgfpwTURO1JXqHbEcRoT6rYFxnMIUEFvS-6yWrO-x-AVc-tGhWxQ8V6EMzqr6_k9xbrcNBampOMxKCFQlNrt6kxkrNRVscARGN58xQhvndsgH2QqL6dfHUEZA1XuBThY9Du51U7qnDGI9d5F6wW771N3Vt55epW6vnGqljhLZbLnYNtmKgGtISENnQA_uLD736onJ6kVzxw3BPI55e7J0Ndt4p-rsF5xK_zHqlP1ljIK58n3o2V2APclAkXPkFvevN8BN0CLH7_NJJJ5Urayt2zoCkdOrN5VlEew1IAIoVDmADVgk6cocD9Amb01ZUsAfFi5GBI4cgqJS__9DWL7teb39PouF62oMYxaWsWIn_2et_EGrab6FiAsyiskDQBHhcvKP2NNxK9NbwTJpn9EJCuf9efDJExKPKy4jdwz_dQLxRft5XZqfy1GnF7OS_x95UAKGE-UZaFaMucuFNpm5mN6bUDi5wxIIdl3R9k7yP2OjiO5oSsoFRCCG-f-5koKU5rnD4r78ACkKB4ZDedYcLW0JhCHzhM5ElnoVk0Y81pwNv4KLJxeRw0_atTwoDvlUhN6kyuTgtOp3-qCYyEyd6-4YpbI8YAalXgBHXi5r6L8XGlWlEdRCba6blX0V3AywvIHsjh0j66_vOxfZrlBrBraGijPazmQeKn6IOxLGNDTWVyACQq4uksR43vLHggobWXLkcaJmHVQO_38_T4rzkanxKrWTRLnJOTV_LNFIwysVAMp4iXmmoLFWfwVIR4rbAHfxmftIH-igPjb3KaYjMf8XB4oj9kaoAo9Si0LCvBicKlTc4NN-C1xH2Z39e0iuRYieleMJ31iFRXbtIJdrKZpVbAmw26rkp1N-lhxF2wxBWPfQAz8CVDq8q3Ml_aLZwtfK6rrw_b7413hFC7wEBT3LIVDk5khnV043nVi7k_FCkjiuocHFTuR0-8tI35FcgCuog7B05ZAXJMY8PiEEPPsd_h5TzrwtQtOjtxpSdW2codKC96095uUtnniqY6YFR_qM7habMwAymVyh8zXZ3-27bEwT0rTo5OJzyUtmOc7GS_8AGNfRUq8ChtB_2MGALyDkwCzF1yz3nyDfbsmjhSot1dhK-KIcU6zBUM26RzMW0yV6jcWpfVk4NVzxYVbgshlgtOfzsRD51', TRUE, CURRENT_DATE - 60, 1),
    (15, 17, 'gAAAAABrAhJbbSCt2TKceDkQcPExtaTml9oCtaLzdYw4I0EMqA89DNzX27RnjQbefaFKsIH3avNA_hQJpcZrjZdfElC-LLqtY4EeWJBnSDpULCGOCrT_deUHHWZpHa9SsrQ8u2B4rs7YO692sxxaspuliJMTG4exB0CQClSBqs_Bhg0DYBI9lIXkmqqtJDEr9cxCfiThQqK-rUvrLxfedM18NEjvLfEzyBrWqQ4LuIjUgodF17mZ0JcVCacvwXlRmBArEEu1duc5Qqru1zyCutOVtprKshhEaIYDZ4JBOPkpAXUbY9Xtocg6V9u1XXi8MuEcPE1Ygf06Ooipt2G4pRJPH-PYzMiTc2OH7fKw4hQJLVRwE4IIJuzStGGzfctbZ8Jx7aDDXRmyEjyRWlDKQIsjgJgcTTGtXyLjENv-rdzuhKN0wkqG3_9jH6QvTi1Ng4ZwdxRjK4zkoUaZj4Q8G0CqcMFBkzZ-SJ5zjzBseM92Sw7piyOR0FixDiizxvYbgVvVAlLS3PD0gBp5jqC0cR5jNe6LVcsGHAkyNkosMfs2WRWAAkAPm-99asK0KNSJ_P2vh8W5dQEqUu0E15JN2VFrVSBEaVOCde01OkPkTXtTahwoDTj0qtP_rDjD6f_btCQmsVr3yG6CBMQj7NJEzrGTBSIHBvXlweDUbCsLq48N71Bif9UfZ84jHZEnEuVnAmTGvQ6rEEkZuzfOEC3LHoSC_O6GmcAX8aALeExL9BN__2fO2NFZNn6P9vhT6G8GDu3Mn5O60L1P7OvTjowOcHyjgcNDII0m-OIFlPKY1JHh2kBMIxzM5uIOR7Wr-SOJmkbgwChM64RCmBr4fFTwmbMeHaGyBGFbrsr4e_Y8tMh_Jya0lzjTIU6PZv4I_35O0XSK2c1mRWAvpMk4RWQo1xLRZViFY2tmXfYMCMdC6iQyLvLxk5zYjiQUriM44xDrq_KZwTtEGYvLbiuHp4PeogpYje9XPrsLMMXqiImIiAfyE2phi-c01WASLNmDZtfJK9wp45lNrsLIq5X0JI596-y1HOqgd9BBvDdn-xAHbCX5SZYlzTTUMFEiN3xpnmbfB9zyjRAEg2JY3L_9GOxIc-g4genJJJc6hL0LUAtNQ0o4tFOUyMHesM2Vq9aX21r290DXgyet4uaur23u-cruUp8CTK5HUu7E1BbVptew6lFbO_fo1VY87fsCI96AeUOBvCy2qb__auM-CJpFaDIBFF9FeaHhB5AWt7gVlMaJpVwgwRrH0lqga2lxxQDedycIkb_E0vErwdHEqlJBdtsva1k5Rtgrrj4Wl-5ngoxTE9SGXOduBmW1W89luvAEofPRXEQ77g20TbQwizESeU_3d-x0t0EapRDFu0rFMz2ocz4keuSQP3paYTfUilaFDBKKtGnMhUIWMKuMoKp_2fp_dJsBmkd_kLtrKLys_Vwwlo08NbLvnOXxf2rXPLRE1w98vcyN1ZYoAJ55NL_BH6HwDzFOvjnfxufEVLyhGE1Sn82CwKIxDK1ZAz-ACCuB0V4HyhqgVyPnfvo8UJV4LUetdP4lI6y45Hfm1H3R-c1NL8HOxME8Pib5g5PWOyE5XRrUOPozc96RwipxkS6s3eeheKlRkLwJjmeOjcpqBktboy5a8thf2BPeqrvl_dMH937V4lCRLyWcuFg2LeX82LMyTgtROedUVMNjx5uNuSWo4MiHl6DNRVrEE2K6G83oYSAAkynFg578v8hwzlJxMZl1KSGBZhIGaLijG8xriZHl9jEgDsJD6NsG2wG6rN2F_BsojzxDh46jVaE3xeIfyIxeUVNHzuRZMeIc2ojVA11o0RpSYAgXs1WlnMaGJN7GtQ2LBFXfSsyi8DIt', TRUE, CURRENT_DATE - 60, 1),
    (16, 18, 'gAAAAABrAhJbW_MlupwLRJC5pbwCctY-iAkYhY8OOTkvXHFWJtILhmZjPik3nkoT7QjRZ14y0OkxhW4stJFVFfNhNtcNooPI6C0ef3xZ0p_mwvH2J27ySJbqxX4yufQ_4v73gsP4JjBtOgU_3OBcHIqte_8eqoXy0qu2gQnT5Srt0wN56SlICTHesqX1WDyXuw11ankomVkyxaQ1-4RSgT5cFbelYjAOzlHoIAqXuPzw3IA07RfZByEHp1JGn4IdypCnqpHUXGQVodQroBOFCgZXZktPX_r6id89K1ee2qJN6mE4WiwRa7HkETrjx3B7VS23fGQrL6Xl1ILvbOHNACHQgPbWFFdhO_JxuTf5Gwx0ViKMPSjQymoj-5IAefJkt5gKFoLmacIcUTZbgWW7LnOLUSkXkjoU7pY4d9eGaJ8CL5fUXK95y_HJ4I-4BOkPNp_wLdfkF0U737akCCokpU_t9ZHUcgS0UeF7NLnafoKCl2y5i9su3sA1__CsMaD8X4-AdNOwTr-q9IvmMFwwByhOeW81tDtbufRKFr7EjGBbWyZImuxrQZqYBlEUKw-OZQ9JGiRupLz2XLUjnLhXruCbFOCwfqz-Svh2dXtO5Rf3YZwjQAiKpBoR6p0Te-2bXFPTJHEKWTJgrF4dKf_TNqy2N4lQldhG3IDuMLJevc0A8WzjVg1jS6Yc4Ty6MRxYxn4xSar-MJClTxOU51bWAFwGL8q41NVoGNn5FO6y0-uhSRP-wd1lvfsvdOg_NVdqcOAvhfAckBq4aKRqxAZRASAO55NmneHQ7Lwg4DZ0t7g91pjxKmS8IpVJFwFSVxuU-HgYWjEvMNEr35TcF4u9jLG8ybBjY8QNEbvMYc151CwGEO9TyOKI0PwZmO3dmL4l6u9F0wt0yFEB4IHCS23duBerqKYcxqXxK7wCCUppZHCRBSeBeu_psiCu53QtOxeCJaxhz3UbT4-7t6JCXTV2-YBWQ9thIG_c7HY7pqfc8HE7sXrwF_QfgzeTglT7GCIu9vJI7tlqovjRrg_E6LiT5xgX3U7Wwc7-heTlSlBBqok9decP976zvYYPQ3vpwIVvjQIjcQ-eYMOdGmLuI5qiLoSDdwglI5hwE2e8tmpvS17LeKb9gMSK2EXZNhSnNGKbd0IML9ayw2UNv7OauzYZ4FxXedk6x9V_VUdDSo9S9lcvto7DqT9U6gesCsTWBnkZd-Mg01ZBottUXVWmpgPOuO791sudM4HuDI_eGGagI9voqs4MfvVAocvmf_i8nmxv-Piv-JJn9__WwgJOb-uEPoye3f85rJLaEHmBsvxmJh29hiqTBrXNOlUsw6hiI5zDHuwvZnPGqz1cwtOJ3mI1QYBYNjT2QOeYL3COlLDWO1vY72QWQ7nsZnbGp9a-EUs5U5dPLpotjYrwrdrYyJzFuM01X7bcESa8VSZbZzgPtwd6o3pEQoTpuRDV5XsiNggqJtFXQQ_uCcg4vsHo_eNOyGrXaIJyUvMUEGenlvhCX8YE7-9Hyp6IqMcSpUnJOwCiFWOb9LNwmEeJJ7A6m-qwOu1iwmJbmapCAl1x6RHgyIWAU2iw_fGIE5AOXzwYvMg5Oq3vQ4QUvhek1oY4_oOunJ8RPuVLgrnRRgV2kpmgEuuypR8t9hMa3yr1WdEwwj7O0h-rmqrAblNVfatE8FXiMPbSB7AceGKcE7W7P-JFAFW5nIx4TuWNa9PO95ZysJZNFjlIjdzNGGDSR83Svc0bj-ZAhikHRUwQAtEAjGnMfhHALQ1iW75wSZF52li4-Veek5nNROTJxREozCcgzV3IUGREW4EPYREiSJrt1_G7stJHOybfYcL8zpk=', TRUE, CURRENT_DATE - 60, 1),
    (17, 20, 'gAAAAABrAhJbAdv3JayAPlXmwPtlWcdVmGG8y6RgIla-L1FB_PHSyIJj8_uY0oDZ-VnuSuOAQuOhWjCj4TCORwpJ56Lr6HNkUxekzhuOYrvQ7wkInMQftG9cuDttwnBcxFNObkeCURByXqSAmEIQShCOInjjEEktbvamo48MWK3caa2EKfzuA3KEsePF9oAGMf4WZTKSZKgE-TML3yOXNZQTSxQWwMKbY0VvOsvuHCluGUa9Rf75rkr0U3ODcJ_iPJN03QLb4esfJk3BfhLbM659ir_abh55JM--QmIAbfZLiUbdOpZmE-nwaPRYXdO0oJiW7Ipoxa9Gd3oTy_GVGfKcBIJbuKFMEMJrbRCF6N9u7D6X_gkYkkWDKHD0u8fFJk3CAaHFVOE6Sq-UIjzB4RcPW1ioNWi7kP6DxelIplfQ941kwJhXrwEftB7-TaFM28FDWP7Q-rJPrBTLTwLeChuK4KT6hKP_jBx8_dvk_3tVFkm0cjJiEw7fBRx2fsikJj9nxCVSCgdTFqd-V09OGtHVkm-isv8ZrU8rovC-m-cIyC1ehdWaPC-py_DIBrwyjoHf2UzjFeIBJjF18LX22BMrAigRIIJifRy4R-eqJc5PIlshF31UIrux-zySrOB7x2fIGSOs-5BzgzQvCPJTHVVNfuw4owKcGUY-_MyLD3GEVatozn3wjm3LrfCG-gdzAlkjqgh3qeExO8imaW6FvYYCLjH5ubdpdMbhqjQZWwvVX9iSXiqd-p0FgcqRmES2LeAldCW3GIwlyFEguXjydWeJcpZ0vpgV4khu9Kz7yzC3v_LOr5y3LP-gR-Xu6BlXZiHD7gTJ8279aAPYRwQD6Z9m-yN9VBykkegtb94HLsVuox1L9wB255r3pfQuBU-htgxzuEgKPohgPcy0CIScHAAJXIbBdSCw6TPOrWv0OvBz9-jmJJVppwKVC966QvEzIp5AOsKUKMKCGQdO0FbszX-nmU9tniNAJKvkN4C6w0Qkdr9mpfwJBmw3QlI3TZtVcYhGXDxZ9H2sPqBtnYjRwnLioLhIy0VKO833WSLpURF7tHlNmT0U3olxi04fr1zLa_7oNzMI5flSSaT1cuptNHSslGvNLB0fPDsD46sPed0BKQlVvIjeJT6BW00pn0TgpxCue8cF_eZarzrI5ZCJk9VFDmZ8mWZGK9Yu8_mLewxBlvakgjwLOJVB0ixxAlbH-s5ajakTdEbz2IVhCmuXkOaohfHr2bgEY7_5vD7kUJ8yyvIjrV-DazV3RaAstzfOjHfKidyT3bwfyNcfT2Ym0cXxgoyAc5nQJXj83kDrdDb3UPeh9F8pRyGE7bhp4Gx6hKcIyULuz5yOt7ECVxkjyNKQ6goh7vw2v4FDFcOeId3BjYGVBglHHZl9PlpY6zZvl5xkfadFRfKWuTj8hA4SwWyZjRtQjcl-ZumbkvhxO9jtfFDTE--TwZ1UGLz1WTYTb24bWZcaT7nUQzh5F36s_FG_ZqgDmLxgS6w_ML5FQ8TRGWiuRYajRI9JWlfKw137STlWUkElsDRRmEMJ7IODT006hKTi-28T-wRNsiTLmg6cWffXL1H7SRZ4jUuNIU3DyroTaVSZIM1l4HVKCOHUg_pYvM6SQ1cdgCgTkNyc-7nwzPDRw2oTLLLp8VDLtxdIgL70YolFnzEr3kvx5Qk9XSPe3pGVHB04l-oj-afBpMDcPzc68o4IZOoI1yqNSS8YXYyxaUQJ6BDlKvJJLM2Y-RGgIK8l3Ee-ny0tgt_b-Nx8lhCCg_qIRVTELqTVsh_0fqrxzfkMc8pegHvxgqgsi_BJROYNgCJkvTlH6gNz3l4BrwXToC9jYX1ok_sRJfbfRr1JpSJpWXJT', TRUE, CURRENT_DATE - 60, 1);

-- Categorías de insumos
INSERT INTO categoria_producto (id, nombre, descripcion, creado_por) VALUES
    (1, 'Granos', 'Arroz, fríjol, lenteja y garbanzo', 1),
    (2, 'Cárnicos', 'Res, cerdo y pollo', 1),
    (3, 'Pescados', 'Pescado y mariscos', 1),
    (4, 'Lácteos', 'Leche, queso, crema y mantequilla', 1),
    (5, 'Frutas', 'Frutas para jugos y postres', 1),
    (6, 'Verduras', 'Hortalizas y tubérculos', 1),
    (7, 'Abarrotes', 'Aceite, sal, azúcar y harinas', 1),
    (8, 'Condimentos', 'Especias y salsas', 1),
    (9, 'Bebidas', 'Panela, café y concentrados', 1),
    (10, 'Desechables', 'Empaques y servilletas', 1);

-- Productos (algunos con stock bajo o próximos a vencer para ver las alertas)
INSERT INTO producto (id, categoria_id, codigo, nombre, unidad_medida, origen, cantidad, stock_minimo, fecha_vencimiento, creado_por) VALUES
    (1, 1, 'GRA-001', 'Arroz blanco', 'kg', 'proveedor', 120, 40, CURRENT_DATE + 180, 1),
    (2, 1, 'GRA-002', 'Fríjol cargamanto', 'kg', 'proveedor', 25, 30, CURRENT_DATE + 200, 1),
    (3, 2, 'CAR-001', 'Pechuga de pollo', 'kg', 'proveedor', 45, 20, CURRENT_DATE + 5, 1),
    (4, 2, 'CAR-002', 'Carne de res', 'kg', 'proveedor', 30, 15, CURRENT_DATE + 4, 1),
    (5, 3, 'PES-001', 'Filete de tilapia', 'kg', 'proveedor', 12, 10, CURRENT_DATE + 3, 1),
    (6, 4, 'LAC-001', 'Leche entera', 'l', 'proveedor', 18, 20, CURRENT_DATE + 6, 1),
    (7, 5, 'FRU-001', 'Mora', 'kg', 'insumo_sena', 10, 5, CURRENT_DATE + 2, 1),
    (8, 6, 'VER-001', 'Papa pastusa', 'kg', 'insumo_sena', 80, 30, CURRENT_DATE + 25, 1),
    (9, 7, 'ABA-001', 'Aceite vegetal', 'l', 'proveedor', 24, 10, CURRENT_DATE + 300, 1),
    (10, 8, 'CON-001', 'Sal refinada', 'kg', 'proveedor', 15, 5, CURRENT_DATE + 500, 1),
    (11, 9, 'BEB-001', 'Panela', 'kg', 'proveedor', 20, 8, CURRENT_DATE + 120, 1),
    (12, 10, 'DES-001', 'Servilletas', 'paquete', 'proveedor', 4, 10, NULL, 1);

-- Movimientos de inventario (kárdex)
INSERT INTO movimiento_inventario (id, producto_id, tipo, cantidad, cantidad_resultante, motivo, creado_por) VALUES
    (1, 1, 'entrada', 150, 150, 'Compra al proveedor', 1),
    (2, 1, 'salida', 30, 120, 'Preparación almuerzos semana', 1),
    (3, 2, 'entrada', 40, 40, 'Compra al proveedor', 1),
    (4, 2, 'salida', 15, 25, 'Preparación almuerzos', 1),
    (5, 3, 'entrada', 60, 60, 'Compra al proveedor', 1),
    (6, 3, 'salida', 15, 45, 'Preparación almuerzos', 1),
    (7, 4, 'entrada', 30, 30, 'Compra al proveedor', 1),
    (8, 5, 'entrada', 14, 14, 'Compra al proveedor', 1),
    (9, 5, 'merma', 2, 12, 'Producto en mal estado', 1),
    (10, 6, 'entrada', 18, 18, 'Compra al proveedor', 1),
    (11, 7, 'entrada', 10, 10, 'Cosecha de la huerta SENA', 1),
    (12, 8, 'entrada', 80, 80, 'Cosecha de la huerta SENA', 1),
    (13, 9, 'entrada', 24, 24, 'Compra al proveedor', 1),
    (14, 10, 'entrada', 15, 15, 'Compra al proveedor', 1),
    (15, 11, 'entrada', 20, 20, 'Compra al proveedor', 1),
    (16, 12, 'ajuste', 4, 4, 'Conteo físico de inventario', 1);

-- Visitantes (tarifa visitante $8.000)
INSERT INTO visitante (id, nombre_completo, tipo_documento, numero_documento, entidad, fecha, valor_pagado, creado_por) VALUES
    (1, 'Ricardo Salazar Pinto', 'CC', '19876543', 'Alcaldía Municipal', CURRENT_DATE, 8000, 1),
    (2, 'Gloria Inés Bedoya', 'CC', '41234567', 'Secretaría de Educación', CURRENT_DATE - 1, 8000, 1),
    (3, 'Hernán Darío Mesa', 'CC', '70123987', 'Proveedor Distrigranos', CURRENT_DATE - 2, 8000, 1),
    (4, 'Paula Andrea Cifuentes', 'CC', '1036987456', 'Universidad de Antioquia', CURRENT_DATE - 3, 8000, 1),
    (5, 'Fernando Villegas', 'CE', '456789123', 'Chef invitado', CURRENT_DATE - 4, 8000, 1),
    (6, 'Marta Lucía Zapata', 'CC', '43890123', 'Madre de familia', CURRENT_DATE - 5, 8000, 1),
    (7, 'Óscar Iván Duque', 'CC', '98765432', 'Empresa aliada', CURRENT_DATE - 6, 8000, 1),
    (8, 'Natalia Galeano', 'CC', '1017456321', 'Egresada SENA', CURRENT_DATE - 7, 8000, 1),
    (9, 'Julián Echeverri', 'CC', '1128456789', 'Proveedor Lácteos del Valle', CURRENT_DATE - 8, 8000, 1),
    (10, 'Adriana Montoya', 'CC', '32145678', 'Visita institucional', CURRENT_DATE, 8000, 1);

-- Observaciones y sugerencias
INSERT INTO observacion (id, usuario_id, categoria, descripcion, estado, respuesta, respondida_en, creado_por) VALUES
    (1, 7, 'menu', 'Sería bueno tener una opción vegetariana al menos dos veces por semana.', 'revisada', 'Gracias, lo estamos evaluando con los instructores de cocina.', ((CURRENT_DATE - 0) + TIME '15:00') AT TIME ZONE 'America/Bogota', 7),
    (2, 8, 'servicio', 'El pago con el QR de Nequi en pantalla es muy rápido, ya no tengo que salir del ambiente.', 'implementada', '¡Gracias por tu comentario!', ((CURRENT_DATE - 1) + TIME '15:00') AT TIME ZONE 'America/Bogota', 8),
    (3, 9, 'horario', 'Propongo ampliar la reserva hasta las 9:30 a. m. para la jornada de la tarde.', 'nueva', NULL, NULL, 9),
    (4, 10, 'instalaciones', 'Faltan mesas cerca de la ventana; a veces toca esperar para sentarse.', 'revisada', 'Se gestionará con el área administrativa.', ((CURRENT_DATE - 3) + TIME '15:00') AT TIME ZONE 'America/Bogota', 10),
    (5, 11, 'menu', 'Las porciones de ensalada podrían ser un poco más grandes.', 'nueva', NULL, NULL, 11),
    (6, 12, 'servicio', 'La cámara de reconocimiento facial a veces tarda con poca luz.', 'revisada', 'Se instalará iluminación adicional en el acceso.', ((CURRENT_DATE - 5) + TIME '15:00') AT TIME ZONE 'America/Bogota', 12),
    (7, 13, 'otro', 'Gracias por el almuerzo de beneficiario, es de gran ayuda.', 'revisada', 'Con gusto, ¡buen provecho!', ((CURRENT_DATE - 6) + TIME '15:00') AT TIME ZONE 'America/Bogota', 13),
    (8, 14, 'menu', 'Me gustaría que el jugo fuera sin azúcar añadida algunos días.', 'nueva', NULL, NULL, 14),
    (9, 3, 'servicio', 'Sugiero mostrar el saldo de la cuenta institucional en el perfil del instructor.', 'implementada', 'Ya está disponible en Mi deuda.', ((CURRENT_DATE - 8) + TIME '15:00') AT TIME ZONE 'America/Bogota', 3),
    (10, 15, 'horario', 'A veces hay fila larga a las 12:15; podrían escalonar por fichas.', 'nueva', NULL, NULL, 15);

-- Control de producción de los 10 días anteriores
INSERT INTO control_produccion (id, fecha, almuerzos_preparados, almuerzos_entregados, observaciones, creado_por) VALUES
    (1, CURRENT_DATE - 10, 105, 102, 'Servicio normal', 1),
    (2, CURRENT_DATE - 9, 98, 98, 'Sobró sopa', 1),
    (3, CURRENT_DATE - 8, 106, 100, 'Servicio normal', 1),
    (4, CURRENT_DATE - 7, 99, 96, 'Servicio normal', 1),
    (5, CURRENT_DATE - 6, 107, 107, 'Sobró sopa', 1),
    (6, CURRENT_DATE - 5, 100, 94, 'Servicio normal', 1),
    (7, CURRENT_DATE - 4, 108, 105, 'Servicio normal', 1),
    (8, CURRENT_DATE - 3, 101, 101, 'Sobró sopa', 1),
    (9, CURRENT_DATE - 2, 109, 103, 'Servicio normal', 1),
    (10, CURRENT_DATE - 1, 102, 99, 'Servicio normal', 1);

-- Ajustar las secuencias después de insertar con id explícito
SELECT setval(pg_get_serial_sequence('sara.rol', 'id'), (SELECT MAX(id) FROM sara.rol));
SELECT setval(pg_get_serial_sequence('sara.usuario', 'id'), (SELECT MAX(id) FROM sara.usuario));
SELECT setval(pg_get_serial_sequence('sara.ficha_formacion', 'id'), (SELECT MAX(id) FROM sara.ficha_formacion));
SELECT setval(pg_get_serial_sequence('sara.menu', 'id'), (SELECT MAX(id) FROM sara.menu));
SELECT setval(pg_get_serial_sequence('sara.plato_menu', 'id'), (SELECT MAX(id) FROM sara.plato_menu));
SELECT setval(pg_get_serial_sequence('sara.precio', 'id'), (SELECT MAX(id) FROM sara.precio));
SELECT setval(pg_get_serial_sequence('sara.reserva', 'id'), (SELECT MAX(id) FROM sara.reserva));
SELECT setval(pg_get_serial_sequence('sara.pago_deuda', 'id'), (SELECT MAX(id) FROM sara.pago_deuda));
SELECT setval(pg_get_serial_sequence('sara.plantilla_biometrica', 'id'), (SELECT MAX(id) FROM sara.plantilla_biometrica));
SELECT setval(pg_get_serial_sequence('sara.registro_ingreso', 'id'), (SELECT MAX(id) FROM sara.registro_ingreso));
SELECT setval(pg_get_serial_sequence('sara.categoria_producto', 'id'), (SELECT MAX(id) FROM sara.categoria_producto));
SELECT setval(pg_get_serial_sequence('sara.producto', 'id'), (SELECT MAX(id) FROM sara.producto));
SELECT setval(pg_get_serial_sequence('sara.movimiento_inventario', 'id'), (SELECT MAX(id) FROM sara.movimiento_inventario));
SELECT setval(pg_get_serial_sequence('sara.visitante', 'id'), (SELECT MAX(id) FROM sara.visitante));
SELECT setval(pg_get_serial_sequence('sara.observacion', 'id'), (SELECT MAX(id) FROM sara.observacion));
SELECT setval(pg_get_serial_sequence('sara.control_produccion', 'id'), (SELECT MAX(id) FROM sara.control_produccion));

COMMIT;
