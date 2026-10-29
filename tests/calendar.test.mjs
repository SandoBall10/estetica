import test from "node:test";
import assert from "node:assert/strict";
import { layoutAppointments, minutes } from "../src/ng/calendar-layout.mjs";
import {
  appointmentError,
  validDate,
  validTime,
} from "../server/validation.js";
test("overlapping appointments occupy separate lanes; adjacent appointments reuse space", () => {
  const result = layoutAppointments([
    { id: 1, hora: "09:00", duracion: 60 },
    { id: 2, hora: "09:30", duracion: 60 },
    { id: 3, hora: "10:00", duracion: 30 },
    { id: 4, hora: "10:30", duracion: 45 },
  ]);
  assert.equal(result[0].lanes, 2);
  assert.notEqual(result[0].lane, result[1].lane);
  assert.equal(result[2].lane, 0);
  assert.equal(result[3].lanes, 1);
  assert.equal(result[3].end - result[3].start, 45);
});
test("nested intervals and input ordering are handled", () => {
  const r = layoutAppointments([
    { id: 3, hora: "10:00", duracion: 30 },
    { id: 1, hora: "09:00", duracion: 180 },
    { id: 2, hora: "09:30", duracion: 60 },
  ]);
  assert.equal(r[0].item.id, 1);
  assert.equal(r[0].lanes, 3);
  assert.deepEqual(layoutAppointments([]), []);
  assert.equal(minutes("15:30"), 930);
});
test("calendar validates real dates and time ranges", () => {
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(validTime("25:30"), false);
  assert.equal(validTime("09:30"), true);
});
test("appointment API remains compatible and accepts confirmed state", () => {
  const old = {
    nombre_completo: "Cliente Demo",
    whatsapp: "+51 900 000 000",
    fecha: "2026-09-25",
    hora: "09:30",
  };
  assert.equal(appointmentError(old), null);
  assert.equal(
    appointmentError({ ...old, estado: "Confirmada", duracion: 45 }),
    null,
  );
  assert.ok(appointmentError({ ...old, estado: "invalid" }));
  assert.ok(appointmentError({ ...old, duracion: -5 }));
  assert.equal(appointmentError({ estado: "Completada" }, true), null);
});
