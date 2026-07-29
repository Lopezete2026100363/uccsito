/**
 * lib/rag/embeddings.ts
 *
 * Gemini Embeddings para RAG.
 * Compatible con una columna pgvector(vector(768)) en Supabase.
 *
 * Variables de entorno:
 *   GEMINI_API_KEY=...
 *   # opcional:
 *   GEMINI_EMBEDDING_MODEL=gemini-embedding-001
 */

const GEMINI_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";

const GEMINI_BATCH_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:batchEmbedContents`;

/** Gemini Embedding 001 permite reducir la salida a 768 dimensiones. */
export const EMBEDDING_DIMS = 768;

/** Límite conservador para no enviar lotes enormes. */
const LOTE = 100;

interface GeminiEmbedding {
  values: number[];
}

interface GeminiResponse {
  embeddings?: GeminiEmbedding[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

function getApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!key) {
    throw new Error(
      "Falta GEMINI_API_KEY o GOOGLE_GENERATIVE_AI_API_KEY en las variables de entorno."
    );
  }

  return key;
}

function isFiniteVector(vector: number[]): boolean {
  return (
    vector.length === EMBEDDING_DIMS &&
    vector.every((value) => Number.isFinite(value))
  );
}

/**
 * Genera embeddings para un lote.
 *
 * Importante: `requests` debe ser un array plano. El error habitual era
 * `requests: [textos.map(...)]`, que enviaba un array anidado incorrecto.
 */
async function embedLote(textos: string[]): Promise<number[][]> {
  const response = await fetch(`${GEMINI_BATCH_URL}?key=${encodeURIComponent(getApiKey())}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: textos.map((texto) => ({
        model: `models/${GEMINI_MODEL}`,
        content: {
          parts: [{ text: texto }],
        },
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: EMBEDDING_DIMS,
      })),
    }),
  });

  const data = (await response.json().catch(() => null)) as GeminiResponse | null;

  if (!response.ok || data?.error) {
    const detail = data?.error?.message ?? response.statusText;
    throw new Error(
      `Gemini embeddings falló (${response.status}): ${detail}. ` +
        `Modelo usado: ${GEMINI_MODEL}.`
    );
  }

  if (!data?.embeddings || data.embeddings.length !== textos.length) {
    throw new Error(
      `Gemini devolvió ${data?.embeddings?.length ?? 0} vectores para ${textos.length} textos.`
    );
  }

  const vectors = data.embeddings.map((item) => item.values);

  if (!vectors.every(isFiniteVector)) {
    throw new Error(
      `Gemini no devolvió vectores válidos de ${EMBEDDING_DIMS} dimensiones.`
    );
  }

  return vectors;
}

/**
 * Genera embeddings para todos los chunks en lotes secuenciales.
 * `onProgress` mantiene funcionando el indicador de progreso del admin.
 */
export async function generarEmbeddings(
  textos: string[],
  onProgress?: (procesados: number, total: number) => void
): Promise<number[][]> {
  if (textos.length === 0) return [];

  const resultado: number[][] = [];

  for (let inicio = 0; inicio < textos.length; inicio += LOTE) {
    const lote = textos.slice(inicio, inicio + LOTE);
    const vectors = await embedLote(lote);

    resultado.push(...vectors);
    onProgress?.(resultado.length, textos.length);
  }

  return resultado;
}
