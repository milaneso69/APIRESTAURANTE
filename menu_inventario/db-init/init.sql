-- =========================================================
-- SISTEMA RESTAURANTE: MENU_INVENTARIO SERVICE (PostgreSQL)
-- =========================================================

CREATE TABLE IF NOT EXISTS categoria_menu (
  categoria_id SERIAL PRIMARY KEY,
  nombre       VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS platillo (
  platillo_id   SERIAL PRIMARY KEY,
  categoria_id  INT NOT NULL REFERENCES categoria_menu(categoria_id),
  nombre        VARCHAR(120) NOT NULL,
  descripcion   VARCHAR(250),
  precio        NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  disponible    BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (categoria_id, nombre)
);

CREATE TABLE IF NOT EXISTS proveedor (
  proveedor_id SERIAL PRIMARY KEY,
  nombre       VARCHAR(120) NOT NULL UNIQUE,
  telefono     VARCHAR(20),
  email        VARCHAR(120),
  rfc          VARCHAR(20),
  direccion    VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS compra (
  compra_id     SERIAL PRIMARY KEY,
  proveedor_id  INT NOT NULL REFERENCES proveedor(proveedor_id),
  comprador_id  INT NOT NULL, -- ID del empleado que compra (referencia al MS usuarios)
  fecha_compra  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  folio         VARCHAR(30) UNIQUE,
  estado        VARCHAR(20) NOT NULL DEFAULT 'RECIBIDA' CHECK (estado IN ('PENDIENTE', 'RECIBIDA', 'CANCELADA')),
  total         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0)
);

CREATE TABLE IF NOT EXISTS insumo (
  insumo_id     SERIAL PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL UNIQUE,
  unidad        VARCHAR(20) NOT NULL CHECK (unidad IN ('KG', 'G', 'L', 'ML', 'PZA')),
  stock_actual  NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
  stock_minimo  NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  activo        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS compra_detalle (
  compra_detalle_id SERIAL PRIMARY KEY,
  compra_id     INT NOT NULL REFERENCES compra(compra_id) ON DELETE CASCADE,
  insumo_id     INT NOT NULL REFERENCES insumo(insumo_id),
  cantidad      NUMERIC(12,3) NOT NULL CHECK (cantidad > 0),
  costo_unit    NUMERIC(12,2) NOT NULL CHECK (costo_unit >= 0),
  subtotal      NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE IF NOT EXISTS inventario_movimiento (
  movimiento_id SERIAL PRIMARY KEY,
  insumo_id     INT NOT NULL REFERENCES insumo(insumo_id),
  fecha         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo          VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA_COMPRA', 'SALIDA_PRODUCCION', 'AJUSTE')),
  cantidad      NUMERIC(12,3) NOT NULL CHECK (cantidad > 0),
  referencia    VARCHAR(60),
  notas         VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS receta_ingrediente (
  receta_id    SERIAL PRIMARY KEY,
  platillo_id  INT NOT NULL REFERENCES platillo(platillo_id) ON DELETE CASCADE,
  insumo_id    INT NOT NULL REFERENCES insumo(insumo_id),
  cantidad     NUMERIC(12,3) NOT NULL CHECK (cantidad > 0),
  UNIQUE (platillo_id, insumo_id)
);

-- =========================
-- DATOS DE EJEMPLO
-- =========================

INSERT INTO categoria_menu (nombre) VALUES
('ENTRADAS'), ('PLATO FUERTE'), ('BEBIDAS'), ('POSTRES')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO platillo (categoria_id, nombre, descripcion, precio, disponible) VALUES
(1, 'Guacamole con totopos', 'Aguacate, pico de gallo y totopos', 85.00, TRUE),
(2, 'Tacos al pastor (5)', 'Tortilla, pastor, piña, cilantro y cebolla', 120.00, TRUE),
(2, 'Hamburguesa clásica', 'Carne 150g, queso, lechuga, jitomate', 145.00, TRUE),
(3, 'Agua de horchata 500ml', 'Bebida tradicional', 35.00, TRUE),
(4, 'Pay de limón', 'Rebanada', 65.00, TRUE)
ON CONFLICT (categoria_id, nombre) DO NOTHING;

INSERT INTO proveedor (nombre, telefono, email, rfc, direccion) VALUES
('Central de Abastos Córdoba', '2715006001', 'ventas@abastoscordoba.mx', 'CAC010101ABC', 'Av. Principal 123, Córdoba, Ver.'),
('Carnes El Buen Corte',       '2715006002', 'contacto@buencorte.mx',   'CEB020202DEF', 'Calle 5 #45, Córdoba, Ver.')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO insumo (nombre, unidad, stock_actual, stock_minimo) VALUES
('Aguacate', 'KG', 4.750, 2.000),
('Tortilla de maíz', 'PZA', 190.000, 50.000),
('Carne al pastor', 'KG', 7.600, 3.000),
('Piña', 'KG', 2.900, 1.000),
('Arroz', 'KG', 9.600, 3.000),
('Leche', 'L', 10.700, 4.000),
('Limón', 'KG', 3.950, 2.000)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO receta_ingrediente (platillo_id, insumo_id, cantidad) VALUES
(1, 1, 0.250), (2, 2, 5.000), (2, 3, 0.200), (2, 4, 0.050),
(4, 5, 0.100), (4, 6, 0.300), (5, 7, 0.050), (5, 6, 0.100)
ON CONFLICT (platillo_id, insumo_id) DO NOTHING;