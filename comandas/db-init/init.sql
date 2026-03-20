
CREATE TABLE IF NOT EXISTS mesa (
  mesa_id     SERIAL PRIMARY KEY,
  numero      INT NOT NULL UNIQUE,
  capacidad   INT NOT NULL CHECK (capacidad BETWEEN 1 AND 20),
  ubicacion   VARCHAR(50) NOT NULL CHECK (ubicacion IN ('SALON', 'TERRAZA', 'BARRA', 'PRIVADO')),
  estado      VARCHAR(20) NOT NULL DEFAULT 'LIBRE' CHECK (estado IN ('LIBRE', 'RESERVADA', 'OCUPADA', 'FUERA_SERVICIO'))
);

CREATE TABLE IF NOT EXISTS reservacion (
  reservacion_id SERIAL PRIMARY KEY,
  cliente_id     INT NOT NULL, -- Referencia a usuarios-service
  mesa_id        INT REFERENCES mesa(mesa_id),
  fecha_hora     TIMESTAMP NOT NULL,
  personas       INT NOT NULL CHECK (personas BETWEEN 1 AND 20),
  estado         VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADA' CHECK (estado IN ('PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'NO_SHOW', 'COMPLETADA')),
  notas          VARCHAR(250),
  creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orden (
  orden_id      SERIAL PRIMARY KEY,
  mesa_id       INT NOT NULL REFERENCES mesa(mesa_id),
  mesero_id     INT NOT NULL, -- Referencia a usuarios-service
  cliente_id    INT, -- Referencia a usuarios-service
  reservacion_id INT REFERENCES reservacion(reservacion_id),
  fecha_apertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre   TIMESTAMP,
  estado        VARCHAR(20) NOT NULL DEFAULT 'ABIERTA' CHECK (estado IN ('ABIERTA', 'ENVIADA_COCINA', 'SERVIDA', 'CERRADA', 'CANCELADA')),
  observaciones VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS orden_detalle (
  orden_detalle_id SERIAL PRIMARY KEY,
  orden_id     INT NOT NULL REFERENCES orden(orden_id) ON DELETE CASCADE,
  platillo_id  INT NOT NULL, -- Referencia a menu_inventario-service
  cantidad     INT NOT NULL CHECK (cantidad >= 1),
  precio_unit  NUMERIC(10,2) NOT NULL CHECK (precio_unit >= 0),
  estado       VARCHAR(25) NOT NULL DEFAULT 'CAPTURADO' CHECK (estado IN ('CAPTURADO', 'EN_PREPARACION', 'LISTO', 'SERVIDO', 'CANCELADO')),
  notas        VARCHAR(250)
);

-- =========================
-- DATOS DE EJEMPLO
-- =========================

INSERT INTO mesa (numero, capacidad, ubicacion, estado) VALUES
(1, 2, 'SALON', 'LIBRE'),
(2, 4, 'SALON', 'LIBRE'),
(3, 6, 'TERRAZA', 'LIBRE'),
(4, 4, 'BARRA', 'LIBRE'),
(5, 10, 'PRIVADO', 'FUERA_SERVICIO')
ON CONFLICT (numero) DO NOTHING;

-- Cliente referenciado desde Usuarios MS: Laura Gómez (ID 2 en su tabla, AuthUser 7) - asumiendo ID 2 para ejemplo.
INSERT INTO reservacion (cliente_id, mesa_id, fecha_hora, personas, estado, notas) VALUES
(2, 2, CURRENT_TIMESTAMP + INTERVAL '4 hours', 4, 'CONFIRMADA', 'Cumpleaños, traer vela');