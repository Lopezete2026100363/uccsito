/**
 * lib/rag/embeddings.ts
 * Vectores con Google Gemini (embedding-001 → 768 dimensiones,
 * compatible al 100% con la columna `embedding` de `documents`).
 */

const GEMINI_MODEL = "text-embedding-004";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:batchEmbedContents`;

/** Gemini acepta como máximo 100 textos por llamada. */
const LOTE = 100;

export const EMBEDDING_DIMS = 768;

interface RespuestaGemini {
  embeddings?: Array<{ values: number[] }>;
  error?: { message: string };
}

function apiKey(): string {
  const key =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GOOGLE_API_KEY;

  if (!key) {
    throw new Error("Falta GEMINI_API_KEY en las variables de entorno del servidor.");
  }
  return key;
}

/**
 * Vectoriza un lote de textos. `taskType: RETRIEVAL_DOCUMENT` es importante:
 * le dice a Gemini que son documentos para indexar, no consultas de búsqueda.
 */
async function embedLote(textos: string[]): Promise<number[][]> {
  const respuesta = await fetch(`${GEMINI_URL}?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: textos.map((texto) => ({
        model: `models/${GEMINI_MODEL}`,
        content: { parts: [{ text: texto }] },
        taskType: "RETRIEVAL_DOCUMENT",
      })),
    }),
  });

  const datos = (await respuesta.json()) as RespuestaGemini;

  if (!respuesta.ok || datos.error) {
    throw new Error(`Gemini: ${datos.error?.message ?? respuesta.statusText}`);
  }
  if (!datos.embeddings || datos.embeddings.length !== textos.length) {
    throw new Error("Gemini devolvió menos vectores de los esperados.");
  }

  return datos.embeddings.map((item) => item.values);
}

/**
 * Vectoriza todos los chunks respetando el límite por lote.
 * `onProgress` permite ir informando al cliente cuántos van.
 */
export async function generarEmbeddings(
  textos: string[],
  onProgress?: (procesados: number, total: number) => void
): Promise<number[][]> {
  const vectores: number[][] = [];

  for (let i = 0; i < textos.length; i += LOTE) {
    const lote = textos.slice(i, i + LOTE);
    vectores.push(...(await embedLote(lote)));
    onProgress?.(Math.min(i + LOTE, textos.length), textos.length);
  }

  return vectores;
}