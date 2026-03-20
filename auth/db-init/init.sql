-- =========================================================
-- SISTEMA RESTAURANTE: AUTH SERVICE (PostgreSQL)
-- =========================================================

CREATE TABLE IF NOT EXISTS rol (
  rol_id      SERIAL PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS auth_users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(120) UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  rol_id      INT REFERENCES rol(rol_id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMPTZ NULL
);

-- =========================
-- DATOS DE EJEMPLO
-- =========================

INSERT INTO rol (nombre, descripcion) VALUES
('ADMIN', 'Control total del sistema'),
('GERENTE', 'Supervisión y reportes'),
('MESERO', 'Atención a mesas y captura de órdenes'),
('COCINA', 'Preparación y seguimiento de platillos'),
('CAJERO', 'Cobros y cierres'),
('RECEPCIONISTA', 'Maneja reservas y asignación de mesas'),
('CLIENTE', 'Puede ver platillos y sus reservaciones'),
('CHEF', 'Administra inventario e insumos')
ON CONFLICT (nombre) DO NOTHING;

-- Para testing (Contraseña: password123 asumiendo hash en código o texto plano temporalmente)
INSERT INTO auth_users (email, password, rol_id) VALUES
('admin@resto.mx', 'password123', (SELECT rol_id FROM rol WHERE nombre='ADMIN')),
('carlos.ruiz@resto.mx', 'password123', (SELECT rol_id FROM rol WHERE nombre='GERENTE')),
('ana.lopez@resto.mx', 'password123', (SELECT rol_id FROM rol WHERE nombre='MESERO')),
('luis.santos@resto.mx', 'password123', (SELECT rol_id FROM rol WHERE nombre='MESERO')),
('marta.garcia@resto.mx', 'password123', (SELECT rol_id FROM rol WHERE nombre='CAJERO')),
('jorge.vega@resto.mx', 'password123', (SELECT rol_id FROM rol WHERE nombre='COCINA')),
('juan.perez@mail.com', 'password123', (SELECT rol_id FROM rol WHERE nombre='CLIENTE')),
('laura.gomez@mail.com', 'password123', (SELECT rol_id FROM rol WHERE nombre='CLIENTE')),
('facturacion@acme.com', 'password123', (SELECT rol_id FROM rol WHERE nombre='CLIENTE'));
ON CONFLICT (email) DO NOTHING;
