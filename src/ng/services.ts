import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "./data.service";
import { DialogService } from "./dialog.service";
import { Art, Icon, Stat } from "./ui";
@Component({
  selector: "q-services",
  imports: [FormsModule, Art, Icon, Stat],
  template: ` <main class="page services-page">
    <section class="page-heading">
      <div class="heading-copy">
        <h1>Servicios y tratamientos</h1>
        <p>Organiza tu catálogo y crea experiencias memorables.</p>
      </div>
      <div class="stats">
        <q-stat
          label="Servicios activos"
          [value]="data.demo() ? '12' : '' + activeCount()"
          [note]="data.demo() ? '↑ 9% vs. mes anterior' : ''"
        /><q-stat
          icon="star"
          label="Más reservado"
          [value]="data.demo() ? 'Limpieza facial' : '—'"
          [note]="data.demo() ? '342 reservas este mes' : ''"
        /><q-stat
          icon="money"
          label="Ingresos del mes"
          [value]="data.demo() ? 'S/ 8,420' : '—'"
          [note]="data.demo() ? '↑ 16% vs. mes anterior' : ''"
        />
      </div>
      <button
        class="primary new-button"
        (click)="dialogs.open({ kind: 'treatment' })"
      >
        <q-icon name="plus" />Nuevo servicio
      </button>
    </section>
    <section class="card service-filters">
      <label class="field"
        ><q-icon name="search" /><input
          aria-label="Buscar servicio"
          placeholder="Buscar servicio"
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
      /></label>
      <div class="category-tabs">
        @for (c of categories; track c) {
          <button [class.active]="category() === c" (click)="category.set(c)">
            {{ c }}
          </button>
        }
      </div>
    </section>
    <div class="services-layout">
      <section class="treatment-grid">
        @for (t of filtered(); track t.id) {
          <article class="card treatment" [class.featured]="t.id === 1">
            @if (t.id === 1) {
              <span class="featured-label"
                ><q-icon name="star" />Más solicitado</span
              >
            }
            <div class="treatment-content">
              <q-art [name]="t.ilustracion" />
              <div>
                <h3>{{ t.nombre }}</h3>
                <p class="green">{{ t.categoria }}</p>
                <div class="treatment-price">
                  <q-icon name="clock" />{{ t.duracion }} min<span></span>S/
                  {{ t.precio }}
                </div>
                <p class="demand">
                  <i [class.inactive]="!t.activo"></i
                  >{{ t.activo ? t.demanda : "Inactivo" }}
                </p>
              </div>
            </div>
            <footer>
              <button
                class="text-button"
                (click)="dialogs.open({ kind: 'treatment', value: t })"
              >
                <q-icon name="edit" />Editar</button
              ><button
                class="icon-button"
                [attr.aria-label]="'Opciones de ' + t.nombre"
                (click)="dialogs.open({ kind: 'treatment', value: t })"
              >
                <q-icon name="more" />
              </button>
            </footer>
          </article>
        } @empty {
          <div class="card empty">
            No se encontraron servicios para este filtro.
          </div>
        }
      </section>
      <aside class="card performance">
        <h3>Rendimiento del catálogo</h3>
        <p>Top 3 servicios por ingresos del mes</p>
        @if (data.demo()) {
          @for (r of ranking; track r.name) {
            <div class="ranking">
              <span class="art-circle"><q-art [name]="r.art" /></span>
              <div>
                <div class="ranking-title">
                  <span>{{ r.name }}</span
                  ><strong>S/ {{ r.income }}</strong>
                </div>
                <div class="progress-line">
                  <div class="progress">
                    <span [style.width.%]="r.percent"></span>
                  </div>
                  <span>{{ r.percent }}%</span>
                </div>
              </div>
            </div>
          }
        } @else {
          <p class="empty">
            Los ingresos requieren registrar pagos. No hay datos de facturación
            disponibles.
          </p>
        }
        <button
          class="text-button card-bottom"
          (click)="dialogs.open({ kind: 'report' })"
        >
          Ver reporte completo<q-icon name="chevron" />
        </button>
      </aside>
    </div>
  </main>`,
})
export class ServicesPage {
  data = inject(DataService);
  dialogs = inject(DialogService);
  route = inject(ActivatedRoute);
  search = signal("");
  category = signal(
    this.route.snapshot.queryParamMap.get("categoria") || "Todos",
  );
  categories = ["Todos", "Faciales", "Corporales", "Depilación", "Masajes"];
  activeCount = computed(
    () => this.data.treatments().filter((t) => t.activo).length,
  );
  filtered = computed(() =>
    this.data
      .treatments()
      .filter(
        (t) =>
          (this.category() === "Todos" || t.categoria === this.category()) &&
          t.nombre
            .toLocaleLowerCase()
            .includes(this.search().toLocaleLowerCase()),
      ),
  );
  ranking = [
    {
      name: "Limpieza facial profunda",
      art: "facial",
      income: "3,120",
      percent: 37,
    },
    { name: "Masaje relajante", art: "stones", income: "2,450", percent: 29 },
    {
      name: "Depilación láser – Piernas",
      art: "legs",
      income: "1,980",
      percent: 23,
    },
  ];
}
