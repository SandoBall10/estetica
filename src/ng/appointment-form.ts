import {
  Component,
  inject,
  input,
  output,
  OnInit,
  ChangeDetectorRef,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DataService } from "./data.service";
import { Appointment, Client } from "./models";
import { Icon } from "./ui";
@Component({
  selector: "q-appointment-form",
  imports: [ReactiveFormsModule, Icon],
  template: ` <form [formGroup]="form" (ngSubmit)="save()">
    <div class="form-grid">
      <label
        >NOMBRE COMPLETO
        <div class="field">
          <q-icon name="user" /><input
            formControlName="nombre_completo"
            placeholder="Ej. María González"
            autocomplete="name"
          /></div
      ></label>
      <label
        >WHATSAPP
        <div class="field">
          <q-icon name="phone" /><input
            formControlName="whatsapp"
            placeholder="Ej. +51 921 074 661"
            type="tel"
            autocomplete="tel"
          /></div
      ></label>
      <label
        >FECHA
        <div class="field">
          <q-icon name="calendar" /><input
            formControlName="fecha"
            type="date"
            [min]="data.demo() ? '' : data.today()"
          /></div
      ></label>
      <label
        >HORARIO
        <div class="field">
          <q-icon name="clock" /><input
            formControlName="hora"
            type="time"
          /></div
      ></label>
      <label class="full"
        >SERVICIO
        <div class="field">
          <q-icon name="lotus" /><select
            formControlName="servicio"
            aria-label="SERVICIO"
          >
            <option value="">Seleccionar servicio</option>
            @for (t of data.treatments(); track t.id) {
              @if (t.activo || t.nombre === value()?.servicio) {
                <option [value]="t.nombre">{{ t.nombre }}</option>
              }
            }
          </select>
        </div></label
      >
    </div>
    @if (error) {
      <p class="form-error" role="alert">{{ error }}</p>
    }
    <button class="primary full-button" type="submit" [disabled]="busy">
      <q-icon name="addCalendar" />{{
        busy ? "Guardando…" : value() ? "GUARDAR CAMBIOS" : "AGENDAR CITA"
      }}
    </button>
  </form>`,
})
export class AppointmentForm implements OnInit {
  cdr = inject(ChangeDetectorRef);
  data = inject(DataService);
  fb = inject(FormBuilder);
  value = input<Appointment>();
  client = input<Client>();
  saved = output<void>();
  busy = false;
  error = "";
  form = this.fb.nonNullable.group({
    nombre_completo: ["", [Validators.required, Validators.minLength(3)]],
    whatsapp: [
      "",
      [Validators.required, Validators.pattern(/^[+\d\s()-]{7,20}$/)],
    ],
    fecha: [this.data.today(), Validators.required],
    hora: ["", Validators.required],
    servicio: ["", Validators.required],
  });
  ngOnInit() {
    const v = this.value();
    if (v) this.form.patchValue(v);
    const c = this.client();
    if (c)
      this.form.patchValue({ nombre_completo: c.nombre, whatsapp: c.telefono });
  }
  async save() {
    this.error = "";
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = "Completa todos los campos e ingresa un teléfono válido.";
      return;
    }
    this.busy = true;
    try {
      const v = this.form.getRawValue();
      await this.data.saveAppointment(
        {
          ...v,
          estado: this.value()?.estado || "Pendiente",
          duracion:
            this.data.treatments().find((t) => t.nombre === v.servicio)
              ?.duracion || 60,
        },
        this.value()?.id,
      );
      this.form.reset({
        nombre_completo: "",
        whatsapp: "",
        fecha: this.data.today(),
        hora: "",
        servicio: "",
      });
      this.saved.emit();
    } catch (e) {
      this.error =
        e instanceof Error ? e.message : "No se pudo guardar la cita.";
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }
}
