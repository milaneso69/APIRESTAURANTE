
CREATE TABLE IF NOT EXISTS empleado (
  empleado_id SERIAL PRIMARY KEY,
  auth_user_id INT UNIQUE NOT NULL, -- ID en auth-service
  nombre      VARCHAR(60) NOT NULL,
  apellido_p  VARCHAR(60) NOT NULL,
  apellido_m  VARCHAR(60),
  telefono    VARCHAR(20),
  fecha_alta  DATE NOT NULL DEFAULT CURRENT_DATE,
  activo      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS cliente (
  cliente_id  SERIAL PRIMARY KEY,
  auth_user_id INT UNIQUE NULL, -- ID en auth-service (puede ser null si no se registró en auth)
  nombre      VARCHAR(80) NOT NULL,
  telefono    VARCHAR(20),
  creado_en   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turno (
  turno_id     SERIAL PRIMARY KEY,
  nombre       VARCHAR(40) NOT NULL UNIQUE,
  hora_inicio  TIME NOT NULL,
  hora_fin     TIME NOT NULL,
  CHECK (hora_fin <> hora_inicio)
);

CREATE TABLE IF NOT EXISTS turno_asignacion (
  turno_asignacion_id SERIAL PRIMARY KEY,
  turno_id      INT NOT NULL REFERENCES turno(turno_id),
  empleado_id   INT NOT NULL REFERENCES empleado(empleado_id),
  fecha         DATE NOT NULL,
  UNIQUE (turno_id, empleado_id, fecha)
);


-- Empleados (El auth_user_id asume el orden del script de auth. 2:roberto, 3:elena, 4:miguel, 5:sofia, 6:ricardo)
INSERT INTO empleado (auth_user_id, nombre, apellido_p, apellido_m, telefono) VALUES
(2, 'Roberto', 'Jiménez', 'Pérez', '2711002001'),
(3, 'Elena', 'Torres', 'Sánchez',   '2711002002'),
(4, 'Miguel', 'Castro', 'Luna',     '2711002003'),
(5, 'Sofía', 'Mendoza', 'García',   '2711002004'),
(6, 'Ricardo', 'Luna', 'Vázquez',    '2711002005')
ON CONFLICT (auth_user_id) DO NOTHING;

-- Turnos
INSERT INTO turno (nombre, hora_inicio, hora_fin) VALUES
('MATUTINO', '07:00', '15:00'),
('VESPERTINO', '15:00', '23:00')
ON CONFLICT (nombre) DO NOTHING;

-- Asignaciones (mismo día)
INSERT INTO turno_asignacion (turno_id, empleado_id, fecha) VALUES
(1, 2, CURRENT_DATE),
(1, 3, CURRENT_DATE),
(1, 4, CURRENT_DATE),
(1, 5, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Clientes (7:alicia, 8:sergio, 9:corporativo)
INSERT INTO cliente (auth_user_id, nombre, telefono) VALUES
(7, 'Alicia Vargas', '2712003001'),
(8, 'Sergio Ruiz', '2712003002'),
(9, 'Corporativo Alimentos', '2712003999')
ON CONFLICT (auth_user_id) DO NOTHING;