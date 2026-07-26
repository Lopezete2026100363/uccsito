"use client";

/**
 * Banco de Dudas para los Nuevos Cachimbos UCSS
 * Ruta: app/aportes/page.tsx   (Next.js App Router · TypeScript)
 *
 * Requisitos:
 *   npm i lucide-react
 *
 * Endpoint (Google Apps Script desplegado como aplicación web):
 *   .env.local  →  NEXT_PUBLIC_FORM_ENDPOINT=https://script.google.com/macros/s/AKfycb.../exec
 *   Si no defines la variable, se usa FALLBACK_ENDPOINT de abajo.
 *
 * Nota CORS: Apps Script NO responde a peticiones preflight (OPTIONS). Por eso
 * enviamos el JSON con Content-Type "text/plain;charset=utf-8", que el navegador
 * considera una "simple request" y manda directo, sin preflight.
 */

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  FileBadge,
  GraduationCap,
  HeartHandshake,
  LaptopMinimal,
  Loader2,
  MessagesSquare,
  RefreshCw,
  RotateCcw,
  School,
  Send,
  Sparkles,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------- config envío ------------------------------ */

/** Pega aquí tu URL /exec o define NEXT_PUBLIC_FORM_ENDPOINT en .env.local */
const FALLBACK_ENDPOINT =
  "https://script.google.com/macros/s/PEGA_AQUI_TU_ID_DE_DESPLIEGUE/exec";

const FORM_ENDPOINT: string =
  process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? FALLBACK_ENDPOINT;

/** Payload exacto que llega a tu Google Sheet. */
interface AportePayload {
  categoria: string;
  duda: string;
  fecha: string; // legible: 26/07/2026, 17:20:03
  timestamp: string; // ISO 8601 para ordenar en la hoja
  origen: string;
}

/* -------------------------------- categorías ------------------------------- */

const CATEGORIAS = [
  { value: "Primeros Pasos / Cachimbo", icon: School },
  { value: "Trámites y Carnés", icon: FileBadge },
  { value: "Matrícula y Horarios", icon: CalendarDays },
  { value: "Pagos y Pensiones", icon: WalletCards },
  { value: "Plataformas Virtuales", icon: LaptopMinimal },
  { value: "Vida Universitaria / Aulas", icon: GraduationCap },
] as const;

type Categoria = (typeof CATEGORIAS)[number]["value"];
type Estado = "form" | "sending" | "success" | "error";

/* --------------------------------- select --------------------------------- */

interface CategoriaSelectProps {
  value: Categoria;
  onChange: (value: Categoria) => void;
  disabled?: boolean;
}

function CategoriaSelect({ value, onChange, disabled = false }: CategoriaSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = CATEGORIAS.find((item) => item.value === value) ?? CATEGORIAS[0];
  const SelectedIcon: LucideIcon = selected.icon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onBlur={(event) => {
          if (!ref.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
        }}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/75 px-4 text-left text-sm font-medium text-slate-100 shadow-inner shadow-slate-950/20 transition hover:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <SelectedIcon size={17} strokeWidth={2.1} />
        </span>
        <span className="flex-1 truncate">{selected.value}</span>
        <ChevronDown
          size={18}
          className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl shadow-slate-950/60"
        >
          {CATEGORIAS.map((item) => {
            const Icon = item.icon;
            const active = item.value === value;
            return (
              <li key={item.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition ${
                    active
                      ? "bg-emerald-400/12 font-semibold text-emerald-300"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                  }`}
                >
                  <Icon size={16} className="shrink-0 opacity-80" />
                  <span className="flex-1">{item.value}</span>
                  {active && <Check size={15} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------------------------------- página --------------------------------- */

export default function BancoDeDudasPage() {
  const [categoria, setCategoria] = useState<Categoria>(CATEGORIAS[0].value);
  const [duda, setDuda] = useState("");
  const [error, setError] = useState("");
  const [estado, setEstado] = useState<Estado>("form");

  const enviando = estado === "sending";

  const construirPayload = (): AportePayload => {
    const ahora = new Date();
    return {
      categoria,
      duda: duda.trim(),
      fecha: ahora.toLocaleString("es-PE", { timeZone: "America/Lima" }),
      timestamp: ahora.toISOString(),
      origen: "Banco de Dudas Cachimbos",
    };
  };

  const enviar = async (): Promise<void> => {
    setEstado("sending");
    setError("");

    try {
      const respuesta = await fetch(FORM_ENDPOINT, {
        method: "POST",
        redirect: "follow",
        // text/plain evita el preflight OPTIONS que Apps Script no sabe responder.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(construirPayload()),
      });

      if (!respuesta.ok) throw new Error(`Respuesta ${respuesta.status}`);

      const datos: unknown = await respuesta.json().catch(() => null);
      const fallo =
        typeof datos === "object" &&
        datos !== null &&
        "result" in datos &&
        (datos as { result?: string }).result === "error";

      if (fallo) throw new Error("El script devolvió un error");

      setEstado("success");
    } catch {
      setEstado("error");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!duda.trim()) {
      setError("Cuéntanos qué duda o enredo tuviste.");
      document.getElementById("duda")?.focus();
      return;
    }
    void enviar();
  };

  const handleDudaChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setDuda(event.target.value);
    if (error) setError("");
  };

  const reset = (): void => {
    setCategoria(CATEGORIAS[0].value);
    setDuda("");
    setError("");
    setEstado("form");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
      <style>{`
        @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drift { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(2%, -3%, 0) scale(1.05); } }
        .rise { animation: rise 650ms cubic-bezier(.16,1,.3,1) both; }
        .drift { animation: drift 24s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
      `}</style>

      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="drift absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(148,163,184,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.22)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_top,#000_15%,transparent_75%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/30">
              <GraduationCap size={22} strokeWidth={2.2} />
            </span>
            <div>
              <p className="font-bold tracking-tight text-slate-100">UCSS</p>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Comunidad cachimba
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 sm:inline-flex">
            <HeartHandshake size={15} className="text-emerald-400" /> Entre estudiantes
          </span>
        </header>

        <div className="mt-16 grid items-start gap-14 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_34rem] lg:gap-24">
          {/* Columna narrativa */}
          <section className="rise max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-violet-300">
              <Sparkles size={14} /> Banco de dudas
            </div>
            <h1 className="mt-7 max-w-[12ch] text-balance text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-slate-50">
              ¡Sálvale la vida a un cachimbo! 🎓
            </h1>
            <p className="mt-7 max-w-[58ch] text-pretty text-base leading-8 text-slate-300 sm:text-lg">
              ¿Recuerdas cuando recién ingresaste y no sabías ni cómo pagar la pensión, dónde sacar
              el carné o cómo usar el portal? Deja aquí esa duda o trámite que te hizo renegar en
              primer ciclo para investigarlo y subir la solución a la app. ¡Ayudemos a la comunidad!
            </p>

            <div className="mt-10 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-5 text-sm leading-6 text-emerald-100/80">
              <div className="flex gap-3">
                <HeartHandshake size={19} className="mt-0.5 shrink-0 text-emerald-300" />
                <p>
                  Tu aporte servirá para alimentar la base de preguntas frecuentes de Uccsito y
                  evitar que los nuevos se pierdan.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                ["01", "Recuerda", "La traba que te hizo perder tiempo."],
                ["02", "Cuéntala", "Con palabras simples, como a un amigo."],
                ["03", "Ayuda", "Otro cachimbo llegará mejor preparado."],
              ].map(([number, title, text]) => (
                <div key={number} className="border-t border-slate-800 pt-4">
                  <span className="font-mono text-sm font-bold text-emerald-400">{number}</span>
                  <p className="mt-3 font-semibold text-slate-200">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Panel del formulario */}
          <section
            className="rise rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8"
            style={{ animationDelay: "100ms" }}
          >
            {estado !== "success" ? (
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-400">
                      Aporte comunitario
                    </p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-50">
                      La pregunta que te hubiera gustado encontrar
                    </h2>
                  </div>
                  <MessagesSquare className="mt-1 shrink-0 text-violet-300" size={24} />
                </div>

                <div className="mt-9">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Categoría
                  </label>
                  <CategoriaSelect value={categoria} onChange={setCategoria} disabled={enviando} />
                </div>

                <div className="mt-7">
                  <label
                    htmlFor="duda"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400"
                  >
                    Tu pregunta de cachimbo
                  </label>
                  <textarea
                    id="duda"
                    value={duda}
                    onChange={handleDudaChange}
                    disabled={enviando}
                    rows={7}
                    placeholder="¿Qué duda o enredo tuviste en tu primer ciclo que debería estar explicada en la app?"
                    aria-invalid={Boolean(error)}
                    className={`w-full resize-y rounded-2xl border bg-slate-950/70 px-4 py-4 text-base leading-7 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      error
                        ? "border-rose-400/70 focus:ring-rose-400/30"
                        : "border-slate-700 focus:border-emerald-400 focus:ring-emerald-400/40"
                    }`}
                  />
                  <div className="mt-2 flex items-start justify-between gap-4">
                    {error ? (
                      <p className="flex items-center gap-1.5 text-sm text-rose-300">
                        <AlertCircle size={15} />
                        {error}
                      </p>
                    ) : (
                      <p className="text-sm leading-6 text-slate-500">
                        Una duda real ayuda más que una respuesta perfecta.
                      </p>
                    )}
                    <span className="shrink-0 font-mono text-xs text-slate-600">{duda.length}</span>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-violet-400/15 bg-violet-400/[0.06] p-4 text-sm leading-6 text-slate-300">
                  <p>
                    <span className="font-semibold text-violet-200">Tip de veterano:</span> no hace
                    falta que sepas la solución. Déjanos el problema y lo investigamos para la guía.
                  </p>
                </div>

                {/* Fallo de red / endpoint */}
                {estado === "error" && (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/[0.07] p-4 text-sm leading-6 text-rose-100">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-300" />
                    <div>
                      <p className="font-semibold text-rose-200">No pudimos guardar tu aporte</p>
                      <p className="mt-1 text-rose-100/75">
                        Revisa tu conexión y vuelve a intentarlo. Tu texto sigue aquí, no se borró.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="mt-7 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-400 px-6 text-base font-bold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300 active:translate-y-px disabled:cursor-wait disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  {enviando ? (
                    <>
                      <Loader2 size={19} className="animate-spin" /> Enviando...
                    </>
                  ) : estado === "error" ? (
                    <>
                      <RefreshCw size={18} /> Reintentar envío
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Aportar mi pregunta de cachimbo 🚀
                    </>
                  )}
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-slate-600">
                  Guardamos tu aporte de forma anónima. No pedimos nombre ni correo.
                </p>
              </form>
            ) : (
              <div className="py-8 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <HeartHandshake size={30} />
                </span>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-50">
                  ¡Gracias por tu aporte!
                </h2>
                <p className="mx-auto mt-4 max-w-[40ch] leading-7 text-slate-400">
                  Tu pregunta ha sido guardada en nuestra base de datos para investigar la respuesta
                  oficial.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mx-auto mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 font-bold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <RotateCcw size={17} /> Aportar otra pregunta
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
