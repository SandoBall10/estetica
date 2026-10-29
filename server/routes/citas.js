import { Router } from "express";
import { getPool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { appointmentError, validDate } from "../validation.js";

const router = Router();

router.use(requireAuth);

// GET /api/citas              → citas futuras (fecha >= hoy), orden cronológico ascendente
// GET /api/citas?fecha=YYYY-MM-DD → citas de un día concreto
router.get("/", async (req, res) => {
  try {
    const { fecha, cliente } = req.query;
    if (fecha && !validDate(fecha))
      return res.status(400).json({ error: "Fecha inválida." });
    const db = getPool();

    let result;
    if (typeof cliente === "string" && cliente) {
      result = await db.query(
        `SELECT id,nombre_completo,whatsapp,TO_CHAR(fecha,'YYYY-MM-DD') AS fecha,hora,estado,servicio,duracion FROM citas WHERE nombre_completo=$1 ORDER BY fecha DESC,hora DESC`,
        [cliente],
      );
    } else if (fecha) {
      result = await db.query(
        `SELECT id, nombre_completo, whatsapp,
                TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
                hora, estado, servicio, duracion
         FROM citas WHERE fecha = $1::date
         ORDER BY hora ASC`,
        [fecha],
      );
    } else {
      result = await db.query(
        `SELECT id, nombre_completo, whatsapp,
                TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
                hora, estado, servicio, duracion
         FROM citas
         WHERE fecha >= CURRENT_DATE
         ORDER BY fecha ASC, hora ASC`,
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al leer citas" });
  }
});

// POST /api/citas
router.post("/", async (req, res) => {
  try {
    const {
      nombre_completo,
      whatsapp,
      fecha,
      hora,
      estado,
      servicio = "",
      duracion = 60,
    } = req.body ?? {};
    const error = appointmentError(req.body ?? {});
    if (error) return res.status(400).json({ error });

    if (!nombre_completo?.trim() || !whatsapp?.trim() || !fecha || !hora) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const pastCheck = await getPool().query(
      `SELECT ($1::date < CURRENT_DATE) AS es_pasada`,
      [fecha],
    );
    if (pastCheck.rows[0]?.es_pasada) {
      return res.status(400).json({ error: "No se permiten fechas pasadas" });
    }

    const estadoFinal = estado || "Pendiente";
    const db = getPool();

    const result = await db.query(
      `INSERT INTO citas (nombre_completo, whatsapp, fecha, hora, estado, servicio, duracion)
       VALUES ($1, $2, $3::date, $4, $5, $6, $7)
       RETURNING id, nombre_completo, whatsapp,
                 TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
                 hora, estado, servicio, duracion`,
      [
        nombre_completo.trim(),
        whatsapp.trim(),
        fecha,
        hora,
        estadoFinal,
        servicio,
        duracion,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear cita" });
  }
});

// PUT /api/citas/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_completo,
      whatsapp,
      fecha,
      hora,
      estado,
      servicio,
      duracion,
    } = req.body ?? {};
    const error = appointmentError(req.body ?? {}, true);
    if (error) return res.status(400).json({ error });
    const db = getPool();
    if (fecha) {
      const past = await db.query(
        "SELECT ($1::date < CURRENT_DATE) AS es_pasada",
        [fecha],
      );
      if (past.rows[0]?.es_pasada)
        return res.status(400).json({ error: "No se permiten fechas pasadas" });
    }

    const result = await db.query(
      `UPDATE citas SET
         nombre_completo = COALESCE($1, nombre_completo),
         whatsapp = COALESCE($2, whatsapp),
         fecha = COALESCE($3::date, fecha),
         hora = COALESCE($4, hora),
         estado = COALESCE($5, estado),
         servicio = COALESCE($7, servicio), duracion = COALESCE($8, duracion)
       WHERE id = $6
       RETURNING id, nombre_completo, whatsapp,
                 TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
                 hora, estado, servicio, duracion`,
      [
        nombre_completo?.trim() || null,
        whatsapp?.trim() || null,
        fecha || null,
        hora || null,
        estado || null,
        id,
        servicio ?? null,
        duracion ?? null,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar cita" });
  }
});

// DELETE /api/citas/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = getPool();
    const result = await db.query("DELETE FROM citas WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar cita" });
  }
});

export default router;
