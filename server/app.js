import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import citasRoutes from "./routes/citas.js";

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "*";

app.use(
  cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());

let dbReady = false;
app.use(async (_req, res, next) => {
  if (!dbReady) {
    try {
      await initDb();
      dbReady = true;
    } catch (err) {
      console.error("Error inicializando DB:", err);
      return res.status(500).json({ error: "Error de base de datos" });
    }
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/citas", citasRoutes);

export default app;
