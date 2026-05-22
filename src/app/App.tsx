import { useState, useEffect, useCallback } from "react";
import {
  Eye, EyeOff, Leaf, Lock, User,
  Calendar, Clock, Phone, MessageCircle,
  ChevronRight, Check, LogOut, Trash2, AlertTriangle, List, X, Bell,
} from "lucide-react";
import {
  type Cita,
  type CitaEstado,
  type Urgency,
  login,
  logout,
  verifySession,
  fetchCitas,
  createCita,
  updateCita,
  deleteCita,
  todayISO,
  getCitaUrgency,
  getCitasAlertaUnaHora,
  formatFechaLabel,
  groupCitasByFecha,
} from "../lib/api";

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30","12:00",
  "12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00",
];

const SOFTDEV_WHATSAPP = "https://wa.me/933070052";

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [visible, setVisible]       = useState(true);
  const [checking, setChecking]     = useState(true);

  useEffect(() => {
    verifySession().then(valid => {
      setIsLoggedIn(valid);
      setChecking(false);
    });
  }, []);

  const transition = (nextLoggedIn: boolean) => {
    setVisible(false);
    setTimeout(() => {
      setIsLoggedIn(nextLoggedIn);
      setVisible(true);
    }, 320);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="font-sans"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.32s ease" }}
    >
      {isLoggedIn
        ? <Dashboard onLogout={() => { logout(); transition(false); }} />
        : <LoginScreen onLogin={() => transition(true)} />
      }
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [usuario,    setUsuario]    = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!usuario.trim() || !contrasena.trim()) {
      setError("Por favor complete todos los campos.");
      return;
    }
    setLoading(true);
    try {
      await login(usuario.trim(), contrasena);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(122,158,130,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

        <div className="px-9 pt-10 pb-11">
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="font-display text-[1.75rem] leading-tight text-foreground tracking-wide">
                Quietud y Belleza
              </h1>
              <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground mt-1">
                Centro Estético
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <LoginField label="Usuario" icon={<User className="w-4 h-4" />}>
              <input
                type="text"
                autoComplete="username"
                placeholder="Tu nombre de usuario"
                value={usuario}
                onChange={e => { setUsuario(e.target.value); setError(""); }}
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all"
              />
            </LoginField>

            <LoginField label="Contraseña" icon={<Lock className="w-4 h-4" />}>
              <input
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={contrasena}
                onChange={e => { setContrasena(e.target.value); setError(""); }}
                className="w-full pl-10 pr-11 py-3 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </LoginField>

            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: error ? "2rem" : 0, opacity: error ? 1 : 0 }}
            >
              <p className="text-[11px] text-destructive pl-0.5 pt-0.5">{error}</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 text-primary-foreground py-3.5 rounded-xl text-sm font-medium tracking-[0.08em] uppercase transition-all flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Ingresando…
                  </>
                ) : "Ingresar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <FooterCredits className="mt-8" />
    </div>
  );
}

function LoginField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium pl-0.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

type AgendaModo = "proximas" | "dia";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [agendaModo, setAgendaModo] = useState<AgendaModo>("proximas");
  const [filtroDia, setFiltroDia] = useState("");
  const [form, setForm] = useState({
    nombre_completo: "",
    whatsapp: "",
    fecha: todayISO(),
    hora: "",
  });
  const [errors, setErrors]   = useState<Partial<typeof form>>({});
  const [success, setSuccess] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [alertasCitas, setAlertasCitas] = useState<Cita[]>([]);

  const hoy = todayISO();

  const revisarAlertas = useCallback(async () => {
    try {
      const citasHoy = await fetchCitas({ modo: "dia", fecha: hoy });
      setAlertasCitas(getCitasAlertaUnaHora(citasHoy, hoy));
    } catch (err) {
      console.error(err);
    }
  }, [hoy]);

  const loadCitas = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        agendaModo === "dia" && filtroDia
          ? await fetchCitas({ modo: "dia", fecha: filtroDia })
          : await fetchCitas({ modo: "proximas" });
      setCitas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [agendaModo, filtroDia]);

  useEffect(() => {
    loadCitas();
  }, [loadCitas]);

  useEffect(() => {
    revisarAlertas();
    const intervalo = setInterval(revisarAlertas, 60_000);
    return () => clearInterval(intervalo);
  }, [revisarAlertas]);

  const agendaSubtitle =
    agendaModo === "proximas"
      ? "Todas las citas próximas, de la más cercana a la más lejana"
      : filtroDia
        ? formatFechaLabel(filtroDia)
        : "Selecciona un día";

  const citasAgrupadas = agendaModo === "proximas" ? groupCitasByFecha(citas) : null;

  const completedCount = citas.filter(c => c.estado === "Completada").length;
  const pendingCount   = citas.filter(c => c.estado === "Pendiente").length;

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.nombre_completo.trim()) e.nombre_completo = "Requerido";
    if (!form.whatsapp.trim())        e.whatsapp        = "Requerido";
    if (!form.fecha)                  e.fecha           = "Requerido";
    else if (form.fecha < hoy)        e.fecha           = "No se permiten fechas pasadas";
    if (!form.hora)                   e.hora            = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const verTodasProximas = () => {
    setAgendaModo("proximas");
    setFiltroDia("");
  };

  const verDiaEspecifico = (fecha: string) => {
    if (!fecha) return;
    setAgendaModo("dia");
    setFiltroDia(fecha);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await createCita({
        nombre_completo: form.nombre_completo.trim(),
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        fecha: form.fecha,
        hora: form.hora,
      });
      setForm({ nombre_completo: "", whatsapp: "", fecha: hoy, hora: "" });
      setErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3200);
      await loadCitas();
      await revisarAlertas();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = async (cita: Cita) => {
    const nuevo: CitaEstado =
      cita.estado === "Completada" ? "Pendiente" : "Completada";
    try {
      await updateCita(cita.id, { estado: nuevo });
      await loadCitas();
      await revisarAlertas();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta cita?")) return;
    try {
      await deleteCita(id);
      await loadCitas();
      await revisarAlertas();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <div className="sticky top-0 z-20">
        <header className="bg-card/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-display text-lg text-foreground tracking-wide">Quietud y Belleza</span>
              <span className="hidden sm:block text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                Centro Estético
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs text-red-500/90 hover:text-red-600 hover:bg-red-50 rounded-lg px-2.5 py-1.5 -mr-2.5 transition-colors group"
              >
                <LogOut className="w-3.5 h-3.5 transition-colors" />
                <span className="hidden sm:block">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </header>

        <CitaAlertBanner citas={alertasCitas} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-10 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 lg:gap-14 items-start">

        <div className="lg:sticky lg:top-24">
          <div className="mb-7">
            <h2 className="font-display text-[2rem] leading-[1.15] text-foreground">
              Agendar<br />nueva cita
            </h2>
            <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
              Complete los datos para reservar su próximo tratamiento.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <FormField label="Nombre completo" icon={<User className="w-4 h-4" />} error={errors.nombre_completo}>
                <input
                  type="text"
                  placeholder="Ej. María González"
                  value={form.nombre_completo}
                  onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all"
                />
              </FormField>

              <FormField label="Número de WhatsApp" icon={<Phone className="w-4 h-4" />} error={errors.whatsapp}>
                <input
                  type="tel"
                  placeholder="+51 921 074 661"
                  value={form.whatsapp}
                  onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Fecha" icon={<Calendar className="w-4 h-4" />} error={errors.fecha}>
                  <input
                    type="date"
                    min={hoy}
                    value={form.fecha}
                    onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="w-full pl-10 pr-3 py-3 bg-input-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all appearance-none"
                  />
                </FormField>

                <FormField label="Horario" icon={<Clock className="w-4 h-4" />} error={errors.hora}>
                  <select
                    value={form.hora}
                    onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                    className="w-full pl-10 pr-3 py-3 bg-input-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Hora</option>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
              </div>

              <div className="pt-1 space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 text-primary-foreground py-3.5 rounded-xl text-sm font-medium tracking-[0.07em] uppercase transition-all flex items-center justify-center gap-2"
                >
                  {saving ? "Guardando…" : "Agendar Cita"}
                  {!saving && <ChevronRight className="w-4 h-4" />}
                </button>

                <div
                  className="overflow-hidden transition-all duration-500"
                  style={{ maxHeight: success ? "2.5rem" : 0, opacity: success ? 1 : 0 }}
                >
                  <div className="flex items-center justify-center gap-2 text-primary text-xs tracking-wide pt-1">
                    <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    Cita agendada correctamente
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="font-display text-[2rem] leading-[1.15] text-foreground">
                Agenda
              </h2>
              <p className="mt-2 text-sm text-muted-foreground capitalize">{agendaSubtitle}</p>
            </div>

            <div className="flex items-end gap-6 sm:text-right shrink-0">
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Completadas</p>
                <p className="font-display text-2xl text-foreground leading-none mt-0.5">{completedCount}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Pendientes</p>
                <p className="font-display text-2xl text-foreground leading-none mt-0.5">{pendingCount}</p>
              </div>
            </div>
          </div>

          <AgendaFilter
            modo={agendaModo}
            filtroDia={filtroDia}
            hoy={hoy}
            onVerProximas={verTodasProximas}
            onVerDia={verDiaEspecifico}
          />

          <div className="flex items-center gap-5 mb-5 flex-wrap text-[11px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded border-2 border-emerald-500/60" />
              Próxima (&lt;24 h)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-orange-500/80" />
              Urgente (&lt;1 h)
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <span className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          ) : citas.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground text-sm">
              {agendaModo === "proximas"
                ? "No hay citas próximas agendadas."
                : "No hay citas para esta fecha."}
            </div>
          ) : agendaModo === "proximas" && citasAgrupadas ? (
            <div className="space-y-8">
              {citasAgrupadas.map(grupo => (
                <section key={grupo.fecha}>
                  <h3 className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium mb-3 pl-0.5 capitalize">
                    {formatFechaLabel(grupo.fecha)}
                  </h3>
                  <div className="space-y-2.5">
                    {grupo.citas.map(cita => (
                      <AppointmentCard
                        key={cita.id}
                        cita={cita}
                        showFecha={false}
                        onToggleEstado={() => toggleEstado(cita)}
                        onDelete={() => handleDelete(cita.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {citas.map(cita => (
                <AppointmentCard
                  key={cita.id}
                  cita={cita}
                  showFecha={false}
                  onToggleEstado={() => toggleEstado(cita)}
                  onDelete={() => handleDelete(cita.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-5 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="font-display text-sm text-muted-foreground">Quietud y Belleza</span>
          <FooterCredits align="end" />
        </div>
      </footer>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function FooterCredits({
  className = "",
  align = "center",
}: {
  className?: string;
  align?: "center" | "end";
}) {
  return (
    <p
      className={[
        "text-xs text-gray-900 font-medium tracking-wide",
        align === "center" ? "text-center" : "text-center sm:text-right",
        className,
      ].join(" ")}
    >
      © {new Date().getFullYear()} Quietud y Belleza
      <span className="text-gray-500 mx-1.5 hidden sm:inline">·</span>
      <span className="block sm:inline mt-1 sm:mt-0">
        Desarrollado por{" "}
        <a
          href={SOFTDEV_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 hover:text-primary hover:underline transition-colors"
        >
          A&amp;S SoftDev
        </a>
      </span>
    </p>
  );
}

function CitaAlertBanner({ citas }: { citas: Cita[] }) {
  if (citas.length === 0) return null;

  return (
    <div
      role="alert"
      className="border-b border-orange-400/40 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 space-y-2">
        {citas.map(cita => (
          <div
            key={cita.id}
            className="flex items-start gap-3 text-sm font-medium"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Bell className="h-4 w-4 animate-pulse" />
            </span>
            <p className="pt-1 leading-snug">
              🔔 ¡Alerta! La cita de{" "}
              <span className="font-semibold underline decoration-white/40">
                {cita.nombre_completo}
              </span>{" "}
              empieza en menos de 1 hora ({cita.hora}).
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgendaFilter({
  modo,
  filtroDia,
  hoy,
  onVerProximas,
  onVerDia,
}: {
  modo: AgendaModo;
  filtroDia: string;
  hoy: string;
  onVerProximas: () => void;
  onVerDia: (fecha: string) => void;
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-card border border-border rounded-2xl">
      <button
        type="button"
        onClick={onVerProximas}
        className={[
          "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-[0.06em] uppercase transition-all shrink-0",
          modo === "proximas"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted",
        ].join(" ")}
      >
        <List className="w-3.5 h-3.5" />
        Todas las próximas
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground shrink-0 hidden sm:block">
          o por día
        </span>
        <div className="relative flex-1 min-w-0">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            min={hoy}
            value={modo === "dia" ? filtroDia : ""}
            onChange={e => onVerDia(e.target.value)}
            className={[
              "w-full pl-10 pr-9 py-2.5 bg-input-background border rounded-xl text-sm transition-all",
              modo === "dia"
                ? "border-primary ring-2 ring-ring text-foreground"
                : "border-border text-foreground focus:border-primary focus:ring-2 focus:ring-ring",
            ].join(" ")}
          />
          {modo === "dia" && filtroDia && (
            <button
              type="button"
              onClick={onVerProximas}
              title="Volver a todas las próximas"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] tracking-[0.16em] uppercase text-muted-foreground font-medium">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {icon}
        </div>
        {children}
      </div>
      {error && <p className="text-[11px] text-destructive pl-0.5">{error}</p>}
    </div>
  );
}

function urgencyStyles(urgency: Urgency, isCompleted: boolean): string {
  if (isCompleted) return "border-border opacity-50 hover:opacity-70";
  if (urgency === "urgent") return "border-orange-500/50 bg-orange-500/[0.04] ring-1 ring-orange-500/20";
  if (urgency === "soon") return "border-emerald-500/40 hover:border-emerald-500/60";
  return "border-border hover:border-primary/25 hover:shadow-sm";
}

function AppointmentCard({
  cita,
  showFecha = false,
  onToggleEstado,
  onDelete,
}: {
  cita: Cita;
  showFecha?: boolean;
  onToggleEstado: () => void;
  onDelete: () => void;
}) {
  const isCompleted = cita.estado === "Completada";
  const urgency = isCompleted ? "none" : getCitaUrgency(cita.fecha, cita.hora);

  return (
    <div
      className={[
        "bg-card border rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-200",
        urgencyStyles(urgency, isCompleted),
      ].join(" ")}
    >
      <span className="w-12 shrink-0 text-sm font-medium text-foreground tabular-nums">
        {cita.hora}
      </span>

      <button
        type="button"
        onClick={onToggleEstado}
        title={isCompleted ? "Marcar pendiente" : "Marcar completada"}
        className="shrink-0"
      >
        {isCompleted ? (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <Check className="w-3 h-3 text-muted-foreground" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center hover:bg-primary/15 transition-colors">
            <div className="w-2 h-2 rounded-full border border-muted-foreground/30" />
          </div>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{cita.nombre_completo}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {showFecha && <span className="capitalize">{formatFechaLabel(cita.fecha)} · </span>}
          {cita.estado}
        </p>
      </div>

      {urgency === "urgent" && !isCompleted && (
        <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.1em] uppercase text-orange-600 dark:text-orange-400 border border-orange-500/30 bg-orange-500/10 rounded-full px-2.5 py-1 font-medium shrink-0">
          <AlertTriangle className="w-3 h-3" />
          Pronto
        </span>
      )}

      {urgency === "soon" && !isCompleted && (
        <span className="hidden sm:inline-flex text-[10px] tracking-[0.12em] uppercase text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 bg-emerald-500/5 rounded-full px-2.5 py-1 font-medium shrink-0">
          Hoy
        </span>
      )}

      <a
        href={`https://wa.me/${cita.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        title={`WhatsApp: ${cita.nombre_completo}`}
        className="shrink-0 w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
      </a>

      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="Eliminar cita"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
