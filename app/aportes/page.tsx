"use client";

/**
 * Buzón de Consultas y Preguntas Frecuentes UCSS
 * Ruta: app/aportes/page.tsx   (Next.js App Router · TypeScript)
 *
 * Requisitos:
 *   npm i lucide-react
 *   Tailwind con dark mode por clase:
 *     v3 → tailwind.config.ts: darkMode: "class"
 *     v4 → globals.css: @custom-variant dark (&:where(.dark, .dark *));
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  GraduationCap,
  ClipboardCheck,
  Wallet,
  FileStack,
  Scale,
  CalendarClock,
  Sparkles,
  MessagesSquare,
  ChevronDown,
  Check,
  AlertCircle,
  Building2,
  UserRound,
  Send,
  Loader2,
  PartyPopper,
  RotateCcw,
  Eye,
  Copy,
  ShieldAlert,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";

/* ---------------------------------- tipos --------------------------------- */

type Categoria =
  | "Matrícula"
  | "Becas y Pagos"
  | "Trámites / Secretaría"
  | "Reglamentos"
  | "Aulas / Horarios"
  | "Otro";

interface OpcionCategoria {
  value: Categoria;
  icon: LucideIcon;
}

type EstadoCopia = "idle" | "ok" | "error";

/** Permite pasar la custom property --i al atributo style sin pelear con TS. */
type EstiloConIndice = CSSProperties & { "--i"?: number };

const WHATSAPP_NUMBER = "51944467083" as const;
const SIN_RESPUESTA = "(Por resolver / Dejada en blanco)" as const;

const CATEGORIAS: readonly OpcionCategoria[] = [
  { value: "Matrícula", icon: ClipboardCheck },
  { value: "Becas y Pagos", icon: Wallet },
  { value: "Trámites / Secretaría", icon: FileStack },
  { value: "Reglamentos", icon: Scale },
  { value: "Aulas / Horarios", icon: CalendarClock },
  { value: "Otro", icon: Sparkles },
];

/* ---------------------------------- tema --------------------------------- */

function useTheme(): { dark: boolean; toggle: () => void } {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("ucss-buzon-theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = saved ? saved === "dark" : prefers;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);

  const toggle = (): void => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("ucss-buzon-theme", next ? "dark" : "light");
      return next;
    });
  };

  return { dark, toggle };
}

/* ------------------------------- portapapeles ------------------------------ */

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* cae al método legacy */
  }

  try {
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/** Estado de copiado que se autolimpia a los 2.2 s. */
function useCopiar(): {
  estado: EstadoCopia;
  copiar: (texto: string) => Promise<boolean>;
} {
  const [estado, setEstado] = useState<EstadoCopia>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copiar = async (texto: string): Promise<boolean> => {
    const ok = await copiarTexto(texto);
    setEstado(ok ? "ok" : "error");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setEstado("idle"), 2200);
    return ok;
  };

  return { estado, copiar };
}

interface BotonCopiarProps {
  texto: string;
  className?: string;
  etiqueta?: string;
}

function BotonCopiar({
  texto,
  className = "",
  etiqueta = "Copiar mensaje",
}: BotonCopiarProps) {
  const { estado, copiar } = useCopiar();

  const contenido: Record<EstadoCopia, [LucideIcon, string]> = {
    idle: [Copy, etiqueta],
    ok: [Check, "Copiado al portapapeles"],
    error: [AlertCircle, "Cópialo manualmente arriba"],
  };

  const [Icono, label] = contenido[estado];

  return (
    <button
      type="button"
      onClick={() => void copiar(texto)}
      aria-live="polite"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-[0.875rem] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00A3E0]/40 ${
        estado === "ok"
          ? "border-[#00A3E0]/45 bg-[#00A3E0]/12 text-[#00618c] dark:text-[#7FD8F7]"
          : estado === "error"
          ? "border-[#D4483B]/45 bg-[#D4483B]/[0.08] text-[#C0392B] dark:text-[#F2938A]"
          : "border-[#002B49]/15 text-[#002B49]/75 hover:border-[#00A3E0]/60 hover:text-[#002B49] dark:border-white/15 dark:text-white/75 dark:hover:text-white"
      } ${className}`}
    >
      <Icono size={15} strokeWidth={2.3} />
      {label}
    </button>
  );
}

/* -------------------------------- dropdown -------------------------------- */

interface CategoriaSelectProps {
  value: Categoria;
  onChange: (value: Categoria) => void;
}

function CategoriaSelect({ value, onChange }: CategoriaSelectProps) {
  const [open, setOpen] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const actual: OpcionCategoria =
    CATEGORIAS.find((c) => c.value === value) ?? CATEGORIAS[0];
  const ActualIcon = actual.icon;

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent): void => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center gap-3 rounded-2xl border border-[#002B49]/12 bg-white/70 px-4 py-3.5 text-left text-[0.9375rem] font-medium text-[#002B49] shadow-[0_1px_2px_rgba(0,43,73,0.05)] backdrop-blur-md transition-colors duration-150 hover:border-[#00A3E0]/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00A3E0]/40 dark:border-white/10 dark:bg-white/[0.06] dark:text-[#E8F4FB] dark:hover:border-[#00A3E0]/60"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#00A3E0]/12 text-[#0083b8] dark:bg-[#00A3E0]/[0.18] dark:text-[#5CCBF2]">
          <ActualIcon size={16} strokeWidth={2.1} />
        </span>
        <span className="flex-1 truncate">{actual.value}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#002B49]/40 transition-transform duration-200 dark:text-white/40 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-2 w-full origin-top overflow-hidden rounded-2xl border border-[#002B49]/10 bg-white/85 p-1.5 shadow-[0_18px_44px_-16px_rgba(0,43,73,0.35)] backdrop-blur-2xl [animation:ucss-pop_220ms_cubic-bezier(0.16,1,0.3,1)] dark:border-white/12 dark:bg-[#012338]/85"
        >
          {CATEGORIAS.map((c) => {
            const Icon = c.icon;
            const activo = c.value === value;
            return (
              <li key={c.value} role="option" aria-selected={activo}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.9375rem] transition-colors duration-150 ${
                    activo
                      ? "bg-[#00A3E0]/[0.14] font-semibold text-[#00507a] dark:text-[#7FD8F7]"
                      : "font-medium text-[#002B49]/80 hover:bg-[#002B49]/[0.05] dark:text-white/75 dark:hover:bg-white/[0.07]"
                  }`}
                >
                  <Icon size={16} strokeWidth={2.1} className="shrink-0 opacity-70" />
                  <span className="flex-1 truncate">{c.value}</span>
                  {activo && <Check size={15} strokeWidth={2.6} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------- campos --------------------------------- */

interface EtiquetaProps {
  children: ReactNode;
  opcional?: boolean;
}

function Etiqueta({ children, opcional = false }: EtiquetaProps) {
  return (
    <span className="mb-2 flex items-baseline gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.09em] text-[#002B49]/65 dark:text-[#9FC4DA]">
      {children}
      {opcional && (
        <span className="text-[0.6875rem] font-medium normal-case tracking-normal text-[#002B49]/40 dark:text-white/35">
          opcional
        </span>
      )}
    </span>
  );
}

const campoBase =
  "w-full rounded-2xl border bg-white/65 px-4 py-3.5 text-[0.9375rem] leading-relaxed text-[#002B49] shadow-[0_1px_2px_rgba(0,43,73,0.05)] backdrop-blur-md transition-[border-color,box-shadow] duration-150 placeholder:text-[#002B49]/35 focus:outline-none focus:ring-[3px] focus:ring-[#00A3E0]/35 dark:bg-white/[0.06] dark:text-[#E8F4FB] dark:placeholder:text-white/30";

function bordeCampo(error: boolean): string {
  return error
    ? "border-[#D4483B]/60 focus:border-[#D4483B] focus:ring-[#D4483B]/25 dark:border-[#F08379]/50"
    : "border-[#002B49]/12 focus:border-[#00A3E0] dark:border-white/10";
}

/* ------------------------------- pasos guía ------------------------------- */

const PASOS: ReadonlyArray<{ titulo: string; texto: ReactNode }> = [
  {
    titulo: "Escribe tu duda tal cual",
    texto: "Sin tecnicismos. Como se la preguntarías a un compañero en el pasillo.",
  },
  {
    titulo: "¿Sabes la respuesta? Compártela",
    texto: (
      <>
        <strong className="font-semibold text-[#002B49] dark:text-[#E8F4FB]">
          Si no la sabes, deja ese campo en blanco.
        </strong>{" "}
        Igual recibimos tu consulta y te respondemos.
      </>
    ),
  },
  {
    titulo: "Revisa y envía",
    texto: "Se abre WhatsApp con el mensaje ya listo. Solo pulsas enviar.",
  },
];

/* --------------------------------- página --------------------------------- */

export default function BuzonConsultasPage() {
  const { dark, toggle } = useTheme();

  const [categoria, setCategoria] = useState<Categoria>("Matrícula");
  const [pregunta, setPregunta] = useState<string>("");
  const [respuesta, setRespuesta] = useState<string>("");
  const [sede, setSede] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");

  const [errorPregunta, setErrorPregunta] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [enviado, setEnviado] = useState<boolean>(false);
  const [bloqueado, setBloqueado] = useState<boolean>(false);
  const [verPreview, setVerPreview] = useState<boolean>(false);

  const mensaje: string = useMemo(() => {
    const solucionTxt = respuesta.trim() || SIN_RESPUESTA;
    const sedeTxt = sede.trim() || "No especificada";
    const nombreTxt = nombre.trim() || "Anónimo";
    return [
      "*Nueva Consulta UCSS* 🚀",
      "",
      `📌 *Categoría:* ${categoria}`,
      `❓ *Pregunta:* ${pregunta.trim() || "..."}`,
      `💡 *Solución:* ${solucionTxt}`,
      `🏛️ *Sede/Facultad:* ${sedeTxt}`,
      `👤 *Enviado por:* ${nombreTxt}`,
    ].join("\n");
  }, [categoria, pregunta, respuesta, sede, nombre]);

  const enlaceWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    mensaje
  )}`;

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Única obligatoria: la pregunta. La respuesta puede quedar en blanco.
    if (!pregunta.trim()) {
      setErrorPregunta("Escribe la duda que quieres enviar.");
      document.getElementById("pregunta")?.focus({ preventScroll: false });
      return;
    }
    setErrorPregunta(null);

    const ventana: Window | null = window.open(
      enlaceWhatsApp,
      "_blank",
      "noopener,noreferrer"
    );
    const popupBloqueado =
      !ventana || ventana.closed || typeof ventana.closed === "undefined";

    // Si el navegador bloqueó la pestaña, dejamos la consulta en el portapapeles.
    if (popupBloqueado) void copiarTexto(mensaje);
    setBloqueado(popupBloqueado);

    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 700);
  };

  const reiniciar = (): void => {
    setCategoria("Matrícula");
    setPregunta("");
    setRespuesta("");
    setSede("");
    setNombre("");
    setErrorPregunta(null);
    setVerPreview(false);
    setBloqueado(false);
    setEnviado(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#EEF5FA] font-[var(--ucss-font)] text-[#002B49] antialiased transition-colors duration-300 dark:bg-[#00131F] dark:text-[#E8F4FB]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap');
        :root { --ucss-font: 'Instrument Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
        @keyframes ucss-pop { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes ucss-fade { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }
        @keyframes ucss-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes ucss-drift { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(3%, -4%, 0) scale(1.06); } }
        .ucss-rise { animation: ucss-rise 620ms cubic-bezier(0.16,1,0.3,1) both; animation-delay: calc(var(--i, 0) * 70ms); }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      {/* Fondo: lo que le da al cristal algo que difuminar */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -left-[12%] top-[-18%] h-[46rem] w-[46rem] rounded-full bg-[#00A3E0] opacity-[0.28] blur-[130px] dark:opacity-[0.22]"
          style={{ animation: "ucss-drift 26s ease-in-out infinite" }}
        />
        <div
          className="absolute right-[-16%] top-[22%] h-[40rem] w-[40rem] rounded-full bg-[#002B49] opacity-[0.20] blur-[140px] dark:bg-[#0B5C8A] dark:opacity-[0.34]"
          style={{ animation: "ucss-drift 34s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute bottom-[-24%] left-[28%] h-[34rem] w-[34rem] rounded-full bg-[#4FD1C5] opacity-[0.18] blur-[130px] dark:bg-[#00A3E0] dark:opacity-[0.14]"
          style={{ animation: "ucss-drift 30s ease-in-out infinite" }}
        />
        <div
          className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,43,73,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,43,73,0.055) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 100%)",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-7 sm:px-8 lg:pt-10">
        {/* Barra superior */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#002B49] text-white shadow-[0_8px_20px_-8px_rgba(0,43,73,0.7)] dark:bg-[#00A3E0] dark:text-[#00131F]">
              <GraduationCap size={20} strokeWidth={2.2} />
            </span>
            <div className="leading-tight">
              <p className="text-[0.9375rem] font-bold tracking-tight">UCSS</p>
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[#002B49]/50 dark:text-white/45">
                Atención al estudiante
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#002B49]/12 bg-white/60 text-[#002B49]/70 backdrop-blur-md transition-colors duration-150 hover:text-[#002B49] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00A3E0]/40 dark:border-white/12 dark:bg-white/[0.07] dark:text-white/70 dark:hover:text-white"
          >
            {dark ? <Sun size={17} strokeWidth={2.1} /> : <Moon size={17} strokeWidth={2.1} />}
          </button>
        </header>

        <div className="mt-14 grid items-start gap-14 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-20">
          {/* Columna narrativa */}
          <section className="max-w-[34rem]">
            <p className="ucss-rise inline-flex items-center gap-2 rounded-full border border-[#00A3E0]/30 bg-[#00A3E0]/10 px-3.5 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#00618c] dark:border-[#00A3E0]/25 dark:text-[#7FD8F7]">
              <MessagesSquare size={13} strokeWidth={2.4} />
              Buzón abierto
            </p>

            <h1
              className="ucss-rise mt-6 max-w-[16ch] text-balance text-[clamp(2rem,4.6vw,3.05rem)] font-bold leading-[1.06] tracking-[-0.03em]"
              style={{ "--i": 1 } as EstiloConIndice}
            >
              Buzón de Consultas y Preguntas Frecuentes UCSS
            </h1>

            <p
              className="ucss-rise mt-6 max-w-[46ch] text-pretty text-[1.0625rem] leading-[1.7] text-[#002B49]/70 dark:text-[#B9D4E4]"
              style={{ "--i": 2 } as EstiloConIndice}
            >
              Déjanos tus dudas sobre trámites o procesos universitarios. Si ya sabes cómo se
              resuelve, cuéntanoslo también: le ahorras la cola al siguiente.
            </p>

            <ol className="ucss-rise mt-12 space-y-7" style={{ "--i": 3 } as EstiloConIndice}>
              {PASOS.map((paso, i) => (
                <li key={paso.titulo} className="flex gap-5">
                  <span className="mt-0.5 w-6 shrink-0 text-[1.0625rem] font-bold tabular-nums text-[#00A3E0]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="border-l border-[#002B49]/10 pl-5 dark:border-white/10">
                    <span className="block text-[1rem] font-semibold tracking-[-0.01em]">
                      {paso.titulo}
                    </span>
                    <span className="mt-1 block max-w-[42ch] text-[0.9375rem] leading-relaxed text-[#002B49]/60 dark:text-[#9FC4DA]">
                      {paso.texto}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Panel de cristal */}
          <section
            className="ucss-rise relative rounded-[1.75rem] border border-white/70 bg-white/55 p-6 shadow-[0_30px_70px_-30px_rgba(0,43,73,0.45)] backdrop-blur-2xl sm:p-8 dark:border-white/12 dark:bg-white/[0.055] dark:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)]"
            style={{ "--i": 2 } as EstiloConIndice}
          >
            {!enviado ? (
              <form onSubmit={handleSubmit} noValidate>
                <h2 className="text-[1.375rem] font-bold tracking-[-0.02em]">Nueva consulta</h2>
                <p className="mt-1.5 text-[0.9375rem] text-[#002B49]/55 dark:text-[#9FC4DA]">
                  Toma menos de dos minutos.
                </p>

                <div className="mt-8 flex flex-col">
                  <Etiqueta>Categoría</Etiqueta>
                  <CategoriaSelect value={categoria} onChange={setCategoria} />
                </div>

                <div className="mt-6 flex flex-col">
                  <label htmlFor="pregunta">
                    <Etiqueta>Tu pregunta o duda frecuente</Etiqueta>
                  </label>
                  <textarea
                    id="pregunta"
                    rows={2}
                    value={pregunta}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                      setPregunta(e.target.value);
                      if (errorPregunta) setErrorPregunta(null);
                    }}
                    placeholder="¿Cómo solicito un duplicado de carné universitario?"
                    className={`${campoBase} ${bordeCampo(Boolean(errorPregunta))} resize-y`}
                    aria-invalid={Boolean(errorPregunta)}
                  />
                  {errorPregunta && (
                    <span className="mt-2 flex items-center gap-1.5 text-[0.8125rem] font-medium text-[#C0392B] [animation:ucss-fade_200ms_cubic-bezier(0.16,1,0.3,1)] dark:text-[#F2938A]">
                      <AlertCircle size={14} strokeWidth={2.3} />
                      {errorPregunta}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-col">
                  <label htmlFor="respuesta">
                    <Etiqueta opcional>Tu respuesta o solución paso a paso</Etiqueta>
                  </label>
                  <textarea
                    id="respuesta"
                    rows={5}
                    value={respuesta}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setRespuesta(e.target.value)
                    }
                    placeholder={
                      "1. Ingresa al campus virtual, sección Trámites.\n2. Paga la tasa en el banco o en línea.\n3. Sube el voucher y recoge el carné en 5 días hábiles."
                    }
                    className={`${campoBase} ${bordeCampo(false)} resize-y`}
                  />
                  <span className="mt-2 flex items-start justify-between gap-3">
                    <span className="text-[0.8125rem] leading-[1.5] text-[#002B49]/45 dark:text-white/40">
                      <b className="font-semibold text-[#00618c] dark:text-[#7FD8F7]">
                        ¿No sabes la respuesta?
                      </b>{" "}
                      Deja este campo totalmente en blanco y la marcamos como pendiente.
                    </span>
                    <span className="shrink-0 pt-px text-[0.75rem] tabular-nums text-[#002B49]/35 dark:text-white/30">
                      {respuesta.length}
                    </span>
                  </span>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label htmlFor="sede">
                      <Etiqueta opcional>Sede / Facultad</Etiqueta>
                    </label>
                    <div className="relative">
                      <Building2
                        size={16}
                        strokeWidth={2.1}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#002B49]/35 dark:text-white/35"
                      />
                      <input
                        id="sede"
                        value={sede}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSede(e.target.value)}
                        placeholder="Los Olivos · Ingeniería"
                        className={`${campoBase} ${bordeCampo(false)} pl-11`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="nombre">
                      <Etiqueta opcional>Nombre o correo</Etiqueta>
                    </label>
                    <div className="relative">
                      <UserRound
                        size={16}
                        strokeWidth={2.1}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#002B49]/35 dark:text-white/35"
                      />
                      <input
                        id="nombre"
                        value={nombre}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                        placeholder="tu@ucss.pe"
                        className={`${campoBase} ${bordeCampo(false)} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                {/* Vista previa + copia manual */}
                <div className="mt-7 rounded-2xl border border-[#002B49]/10 bg-white/40 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setVerPreview((v) => !v)}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[0.875rem] font-semibold text-[#002B49]/70 transition-colors duration-150 hover:text-[#002B49] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00A3E0]/40 dark:text-white/65 dark:hover:text-white"
                  >
                    <Eye size={15} strokeWidth={2.2} />
                    Ver cómo llegará el mensaje
                    <ChevronDown
                      size={16}
                      className={`ml-auto transition-transform duration-200 ${
                        verPreview ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {verPreview && (
                    <div className="px-4 pb-4 [animation:ucss-fade_240ms_cubic-bezier(0.16,1,0.3,1)]">
                      <pre className="whitespace-pre-wrap break-words rounded-xl bg-[#002B49]/[0.045] p-4 font-[var(--ucss-font)] text-[0.875rem] leading-[1.65] text-[#002B49]/80 dark:bg-black/25 dark:text-[#CFE6F2]">
                        {mensaje}
                      </pre>
                      <BotonCopiar texto={mensaje} className="mt-3 w-full" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="group mt-7 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#002B49] px-6 py-4 text-[1rem] font-semibold text-white shadow-[0_16px_34px_-14px_rgba(0,43,73,0.8)] transition-[background-color,transform,box-shadow] duration-150 hover:bg-[#003a61] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00A3E0]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:bg-[#00A3E0] dark:text-[#00131F] dark:shadow-[0_16px_34px_-14px_rgba(0,163,224,0.6)] dark:hover:bg-[#33B8E8]"
                >
                  {enviando ? (
                    <>
                      <Loader2 size={18} strokeWidth={2.4} className="animate-spin" />
                      Abriendo WhatsApp
                    </>
                  ) : (
                    <>
                      <Send
                        size={17}
                        strokeWidth={2.3}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                      Enviar a WhatsApp 📲
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[0.8125rem] leading-relaxed text-[#002B49]/45 dark:text-white/40">
                  Tu consulta viaja contigo al chat de atención. Nada se guarda en esta página.
                </p>
              </form>
            ) : (
              <div className="[animation:ucss-rise_500ms_cubic-bezier(0.16,1,0.3,1)] py-6 text-center">
                <span
                  className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${
                    bloqueado
                      ? "bg-[#E9A23B]/15 text-[#9A6212] dark:text-[#F2C57C]"
                      : "bg-[#00A3E0]/15 text-[#00618c] dark:text-[#7FD8F7]"
                  }`}
                >
                  {bloqueado ? (
                    <ShieldAlert size={28} strokeWidth={2} />
                  ) : (
                    <PartyPopper size={28} strokeWidth={2} />
                  )}
                </span>

                <h2 className="mt-6 text-balance text-[1.625rem] font-bold tracking-[-0.02em]">
                  {bloqueado ? "Tu navegador bloqueó la pestaña" : "Gracias por escribirnos"}
                </h2>
                <p className="mx-auto mt-3 max-w-[38ch] text-pretty text-[0.9875rem] leading-[1.7] text-[#002B49]/60 dark:text-[#9FC4DA]">
                  {bloqueado
                    ? "Ya copiamos tu consulta al portapapeles. Abre WhatsApp con el botón de abajo y pégala, no se pierde nada."
                    : "Termina de enviarla en la pestaña de WhatsApp que acabamos de abrir. Si no la ves, copia el mensaje y ábrelo a mano."}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <a
                    href={enlaceWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#002B49] px-6 py-3.5 text-[0.9375rem] font-semibold text-white transition-colors duration-150 hover:bg-[#003a61] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00A3E0]/50 dark:bg-[#00A3E0] dark:text-[#00131F] dark:hover:bg-[#33B8E8]"
                  >
                    <Send size={16} strokeWidth={2.3} />
                    {bloqueado ? "Abrir WhatsApp" : "Reabrir WhatsApp"}
                  </a>
                  <BotonCopiar texto={mensaje} etiqueta="Copiar la consulta" />
                </div>

                <button
                  type="button"
                  onClick={reiniciar}
                  className="mx-auto mt-7 inline-flex items-center gap-2 text-[0.875rem] font-semibold text-[#002B49]/55 underline-offset-4 transition-colors duration-150 hover:text-[#002B49] hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00A3E0]/40 dark:text-white/55 dark:hover:text-white"
                >
                  <RotateCcw size={15} strokeWidth={2.3} />
                  Enviar otra pregunta
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
