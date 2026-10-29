import type { Appointment } from "./models";
export function minutes(time: string): number;
export function layoutAppointments(items: Appointment[]): {
  item: Appointment;
  start: number;
  end: number;
  lane: number;
  lanes: number;
}[];
