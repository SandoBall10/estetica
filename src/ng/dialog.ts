import {
  Component,
  inject,
  input,
  OnInit,
  AfterViewInit,
  ElementRef,
  viewChild,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DialogService, DialogState } from "./dialog.service";
import { DataService } from "./data.service";
import { AppointmentForm } from "./appointment-form";
import { Icon, Badge } from "./ui";
@Component({
  selector: "q-dialog",
  imports: [ReactiveFormsModule, AppointmentForm, Icon, Badge],
  templateUrl: "./dialog.html",
})
export class AppDialog implements OnInit, AfterViewInit, OnDestroy {
  cdr = inject(ChangeDetectorRef);
  state = input.required<DialogState>();
  dialogs = inject(DialogService);
  data = inject(DataService);
  fb = inject(FormBuilder);
  dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog");
  previous = document.activeElement as HTMLElement | null;
  busy = false;
  error = "";
  clientForm = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    telefono: [
      "",
      [Validators.required, Validators.pattern(/^[+\d\s()-]{7,20}$/)],
    ],
    email: ["", Validators.email],
    estado: "Nuevo",
    cumple: "",
    preferencias: "",
  });
  treatmentForm = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    categoria: "Faciales",
    duracion: [
      60,
      [Validators.required, Validators.min(10), Validators.max(180)],
    ],
    precio: [100, [Validators.required, Validators.min(0)]],
    activo: true,
    ilustracion: "facial",
  });
  ngOnInit() {
    const s = this.state();
    if (s.kind === "client" && s.value)
      this.clientForm.patchValue({
        ...s.value,
        preferencias: s.value.preferencias.join(", "),
      });
    if (s.kind === "treatment" && s.value)
      this.treatmentForm.patchValue(s.value);
    if (s.kind === "history")
      void this.data
        .loadHistory(s.client.nombre)
        .catch((e) => this.data.notify(e.message));
  }
  ngAfterViewInit() {
    this.dialog().nativeElement.showModal();
  }
  backdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.dialogs.close();
  }
  ngOnDestroy() {
    this.previous?.focus();
  }
  title() {
    const s = this.state();
    switch (s.kind) {
      case "appointment":
        return s.value ? "Reprogramar cita" : "Nueva cita";
      case "client":
        return s.value ? "Editar cliente" : "Nuevo cliente";
      case "treatment":
        return s.value ? "Editar servicio" : "Nuevo servicio";
      case "history":
        return "Historial de " + s.client.nombre;
      case "birthdays":
        return "Cumpleaños próximos";
      case "report":
        return "Rendimiento del catálogo";
      case "recovery":
        return "Recuperar acceso";
      case "delete":
        return "Eliminar cita";
    }
  }
  async saveClient() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      this.error = "Revisa el nombre, teléfono y correo electrónico.";
      return;
    }
    const s = this.state();
    if (s.kind !== "client") return;
    await this.run(async () => {
      const v = this.clientForm.getRawValue();
      await this.data.saveClient(
        {
          ...v,
          preferencias: v.preferencias
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          ultima: s.value?.ultima || "",
          proxima: s.value?.proxima || "",
          hora: s.value?.hora || "",
          visitas: s.value?.visitas || 0,
          invertido: s.value?.invertido || 0,
          alta: s.value?.alta || this.data.today(),
        },
        s.value?.id,
      );
    });
  }
  async saveTreatment() {
    if (this.treatmentForm.invalid) {
      this.treatmentForm.markAllAsTouched();
      this.error = "Revisa el nombre, la duración (10–180 min) y el precio.";
      return;
    }
    const s = this.state();
    if (s.kind !== "treatment") return;
    await this.run(async () => {
      await this.data.saveTreatment(
        {
          ...this.treatmentForm.getRawValue(),
          demanda: s.value?.demanda || "Activo",
        },
        s.value?.id,
      );
    });
  }
  async remove() {
    const s = this.state();
    if (s.kind === "delete")
      await this.run(() => this.data.removeAppointment(s.appointment.id));
  }
  async run(action: () => Promise<unknown>) {
    this.busy = true;
    this.error = "";
    try {
      await action();
      this.dialogs.close();
    } catch (e) {
      this.error = e instanceof Error ? e.message : "No se pudo guardar.";
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }
  history() {
    const s = this.state();
    return s.kind === "history"
      ? this.data
          .appointments()
          .filter((a) => a.nombre_completo === s.client.nombre)
          .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora))
      : [];
  }
  birthdays() {
    const today = new Date(this.data.today() + "T12:00:00");
    return this.data.clients().filter((c) => {
      if (!c.cumple) return false;
      const d = new Date(c.cumple + "T12:00:00");
      d.setFullYear(today.getFullYear());
      if (d < today) d.setFullYear(d.getFullYear() + 1);
      return (d.getTime() - today.getTime()) / 86400000 <= 14;
    });
  }
  exportReport() {
    const rows = [
      "Servicio,Ingresos PEN,Porcentaje",
      "Limpieza facial profunda,3120,37",
      "Masaje relajante,2450,29",
      "Depilación láser – Piernas,1980,23",
      "Otros,870,11",
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(["\ufeff" + rows.join("\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    a.download = "rendimiento-demo-agosto-2026.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
