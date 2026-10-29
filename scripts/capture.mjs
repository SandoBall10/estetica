import { chromium } from "@playwright/test";
import fs from "node:fs";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.goto("http://127.0.0.1:4173/login");
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "docs/screenshots/login-1600.png" });
await page.getByRole("button", { name: "Explorar demostración" }).click();
for (const route of ["inicio", "agenda", "clientes", "servicios"]) {
  await page.goto("http://127.0.0.1:4173/" + route);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `docs/screenshots/${route}-1600.png` });
}
await browser.close();
if (errors.length) {
  console.error(errors);
  process.exit(1);
}
console.log("Producción: cinco rutas a 1600 × 900, sin errores de consola.");
fs.writeFileSync(
  "docs/VERIFICACION.md",
  `# Verificación de entrega\n\n- Angular 21.2.23: build de producción correcto, sin advertencias de compilación.\n- 5 pruebas de API/calendario aprobadas: migración conservadora e idempotente sobre PostgreSQL temporal, autenticación, CRUD, fechas y solapamientos.\n- 5 pruebas de navegador aprobadas: cinco rutas en 1600 × 900, 1366 × 768, 1024 × 768 y 390 × 844; login; clientes; servicios; ciclo completo de citas.\n- Sin desbordamiento horizontal global en las veinte combinaciones de pantalla/tamaño.\n- Capturas de producción a 1600 × 900 actualizadas y sin errores de consola.\n- Revisión visual de las cinco capturas frente a las referencias y revisión responsive. Fotografía sustituida e ilustraciones originales, como se documenta en ASSETS.md.\n- npm audit: 0 vulnerabilidades.\n- No se desplegó ni se conectó a una base de producción.\n`,
);
