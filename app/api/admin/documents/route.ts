import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("list_documents");

    if (error) throw new Error(error.message);

    return NextResponse.json({ documents: data ?? [] });
  } catch (error) {
    console.error("❌ GET /api/admin/documents:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error listando documentos." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json().catch(() => null)) as { doc_id?: unknown } | null;
    const docId = typeof body?.doc_id === "string" ? body.doc_id.trim() : "";

    if (!docId) {
      return NextResponse.json({ error: "Falta doc_id." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("delete_document", { p_doc_id: docId });

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, deletedChunks: data ?? 0 });
  } catch (error) {
    console.error("❌ DELETE /api/admin/documents:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error eliminando el documento." },
      { status: 500 }
    );
  }
}