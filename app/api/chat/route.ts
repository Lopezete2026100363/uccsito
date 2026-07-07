import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  // FASE 0: Variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const googleKey   = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !googleKey) {
    return NextResponse.json({ error: "Variables de entorno no configuradas." }, { status: 500 });
  }

  // FASE 1: Leer pregunta del alumno
  let question: string;
  try {
    const body = await req.json();
    question = body.question?.trim();
    if (!question) throw new Error("Pregunta vacía.");
  } catch {
    return NextResponse.json({ error: "Envía una pregunta válida." }, { status: 400 });
  }
  console.log(`✅ FASE 1 OK: Pregunta recibida → "${question}"`);

  // FASE 2: Generar embedding de la pregunta con Gemini
  let queryEmbedding: number[];
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${googleKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: { parts: [{ text: question }] },
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Error generando embedding");
    queryEmbedding = json.embedding.values;
    console.log(`✅ FASE 2 OK: Embedding de pregunta generado (${queryEmbedding.length} dims)`);
  } catch (err) {
    console.error("❌ FASE 2:", err);
    return NextResponse.json({ error: `Error con Gemini embeddings: ${(err as Error).message}` }, { status: 500 });
  }

  // FASE 3: Buscar chunks relevantes en Supabase (búsqueda semántica)
  let contextChunks: string[];
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.4,
      match_count: 5,
    });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return NextResponse.json({
        answer: "No encontré información relacionada a tu pregunta en los documentos disponibles. Te recomiendo consultar directamente con tu docente o coordinador.",
      });
    }

    contextChunks = data.map((row: { content: string }) => row.content);
    console.log(`✅ FASE 3 OK: ${contextChunks.length} fragmentos relevantes encontrados`);
  } catch (err) {
    console.error("❌ FASE 3:", err);
    return NextResponse.json({ error: `Error buscando en Supabase: ${(err as Error).message}` }, { status: 500 });
  }

  // FASE 4: Generar respuesta con Gemini 2.0 Flash
  let answer: string;
  try {
    const context = contextChunks.join("\n\n---\n\n");

    const prompt = `Eres "uccsito", el asistente virtual oficial de la UCSS (Universidad Católica Sedes Sapientiae). 
Tu rol es ayudar a los estudiantes respondiendo preguntas basadas únicamente en los documentos oficiales de la universidad.

CONTEXTO DE LOS DOCUMENTOS OFICIALES:
${context}

PREGUNTA DEL ESTUDIANTE:
${question}

INSTRUCCIONES:
- Responde de forma clara, amigable y en español.
- Basa tu respuesta ÚNICAMENTE en el contexto proporcionado.
- Si la información no está en el contexto, dilo honestamente y sugiere contactar a la oficina correspondiente.
- Sé conciso pero completo.
- No inventes información.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Error generando respuesta");
    answer = json.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta.";
    console.log(`✅ FASE 4 OK: Respuesta generada`);
  } catch (err) {
    console.error("❌ FASE 4:", err);
    return NextResponse.json({ error: `Error con Gemini chat: ${(err as Error).message}` }, { status: 500 });
  }

  return NextResponse.json({ answer });
}