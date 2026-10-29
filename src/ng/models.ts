export type Status = "Confirmada" | "Pendiente" | "Completada";
export interface Appointment {
  id: number;
  nombre_completo: string;
  whatsapp: string;
  fecha: string;
  hora: string;
  estado: Status;
  servicio: string;
  duracion: number;
}
export interface Client {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  ultima: string;
  proxima: string;
  hora: string;
  visitas: number;
  estado: string;
  invertido: number;
  alta: string;
  cumple: string;
  preferencias: string[];
}
export interface Treatment {
  id: number;
  nombre: string;
  categoria: string;
  duracion: number;
  precio: number;
  demanda: string;
  ilustracion: string;
  activo: boolean;
}
export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
