import { test, expect } from "@playwright/test";
import fs from "node:fs";
async function demo(page: any) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Explorar demostración" }).click();
  await expect(
    page.getByRole("heading", { name: "Buenos días, Andrea" }),
  ).toBeVisible();
}
test("five routes at desktop, laptop, tablet and mobile; no overflow or browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  fs.mkdirSync("docs/screenshots", { recursive: true });
  await page.goto("/login");
  await page.screenshot({ path: "docs/screenshots/login-1600.png" });
  await demo(page);
  for (const size of [
    { width: 1600, height: 900 },
    { width: 1366, height: 768 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    for (const path of ["inicio", "agenda", "clientes", "servicios", "login"]) {
      await page.goto("/" + path);
      await page.locator("h1:visible,h2:visible").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `docs/screenshots/${path}-${size.width}.png`,
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `${path} ${size.width} horizontal overflow`,
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
test("login validates fields, toggles password, closes recovery with escape", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "INGRESAR", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Ingresa");
  await page.getByPlaceholder("••••••••").fill("test-password");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(page.getByPlaceholder("••••••••")).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "¿Olvidaste tu contraseña?" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "test-password",
  );
});
test("clients search, pagination, create, edit, selection, persistence and history", async ({
  page,
}) => {
  await demo(page);
  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await page.getByRole("button", { name: "Página 2", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "RL Renata López" }),
  ).toBeVisible();
  await page.getByLabel("Buscar por nombre o teléfono").fill("Lucía");
  await page.getByRole("button", { name: "LC Lucía Carrillo" }).click();
  await expect(page.locator(".client-detail h2")).toHaveText("Lucía Carrillo");
  await page.getByLabel("Buscar por nombre o teléfono").fill("");
  await page
    .getByRole("button", { name: "Nuevo cliente", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("NOMBRE COMPLETO").fill("Prueba Cliente");
  await dialog.getByLabel("TELÉFONO", { exact: true }).fill("+51 900 999 888");
  await dialog.getByLabel("CORREO ELECTRÓNICO").fill("prueba@example.test");
  await dialog.getByRole("button", { name: "Guardar cliente" }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByLabel("Buscar por nombre o teléfono").fill("Prueba Cliente");
  await page
    .getByRole("button", { name: "Editar cliente Prueba Cliente", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("NOMBRE COMPLETO").fill("Prueba Editada");
  await dialog.getByRole("button", { name: "Guardar cliente" }).click();
  await page.reload();
  await page.getByLabel("Buscar por nombre o teléfono").fill("Prueba Editada");
  await page.getByRole("button", { name: "PE Prueba Editada" }).click();
  await expect(page.locator(".client-detail h2")).toHaveText("Prueba Editada");
  await page.getByRole("button", { name: "Ver historial" }).click();
  await expect(page.getByRole("dialog")).toContainText("No hay citas");
});
test("services filters, create and edit persist", async ({ page }) => {
  await demo(page);
  await page.getByRole("link", { name: "Servicios", exact: true }).click();
  await page.getByRole("button", { name: "Masajes", exact: true }).click();
  await expect(page.locator(".treatment")).toHaveCount(2);
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await page.getByLabel("Buscar servicio").fill("Hidratación");
  await expect(page.locator(".treatment")).toHaveCount(1);
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByRole("dialog").getByLabel("PRECIO (S/)").fill("115");
  await page.getByRole("button", { name: "Guardar servicio" }).click();
  await expect(page.locator(".treatment-price")).toContainText("115");
  await page.getByLabel("Buscar servicio").fill("");
  await page
    .getByRole("button", { name: "Nuevo servicio", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("NOMBRE DEL SERVICIO")
    .fill("Tratamiento de prueba");
  await page.getByRole("button", { name: "Guardar servicio" }).click();
  await page.reload();
  await page.getByLabel("Buscar servicio").fill("Tratamiento de prueba");
  await expect(page.locator(".treatment")).toHaveCount(1);
});
test("appointment create, search, confirm, reschedule, date navigation and delete", async ({
  page,
}) => {
  await demo(page);
  await page.getByRole("link", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Nueva cita", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("NOMBRE COMPLETO").fill("Cita de prueba");
  await dialog.getByLabel("WHATSAPP").fill("+51 900 000 001");
  await dialog.getByLabel("FECHA", { exact: true }).fill("2026-08-25");
  await dialog.getByLabel("HORARIO").fill("10:00");
  await dialog
    .getByLabel("SERVICIO", { exact: true })
    .selectOption({ label: "Limpieza facial profunda" });
  await dialog.getByRole("button", { name: "AGENDAR CITA" }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByLabel("Buscar cliente en agenda").fill("Cita de prueba");
  await page.locator(".calendar-event").click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(page.locator(".calendar-event")).toHaveAttribute(
    "aria-label",
    /Confirmada/,
  );
  await page.getByRole("button", { name: "Reprogramar", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("HORARIO").fill("12:00");
  await dialog.getByRole("button", { name: "GUARDAR CAMBIOS" }).click();
  await expect(page.locator(".calendar-event time")).toHaveText("12:00");
  await page.getByRole("button", { name: "Mes", exact: true }).click();
  await expect(page.locator(".month-cell")).toHaveCount(42);
  await page.getByRole("button", { name: "Día", exact: true }).click();
  await expect(page.locator(".day-column")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Eliminar cita", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Eliminar cita" })
    .click();
  await expect(page.locator(".calendar-event")).toHaveCount(0);
  await page.getByRole("button", { name: "Mes siguiente" }).click();
  await expect(page.locator(".month-heading")).toContainText(
    /setiembre|septiembre/,
  );
});
