import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMS = 768;
const MATCH_THRESHOLD = 0.3;
const MATCH_COUNT = 5;
const MARCA_FUENTES = "📌 Fuentes consultadas:";

interface GeminiEmbeddingResponse {
  embedding?: { values?: number[] };
  error?: { message?: string; code?: number; status?: string };
}

interface MatchDocument {
  id: number;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

interface MetaChunk {
  docId: string | null;
  filename: string | null;
  titulo: string | null;
  categoria: string;
  etiqueta: string;
}

function getEnv(): { supabaseUrl: string; supabaseKey: string; googleKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const googleKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !googleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o GEMINI_API_KEY."
    );
  }
  return { supabaseUrl, supabaseKey, googleKey };
}

/* ------------------------ metadatos del documento ------------------------- */

function leerMeta(chunk: MatchDocument): MetaChunk {
  const meta = chunk.metadata ?? {};
  const filename = typeof meta.filename === "string" ? meta.filename : null;
  const titulo = typeof meta.titulo === "string" && meta.titulo.trim() ? meta.titulo : null;
  const categoria =
    typeof meta.categoria === "string" && meta.categoria.trim() ? meta.categoria : "General";
  const docId = typeof meta.doc_id === "string" ? meta.doc_id : filename;

  return {
    docId,
    filename,
    titulo,
    categoria,
    etiqueta: filename ?? titulo ?? "Documento oficial UCSS",
  };
}

/** Pie de fuentes determinista: no dependemos de que el modelo lo escriba bien. */
function construirPieDeFuentes(chunks: MatchDocument[]): string {
  const vistos = new Set<string>();
  const nombres: string[] = [];

  for (const chunk of chunks) {
    const { etiqueta } = leerMeta(chunk);
    if (!vistos.has(etiqueta)) {
      vistos.add(etiqueta);
      nombres.push(etiqueta);
    }
  }

  return nombres.length ? `\n\n${MARCA_FUENTES} ${nombres.join(", ")}` : "";
}

/* ------------------------------ embeddings -------------------------------- */

async function generarEmbeddingPregunta(question: string, googleKey: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${encodeURIComponent(
      googleKey
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text: question }] },
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: EMBEDDING_DIMS,
      }),
      cache: "no-store",
    }
  );

  const data = (await response.json().catch(() => null)) as GeminiEmbeddingResponse | null;

  if (!response.ok || data?.error) {
    throw new Error(
      `Gemini embeddings (${response.status}): ${data?.error?.message ?? response.statusText}`
    );
  }

  const vector = data?.embedding?.values;
  if (!vector) throw new Error("Gemini no devolvió el vector de la pregunta.");

  if (vector.length !== EMBEDDING_DIMS || vector.some((value) => !Number.isFinite(value))) {
    throw new Error(
      `Gemini devolvió ${vector.length} dimensiones; se esperaban ${EMBEDDING_DIMS}.`
    );
  }

  return vector;
}

/* -------------------------------- retrieval ------------------------------- */

async function buscarChunks(
  question: string,
  supabaseUrl: string,
  supabaseKey: string,
  googleKey: string,
  categoria: string | null
): Promise<MatchDocument[]> {
  const queryEmbedding = await generarEmbeddingPregunta(question, googleKey);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
    filter_categoria: categoria, // null = busca en todas
  });

  if (error) throw new Error(`Supabase match_documents: ${error.message}`);
  return (data ?? []) as MatchDocument[];
}

/* ------------------------------- generación ------------------------------- */

async function generarRespuesta(
  question: string,
  chunks: MatchDocument[],
  googleKey: string
): Promise<string> {
  const context = chunks
    .map((chunk, index) => {
      const { etiqueta, categoria, titulo } = leerMeta(chunk);
      const cabecera = [
        `Fuente ${index + 1}`,
        `archivo: ${etiqueta}`,
        titulo ? `título: ${titulo}` : null,
        `categoría: ${categoria}`,
      ]
        .filter(Boolean)
        .join(" | ");

      return `[${cabecera}]\n${chunk.content}`;
    })
    .join("\n\n---\n\n");

  const listaFuentes = Array.from(new Set(chunks.map((chunk) => leerMeta(chunk).etiqueta)));

  const prompt = `Eres "uccsito", el asistente virtual oficial de la UCSS.
Tu función es ayudar a estudiantes usando únicamente los documentos oficiales recuperados.

CONTEXTO:
${context}

PREGUNTA:
${question}

REGLAS:
- Responde en español, con claridad y amabilidad.
- Usa únicamente el contexto proporcionado.
- No inventes fechas, requisitos, costos ni procedimientos.
- Si el contexto no alcanza, dilo honestamente y recomienda contactar la oficina correspondiente.
- Sé conciso pero completo.
- Cuando cites un dato puntual, menciona de forma natural el archivo del que proviene.
- TERMINA SIEMPRE tu respuesta con una última línea exactamente en este formato:
  ${MARCA_FUENTES} ${listaFuentes.join(", ")}
- No agregues nada después de esa línea.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      googleKey
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
      cache: "no-store",
    }
  );

  const data = (await response.json().catch(() => null)) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  } | null;

  if (!response.ok || data?.error) {
    throw new Error(
      `Gemini chat (${response.status}): ${data?.error?.message ?? response.statusText}`
    );
  }

  return (
    data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ||
    "No pude generar una respuesta."
  );
}

/* --------------------------------- handler -------------------------------- */

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { supabaseUrl, supabaseKey, googleKey } = getEnv();

    const body = (await req.json().catch(() => null)) as {
      question?: unknown;
      categoria?: unknown;
    } | null;

    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const categoria =
      typeof body?.categoria === "string" && body.categoria.trim() ? body.categoria.trim() : null;

    if (!question) {
      return NextResponse.json({ error: "Envía una pregunta válida." }, { status: 400 });
    }

    const chunks = await buscarChunks(question, supabaseUrl, supabaseKey, googleKey, categoria);

    if (chunks.length === 0) {
      return NextResponse.json({
        answer:
          "No encontré información relacionada a tu pregunta en los documentos disponibles. Te recomiendo consultar directamente con tu docente o coordinador.",
        sources: [],
      });
    }

    const base = (await generarRespuesta(question, chunks, googleKey)).trimEnd();

    // Red de seguridad: si el modelo olvidó el pie, lo agregamos nosotros.
    const answer = base.includes(MARCA_FUENTES) ? base : base + construirPieDeFuentes(chunks);

    return NextResponse.json({
      answer,
      sources: chunks.map((chunk) => {
        const meta = leerMeta(chunk);
        return {
          id: chunk.id,
          doc_id: meta.docId,
          filename: meta.filename,
          titulo: meta.titulo,
          categoria: meta.categoria,
          similarity: chunk.similarity,
        };
      }),
    });
  } catch (error) {
    console.error("❌ /api/chat:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error interno procesando la pregunta.",
      },
      { status: 500 }
    );
  }
}
