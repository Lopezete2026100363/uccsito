import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMS = 768;
const MATCH_THRESHOLD = 0.2;
const MATCH_COUNT = 5;

type MatchDocument = { id: number; content: string; metadata: Record<string, unknown> | null; similarity: number };
type GeminiResponse = { embedding?: { values?: number[] }; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };

function env() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const googleKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!supabaseUrl || !supabaseKey || !googleKey) throw new Error("Falta configuración del servicio de consulta.");
  return { supabaseUrl, supabaseKey, googleKey };
}
function sourceName(chunk: MatchDocument) {
  const m = chunk.metadata ?? {};
  if (typeof m.filename === "string" && m.filename.trim()) return m.filename;
  if (typeof m.titulo === "string" && m.titulo.trim()) return m.titulo;
  return "Documento oficial UCSS";
}
async function embedding(question: string, key: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${encodeURIComponent(key)}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
    body: JSON.stringify({ model: `models/${EMBEDDING_MODEL}`, content: { parts: [{ text: question }] }, taskType: "RETRIEVAL_QUERY", outputDimensionality: EMBEDDING_DIMS }),
  });
  const data = await response.json().catch(() => null) as GeminiResponse | null;
  const vector = data?.embedding?.values;
  if (!response.ok || data?.error || !vector || vector.length !== EMBEDDING_DIMS || vector.some((v) => !Number.isFinite(v))) throw new Error("No se pudo generar la búsqueda semántica.");
  return vector;
}
async function search(question: string, category: string | null, config: ReturnType<typeof env>) {
  const queryEmbedding = await embedding(question, config.googleKey);
  const supabase = createClient(config.supabaseUrl, config.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc("match_documents", { query_embedding: queryEmbedding, match_threshold: MATCH_THRESHOLD, match_count: MATCH_COUNT, filter_category: category });
  if (error) throw new Error("No se pudo consultar la base documental.");
  return (data ?? []) as MatchDocument[];
}
async function answerQuestion(question: string, chunks: MatchDocument[], key: string) {
  const context = chunks.map((c, i) => `[Fuente ${i + 1}: ${sourceName(c)}]\n${c.content}`).join("\n\n---\n\n");
  const prompt = `Eres UCCSito, asistente virtual universitario de la UCSS. Responde en español con claridad y amabilidad usando únicamente el contexto. No inventes fechas, costos, requisitos, horarios ni procedimientos. Si el contexto no basta, dilo y recomienda el área correspondiente. No agregues una lista de fuentes: la interfaz la muestra por separado.\n\nCONTEXTO:\n${context}\n\nPREGUNTA:\n${question}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 1600 } }),
  });
  const data = await response.json().catch(() => null) as GeminiResponse | null;
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!response.ok || data?.error || !text) throw new Error("No se pudo generar una respuesta.");
  return text;
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const raw = body?.question ?? body?.prompt ?? body?.message ?? (Array.isArray(body?.messages) ? body.messages.at(-1)?.content : "");
    const question = typeof raw === "string" ? raw.trim() : "";
    if (!question) return NextResponse.json({ error: "Envía una pregunta válida." }, { status: 400 });
    if (question.length > 2000) return NextResponse.json({ error: "La consulta es demasiado extensa." }, { status: 400 });
    const normalized = question.toLocaleLowerCase("es").replace(/[¡!.,]/g, "").trim();
    if (["hola", "buenas", "buenos días", "buenos dias", "buenas tardes", "buenas noches", "saludos"].includes(normalized)) {
      return NextResponse.json({ answer: "¡Hola! Soy UCCSito, tu asistente virtual universitario. Puedo orientarte sobre reglamentos, trámites, evaluaciones, becas y servicios. ¿Qué necesitas consultar?", sources: [] });
    }
    const config = env();
    const category = typeof body?.category === "string" ? body.category : null;
    const chunks = await search(question, category, config);
    if (!chunks.length) return NextResponse.json({ answer: "No encontré información suficiente en los documentos disponibles para responder con seguridad. Te recomiendo consultar directamente con el área correspondiente.", sources: [] });
    const answer = await answerQuestion(question, chunks, config.googleKey);
    const seen = new Set<string>();
    const sources = chunks.map((c) => ({ name: sourceName(c), category: typeof c.metadata?.categoria === "string" ? c.metadata.categoria : "General" })).filter((s) => !seen.has(s.name) && seen.add(s.name));
    return NextResponse.json({ answer, sources });
  } catch (error) {
    console.error("/api/chat", error);
    return NextResponse.json({ error: "No pude procesar la consulta en este momento." }, { status: 500 });
  }
}
