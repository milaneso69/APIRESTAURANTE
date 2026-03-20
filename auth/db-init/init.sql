
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

-- Para testing (Usuarios personalizados)
INSERT INTO auth_users (email, password, rol_id) VALUES
('admin@sabores.com.mx', 'AdminResto2024!', (SELECT rol_id FROM rol WHERE nombre='ADMIN')),
('roberto.jimenez@sabores.com.mx', 'UserResto2024!', (SELECT rol_id FROM rol WHERE nombre='GERENTE')),
('elena.torres@sabores.com.mx', 'UserResto2024!', (SELECT rol_id FROM rol WHERE nombre='MESERO')),
('miguel.castro@sabores.com.mx', 'UserResto2024!', (SELECT rol_id FROM rol WHERE nombre='MESERO')),
('sofia.mendoza@sabores.com.mx', 'UserResto2024!', (SELECT rol_id FROM rol WHERE nombre='CAJERO')),
('ricardo.luna@sabores.com.mx', 'UserResto2024!', (SELECT rol_id FROM rol WHERE nombre='COCINA')),
('alicia.vargas@ejemplo.com', 'UserResto2024!', (SELECT rol_id FROM rol WHERE nombre='CLIENTE')),
('sergio.ruiz@ejemplo.com', 'UserResto2024!', (SELECT rol_id FROM rol WHERE nombre='CLIENTE')),
('compras@corporativo.com', 'UserResto2024!', (SELECT rol_id FROM rol WHERE nombre='CLIENTE'));
ON CONFLICT (email) DO NOTHING;
