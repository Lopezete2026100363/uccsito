/**
 * lib/rag/supabase-admin.ts
 * Cliente de servicio (solo servidor). La service role key NUNCA va al cliente.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Tal cual la tabla `public.documents` de uccsito-db. */
export interface DocumentRow {
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[];
}

let cliente: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cliente) return cliente;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno."
    );
  }

  cliente = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cliente;
}

/**
 * Inserta los fragmentos en `documents`. Se manda por tandas para no
 * reventar el límite de tamaño del payload (cada vector son 768 floats).
 */
export async function insertarChunks(filas: DocumentRow[], tanda = 50): Promise<number> {
  const db = supabaseAdmin();
  let insertadas = 0;

  for (let i = 0; i < filas.length; i += tanda) {
    const grupo = filas.slice(i, i + tanda);
    const { error } = await db.from("documents").insert(grupo);

    if (error) throw new Error(`Supabase: ${error.message}`);
    insertadas += grupo.length;
  }

  return insertadas;
}

/**
 * Opcional: registra el documento padre en `documentos_ucss` para tener
 * el catálogo (título + categoría). Si la tabla no existe, no rompe la subida.
 */
export async function registrarDocumento(
  titulo: string,
  categoria: string
): Promise<number | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("documentos_ucss")
      .insert({ titulo, categoria })
      .select("id")
      .single();

    if (error) return null;
    return (data as { id: number } | null)?.id ?? null;
  } catch {
    return null;
  }
}
