"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FileText, Loader2, RefreshCw, Trash2, Tag, Library } from "lucide-react";

export interface DocumentoIndexado {
  doc_id: string;
  filename: string | null;
  titulo: string | null;
  categoria: string | null;
  chunks: number;
  created_at: string | null;
}

const COLOR_CATEGORIA: Record<string, string> = {
  Admisión: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  Reglamentos: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  Trámites: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  General: "border-slate-600/50 bg-slate-700/30 text-slate-300",
};

export default function PanelDocumentos({ refreshKey = 0 }: { refreshKey?: number }) {
  const [docs, setDocs] = useState<DocumentoIndexado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [borrando, setBorrando] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [error, setError] = useState("");

  const cargar = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/documents", { cache: "no-store" });
      const json = (await res.json()) as { documents?: DocumentoIndexado[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? "No se pudo cargar la lista.");
      setDocs(json.documents ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar, refreshKey]);

  const eliminar = async (docId: string): Promise<void> => {
    setBorrando(docId);
    setError("");
    try {
      const res = await fetch("/api/admin/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_id: docId }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "No se pudo eliminar.");
      setDocs((prev) => prev.filter((doc) => doc.doc_id !== docId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setBorrando(null);
      setConfirmar(null);
    }
  };

  const totalChunks = docs.reduce((acc, doc) => acc + Number(doc.chunks ?? 0), 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/15 p-2">
            <Library className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Documentos indexados</h3>
            <p className="text-xs text-slate-400">
              {docs.length} documento(s) · {totalChunks} fragmentos vectorizados
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void cargar()}
          disabled={cargando}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:border-slate-500 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${cargando ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {error && (
        <p className="mb-3 break-all rounded-xl border border-red-500/30 bg-red-950/40 p-3 font-mono text-xs text-red-300">
          {error}
        </p>
      )}

      {cargando && docs.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Consultando Supabase...</span>
        </div>
      ) : docs.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Todavía no hay documentos en la base de conocimiento.
        </p>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-2">
          {docs.map((doc) => {
            const nombre = doc.titulo || doc.filename || "Documento sin nombre";
            const cat = doc.categoria || "General";
            const estiloCat = COLOR_CATEGORIA[cat] ?? COLOR_CATEGORIA.General;
            const esperandoConfirmacion = confirmar === doc.doc_id;

            return (
              <div
                key={doc.doc_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{nombre}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${estiloCat}`}
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {cat}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {doc.chunks} fragmentos
                      </span>
                      {doc.created_at && (
                        <span className="font-mono text-[10px] text-slate-600">
                          {new Date(doc.created_at).toLocaleDateString("es-PE")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {esperandoConfirmacion ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void eliminar(doc.doc_id)}
                      disabled={borrando === doc.doc_id}
                      className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
                    >
                      {borrando === doc.doc_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmar(null)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmar(doc.doc_id)}
                    className="shrink-0 rounded-lg p-2 text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Eliminar ${nombre}`}
                    title="Eliminar documento y sus vectores"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-600">
        Eliminar borra el registro y todos sus embeddings asociados. No se puede deshacer.
      </p>
    </div>
  );
}