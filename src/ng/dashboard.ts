import { Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DataService } from "./data.service";
import { DialogService } from "./dialog.service";
import { AppointmentForm } from "./appointment-form";
import { Avatar, Badge, Icon, Stat } from "./ui";
import { initials } from "./models";
@Component({
  selector: "q-dashboard",
  imports: [RouterLink, Avatar, Badge, Icon, Stat, AppointmentForm],
  template: ` <main class="page dashboard">
    <section class="page-heading">
      <div class="heading-copy">
        <h1>Buenos días, Andrea</h1>
        <p>Gestiona tus citas y la experiencia de tus clientes.</p>
      </div>
      <div class="stats">
        <q-stat
          label="Citas de hoy"
          [value]="'' + today().length"
          [note]="data.demo() ? '↑ 14% vs. ayer' : ''"
        /><q-stat
          icon="clock"
          label="Pendientes"
          [value]="'' + pending()"
          [note]="data.demo() ? '2 urgentes' : ''"
          [orange]="true"
        /><q-stat
          icon="users"
          label="Clientes este mes"
          [value]="data.demo() ? '42' : '' + data.clients().length"
          [note]="data.demo() ? '↑ 18% vs. mes anterior' : ''"
        />
      </div>
    </section>
    <div class="dashboard-grid">
      <section class="card today-card">
        <header class="card-heading">
          <span class="square-icon"><q-icon name="calendar" /></span>
          <div>
            <h2>Agenda de hoy</h2>
            <p>{{ dateLabel }}</p>
          </div>
          <a routerLink="/agenda" class="text-button push-right"
            >Ver agenda completa<q-icon name="chevron"
          /></a>
        </header>
        <div class="timeline">
          @for (a of visible(); track a.id) {
            <div class="timeline-row">
              <span class="timeline-dot"></span><time>{{ a.hora }}</time
              ><q-avatar [text]="initials(a.nombre_completo)" />
              <div class="appointment-person">
                <h3>{{ a.nombre_completo }}</h3>
                <p>{{ a.servicio || "Cita" }}</p>
              </div>
              <q-badge [text]="a.estado" /><button
                class="icon-button"
                [attr.aria-label]="'Editar cita de ' + a.nombre_completo"
                (click)="dialogs.open({ kind: 'appointment', value: a })"
              >
                <q-icon name="more" />
              </button>
            </div>
          } @empty {
            <p class="empty">
              No hay citas para hoy. Agenda la primera visita.
            </p>
          }
        </div>
        <a routerLink="/agenda" class="card-bottom text-button"
          >Ver todas las citas del día ({{ today().length }})<q-icon
            name="chevron"
        /></a>
      </section>
      <section class="card new-appointment">
        <header class="card-heading">
          <span class="square-icon"><q-icon name="addCalendar" /></span>
          <div>
            <h2>Nueva cita</h2>
            <p>Completa los datos para agendar una nueva cita.</p>
          </div>
        </header>
        <q-appointment-form />
      </section>
    </div>
    <section class="card popular">
      <span class="square-icon"><q-icon name="star" /></span>
      <div>
        <h3>Servicios más solicitados</h3>
        <p>Los favoritos de tus clientes</p>
      </div>
      <a
        routerLink="/servicios"
        [queryParams]="{ categoria: 'Faciales' }"
        class="service-shortcut"
        ><q-icon name="user" />Limpieza facial</a
      ><a
        routerLink="/servicios"
        [queryParams]="{ categoria: 'Masajes' }"
        class="service-shortcut"
        ><q-icon name="lotus" />Masaje relajante</a
      ><a
        routerLink="/servicios"
        [queryParams]="{ categoria: 'Depilación' }"
        class="service-shortcut"
        ><q-icon name="sparkles" />Depilación láser</a
      ><a routerLink="/servicios" class="text-button push-right"
        >Ver todos los servicios<q-icon name="chevron"
      /></a>
    </section>
  </main>`,
})
export class DashboardPage {
  data = inject(DataService);
  dialogs = inject(DialogService);
  initials = initials;
  today = computed(() =>
    this.data
      .appointments()
      .filter((a) => a.fecha === this.data.today())
      .sort((a, b) => a.hora.localeCompare(b.hora)),
  );
  pending = computed(
    () =>
      this.data.appointments().filter((a) => a.estado === "Pendiente").length,
  );
  visible = computed(() => {
    const all = this.today();
    return this.data.demo()
      ? [
          all.find((a) => a.nombre_completo === "María González"),
          all.find((a) => a.nombre_completo === "Lucía Carrillo"),
          all.find((a) => a.nombre_completo === "Ana Valdivia"),
        ].filter((a) => !!a)
      : all.slice(0, 3);
  });
  dateLabel = new Date(this.data.today() + "T12:00:00").toLocaleDateString(
    "es-PE",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );
}
