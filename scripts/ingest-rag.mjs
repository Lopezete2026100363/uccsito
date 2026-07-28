import { createClient } from '@supabase/supabase-js';

// 1. Validar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error('❌ Error: Faltan variables de entorno en .env.local');
  process.exit(1);
}

// 2. Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Genera el vector embedding haciendo la petición REST directa a Gemini API
 */
async function obtenerEmbedding(texto) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: {
        parts: [{ text: texto }]
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error de conexión con la API de Gemini');
  }

  return data.embedding.values;
}

/**
 * Divide un texto largo en fragmentos (chunks)
 */
function fragmentarTexto(texto, maxCaracteres = 800, overlap = 150) {
  const lineas = texto.split('\n');
  const chunks = [];
  let chunkActual = '';

  for (const linea of lineas) {
    if ((chunkActual + '\n' + linea).length > maxCaracteres) {
      if (chunkActual.trim().length > 0) {
        chunks.push(chunkActual.trim());
      }
      chunkActual = chunkActual.slice(-overlap) + '\n' + linea;
    } else {
      chunkActual += (chunkActual ? '\n' : '') + linea;
    }
  }

  if (chunkActual.trim().length > 0) {
    chunks.push(chunkActual.trim());
  }

  return chunks;
}

/**
 * Procesa e inserta un documento con sus embeddings en Supabase
 */
async function ingresarDocumento({ titulo, categoria, urlPdf, textoCompleto }) {
  console.log(`\n📄 Procesando documento: "${titulo}"...`);

  // A. Registrar el documento principal
  const { data: docData, error: docError } = await supabase
    .from('documentos_ucss')
    .insert({
      titulo,
      categoria,
      url_pdf: urlPdf || null,
    })
    .select('id')
    .single();

  if (docError) {
    console.error('❌ Error guardando el documento principal:', docError.message);
    return;
  }

  const documentoId = docData.id;
  console.log(`✅ Documento registrado con ID: ${documentoId}`);

  // B. Fragmentar el texto
  const chunks = fragmentarTexto(textoCompleto);
  console.log(`✂️ Se dividió en ${chunks.length} fragmentos.`);

  // C. Generar embeddings y guardar cada fragmento
  for (let i = 0; i < chunks.length; i++) {
    const chunkContent = chunks[i];
    console.log(`⏳ Vectorizando fragmento ${i + 1}/${chunks.length}...`);

    try {
      const vector = await obtenerEmbedding(chunkContent);

      const { error: chunkError } = await supabase
        .from('documento_chunks')
        .insert({
          documento_id: documentoId,
          contenido: chunkContent,
          embedding: vector,
          metadata: { chunk_index: i, total_chunks: chunks.length, titulo_doc: titulo }
        });

      if (chunkError) {
        console.error(`  ❌ Error en fragmento ${i + 1}:`, chunkError.message);
      } else {
        console.log(`  ✅ Fragmento ${i + 1}/${chunks.length} guardado en Supabase.`);
      }
    } catch (err) {
      console.error(`  ❌ Error al generar embedding para fragmento ${i + 1}:`, err.message);
    }
  }

  console.log(`\n🎉 ¡Documento "${titulo}" indexado correctamente en la IA!`);
}

// DOCUMENTO DE PRUEBA
const REGLAMENTO_PRUEBA_UCSS = {
  titulo: 'Reglamento General de Evaluación y Asistencia UCSS',
  categoria: 'Reglamento',
  urlPdf: 'https://www.ucss.edu.pe/reglamento-evaluacion',
  textoCompleto: `
REGLAMENTO ACADÉMICO Y DE EVALUACIÓN DE LA UCSS

Artículo 1: Sistema de Calificación y Escala
La escala de calificación en la Universidad Católica Sedes Sapientiae (UCSS) es vigesimal, de cero (00) a veinte (20). La nota mínima aprobatoria para cualquier asignatura o curso es de once (11). Toda fracción igual o mayor a 0.5 favorece al estudiante únicamente en el promedio final de la asignatura.

Artículo 2: Asistencia e Inhabilitación (DPR)
La asistencia a clases teóricas y prácticas es obligatoria. El estudiante que acumule un porcentaje igual o mayor al 30% de inasistencias injustificadas sobre el total de horas dictadas en una asignatura quedará automático e Inhabilitado por Desaprobación por Inasistencia (DPR). La condición de DPR equivale a nota final de cero (00) en el acta del curso.

Artículo 3: Composición de Notas y Promedio Ponderado
El promedio final del curso se calcula bajo la siguiente fórmula estándar, salvo especificación del sílabo:
- Evaluación Continua / Prácticas (PP): 40%
- Examen Parcial (EP): 30%
- Examen Final (EF): 30%
Fórmula: Promedio Final = (PP * 0.40) + (EP * 0.30) + (EF * 0.30)

Artículo 4: Exámenes Sustitutorios y Rezagados
Un estudiante tiene derecho a rendir examen rezagado únicamente si justifica su inasistencia por motivos de salud u fuerza mayor formalmente ante su facultad en un plazo máximo de 48 horas. No existen exámenes sustitutorios para subir nota si el promedio final es aprobatorio.

Artículo 5: Carné Universitario y Trámites
El carné universitario es gestionado por la UCSS ante la SUNEDU. La entrega se realiza en la oficina de Secretaría General del campus principal. Para solicitar duplicado por pérdida o robo, el estudiante debe abonar el derecho de trámite en caja de la universidad y presentar la denuncia policial correspondiente.
`
};

ingresarDocumento(REGLAMENTO_PRUEBA_UCSS);