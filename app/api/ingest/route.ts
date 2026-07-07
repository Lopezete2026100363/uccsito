import { NextRequest, NextResponse } from "next/server";

function splitIntoChunks(text: string, chunkSize = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 30) chunks.push(chunk);
    start += chunkSize - overlap;
  }
  return chunks;
}

export async function POST(req: NextRequest) {

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const googleKey   = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !googleKey) {
    return NextResponse.json({ error: "Variables de entorno no configuradas." }, { status: 500 });
  }
let file: File | null = null;
  try {
    const formData = await req.formData();
    
    // Busca automáticamente el archivo sin importar cómo se llame el campo
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        file = value;
        break;
      }
    }

    if (!file) throw new Error("No se detectó ningún archivo en el formulario enviado.");
    console.log(`✅ Archivo recibido: "${file.name}" (${file.size} bytes)`);
  } catch (err) {
    return NextResponse.json({ error: `Error leyendo archivo: ${(err as Error).message}` }, { status: 400 });
  }
  // Extraer texto según tipo de archivo
  let fullText: string;
  try {
    const isTxt = file.name.endsWith(".txt") || file.type === "text/plain";

    if (isTxt) {
      // TXT: leer directamente
      fullText = await file.text();
      console.log(`✅ TXT leído: ${fullText.length} caracteres`);
    } else {
      // PDF: usar pdf-parse
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      fullText = pdfData.text;
      console.log(`✅ PDF leído: ${fullText.length} caracteres`);
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("El archivo no tiene texto extraíble.");
    }
  } catch (err) {
    return NextResponse.json({ error: `Error parseando archivo: ${(err as Error).message}` }, { status: 500 });
  }

  const chunks = splitIntoChunks(fullText);
  console.log(`✅ ${chunks.length} chunks generados`);

  let embeddings: number[][];
  try {
    embeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${googleKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text: chunks[i] }] },
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Error en embedding");
      embeddings.push(json.embedding.values);
      if (i % 5 === 0) console.log(`  → Embedding ${i + 1}/${chunks.length}`);
    }
    console.log(`✅ ${embeddings.length} embeddings generados`);
  } catch (err) {
    return NextResponse.json({ error: `Error con Gemini: ${(err as Error).message}` }, { status: 500 });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const rows = chunks.map((chunk, i) => ({
      content:   chunk,
      metadata:  { filename: file.name, chunk_index: i },
      embedding: embeddings[i],
    }));
    const { error } = await supabase.from("documents").insert(rows);
    if (error) throw new Error(error.message);
    console.log(`✅ ${rows.length} filas insertadas en Supabase`);
  } catch (err) {
    return NextResponse.json({ error: `Error en Supabase: ${(err as Error).message}` }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `"${file.name}" indexado correctamente.`,
    totalChunks: chunks.length,
  });
}