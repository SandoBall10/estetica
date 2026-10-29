import { Component, inject, signal } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { DataService } from "./data.service";
import { AppDialog } from "./dialog";
import { DialogService } from "./dialog.service";
import { Icon } from "./ui";
@Component({
  selector: "app-root",
  imports: [RouterOutlet, AppDialog],
  template: `<router-outlet />
    @if (dialogs.state(); as state) {
      <q-dialog [state]="state" />
    }
    @if (data.message()) {
      <div class="toast" role="status">{{ data.message() }}</div>
    }`,
})
export class App {
  dialogs = inject(DialogService);
  data = inject(DataService);
}
@Component({
  selector: "q-shell",
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  template: ` <header class="app-header">
      <a
        routerLink="/inicio"
        class="brand"
        aria-label="Quietud y Belleza · Inicio"
        ><span class="round-icon"><q-icon name="leaf" /></span
        ><span
          ><span class="brand-name">Quietud y Belleza</span
          ><span class="brand-subtitle">CENTRO ESTÉTICO</span></span
        ></a
      >
      <nav
        id="main-nav"
        aria-label="Navegación principal"
        class="main-nav"
        [class.mobile-open]="mobileMenu()"
      >
        @for (item of navigation; track item.path) {
          <a
            [routerLink]="item.path"
            [attr.aria-label]="item.label"
            routerLinkActive="active"
            (click)="mobileMenu.set(false)"
            ><q-icon [name]="item.icon" /><span>{{ item.label }}</span></a
          >
        }
      </nav>
      <div class="header-actions">
        <div class="dropdown-wrap">
          <button
            class="icon-button notification-button"
            aria-label="Ver notificaciones"
            [attr.aria-expanded]="notifications()"
            (click)="notifications.set(!notifications()); menu.set(false)"
          >
            <q-icon name="bell" />
            @if (pending().length) {
              <span class="notification-count">{{
                data.demo() ? 3 : pending().length
              }}</span>
            }
          </button>
          @if (notifications()) {
            <div class="header-dropdown">
              <h3>Notificaciones</h3>
              @for (a of pending().slice(0, 3); track a.id) {
                <button
                  (click)="
                    dialogs.open({ kind: 'appointment', value: a });
                    notifications.set(false)
                  "
                >
                  <strong>{{ a.nombre_completo }}</strong
                  ><small>{{ a.fecha }} · {{ a.hora }} · Por confirmar</small>
                </button>
              } @empty {
                <p>No tienes citas pendientes.</p>
              }
            </div>
          }
        </div>
        <span class="header-divider"></span>
        <div class="dropdown-wrap">
          <button
            class="admin-button"
            (click)="menu.set(!menu()); notifications.set(false)"
            [attr.aria-expanded]="menu()"
          >
            <span class="admin-avatar">A</span><span>Administración</span
            ><q-icon name="down" />
          </button>
          @if (menu()) {
            <div class="header-dropdown">
              <p>
                {{
                  data.demo()
                    ? "Demostración · Datos ficticios"
                    : "Sesión de administración"
                }}
              </p>
              <button (click)="logout()">
                <q-icon name="logout" />Cerrar sesión
              </button>
            </div>
          }
        </div>
        <button
          class="mobile-nav-toggle"
          type="button"
          [attr.aria-label]="
            mobileMenu() ? 'Cerrar menú principal' : 'Abrir menú principal'
          "
          aria-controls="main-nav"
          [attr.aria-expanded]="mobileMenu()"
          (click)="
            mobileMenu.set(!mobileMenu());
            menu.set(false);
            notifications.set(false)
          "
        >
          <q-icon [name]="mobileMenu() ? 'close' : 'menu'" />
        </button>
      </div>
    </header>
    @if (mobileMenu()) {
      <div
        class="mobile-nav-backdrop"
        (click)="mobileMenu.set(false)"
        aria-hidden="true"
      ></div>
    }
    <router-outlet />`,
})
export class Shell {
  data = inject(DataService);
  dialogs = inject(DialogService);
  router = inject(Router);
  menu = signal(false);
  notifications = signal(false);
  mobileMenu = signal(false);
  navigation = [
    { path: "/inicio", label: "Inicio", icon: "home" },
    { path: "/agenda", label: "Agenda", icon: "calendar" },
    { path: "/clientes", label: "Clientes", icon: "users" },
    { path: "/servicios", label: "Servicios", icon: "lotus" },
  ];
  pending() {
    return this.data.appointments().filter((a) => a.estado === "Pendiente");
  }
  logout() {
    this.data.logout();
    void this.router.navigateByUrl("/login");
  }
}
