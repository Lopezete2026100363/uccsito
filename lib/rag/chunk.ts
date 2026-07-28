/**
 * lib/rag/chunk.ts
 * Limpieza y troceado del texto extraído de un PDF.
 */

export const CHUNK_SIZE = 800;
export const CHUNK_OVERLAP = 150;

/**
 * Los PDF traen saltos de línea por cada renglón visual, guiones de corte
 * y espacios dobles. Sin esto los chunks salen sucios y los embeddings peores.
 */
export function limpiarTexto(texto: string): string {
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/-\n(?=[a-záéíóúñ])/gi, "") // une palabras cortadas al final de renglón
    .replace(/([^\n])\n(?![\n•\-\d])/g, "$1 ") // renglones sueltos → misma frase
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Corta en fragmentos de ~800 caracteres con 150 de superposición,
 * respetando el final de frase más cercano para no partir ideas a la mitad.
 */
export function dividirEnChunks(
  texto: string,
  size: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  const limpio = limpiarTexto(texto);
  if (limpio.length <= size) return limpio ? [limpio] : [];

  const chunks: string[] = [];
  let inicio = 0;

  while (inicio < limpio.length) {
    let fin = Math.min(inicio + size, limpio.length);

    if (fin < limpio.length) {
      // Busca un corte natural en el último 30% del fragmento.
      const ventana = limpio.slice(inicio + Math.floor(size * 0.7), fin);
      const corte = Math.max(
        ventana.lastIndexOf(". "),
        ventana.lastIndexOf(".\n"),
        ventana.lastIndexOf("\n\n"),
        ventana.lastIndexOf("; ")
      );
      if (corte > 0) fin = inicio + Math.floor(size * 0.7) + corte + 1;
    }

    const fragmento = limpio.slice(inicio, fin).trim();
    if (fragmento.length > 0) chunks.push(fragmento);

    if (fin >= limpio.length) break;
    inicio = Math.max(fin - overlap, inicio + 1);
  }

  return chunks;
}
