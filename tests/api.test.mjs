import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

test("API: old schema migration, authentication and full appointment/client/service CRUD", async () => {
  const db = new PGlite();
  await db.waitReady;
  // Existing database before the redesign. All records must survive migration.
  await db.exec(
    `CREATE TABLE citas(id SERIAL PRIMARY KEY,nombre_completo VARCHAR(255) NOT NULL,whatsapp VARCHAR(50) NOT NULL,fecha DATE NOT NULL,hora VARCHAR(5) NOT NULL,estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK(estado IN ('Pendiente','Completada')),created_at TIMESTAMPTZ DEFAULT NOW());INSERT INTO citas(nombre_completo,whatsapp,fecha,hora) VALUES('Cliente anterior','900000000',CURRENT_DATE+1,'10:00');`,
  );
  const original = pg.Pool.prototype.query;
  pg.Pool.prototype.query = async function (sql, params) {
    const r = params
      ? await db.query(sql, params)
      : (await db.exec(sql)).at(-1);
    return { ...r, rowCount: r.affectedRows || r.rows.length };
  };
  process.env.DATABASE_URL = "postgres://test:test@localhost/test";
  process.env.ADMIN_USER = "test-admin";
  process.env.ADMIN_PASSWORD = "test-only-password";
  process.env.JWT_SECRET = "integration-test-secret-not-for-production";
  const { default: app } = await import("../server/app.js");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let token = "";
  const request = async (path, method = "GET", body) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: res.status, body: await res.json() };
  };
  try {
    assert.equal((await request("/citas")).status, 401);
    assert.equal(
      (
        await request("/auth/login", "POST", {
          usuario: "bad",
          contrasena: "bad",
        })
      ).status,
      401,
    );
    const auth = await request("/auth/login", "POST", {
      usuario: "test-admin",
      contrasena: "test-only-password",
    });
    assert.equal(auth.status, 200);
    token = auth.body.token;
    assert.equal((await request("/auth/verify")).body.valid, true);
    const initial = await request("/citas");
    assert.equal(initial.body[0].nombre_completo, "Cliente anterior");
    assert.equal(initial.body[0].duracion, 60);
    const { initDb } = await import("../server/db.js");
    await initDb();
    assert.equal(
      (await request("/citas")).body.length,
      1,
      "migration is idempotent",
    );
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 2);
    const fecha = nextDay.toISOString().slice(0, 10);
    const appointment = {
      nombre_completo: "Cliente de prueba",
      whatsapp: "+51 900 000 111",
      fecha,
      hora: "09:30",
      servicio: "Limpieza facial",
      duracion: 45,
    };
    const created = await request("/citas", "POST", appointment);
    assert.equal(created.status, 201);
    assert.equal(created.body.estado, "Pendiente");
    const id = created.body.id;
    assert.equal(
      (await request("/citas/" + id, "PUT", { estado: "Confirmada" })).body
        .estado,
      "Confirmada",
    );
    assert.equal(
      (await request("/citas/" + id, "PUT", { hora: "11:00" })).body.hora,
      "11:00",
    );
    assert.equal((await request("/citas?fecha=" + fecha)).body.length, 1);
    assert.equal(
      (await request("/citas", "POST", { ...appointment, fecha: "2020-01-01" }))
        .status,
      400,
    );
    assert.equal(
      (await request("/citas/" + id, "PUT", { estado: "invalid" })).status,
      400,
    );
    const client = {
      nombre: "Cliente Prueba",
      telefono: "+51 900 000 111",
      email: "client@example.test",
      ultima: "",
      proxima: "",
      hora: "",
      visitas: 0,
      estado: "Nuevo",
      invertido: 0,
      alta: fecha,
      cumple: "1990-10-20",
      preferencias: ["Piel sensible"],
    };
    const c = await request("/clientes", "POST", client);
    assert.equal(c.status, 201);
    assert.deepEqual(c.body.preferencias, ["Piel sensible"]);
    assert.equal(
      (
        await request("/clientes/" + c.body.id, "PUT", {
          ...client,
          nombre: "Cliente Editado",
        })
      ).body.nombre,
      "Cliente Editado",
    );
    assert.equal((await request("/clientes")).body.length, 1);
    const service = {
      nombre: "Servicio de prueba",
      categoria: "Faciales",
      duracion: 45,
      precio: 120,
      demanda: "Activo",
      ilustracion: "facial",
      activo: true,
    };
    const s = await request("/servicios", "POST", service);
    assert.equal(s.status, 201);
    assert.equal(s.body.precio, 120);
    assert.equal(
      (
        await request("/servicios/" + s.body.id, "PUT", {
          ...service,
          precio: 150,
        })
      ).body.precio,
      150,
    );
    assert.equal((await request("/servicios")).body.length, 1);
    assert.equal(
      (await request("/citas/" + id, "PUT", { estado: "Completada" })).body
        .estado,
      "Completada",
    );
    assert.equal((await request("/citas/" + id, "DELETE")).status, 200);
    assert.equal((await request("/citas?fecha=" + fecha)).body.length, 0);
  } finally {
    await new Promise((r) => server.close(r));
    pg.Pool.prototype.query = original;
    await db.close();
  }
});
