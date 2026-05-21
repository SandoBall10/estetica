# Despliegue en Vercel — Quietud y Belleza

## Estructura del proyecto

```
├── api/
│   └── index.js          # Punto de entrada serverless (Express)
├── server/
│   ├── app.js            # App Express + CORS
│   ├── db.js             # Pool PostgreSQL
│   ├── dev.js            # Servidor local (puerto 3001)
│   ├── schema.sql        # SQL manual (opcional)
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js       # POST /api/auth/login
│       └── citas.js      # CRUD /api/citas
├── src/
│   ├── app/App.tsx
│   └── lib/api.ts
├── vercel.json
├── .env.example
└── package.json
```

## Dependencias

```bash
npm install
```

Paquetes del backend: `express`, `cors`, `pg`, `jsonwebtoken`, `dotenv`  
Desarrollo: `concurrently`

## Variables de entorno

Copia `.env.example` a `.env` para desarrollo local.

| Variable | Descripción |
|----------|-------------|
| `POSTGRES_URL` o `DATABASE_URL` | URI de conexión PostgreSQL |
| `ADMIN_USER` | Usuario del panel |
| `ADMIN_PASSWORD` | Contraseña del panel |
| `JWT_SECRET` | Clave para firmar tokens (string largo aleatorio) |
| `FRONTEND_URL` | Origen permitido en CORS (ej. `http://localhost:5173`) |

## Base de datos en la nube

### Opción A: Vercel Postgres

1. En el dashboard de Vercel → tu proyecto → **Storage** → **Create Database** → Postgres.
2. Vincula la BD al proyecto: se inyecta `POSTGRES_URL` automáticamente.
3. La tabla se crea sola al primer request (`initDb` en `server/db.js`).

### Opción B: Supabase (gratis)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **Project Settings → Database → Connection string → URI**.
3. Pégala en Vercel como `DATABASE_URL` (modo *Transaction* o *Session*).
4. Opcional: ejecuta `server/schema.sql` en el SQL Editor de Supabase.

## Desarrollo local

Terminal 1 — API:

```bash
npm run dev:api
```

Terminal 2 — Frontend (proxy `/api` → `localhost:3001`):

```bash
npm run dev
```

O ambos a la vez:

```bash
npm run dev:all
```

## Despliegue en Vercel

1. Sube el repo a GitHub y conéctalo en [vercel.com](https://vercel.com).
2. **Environment Variables** (Production + Preview):

   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `FRONTEND_URL` = `https://tu-dominio.vercel.app`
   - `POSTGRES_URL` o `DATABASE_URL` (si usas Supabase)

3. Deploy. `vercel.json` ya enruta:
   - `/api/*` → función Express
   - resto → SPA (`dist/index.html`)

## Endpoints API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | `{ usuario, contrasena }` → `{ token }` |
| GET | `/api/auth/verify` | Bearer | Valida sesión |
| GET | `/api/citas?fecha=YYYY-MM-DD` | Bearer | Lista citas |
| POST | `/api/citas` | Bearer | Crea cita |
| PUT | `/api/citas/:id` | Bearer | Edita cita |
| DELETE | `/api/citas/:id` | Bearer | Elimina cita |
