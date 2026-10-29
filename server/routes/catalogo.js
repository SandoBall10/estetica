import { Router } from "express";
import { getPool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validDate, validPhone } from "../validation.js";
const router = Router();
router.use(requireAuth);
const configs = {
  clientes: {
    columns: [
      "nombre",
      "telefono",
      "email",
      "ultima",
      "proxima",
      "hora",
      "visitas",
      "estado",
      "invertido",
      "alta",
      "cumple",
      "preferencias",
    ],
    validate: (v) =>
      typeof v.nombre === "string" &&
      v.nombre.trim().length >= 3 &&
      validPhone(v.telefono) &&
      typeof v.email === "string" &&
      (!v.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) &&
      ["Nuevo", "Frecuente", "Inactivo"].includes(v.estado) &&
      validDate(v.alta) &&
      (!v.cumple || validDate(v.cumple)) &&
      Array.isArray(v.preferencias) &&
      v.preferencias.every((p) => typeof p === "string") &&
      Number.isInteger(v.visitas) &&
      v.visitas >= 0 &&
      Number.isFinite(v.invertido) &&
      v.invertido >= 0,
  },
  servicios: {
    columns: [
      "nombre",
      "categoria",
      "duracion",
      "precio",
      "demanda",
      "ilustracion",
      "activo",
    ],
    validate: (v) =>
      typeof v.nombre === "string" &&
      v.nombre.trim().length >= 3 &&
      ["Faciales", "Corporales", "Depilación", "Masajes"].includes(
        v.categoria,
      ) &&
      Number.isInteger(v.duracion) &&
      v.duracion >= 10 &&
      v.duracion <= 180 &&
      Number.isFinite(v.precio) &&
      v.precio >= 0 &&
      ["facial", "hydration", "stones", "back", "axilla", "legs"].includes(
        v.ilustracion,
      ) &&
      typeof v.activo === "boolean",
  },
};
const normalize = (row) => ({
  ...row,
  ...("precio" in row ? { precio: Number(row.precio) } : {}),
  ...("invertido" in row ? { invertido: Number(row.invertido) } : {}),
});
for (const [table, config] of Object.entries(configs)) {
  router.get("/" + table, async (_req, res) => {
    try {
      const r = await getPool().query(`SELECT * FROM ${table} ORDER BY id`);
      res.json(r.rows.map(normalize));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "No se pudo cargar el catálogo." });
    }
  });
  for (const method of ["post", "put"])
    router[method](
      "/" + table + (method === "put" ? "/:id" : ""),
      async (req, res) => {
        try {
          const value = req.body || {};
          if (!config.validate(value))
            return res
              .status(400)
              .json({ error: "Revisa los campos del formulario." });
          const values = config.columns.map((key) =>
            key === "preferencias" ? JSON.stringify(value[key]) : value[key],
          );
          const sql =
            method === "post"
              ? `INSERT INTO ${table} (${config.columns.join(",")}) VALUES (${config.columns.map((_, i) => "$" + (i + 1)).join(",")}) RETURNING *`
              : `UPDATE ${table} SET ${config.columns.map((key, i) => key + "=$" + (i + 1)).join(",")} WHERE id=$${values.length + 1} RETURNING *`;
          if (method === "put") values.push(req.params.id);
          const r = await getPool().query(sql, values);
          if (!r.rowCount)
            return res.status(404).json({ error: "Registro no encontrado." });
          return res
            .status(method === "post" ? 201 : 200)
            .json(normalize(r.rows[0]));
        } catch (e) {
          console.error(e);
          return res
            .status(500)
            .json({ error: "No se pudo guardar el registro." });
        }
      },
    );
}
export default router;
