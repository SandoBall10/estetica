# Quietud y Belleza — Centro Estético

Implementación Angular de las cinco referencias: inicio de sesión, Inicio, Agenda, Clientes y Servicios. Diseño a 1600 × 900 y adaptación a 1366 × 768, tablet y móvil.

## Ejecutar

Requiere Node 22.12+ de la rama 22 (comprobado con 22.17.1) y npm.

```bash
npm ci
npm run dev
```

Abre **http://127.0.0.1:5173** y pulsa **Explorar demostración**. No necesitas contraseña ni base de datos para explorar las cinco pantallas. El botón INGRESAR utiliza la API real; no acepta credenciales ficticias.

```bash
npm run build
npm run preview
```

La compilación queda en `dist/`. La vista previa sirve la aplicación compilada y la API en **http://127.0.0.1:4173**. El ZIP incluye `dist/`, código, assets e instrucciones; las dependencias se instalan con `npm ci`.

## Tecnología y organización

- Angular **21.2.23**, CLI/build 21.2.24, TypeScript 5.9, componentes standalone, Router con carga diferida, Reactive Forms tipados y signals.
- Se eligió Angular 21, con soporte LTS, para mantener Node 22.17.1 del proyecto. Angular 22.1.6 era la versión estable más reciente consultada y requiere Node 22.22.3 o superior en la rama 22. No se usaron versiones preliminares ni instalaciones forzadas. Fuentes: https://angular.dev/reference/releases y https://angular.dev/reference/versions (10 de septiembre de 2026).
- `src/ng/`: implementación activa; `src/main.ts`: arranque y rutas; `angular.json`: compilación y servidor; `public/assets/`: fotografía e ilustraciones.
- El proyecto **solo** compila y ejecuta con Angular. Los comandos npm activos utilizan Angular CLI.
- `src/ng/data.service.ts`: adaptador real/demostración; `models.ts`: contratos; `demo.ts`: datos deterministas; `calendar-layout.mjs`: cálculo de solapamientos.
- Cabecera, iconos, avatares, indicadores, etiquetas y formulario de citas compartidos. Los diálogos nativos mantienen el foco, cierran con Escape y devuelven el foco al control de origen.

## Funciones

- Navegación entre `/login`, `/inicio`, `/agenda`, `/clientes` y `/servicios`, con verificación de sesión.
- Mostrar/ocultar contraseña, validación, recordar solamente el usuario y cierre de sesión.
- Crear, editar, buscar y filtrar clientes y servicios; selección de ficha, paginación, preferencias, cumpleaños e historial de citas.
- Crear, confirmar, completar, reprogramar y eliminar citas con confirmación de eliminación.
- Agenda Día/Semana/Mes, navegación mensual, selección de fechas, búsqueda y filtro de estados. Posición y altura calculadas con hora y duración; las citas solapadas comparten columnas. El rango horario se amplía con citas fuera de 09:00–18:00. Las tarjetas cortas muestran el detalle completo al seleccionar, enfocar o pasar el puntero.
- Notificaciones de pendientes, nueva cita y reporte CSV de demostración.

## API y base de datos real

1. Copia `.env.example` a `.env`.
2. Configura tu conexión real en `DATABASE_URL` (local) o `SUPABASE_DATABASE_URL` (remoto).
   - En Supabase puedes usar la cadena de conexión de **Connection string** y dejar `PG_SSL=true`.
3. Ejecuta `npm run dev:all` (frontend 5173, API 3001).
4. Accede con `ADMIN_USER` y `ADMIN_PASSWORD`.

Se conservaron `/api/auth/login`, `/api/auth/verify` y el CRUD `/api/citas`, incluidos `nombre_completo`, `whatsapp`, `fecha`, `hora` y `estado`. Las citas antiguas siguen siendo válidas. Se añadieron los campos opcionales `servicio`, `duracion` y el estado `Confirmada`. `Pendiente` y `Completada` siguen admitidos. `GET /api/citas?cliente=Nombre` obtiene el historial completo por nombre.

Se añadieron GET/POST `/api/clientes`, PUT `/api/clientes/:id`, GET/POST `/api/servicios` y PUT `/api/servicios/:id`, protegidos por Bearer. Angular usa estos endpoints cuando el acceso es real; no cae silenciosamente a datos ficticios ante un error.

`server/db.js` aplica una migración aditiva e idempotente al iniciar la API: conserva citas, añade columnas, amplía el CHECK de estado y crea las tablas nuevas. La prueba de integración parte del esquema anterior y verifica que la cita original permanece. No se cargan datos ficticios en la base real.

Los tokens se almacenan en sessionStorage, nunca las contraseñas. Un token antiguo de `qyb_token` se verifica y migra una vez. «Recordarme» conserva el usuario, no la contraseña ni una sesión simulada.

## Demostración y diferencias de referencia

- Fecha fija: **martes 25 de agosto de 2026**. Se corrigió el domingo de la imagen. La cita de Ana a las 15:30 es coherente entre Inicio, Agenda y Clientes.
- Los contadores ilustrativos 248 clientes, 18 nuevos, 12 servicios, 42 clientes del mes y el reporte de ingresos reproducen la presentación. El directorio contiene seis fichas ficticias y el catálogo seis servicios: la paginación muestra el total real cargado, no 50 páginas vacías. Las citas se calculan sobre los 27 registros de la semana, ocho del día y cinco pendientes.
- Los cambios de demostración se guardan exclusivamente en `qyb_demo_v1` del navegador. Para restablecerlos, elimina esa clave y entra otra vez en demostración. No uses este modo para datos reales.
- Las duraciones de 20/45/60 minutos producen alturas distintas a algunas tarjetas de la captura. Las vistas y los solapamientos responden a los datos, sin posiciones fijas para fingir la captura.
- La fotografía original no estaba en el repositorio: se creó `public/assets/spa-interior.png` con ImageGen como sustitución de ambiente similar, sin texto incorporado. Los textos son HTML. Hay seis SVG originales distintos. Detalles y prompt en `docs/ASSETS.md`.
- Gilda Display, DM Sans y Georgia en nombres de tratamientos son aproximaciones; no se afirma que sean las fuentes exactas.
- La API existente no incluye recuperación por correo ni facturación. Recuperar acceso muestra el procedimiento con el administrador. Los ingresos son de demostración; en sesión real se indica que falta una fuente de pagos. No se envían correos, WhatsApp ni mensajes reales.
- La integración se probó con PostgreSQL temporal (PGlite), no con una base de producción ni credenciales del usuario.

## Comprobaciones

```bash
npm test
# Con npm run dev abierto y Microsoft Edge instalado:
npm run test:e2e
npm run build
npm audit
```

En otros equipos cambia `channel: 'msedge'` de `playwright.config.ts` por tu navegador o instala Chromium con Playwright. Las pruebas de API usan una base temporal en memoria; no leen `.env` ni acceden a la base real.

Las capturas de las cinco rutas en 1600, 1366, 1024 y 390 px están en `docs/screenshots/`. Se revisaron visualmente las composiciones, adaptaciones y controles, además de comprobar que no hubiera desbordamiento horizontal de toda la página. Tablas y calendarios conservan desplazamiento interno.

La variable pública existente VITE_API_URL sigue admitida: los comandos dev/build generan assets/config.js con esa URL. Si se omite, se utiliza /api. Nunca se exportan credenciales del servidor al navegador.
