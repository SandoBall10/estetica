const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const TOKEN_KEY = "qyb_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export type CitaEstado = "Pendiente" | "Completada";

export type Cita = {
  id: number;
  nombre_completo: string;
  whatsapp: string;
  fecha: string;
  hora: string;
  estado: CitaEstado;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function login(usuario: string, contrasena: string) {
  const data = await request<{ token: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ usuario, contrasena }),
    },
    false
  );
  setToken(data.token);
  return data;
}

export async function verifySession(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const data = await request<{ valid: boolean }>("/auth/verify", {}, true);
    return data.valid;
  } catch {
    setToken(null);
    return false;
  }
}

export function logout() {
  setToken(null);
}

export type FetchCitasOptions =
  | { modo: "proximas" }
  | { modo: "dia"; fecha: string };

export async function fetchCitas(
  options: FetchCitasOptions = { modo: "proximas" }
): Promise<Cita[]> {
  const q =
    options.modo === "dia" ? `?fecha=${encodeURIComponent(options.fecha)}` : "";
  return request<Cita[]>(`/citas${q}`);
}

export function formatFechaLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const hoy = todayISO();
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const mananaISO = [
    manana.getFullYear(),
    String(manana.getMonth() + 1).padStart(2, "0"),
    String(manana.getDate()).padStart(2, "0"),
  ].join("-");

  if (iso === hoy) return "Hoy";
  if (iso === mananaISO) return "Mañana";
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function groupCitasByFecha(citas: Cita[]): { fecha: string; citas: Cita[] }[] {
  const map = new Map<string, Cita[]>();
  for (const cita of citas) {
    if (!map.has(cita.fecha)) map.set(cita.fecha, []);
    map.get(cita.fecha)!.push(cita);
  }
  return Array.from(map.entries()).map(([fecha, items]) => ({
    fecha,
    citas: items,
  }));
}

export async function createCita(
  cita: Omit<Cita, "id" | "estado"> & { estado?: CitaEstado }
): Promise<Cita> {
  return request<Cita>("/citas", {
    method: "POST",
    body: JSON.stringify(cita),
  });
}

export async function updateCita(
  id: number,
  cita: Partial<Omit<Cita, "id">>
): Promise<Cita> {
  return request<Cita>(`/citas/${id}`, {
    method: "PUT",
    body: JSON.stringify(cita),
  });
}

export async function deleteCita(id: number): Promise<void> {
  await request<{ ok: boolean }>(`/citas/${id}`, { method: "DELETE" });
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type Urgency = "none" | "soon" | "urgent";

/** Citas de hoy pendientes que empiezan en ≤60 minutos (aún no iniciadas) */
export function getCitasAlertaUnaHora(citas: Cita[], fechaHoy: string): Cita[] {
  const now = new Date();
  return citas
    .filter(c => {
      if (c.fecha !== fechaHoy || c.estado !== "Pendiente") return false;
      const target = new Date(`${c.fecha}T${c.hora}:00`);
      const diffMin = (target.getTime() - now.getTime()) / (1000 * 60);
      return diffMin > 0 && diffMin <= 60;
    })
    .sort((a, b) => a.hora.localeCompare(b.hora));
}

/** Recordatorios visuales: <24h borde verde, <1h badge urgente */
export function getCitaUrgency(fecha: string, hora: string): Urgency {
  const target = new Date(`${fecha}T${hora}:00`);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return "none";
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return "urgent";
  if (diffHours < 24) return "soon";
  return "none";
}
