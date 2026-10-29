import { Injectable, signal } from "@angular/core";
import { Appointment, Client, Treatment, isoDate } from "./models";
import * as demo from "./demo";
@Injectable({ providedIn: "root" })
export class DataService {
  readonly demo = signal(false);
  readonly appointments = signal<Appointment[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly treatments = signal<Treatment[]>([]);
  readonly message = signal("");
  readonly loading = signal(false);
  private token = sessionStorage.getItem("qyb_session");
  private apiBase =
    (globalThis as typeof globalThis & { QYB_CONFIG?: { apiUrl: string } })
      .QYB_CONFIG?.apiUrl || "/api";
  private timer?: ReturnType<typeof setTimeout>;
  today() {
    return this.demo() ? "2026-08-25" : isoDate(new Date());
  }
  notify(message: string) {
    this.message.set(message);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.message.set(""), 5000);
  }
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.apiBase}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({
        error: "No se pudo conectar con el servidor.",
        detail: "",
        hint: "",
      }));
      const detail = [body.detail, body.hint]
        .filter((value) => value)
        .join(" - ");
      throw new Error(detail ? `${body.error} ${detail}` : body.error);
    }
    return response.json() as Promise<T>;
  }
  async login(usuario: string, contrasena: string, remember: boolean) {
    const result = await this.request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario, contrasena }),
    });
    this.token = result.token;
    sessionStorage.setItem("qyb_session", result.token);
    if (remember) localStorage.setItem("qyb_username", usuario);
    else localStorage.removeItem("qyb_username");
    this.demo.set(false);
    sessionStorage.removeItem("qyb_demo");
    await this.load();
  }
  async restore() {
    if (sessionStorage.getItem("qyb_demo") === "true") {
      this.startDemo();
      return true;
    }
    // Migrate the old React session into tab-scoped storage once.
    if (!this.token) {
      this.token = localStorage.getItem("qyb_token");
      localStorage.removeItem("qyb_token");
      if (this.token) sessionStorage.setItem("qyb_session", this.token);
    }
    if (!this.token) return false;
    try {
      const r = await this.request<{ valid: boolean }>("/auth/verify");
      if (r.valid) {
        await this.load();
        return true;
      }
    } catch {
      this.logout();
    }
    return false;
  }
  startDemo() {
    this.token = null;
    sessionStorage.removeItem("qyb_session");
    this.demo.set(true);
    sessionStorage.setItem("qyb_demo", "true");
    let saved: {
      appointments: Appointment[];
      clients: Client[];
      treatments: Treatment[];
    } | null = null;
    try {
      saved = JSON.parse(localStorage.getItem("qyb_demo_v1") || "null");
    } catch {
      localStorage.removeItem("qyb_demo_v1");
    }
    this.appointments.set(
      saved?.appointments || structuredClone(demo.appointments),
    );
    this.clients.set(saved?.clients || structuredClone(demo.clients));
    this.treatments.set(saved?.treatments || structuredClone(demo.treatments));
  }
  logout() {
    this.token = null;
    sessionStorage.removeItem("qyb_session");
    sessionStorage.removeItem("qyb_demo");
    this.demo.set(false);
    this.appointments.set([]);
    this.clients.set([]);
    this.treatments.set([]);
  }
  async load() {
    this.loading.set(true);
    try {
      const [a, c, t] = await Promise.all([
        this.request<Appointment[]>("/citas"),
        this.request<Client[]>("/clientes"),
        this.request<Treatment[]>("/servicios"),
      ]);
      this.appointments.set(a);
      this.clients.set(c);
      this.treatments.set(t);
    } finally {
      this.loading.set(false);
    }
  }
  async loadDates(dates: string[]) {
    if (this.demo()) return;
    const results = await Promise.all(
      dates.map((d) => this.request<Appointment[]>(`/citas?fecha=${d}`)),
    );
    const map = new Map(this.appointments().map((a) => [a.id, a]));
    for (const date of dates)
      for (const [id, a] of map) if (a.fecha === date) map.delete(id);
    results.flat().forEach((a) => map.set(a.id, a));
    this.appointments.set([...map.values()]);
  }
  private persist() {
    if (this.demo())
      localStorage.setItem(
        "qyb_demo_v1",
        JSON.stringify({
          appointments: this.appointments(),
          clients: this.clients(),
          treatments: this.treatments(),
        }),
      );
  }
  async saveAppointment(value: Omit<Appointment, "id">, id?: number) {
    const result = this.demo()
      ? { ...value, id: id || Date.now() }
      : await this.request<Appointment>(`/citas${id ? "/" + id : ""}`, {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(value),
        });
    this.appointments.update((all) =>
      id ? all.map((a) => (a.id === id ? result : a)) : [...all, result],
    );
    this.persist();
    this.notify(id ? "Cita actualizada." : "Cita agendada correctamente.");
    return result;
  }
  async removeAppointment(id: number) {
    if (!this.demo()) await this.request(`/citas/${id}`, { method: "DELETE" });
    this.appointments.update((a) => a.filter((x) => x.id !== id));
    this.persist();
    this.notify("Cita eliminada.");
  }
  async setAppointmentStatus(a: Appointment, estado: Appointment["estado"]) {
    const result = this.demo()
      ? { ...a, estado }
      : await this.request<Appointment>(`/citas/${a.id}`, {
          method: "PUT",
          body: JSON.stringify({ estado }),
        });
    this.appointments.update((all) =>
      all.map((item) => (item.id === a.id ? result : item)),
    );
    this.persist();
    this.notify(
      estado === "Completada" ? "Visita completada." : "Cita confirmada.",
    );
  }
  async loadHistory(name: string) {
    if (this.demo()) return;
    const history = await this.request<Appointment[]>(
      `/citas?cliente=${encodeURIComponent(name)}`,
    );
    this.appointments.update((all) => [
      ...all.filter((a) => a.nombre_completo !== name),
      ...history,
    ]);
  }
  async saveClient(value: Omit<Client, "id">, id?: number) {
    const result = this.demo()
      ? { ...value, id: id || Date.now() }
      : await this.request<Client>(`/clientes${id ? "/" + id : ""}`, {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(value),
        });
    this.clients.update((all) =>
      id ? all.map((c) => (c.id === id ? result : c)) : [...all, result],
    );
    this.persist();
    this.notify("Cliente guardado.");
    return result;
  }
  async saveTreatment(value: Omit<Treatment, "id">, id?: number) {
    const result = this.demo()
      ? { ...value, id: id || Date.now() }
      : await this.request<Treatment>(`/servicios${id ? "/" + id : ""}`, {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(value),
        });
    this.treatments.update((all) =>
      id ? all.map((t) => (t.id === id ? result : t)) : [...all, result],
    );
    this.persist();
    this.notify("Servicio guardado.");
    return result;
  }
}
