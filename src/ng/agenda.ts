import { Component, computed, inject, signal, effect } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { DataService } from "./data.service";
import { DialogService } from "./dialog.service";
import { Icon, Stat, Avatar } from "./ui";
import { Appointment, initials, isoDate } from "./models";
import { layoutAppointments, minutes } from "./calendar-layout.mjs";
@Component({
  selector: "q-agenda",
  imports: [FormsModule, Icon, Stat, Avatar],
  templateUrl: "./agenda.html",
})
export class AgendaPage {
  data = inject(DataService);
  dialogs = inject(DialogService);
  router = inject(Router);
  initials = initials;
  date = signal(this.data.today());
  month = signal(new Date(this.date() + "T12:00:00"));
  view = signal("Semana");
  search = signal("");
  status = signal("");
  selectedId = signal(6);
  startMinute = computed(
    () =>
      Math.floor(
        Math.min(540, ...this.rangeItems().map((a) => minutes(a.hora))) / 60,
      ) * 60,
  );
  endMinute = computed(
    () =>
      Math.ceil(
        Math.max(
          1080,
          ...this.rangeItems().map((a) => minutes(a.hora) + a.duracion),
        ) / 60,
      ) * 60,
  );
  hours = computed(() =>
    Array.from(
      { length: (this.endMinute() - this.startMinute()) / 60 + 1 },
      (_, i) => String(this.startMinute() / 60 + i).padStart(2, "0") + ":00",
    ),
  );
  today = computed(
    () =>
      this.data.appointments().filter((a) => a.fecha === this.data.today())
        .length,
  );
  pending = computed(
    () =>
      this.data.appointments().filter((a) => a.estado === "Pendiente").length,
  );
  days = computed(() => {
    const current = new Date(this.date() + "T12:00:00");
    if (this.view() === "Día") return [this.day(current)];
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7));
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(current);
      d.setDate(d.getDate() + i);
      return this.day(d);
    });
  });
  weekly = computed(
    () =>
      this.data.appointments().filter((a) => {
        const d = new Date(this.date() + "T12:00:00");
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        const start = isoDate(d);
        d.setDate(d.getDate() + 6);
        return a.fecha >= start && a.fecha <= isoDate(d);
      }).length,
  );
  monthLabel = computed(() =>
    this.month().toLocaleDateString("es-PE", {
      month: "long",
      year: "numeric",
    }),
  );
  cells = computed(() => {
    const d = new Date(this.month());
    d.setDate(1);
    const active = d.getMonth();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const v = new Date(d);
      v.setDate(v.getDate() + i);
      return {
        iso: isoDate(v),
        day: v.getDate(),
        muted: v.getMonth() !== active,
      };
    });
  });
  filtered = computed(() =>
    this.data
      .appointments()
      .filter(
        (a) =>
          (!this.status() || a.estado === this.status()) &&
          a.nombre_completo
            .toLocaleLowerCase()
            .includes(this.search().toLocaleLowerCase()),
      ),
  );
  selected = computed(
    () =>
      this.data.appointments().find((a) => a.id === this.selectedId()) ||
      this.filtered().find((a) => a.fecha === this.date()),
  );
  constructor() {
    effect(() => {
      const dates =
        this.view() === "Mes"
          ? this.cells().map((c) => c.iso)
          : this.days().map((d) => d.iso);
      void this.data.loadDates(dates).catch((e) => this.data.notify(e.message));
    });
  }
  rangeItems() {
    const days = this.days().map((d) => d.iso);
    return this.data.appointments().filter((a) => days.includes(a.fecha));
  }
  day(d: Date) {
    return {
      iso: isoDate(d),
      label: d
        .toLocaleDateString("es-PE", { weekday: "short" })
        .replace(".", ""),
      number: d.getDate(),
    };
  }
  changeMonth(delta: number) {
    const d = new Date(this.month());
    d.setDate(1);
    d.setMonth(d.getMonth() + delta);
    this.month.set(d);
    this.date.set(isoDate(d));
  }
  selectDate(iso: string) {
    this.date.set(iso);
    this.month.set(new Date(iso + "T12:00:00"));
    const a = this.data.appointments().find((a) => a.fecha === iso);
    if (a) this.selectedId.set(a.id);
  }
  appointments(iso: string) {
    return this.filtered().filter((a) => a.fecha === iso);
  }
  layout(iso: string) {
    return layoutAppointments(this.appointments(iso));
  }
  async confirm(a: Appointment) {
    try {
      await this.data.setAppointmentStatus(a, "Confirmada");
    } catch (e) {
      this.data.notify(
        e instanceof Error ? e.message : "No se pudo confirmar.",
      );
    }
  }
  async complete(a: Appointment) {
    try {
      await this.data.setAppointmentStatus(a, "Completada");
    } catch (e) {
      this.data.notify(
        e instanceof Error ? e.message : "No se pudo completar.",
      );
    }
  }
  client(a: Appointment) {
    void this.router.navigate(["/clientes"], {
      queryParams: { nombre: a.nombre_completo },
    });
  }
}
