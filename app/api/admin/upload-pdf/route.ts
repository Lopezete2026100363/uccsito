/**
 * app/api/admin/upload-pdf/route.ts
 *
 * Recibe un PDF (o .txt) por FormData, extrae el texto, lo trocea,
 * genera embeddings con Gemini e inserta en `public.documents`.
 *
 * Responde en streaming NDJSON para que el panel muestre el progreso real:
 *   {"phase":"leyendo"} → {"phase":"fragmentando"} → {"phase":"vectorizando"}
 *   → {"phase":"guardando"} → {"phase":"listo"}
 *
 * Instalación:
 *   npm i pdf-parse @supabase/supabase-js
 *
 * next.config.js:
 *   serverExternalPackages: ["pdf-parse"]   // Next 15
 *   experimental: { serverComponentsExternalPackages: ["pdf-parse"] }  // Next 14
 */

import { createRequire } from "node:module";
import { NextRequest } from "next/server";
import { dividirEnChunks } from "@/lib/rag/chunk";
import { generarEmbeddings } from "@/lib/rag/embeddings";
import { insertarChunks, type DocumentRow } from "@/lib/rag/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Importamos el módulo interno de pdf-parse: el index.js del paquete trae un
 * bloque de debug que intenta leer un PDF de prueba del disco y explota en Next.
 */
type PdfParse = (data: Buffer) => Promise<{ text: string; numpages: number }>;
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as PdfParse;

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

interface Evento {
  phase: "leyendo" | "fragmentando" | "vectorizando" | "guardando" | "listo" | "error";
  message?: string;
  chunks?: number;
  done?: number;
  total?: number;
  pages?: number;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emitir = (evento: Evento): void => {
        controller.enqueue(encoder.encode(JSON.stringify(evento) + "\n"));
      };

      try {
        /* ------------------------------ 1. archivo ----------------------------- */
        const formData = await request.formData();
        const file = formData.get("file");
        const tituloManual = (formData.get("titulo") as string | null)?.trim() ?? "";
        const categoria = (formData.get("categoria") as string | null)?.trim() || "Sin categoría";

        if (!(file instanceof File)) {
          throw new Error("No llegó ningún archivo en el campo 'file'.");
        }
        if (file.size === 0) {
          throw new Error("El archivo está vacío.");
        }
        if (file.size > MAX_BYTES) {
          throw new Error(`El archivo pesa más de ${MAX_BYTES / 1024 / 1024} MB.`);
        }

        emitir({ phase: "leyendo" });

        /* ------------------------------ 2. texto ------------------------------- */
        const buffer = Buffer.from(await file.arrayBuffer());
        const esPdf =
          file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

        let texto = "";
        let paginas = 0;

        if (esPdf) {
          const parsed = await pdfParse(buffer);
          texto = parsed.text ?? "";
          paginas = parsed.numpages ?? 0;
        } else {
          texto = buffer.toString("utf-8");
        }

        if (texto.trim().length < 40) {
          throw new Error(
            "No se pudo extraer texto. Puede ser un PDF escaneado (solo imágenes): necesitarías OCR."
          );
        }

        /* ----------------------------- 3. chunks ------------------------------- */
        emitir({ phase: "fragmentando", pages: paginas });

        const chunks = dividirEnChunks(texto);
        if (chunks.length === 0) throw new Error("El troceado no produjo fragmentos.");

        emitir({ phase: "vectorizando", chunks: chunks.length, done: 0, total: chunks.length });

        /* --------------------------- 4. embeddings ----------------------------- */
        const vectores = await generarEmbeddings(chunks, (done, total) => {
          emitir({ phase: "vectorizando", done, total, chunks: chunks.length });
        });

        /* ---------------------------- 5. Supabase ------------------------------ */
        emitir({ phase: "guardando", chunks: chunks.length });

        const titulo = tituloManual || file.name.replace(/\.[^.]+$/, "");
        const subidoEn = new Date().toISOString();

        const filas: DocumentRow[] = chunks.map((contenido, indice) => ({
          content: contenido,
          metadata: {
            filename: file.name,
            titulo,
            categoria,
            chunk_index: indice,
            total_chunks: chunks.length,
            pages: paginas || undefined,
            uploaded_at: subidoEn,
          },
          embedding: vectores[indice],
        }));

        const insertadas = await insertarChunks(filas);

        emitir({ phase: "listo", chunks: insertadas, pages: paginas });
      } catch (error) {
        emitir({
          phase: "error",
          message: error instanceof Error ? error.message : "Error desconocido en el servidor.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
