# UCCSito: evolución

## Instalación
Copia los archivos respetando sus rutas. No se agregaron dependencias nuevas.

## Variables existentes
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` o `GOOGLE_GENERATIVE_AI_API_KEY`

El clima usa Open-Meteo y no requiere API key. La consulta se hace desde `/api/weather`.

## Imágenes
Coloca en `public/images/`:
- `uccsito-avatar.png`
- `ucss-logo.png`
- `ucss-campus.jpg`
- `mapa-campus.png`

La interfaz tiene fallbacks si faltan. `ucss-campus.jpg` queda centralizada para un banner institucional futuro, sin saturar la versión actual.

## Conservado
- `/api/chat`
- Gemini embeddings de 768 dimensiones
- RPC `match_documents` de Supabase
- Gemini 2.5 Flash
- filtro opcional por categoría

## Corregido
- Fuentes RAG separadas de la respuesta y mostradas por el frontend.
- Respuestas seguras cuando no hay contexto.
- Datos institucionales alineados con el Prompt Maestro.
- Clima estático reemplazado por datos reales.
- Identidad, navegación móvil, accesibilidad, estados de carga/error y mapa con zoom/pan.

## Pendiente de confirmación institucional
- Horario de Lactario.
- Horario de Tutoría.
- Correo de DAAAE.
- Correo de Biblioteca Andrés Aziani.

No se inventaron esos datos.
