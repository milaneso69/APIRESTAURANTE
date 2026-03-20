-- =========================================================
-- SISTEMA RESTAURANTE: PAGOS SERVICE (PostgreSQL)
-- =========================================================

CREATE TABLE IF NOT EXISTS pago (
  pago_id      SERIAL PRIMARY KEY,
  orden_id     INT NOT NULL, -- Referencia a comandas-service
  fecha_pago   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metodo       VARCHAR(20) NOT NULL CHECK (metodo IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
  monto        NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  referencia   VARCHAR(80)
);
