-- Ejecuta esto una vez en tu base PostgreSQL (Vercel Postgres, Supabase SQL Editor, etc.)

CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(5) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'Completada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas (fecha);
