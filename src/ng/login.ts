import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DataService } from "./data.service";
import { DialogService } from "./dialog.service";
import { Icon } from "./ui";
@Component({
  selector: "q-login",
  imports: [ReactiveFormsModule, Icon],
  template: ` <main class="login-page">
    <section class="login-scene">
      <div class="scene-copy">
        <span class="round-icon"><q-icon name="leaf" /></span>
        <h1>Belleza que se siente.<br />Bienestar que permanece.</h1>
        <span class="peach-line"></span>
        <p>
          Gestiona cada cita y acompaña a tus<br />clientes con una experiencia
          excepcional.
        </p>
      </div>
    </section>
    <section class="login-side">
      <div class="login-card card">
        <div class="login-brand">
          <span class="round-icon"><q-icon name="leaf" /></span>
          <div class="brand-name">Quietud y Belleza</div>
          <div class="brand-subtitle">CENTRO ESTÉTICO</div>
        </div>
        <h2>Bienvenida de nuevo</h2>
        <p class="muted">Ingresa para administrar tu centro estético</p>
        <form [formGroup]="form" (ngSubmit)="login()">
          <label
            >USUARIO
            <div class="field">
              <q-icon name="user" /><input
                formControlName="usuario"
                placeholder="Tu nombre de usuario"
                autocomplete="username"
              /></div></label
          ><label
            >CONTRASEÑA
            <div class="field">
              <q-icon name="lock" /><input
                formControlName="contrasena"
                [type]="visible() ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
              /><button
                type="button"
                class="icon-button"
                (click)="visible.set(!visible())"
                [attr.aria-label]="
                  visible() ? 'Ocultar contraseña' : 'Mostrar contraseña'
                "
              >
                <q-icon name="eye" />
              </button></div
          ></label>
          <div class="login-options">
            <label class="checkbox-label"
              ><input
                type="checkbox"
                formControlName="remember"
              />Recordarme</label
            ><button
              class="text-button"
              type="button"
              (click)="dialogs.open({ kind: 'recovery' })"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          @if (error()) {
            <p class="form-error" role="alert">{{ error() }}</p>
          }
          <button class="primary login-submit" [disabled]="busy()">
            {{ busy() ? "INGRESANDO…" : "INGRESAR" }}
          </button>
        </form>
        <p class="secure"><q-icon name="lock" />Acceso seguro y protegido</p>
      </div>
      <footer>© 2026 Quietud y Belleza · Desarrollado por A&S zentrIT</footer>
      <button class="demo-entry text-button" (click)="demo()">
        Explorar demostración
      </button>
    </section>
  </main>`,
})
export class LoginPage {
  data = inject(DataService);
  dialogs = inject(DialogService);
  router = inject(Router);
  fb = inject(FormBuilder);
  visible = signal(false);
  busy = signal(false);
  error = signal("");
  form = this.fb.nonNullable.group({
    usuario: [localStorage.getItem("qyb_username") || "", Validators.required],
    contrasena: ["", Validators.required],
    remember: true,
  });
  async login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set("Ingresa tu usuario y contraseña.");
      return;
    }
    this.busy.set(true);
    this.error.set("");
    try {
      const v = this.form.getRawValue();
      await this.data.login(v.usuario, v.contrasena, v.remember);
      this.form.controls.contrasena.reset();
      await this.router.navigateByUrl("/inicio");
    } catch (e) {
      this.error.set(
        e instanceof Error ? e.message : "No se pudo iniciar sesión.",
      );
    } finally {
      this.busy.set(false);
    }
  }
  demo() {
    this.data.startDemo();
    void this.router.navigateByUrl("/inicio");
  }
}
