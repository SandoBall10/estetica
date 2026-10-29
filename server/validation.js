export const validDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
export const validTime = (value) =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export const validPhone = (value) =>
  typeof value === "string" && /^[+\d\s()-]{7,20}$/.test(value);

export function appointmentError(value, partial = false) {
  if (!partial || value.nombre_completo !== undefined) {
    if (
      typeof value.nombre_completo !== "string" ||
      value.nombre_completo.trim().length < 3
    ) {
      return "Ingresa un nombre válido.";
    }
  }

  if (!partial || value.whatsapp !== undefined) {
    if (!validPhone(value.whatsapp)) {
      return "Ingresa un teléfono válido.";
    }
  }

  if (!partial || value.fecha !== undefined) {
    if (!validDate(value.fecha)) {
      return "Fecha inválida.";
    }
  }

  if (!partial || value.hora !== undefined) {
    if (!validTime(value.hora)) {
      return "Horario inválido.";
    }
  }

  if (
    value.estado !== undefined &&
    !["Pendiente", "Completada", "Confirmada"].includes(value.estado)
  ) {
    return "Estado inválido.";
  }

  if (
    value.duracion !== undefined &&
    (!Number.isInteger(value.duracion) ||
      value.duracion < 10 ||
      value.duracion > 180)
  ) {
    return "La duración debe ser de 10 a 180 minutos.";
  }

  if (value.servicio !== undefined && typeof value.servicio !== "string") {
    return "Servicio inválido.";
  }

  return null;
}
