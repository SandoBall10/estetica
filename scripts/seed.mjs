import "dotenv/config";
import { getPool } from "../server/db.js";

async function seed() {
  const pool = getPool();
  console.log("Conectando a la base de datos...");

  // 1. Insertar servicios si no existen
  const servicios = [
    {
      nombre: "Limpieza facial profunda",
      categoria: "Faciales",
      duracion: 60,
      precio: 120,
      demanda: "Muy solicitado",
      ilustracion: "facial",
      activo: true,
    },
    {
      nombre: "Hidratación facial",
      categoria: "Faciales",
      duracion: 45,
      precio: 100,
      demanda: "Solicitado",
      ilustracion: "hydration",
      activo: true,
    },
    {
      nombre: "Masaje relajante",
      categoria: "Masajes",
      duracion: 60,
      precio: 130,
      demanda: "Muy solicitado",
      ilustracion: "stones",
      activo: true,
    },
    {
      nombre: "Masaje descontracturante",
      categoria: "Masajes",
      duracion: 60,
      precio: 140,
      demanda: "Solicitado",
      ilustracion: "back",
      activo: true,
    },
    {
      nombre: "Depilación láser – Axilas",
      categoria: "Depilación",
      duracion: 20,
      precio: 90,
      demanda: "Activo",
      ilustracion: "axilla",
      activo: true,
    },
    {
      nombre: "Depilación láser – Piernas",
      categoria: "Depilación",
      duracion: 45,
      precio: 180,
      demanda: "Activo",
      ilustracion: "legs",
      activo: true,
    },
  ];

  console.log("Limpiando y sembrando servicios...");
  await pool.query("DELETE FROM servicios");
  for (const s of servicios) {
    await pool.query(
      `INSERT INTO servicios (nombre, categoria, duracion, precio, demanda, ilustracion, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [s.nombre, s.categoria, s.duracion, s.precio, s.demanda, s.ilustracion, s.activo]
    );
  }
  console.log(`✓ ${servicios.length} servicios insertados.`);

  // 2. Insertar clientes
  const clientes = [
    {
      nombre: "María González",
      telefono: "+51 921 074 661",
      email: "maria.gonzalez@gmail.com",
      ultima: "2026-10-20",
      proxima: "2026-10-28",
      hora: "09:30",
      visitas: 12,
      estado: "Frecuente",
      invertido: 1840,
      alta: "2025-03-01",
      cumple: "1994-08-30",
      preferencias: JSON.stringify(["Piel sensible", "Prefiere mañanas"]),
    },
    {
      nombre: "Lucía Carrillo",
      telefono: "+51 987 532 144",
      email: "lucia.carrillo@gmail.com",
      ultima: "2026-10-15",
      proxima: "2026-10-28",
      hora: "11:00",
      visitas: 6,
      estado: "Frecuente",
      invertido: 780,
      alta: "2025-06-01",
      cumple: "1990-09-03",
      preferencias: JSON.stringify(["Prefiere tardes"]),
    },
    {
      nombre: "Ana Valdivia",
      telefono: "+51 912 334 221",
      email: "ana.valdivia@gmail.com",
      ultima: "2026-10-10",
      proxima: "2026-10-28",
      hora: "15:30",
      visitas: 8,
      estado: "Frecuente",
      invertido: 720,
      alta: "2025-07-01",
      cumple: "1988-09-05",
      preferencias: JSON.stringify(["Prefiere mañanas"]),
    },
    {
      nombre: "Sofía Ramírez",
      telefono: "+51 999 551 223",
      email: "sofia.ramirez@gmail.com",
      ultima: "2026-10-01",
      proxima: "2026-10-29",
      hora: "10:00",
      visitas: 1,
      estado: "Nuevo",
      invertido: 90,
      alta: "2026-10-01",
      cumple: "1995-08-28",
      preferencias: JSON.stringify([]),
    },
    {
      nombre: "Camila Torres",
      telefono: "+51 945 221 889",
      email: "camila.torres@gmail.com",
      ultima: "2026-09-10",
      proxima: "2026-10-30",
      hora: "16:00",
      visitas: 3,
      estado: "Inactivo",
      invertido: 540,
      alta: "2025-09-01",
      cumple: "1991-09-02",
      preferencias: JSON.stringify([]),
    },
    {
      nombre: "Renata López",
      telefono: "+51 900 000 006",
      email: "renata@example.test",
      ultima: "2026-10-22",
      proxima: "2026-10-29",
      hora: "12:00",
      visitas: 4,
      estado: "Frecuente",
      invertido: 400,
      alta: "2026-01-01",
      cumple: "1992-09-06",
      preferencias: JSON.stringify([]),
    },
  ];

  console.log("Limpiando y sembrando clientes...");
  await pool.query("DELETE FROM clientes");
  for (const c of clientes) {
    await pool.query(
      `INSERT INTO clientes (nombre, telefono, email, ultima, proxima, hora, visitas, estado, invertido, alta, cumple, preferencias)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)`,
      [
        c.nombre,
        c.telefono,
        c.email,
        c.ultima,
        c.proxima,
        c.hora,
        c.visitas,
        c.estado,
        c.invertido,
        c.alta,
        c.cumple,
        c.preferencias,
      ]
    );
  }
  console.log(`✓ ${clientes.length} clientes insertados.`);

  // 3. Insertar citas para hoy y los próximos días
  const hoy = new Date().toISOString().slice(0, 10); // "2026-10-28"
  const d = (offsetDays) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    return target.toISOString().slice(0, 10);
  };

  const citas = [
    // Hoy
    {
      nombre_completo: "María González",
      whatsapp: "+51 921 074 661",
      fecha: d(0),
      hora: "09:30",
      estado: "Confirmada",
      servicio: "Limpieza facial profunda",
      duracion: 60,
    },
    {
      nombre_completo: "Lucía Carrillo",
      whatsapp: "+51 987 532 144",
      fecha: d(0),
      hora: "11:00",
      estado: "Pendiente",
      servicio: "Masaje relajante",
      duracion: 60,
    },
    {
      nombre_completo: "Ana Valdivia",
      whatsapp: "+51 912 334 221",
      fecha: d(0),
      hora: "15:30",
      estado: "Confirmada",
      servicio: "Depilación láser – Axilas",
      duracion: 20,
    },
    // Mañana
    {
      nombre_completo: "Sofía Ramírez",
      whatsapp: "+51 999 551 223",
      fecha: d(1),
      hora: "10:00",
      estado: "Pendiente",
      servicio: "Hidratación facial",
      duracion: 45,
    },
    {
      nombre_completo: "Renata López",
      whatsapp: "+51 900 000 006",
      fecha: d(1),
      hora: "12:00",
      estado: "Confirmada",
      servicio: "Masaje descontracturante",
      duracion: 60,
    },
    // Pasado mañana
    {
      nombre_completo: "Camila Torres",
      whatsapp: "+51 945 221 889",
      fecha: d(2),
      hora: "16:00",
      estado: "Confirmada",
      servicio: "Depilación láser – Piernas",
      duracion: 45,
    },
  ];

  console.log("Limpiando citas pasadas e insertando citas de prueba...");
  await pool.query("DELETE FROM citas WHERE fecha < CURRENT_DATE OR servicio = ''");
  for (const c of citas) {
    await pool.query(
      `INSERT INTO citas (nombre_completo, whatsapp, fecha, hora, estado, servicio, duracion)
       VALUES ($1, $2, $3::date, $4, $5, $6, $7)`,
      [
        c.nombre_completo,
        c.whatsapp,
        c.fecha,
        c.hora,
        c.estado,
        c.servicio,
        c.duracion,
      ]
    );
  }
  console.log(`✓ ${citas.length} citas insertadas.`);

  console.log("¡Datos simulados cargados exitosamente!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error al sembrar datos:", err);
  process.exit(1);
});

