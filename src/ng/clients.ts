import { Component, computed, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { DataService } from "./data.service";
import { DialogService } from "./dialog.service";
import { Avatar, Badge, Icon, Stat } from "./ui";
import { Client, initials } from "./models";
@Component({
  selector: "q-clients",
  imports: [FormsModule, Avatar, Badge, Icon, Stat],
  templateUrl: "./clients.html",
})
export class ClientsPage {
  Math = Math;
  data = inject(DataService);
  dialogs = inject(DialogService);
  route = inject(ActivatedRoute);
  initials = initials;
  search = signal("");
  status = signal("");
  page = signal(1);
  selectedId = signal(1);
  filtered = computed(() =>
    this.data
      .clients()
      .filter(
        (c) =>
          (!this.status() || c.estado === this.status()) &&
          `${c.nombre} ${c.telefono}`
            .toLocaleLowerCase()
            .includes(this.search().toLocaleLowerCase()),
      ),
  );
  pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / 5)),
  );
  pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i + 1),
  );
  visible = computed(() =>
    this.filtered().slice((this.page() - 1) * 5, this.page() * 5),
  );
  selected = computed(
    () =>
      this.data.clients().find((c) => c.id === this.selectedId()) ||
      this.visible().at(0),
  );
  constructor() {
    const name = this.route.snapshot.queryParamMap.get("nombre");
    if (name) {
      const c = this.data.clients().find((c) => c.nombre === name);
      if (c) {
        this.selectedId.set(c.id);
        this.page.set(Math.floor(this.data.clients().indexOf(c) / 5) + 1);
      } else {
        this.search.set(name);
      }
    }
  }
  date(v: string) {
    return v
      ? new Date(v + "T12:00:00")
          .toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(".", "")
      : "—";
  }
  joined(c: Client) {
    return new Date(c.alta + "T12:00:00").toLocaleDateString("es-PE", {
      month: "long",
      year: "numeric",
    });
  }
  next(c: Client) {
    return this.data
      .appointments()
      .filter(
        (a) => a.nombre_completo === c.nombre && a.fecha >= this.data.today(),
      )
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
      .at(0);
  }
  money(n: number) {
    return n.toLocaleString("en-US");
  }
  setSearch(v: string) {
    this.search.set(v);
    this.page.set(1);
  }
  setStatus(v: string) {
    this.status.set(v);
    this.page.set(1);
  }
}
