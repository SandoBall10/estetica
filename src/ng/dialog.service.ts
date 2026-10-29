import { Injectable, signal } from "@angular/core";
import { Appointment, Client, Treatment } from "./models";
export type DialogState =
  | { kind: "appointment"; value?: Appointment; client?: Client }
  | { kind: "client"; value?: Client }
  | { kind: "treatment"; value?: Treatment }
  | { kind: "history"; client: Client }
  | { kind: "birthdays" }
  | { kind: "report" }
  | { kind: "recovery" }
  | { kind: "delete"; appointment: Appointment };
@Injectable({ providedIn: "root" })
export class DialogService {
  readonly state = signal<DialogState | null>(null);
  open(value: DialogState) {
    this.state.set(value);
  }
  close() {
    this.state.set(null);
  }
}
