import pg from "pg";

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString =
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.SUPABASE_DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "Falta POSTGRES_URL o DATABASE_URL en las variables de entorno",
      );
    }

    const useSsl = () => {
      if (process.env.PG_SSL === "false") {
        return false;
      }
      if (process.env.PG_SSL === "true") {
        return true;
      }
      try {
        const host = new URL(connectionString).hostname;
        return !/^localhost$|^127\.0\.0\.1$|^\[?::1\]?$/.test(host);
      } catch {
        return true;
      }
    };

    pool = new Pool({
      connectionString,
      ssl: useSsl() ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export async function initDb() {
  const db = getPool();
  await db.query(`
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
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas (fecha);
  `);

  // Additive migration: preserve all existing appointments and old API fields.
  await db.query(`
    ALTER TABLE citas
    ADD COLUMN IF NOT EXISTS servicio TEXT NOT NULL DEFAULT '';
  `);
  await db.query(`
    ALTER TABLE citas
    ADD COLUMN IF NOT EXISTS duracion INTEGER NOT NULL DEFAULT 60;
  `);
  await db.query(`
    DO $$
    BEGIN
      ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_v2_check;
      ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_check;
      ALTER TABLE citas
      ADD CONSTRAINT citas_estado_v2_check CHECK (
        estado IN ('Pendiente', 'Completada', 'Confirmada')
      );
    END;
    $$;
  `);
  await db.query(`
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
  `);
  await db.query(`
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
  `);
}
