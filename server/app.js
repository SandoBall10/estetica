import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import citasRoutes from "./routes/citas.js";
import catalogoRoutes from "./routes/catalogo.js";

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "*";

app.use(
  cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin,
    credentials: true,
  }),
);
app.use(express.json());

let dbReady = false;
let dbUnavailable = false;
let dbErrorMessage = "Base de datos no configurada";

function buildDbErrorPayload(err) {
  const detail =
    typeof err?.message === "string" ? err.message : "Error de base de datos.";
  const hint = /password|auth/i.test(detail)
    ? "La conexión fue rechazada por credenciales de PostgreSQL. Revisa DATABASE_URL, usuario y contraseña."
    : /ECONNRESET|connect/i.test(detail)
      ? "No fue posible establecer conexión con PostgreSQL. Verifica que el servicio esté activo."
      : "Configura DATABASE_URL/POSTGRES_URL con una base PostgreSQL accesible.";
  return { error: "Error de base de datos", detail, hint };
}

app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/auth") || req.path === "/api/health") {
    return next();
  }

  if (dbUnavailable) {
    return res
      .status(503)
      .json(buildDbErrorPayload({ message: dbErrorMessage }));
  }

  if (!dbReady) {
    try {
      await initDb();
      dbReady = true;
    } catch (err) {
      dbUnavailable = true;
      dbErrorMessage =
        err instanceof Error ? err.message : "Error de base de datos";
      console.error("Error inicializando DB:", err);
      return res.status(503).json(buildDbErrorPayload(err));
    }
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    database: dbUnavailable || !dbReady ? "disconnected" : "connected",
    lastError: dbUnavailable ? dbErrorMessage : undefined,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api", catalogoRoutes);

export default app;
