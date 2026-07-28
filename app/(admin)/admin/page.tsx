"use client";

/**
 * app/(admin)/admin/page.tsx
 * Consola de conocimiento uccsito: sube PDFs, extrae texto, vectoriza e indexa.
 *
 * npm i react-dropzone lucide-react
 */

import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  Database,
  ShieldAlert,
  XCircle,
  Image as ImageIcon,
  Send,
  Loader2,
  ScanText,
  Sparkles,
  HardDriveDownload,
  Tag,
} from "lucide-react";

/* --------------------------------- tipos ---------------------------------- */

type Fase = "espera" | "leyendo" | "fragmentando" | "vectorizando" | "guardando" | "listo" | "error";

interface EventoServidor {
  phase: Exclude<Fase, "espera">;
  message?: string;
  chunks?: number;
  done?: number;
  total?: number;
  pages?: number;
}

interface ArchivoEnCola {
  id: string;
  file: File;
  fase: Fase;
  chunks: number;
  progreso: number; // 0-100 de la vectorización
  detalle: string;
}

const CATEGORIAS = [
  "Reglamento",
  "Guía",
  "Calendario",
  "Trámite",
  "Matrícula",
  "Pagos",
  "Otro",
] as const;

const ETIQUETA_FASE: Record<Fase, string> = {
  espera: "En cola",
  leyendo: "Leyendo PDF...",
  fragmentando: "Dividiendo en fragmentos...",
  vectorizando: "Generando vectores...",
  guardando: "Guardando en Supabase...",
  listo: "Guardado con éxito",
  error: "Falló",
};

const ICONO_FASE: Record<Fase, React.ReactNode> = {
  espera: <FileText className="h-4 w-4 text-slate-500" />,
  leyendo: <ScanText className="h-4 w-4 animate-pulse text-amber-400" />,
  fragmentando: <ScanText className="h-4 w-4 animate-pulse text-amber-400" />,
  vectorizando: <Sparkles className="h-4 w-4 animate-pulse text-amber-400" />,
  guardando: <HardDriveDownload className="h-4 w-4 animate-pulse text-amber-400" />,
  listo: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
};

const idAleatorio = (): string => Math.random().toString(36).slice(2, 10);

/* -------------------------------- página ---------------------------------- */

export default function AdminPage() {
  const [cola, setCola] = useState<ArchivoEnCola[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS[0]);
  const [resumen, setResumen] = useState("");
  const [errorGlobal, setErrorGlobal] = useState("");

  // Generador de marcadores de imagen (sin cambios funcionales)
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [imgText, setImgText] = useState("");
  const [imgCopiado, setImgCopiado] = useState(false);

  const onDrop = useCallback(
    (aceptados: File[]) => {
      if (procesando) return;
      setCola((prev) => [
        ...prev,
        ...aceptados.map((file) => ({
          id: idAleatorio(),
          file,
          fase: "espera" as Fase,
          chunks: 0,
          progreso: 0,
          detalle: "",
        })),
      ]);
      setResumen("");
      setErrorGlobal("");
    },
    [procesando]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    multiple: true,
    disabled: procesando,
  });

  const pendientes = useMemo(
    () => cola.filter((item) => item.fase !== "listo").length,
    [cola]
  );

  const actualizar = (id: string, cambios: Partial<ArchivoEnCola>): void => {
    setCola((prev) => prev.map((item) => (item.id === id ? { ...item, ...cambios } : item)));
  };

  const quitar = (id: string): void => {
    setCola((prev) => prev.filter((item) => item.id !== id));
  };

  /** Lee el NDJSON del servidor y va pintando cada fase en vivo. */
  const procesarArchivo = async (item: ArchivoEnCola): Promise<number> => {
    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("titulo", cola.length === 1 ? titulo.trim() : "");
    formData.append("categoria", categoria);

    const respuesta = await fetch("/api/admin/upload-pdf", { method: "POST", body: formData });
    if (!respuesta.body) throw new Error("El servidor no devolvió respuesta.");

    const lector = respuesta.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let guardados = 0;

    while (true) {
      const { value, done } = await lector.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lineas = buffer.split("\n");
      buffer = lineas.pop() ?? "";

      for (const linea of lineas) {
        if (!linea.trim()) continue;
        const evento = JSON.parse(linea) as EventoServidor;

        if (evento.phase === "error") throw new Error(evento.message ?? "Error del servidor");

        if (evento.phase === "listo") {
          guardados = evento.chunks ?? 0;
          actualizar(item.id, {
            fase: "listo",
            chunks: guardados,
            progreso: 100,
            detalle: `${guardados} fragmentos indexados${evento.pages ? ` · ${evento.pages} págs.` : ""}`,
          });
        } else {
          const progreso =
            evento.phase === "vectorizando" && evento.total
              ? Math.round(((evento.done ?? 0) / evento.total) * 100)
              : evento.phase === "guardando"
              ? 100
              : 0;

          actualizar(item.id, {
            fase: evento.phase,
            chunks: evento.chunks ?? item.chunks,
            progreso,
            detalle:
              evento.phase === "vectorizando" && evento.total
                ? `${evento.done ?? 0} / ${evento.total} fragmentos`
                : "",
          });
        }
      }
    }

    return guardados;
  };

  const procesarTodo = async (): Promise<void> => {
    const porHacer = cola.filter((item) => item.fase !== "listo");
    if (porHacer.length === 0) return;

    setProcesando(true);
    setResumen("");
    setErrorGlobal("");

    let total = 0;
    let fallidos = 0;

    for (const item of porHacer) {
      try {
        total += await procesarArchivo(item);
      } catch (error) {
        fallidos += 1;
        actualizar(item.id, {
          fase: "error",
          progreso: 0,
          detalle: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    if (total > 0) {
      setResumen(
        `${porHacer.length - fallidos} documento(s) indexados con ${total} fragmentos en total.`
      );
    }
    if (fallidos > 0) {
      setErrorGlobal(`${fallidos} archivo(s) no se pudieron procesar. Revisa el detalle de cada uno.`);
    }

    setProcesando(false);
  };

  const copiarMarcador = (): void => {
    if (!imgUrl.trim()) return;
    const marcador = `${imgText.trim() ? imgText.trim() + "\n" : ""}[IMG:${imgUrl.trim()}|${
      imgAlt.trim() || "Imagen"
    }]`;
    void navigator.clipboard.writeText(marcador);
    setImgCopiado(true);
    window.setTimeout(() => setImgCopiado(false), 2000);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-900 font-sans text-slate-100">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500 p-2 text-slate-950 shadow-md shadow-amber-500/20">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-white">
              uccsito <span className="ml-1 font-mono text-xs text-amber-400">Consola</span>
            </h1>
            <span className="text-xs font-medium text-slate-400">Gestor de Conocimiento RAG</span>
          </div>
        </div>
        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-mono text-xs font-medium text-amber-400">
          Role: Coordinador_Admin
        </span>
      </header>

      <main className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-8 overflow-y-auto p-8">
        {/* Alerta */}
        <div className="flex items-start gap-4 rounded-2xl border border-blue-800/50 bg-blue-950/40 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
          <div className="text-sm">
            <h3 className="mb-0.5 font-bold text-blue-300">Alimentación de Base de Conocimiento</h3>
            <p className="leading-relaxed text-slate-400">
              El texto se extrae en el servidor, se divide en fragmentos de 800 caracteres con 150 de
              superposición y se vectoriza con Gemini antes de guardarse en la tabla{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-amber-300">
                documents
              </code>
              .
            </p>
          </div>
        </div>

        {/* Metadatos */}
        <div className="grid gap-4 sm:grid-cols-[1fr_15rem]">
          <div>
            <label
              htmlFor="titulo"
              className="text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              Título del documento (opcional)
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              disabled={procesando}
              placeholder="Reglamento de Estudios 2026"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500 disabled:opacity-50"
            />
            <p className="mt-1.5 text-xs text-slate-600">
              Si lo dejas vacío, usamos el nombre del archivo. Al subir varios, manda cada uno por
              separado para titularlos.
            </p>
          </div>

          <div>
            <label
              htmlFor="categoria"
              className="text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              Categoría
            </label>
            <div className="relative mt-1">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <select
                id="categoria"
                value={categoria}
                onChange={(event) => setCategoria(event.target.value)}
                disabled={procesando}
                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none transition-all focus:border-amber-500 disabled:opacity-50"
              >
                {CATEGORIAS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 transition-all ${
            isDragActive
              ? "border-amber-400 bg-amber-500/5"
              : "border-slate-700 bg-slate-950/50 hover:border-slate-500 hover:bg-slate-950"
          } ${procesando ? "pointer-events-none opacity-50" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-800 p-4 text-slate-400">
            <UploadCloud
              className={`h-10 w-10 ${isDragActive ? "animate-bounce text-amber-400" : "text-slate-400"}`}
            />
          </div>
          <h3 className="mb-1 text-lg font-bold text-white">
            {isDragActive ? "¡Suéltalos aquí!" : "Arrastra y suelta tus documentos"}
          </h3>
          <p className="max-w-xs text-center text-sm text-slate-500">
            Acepta archivos .pdf y .txt con reglamentos, trámites y más.
          </p>
        </div>

        {/* Cola de archivos */}
        {cola.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
              Archivos en la cola ({cola.length})
            </h4>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-2">
              {cola.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {ICONO_FASE[item.fase]}
                      <span className="truncate text-sm font-medium text-slate-300">
                        {item.file.name}
                      </span>
                      <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>

                    {!procesando && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          quitar(item.id);
                        }}
                        className="rounded-lg p-1 text-slate-500 transition-all hover:bg-slate-800 hover:text-red-400"
                        aria-label={`Quitar ${item.file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {item.fase !== "espera" && (
                    <div className="mt-2.5 pl-7">
                      <div className="flex items-baseline justify-between gap-3">
                        <span
                          className={`text-xs font-semibold ${
                            item.fase === "listo"
                              ? "text-emerald-400"
                              : item.fase === "error"
                              ? "text-red-400"
                              : "text-amber-400"
                          }`}
                        >
                          {ETIQUETA_FASE[item.fase]}
                        </span>
                        {item.detalle && (
                          <span className="truncate font-mono text-[11px] text-slate-500">
                            {item.detalle}
                          </span>
                        )}
                      </div>

                      {item.fase !== "listo" && item.fase !== "error" && (
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-[width] duration-300"
                            style={{
                              width:
                                item.fase === "vectorizando"
                                  ? `${Math.max(item.progreso, 4)}%`
                                  : item.fase === "guardando"
                                  ? "100%"
                                  : "12%",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={procesarTodo}
              disabled={procesando || pendientes === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition-all hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
            >
              {procesando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Procesando documentos...</span>
                </>
              ) : (
                <span>
                  {pendientes === 0
                    ? "Todo indexado"
                    : `Procesar e indexar ${pendientes} documento(s)`}
                </span>
              )}
            </button>
          </div>
        )}

        {resumen && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{resumen}</span>
          </div>
        )}

        {errorGlobal && (
          <div className="flex flex-col gap-2 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-red-400">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">Error al procesar</span>
            </div>
            <p className="break-all rounded-xl bg-red-950/60 p-3 font-mono text-xs text-red-300">
              {errorGlobal}
            </p>
          </div>
        )}

        {/* Generador de marcadores de imagen */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="mb-1 flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/20 p-2">
              <ImageIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Generador de Afiche/Imagen</h3>
              <p className="text-xs text-slate-400">
                Crea el marcador para mostrar imágenes en el chat
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Texto de respuesta (opcional)
              </label>
              <textarea
                value={imgText}
                onChange={(event) => setImgText(event.target.value)}
                placeholder="Ej: Aquí tienes el afiche del taller de liderazgo:"
                rows={2}
                className="mt-1 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                URL de la imagen (Imgur u otro)
              </label>
              <input
                type="url"
                value={imgUrl}
                onChange={(event) => setImgUrl(event.target.value)}
                placeholder="https://i.imgur.com/ejemplo.jpg"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Descripción de la imagen
              </label>
              <input
                type="text"
                value={imgAlt}
                onChange={(event) => setImgAlt(event.target.value)}
                placeholder="Ej: Afiche Taller de Liderazgo"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500"
              />
            </div>

            {imgUrl && (
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <p className="mb-1 font-mono text-xs text-slate-500">Vista previa del marcador:</p>
                <p className="break-all font-mono text-xs text-amber-400">
                  {imgText && (
                    <>
                      {imgText}
                      <br />
                    </>
                  )}
                  {`[IMG:${imgUrl}|${imgAlt || "Imagen"}]`}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={copiarMarcador}
              disabled={!imgUrl.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 font-bold text-white transition-all hover:bg-purple-700 disabled:bg-slate-800 disabled:text-slate-600"
            >
              <Send className="h-4 w-4" />
              {imgCopiado ? "✅ ¡Copiado al portapapeles!" : "Copiar marcador"}
            </button>

            <p className="text-center text-xs text-slate-500">
              Pega este marcador en tu base de datos como respuesta del asistente. El chat lo
              convertirá en imagen automáticamente.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
