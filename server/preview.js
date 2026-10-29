import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import api from "./app.js";
const app = express();
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
app.use("/api", (req, res, next) => {
  req.url = "/api" + req.url;
  api(req, res, next);
});
app.use(express.static(root));
app.get("*", (_req, res) => res.sendFile(path.join(root, "index.html")));
const port = Number(process.env.PORT) || 4173;
const host = process.env.HOST || "0.0.0.0";
app.listen(port, host, () =>
  console.log(`Quietud y Belleza: http://${host}:${port}`),
);
