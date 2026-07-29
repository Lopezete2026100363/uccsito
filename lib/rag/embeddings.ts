/**
 * lib/rag/embeddings.ts
 * Vectores con Google Gemini (text-embedding-004 → 768 dimensiones).
 * Usa `embedContent` individual para evitar bloqueos de batch en v1beta.
 */

const GEMINI_MODEL = "text-embedding-004";
export const EMBEDDING_DIMS = 768;

function apiKey(): string {
  const key =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GOOGLE_API_KEY;

  if (!key) {
    throw new Error("Falta GEMINI_API_KEY en las variables de entorno.");
  }
  return key;
}

/**
 * Genera el vector de un solo texto usando embedContent.
 */
async function embedTexto(texto: string): Promise<number[]> {
  const key = apiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:embedContent?key=${key}`;

  const respuesta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      content: { parts: [{ text: texto }] },
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok || datos.error) {
    throw new Error(`Gemini: ${datos.error?.message ?? respuesta.statusText}`);
  }

  if (!datos.embedding?.values) {
    throw new Error("Gemini no devolvió el vector del documento.");
  }

  return datos.embedding.values;
}

/**
 * Vectoriza todos los fragmentos procesando de 5 en 5 simultáneamente.
 */
export async function generarEmbeddings(
  textos: string[],
  onProgress?: (procesados: number, total: number) => void
): Promise<number[][]> {
  const vectores: number[][] = [];
  const CONCURRENCIA = 5; // 5 textos a la vez en paralelo

  for (let i = 0; i < textos.length; i += CONCURRENCIA) {
    const bloque = textos.slice(i, i + CONCURRENCIA);
    const resultados = await Promise.all(bloque.map((t) => embedTexto(t)));
    vectores.push(...resultados);
    onProgress?.(Math.min(i + CONCURRENCIA, textos.length), textos.length);
  }

  return vectores;
}