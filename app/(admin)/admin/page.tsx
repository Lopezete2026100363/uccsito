'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, Trash2, Database, ShieldAlert, XCircle, Image, Send } from 'lucide-react';

export default function AdminPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorDetail, setErrorDetail] = useState<string>('');
  const [successDetail, setSuccessDetail] = useState<string>('');

  // Estado para registrar respuestas con imagen
  const [imgUrl, setImgUrl] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [imgText, setImgText] = useState('');
  const [imgStatus, setImgStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (uploading) return;
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setStatus('idle');
    setErrorDetail('');
  }, [uploading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcessFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatus('idle');
    setErrorDetail('');
    setSuccessDetail('');

    try {
      let totalChunks = 0;
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/ingest', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
        totalChunks += data.totalChunks || 0;
      }
      setSuccessDetail(`${files.length} archivo(s) indexados correctamente con ${totalChunks} chunks en total.`);
      setStatus('success');
      setFiles([]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      setErrorDetail(msg);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  // Genera el marcador de imagen y lo copia al portapapeles
  const handleCopyImageMarker = () => {
    if (!imgUrl.trim()) return;
    const marker = `${imgText.trim() ? imgText.trim() + '\n' : ''}[IMG:${imgUrl.trim()}|${imgAlt.trim() || 'Imagen'}]`;
    navigator.clipboard.writeText(marker);
    setImgStatus('success');
    setTimeout(() => setImgStatus('idle'), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl text-slate-950 shadow-md shadow-amber-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-none">uccsito <span className="text-amber-400 text-xs ml-1 font-mono">Consola</span></h1>
            <span className="text-xs text-slate-400 font-medium">Gestor de Conocimiento RAG</span>
          </div>
        </div>
        <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-mono font-medium">
          Role: Coordinador_Admin
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-8 max-w-4xl w-full mx-auto grid grid-cols-1 gap-8">

        {/* Alerta */}
        <div className="bg-blue-950/40 border border-blue-800/50 p-4 rounded-2xl flex gap-4 items-start">
          <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h3 className="font-bold text-blue-300 mb-0.5">Alimentación de Base de Conocimiento</h3>
            <p className="text-slate-400 leading-relaxed">
              Los archivos cargados aquí serán procesados automáticamente. El sistema extraerá el texto, lo dividirá en fragmentos semánticos y generará vectores con Google Gemini para guardarlos en Supabase.
            </p>
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-amber-400 bg-amber-500/5'
              : 'border-slate-700 bg-slate-950/50 hover:border-slate-500 hover:bg-slate-950'
          }`}
        >
          <input {...getInputProps()} />
          <div className="bg-slate-800 p-4 rounded-2xl text-slate-400 mb-4 border border-slate-700">
            <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {isDragActive ? '¡Suéltalos aquí!' : 'Arrastra y suelta tus documentos'}
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-xs">
            Acepta archivos .pdf y .txt con reglamentos, trámites y más.
          </p>
        </div>

        {/* Lista de archivos */}
        {files.length > 0 && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              Archivos listos para indexar ({files.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm text-slate-300 truncate font-medium">{file.name}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleProcessFiles(); }}
              disabled={uploading}
              className="w-full mt-5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"/><span>Generando Vectores e Indexando...</span></>
              ) : (
                <span>Procesar e Indexar Documentos</span>
              )}
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{successDetail}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-2xl flex flex-col gap-2 text-red-400">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold">Error al procesar</span>
            </div>
            <p className="text-xs font-mono bg-red-950/60 p-3 rounded-xl text-red-300 break-all">
              {errorDetail || 'Error desconocido. Revisa la terminal.'}
            </p>
          </div>
        )}

        {/* ✅ NUEVO: Generador de marcadores de imagen */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-purple-500/20 p-2 rounded-xl">
              <Image className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Generador de Afiche/Imagen</h3>
              <p className="text-xs text-slate-400">Crea el marcador para mostrar imágenes en el chat</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Texto de respuesta (opcional)</label>
              <textarea
                value={imgText}
                onChange={e => setImgText(e.target.value)}
                placeholder="Ej: Aquí tienes el afiche del taller de liderazgo:"
                rows={2}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-amber-500 resize-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">URL de la imagen (Imgur u otro)</label>
              <input
                type="url"
                value={imgUrl}
                onChange={e => setImgUrl(e.target.value)}
                placeholder="https://i.imgur.com/ejemplo.jpg"
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-amber-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Descripción de la imagen</label>
              <input
                type="text"
                value={imgAlt}
                onChange={e => setImgAlt(e.target.value)}
                placeholder="Ej: Afiche Taller de Liderazgo"
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Preview del marcador */}
            {imgUrl && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1 font-mono">Vista previa del marcador:</p>
                <p className="text-xs text-amber-400 font-mono break-all">
                  {imgText && <>{imgText}<br/></>}
                  {`[IMG:${imgUrl}|${imgAlt || 'Imagen'}]`}
                </p>
              </div>
            )}

            <button
              onClick={handleCopyImageMarker}
              disabled={!imgUrl.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {imgStatus === 'success' ? '✅ ¡Copiado al portapapeles!' : 'Copiar marcador'}
            </button>

            <p className="text-xs text-slate-500 text-center">
              Pega este marcador en tu base de datos como respuesta del asistente. El chat lo convertirá en imagen automáticamente.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}