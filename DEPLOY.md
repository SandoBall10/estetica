# Despliegue — Quietud y Belleza (Angular)

## Desarrollo

```bash
npm ci
npm run dev
```

La demostración está disponible desde el login sin API. Para datos reales, copia `.env.example` a `.env`, configura PostgreSQL y ejecuta `npm run dev:all`.

## Compilación y vista previa

```bash
npm run build
npm run preview
```

Angular genera `dist/index.html`, JavaScript y assets. La vista previa local utiliza http://127.0.0.1:4173. Los comandos mantienen `VITE_API_URL` como configuración pública opcional; por defecto la API es `/api`.

## Vercel

`vercel.json` mantiene el build `npm run build`, la salida `dist`, las rutas `/api/*` hacia la función Express de `api/index.js`, y el resto hacia la SPA. No se realizó ningún despliegue durante la implementación.

Configura `DATABASE_URL` o `POSTGRES_URL`, `ADMIN_USER`, `ADMIN_PASSWORD`, `JWT_SECRET` y `FRONTEND_URL`. Usa Node 22.12+ compatible con Angular 21. No incluyas `.env` en el repositorio ni las credenciales del servidor en la configuración pública del frontend.

El inicio de la API aplica una migración aditiva de `server/db.js`. Conserva las citas previas y agrega clientes, servicios, duración y confirmación de citas. La idempotencia y compatibilidad con el esquema anterior tienen prueba de integración sobre PostgreSQL temporal. La conexión al proveedor de producción requiere las credenciales del propietario.

## Contratos

- POST `/api/auth/login`, GET `/api/auth/verify`.
- GET/POST `/api/citas`, PUT/DELETE `/api/citas/:id`.
- GET `/api/citas?fecha=YYYY-MM-DD` y GET `/api/citas?cliente=Nombre`.
- GET/POST `/api/clientes`, PUT `/api/clientes/:id`.
- GET/POST `/api/servicios`, PUT `/api/servicios/:id`.

Todos los datos operativos requieren JWT. La creación de citas rechaza fechas pasadas. Los clientes y servicios nuevos no se rellenan con ejemplos en una base real. El catálogo se administra desde la interfaz.

Para sustituir el backend, adapta `src/ng/data.service.ts` y conserva los contratos tipados de `src/ng/models.ts`. La recuperación por correo y facturación no forman parte de la API actual.
