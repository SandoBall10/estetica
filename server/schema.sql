-- Esquema de una instalación nueva. Para una base existente,
-- server/db.js aplica la migración aditiva e idempotente.
CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(5) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
    CONSTRAINT citas_estado_v2_check CHECK (
      estado IN ('Pendiente', 'Completada', 'Confirmada')
    ),
  servicio TEXT NOT NULL DEFAULT '',
  duracion INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas (fecha);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  ultima TEXT NOT NULL DEFAULT '',
  proxima TEXT NOT NULL DEFAULT '',
  hora TEXT NOT NULL DEFAULT '',
  visitas INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'Nuevo',
  invertido NUMERIC NOT NULL DEFAULT 0,
  alta TEXT NOT NULL,
  cumple TEXT NOT NULL DEFAULT '',
  preferencias JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  duracion INTEGER NOT NULL,
  precio NUMERIC NOT NULL,
  demanda TEXT NOT NULL DEFAULT 'Activo',
  ilustracion TEXT NOT NULL DEFAULT 'facial',
  activo BOOLEAN NOT NULL DEFAULT TRUE
);
