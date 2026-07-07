'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, Trash2, Database, ShieldAlert, XCircle } from 'lucide-react';

export default function AdminPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorDetail, setErrorDetail] = useState<string>('');
  const [successDetail, setSuccessDetail] = useState<string>('');

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

  const handleProcessPDFs = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatus('idle');
    setErrorDetail('');
    setSuccessDetail('');

    try {
      // ✅ FIX: Procesar cada archivo uno por uno con el campo 'file' (singular)
      let totalChunks = 0;

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file); // ← 'file' singular, coincide con el backend

        const response = await fetch('/api/ingest', {
          method: 'POST',
          body: formData,
        });

        // ✅ Leer el body SIEMPRE, sin importar si es ok o no
        const data = await response.json();

        if (!response.ok) {
          // Mostrar el error real que viene del backend
          throw new Error(data.error || `Error HTTP ${response.status}`);
        }

        console.log(`✅ Archivo procesado:`, data);
        totalChunks += data.totalChunks || 0;
      }

      setSuccessDetail(`${files.length} archivo(s) indexados correctamente con ${totalChunks} chunks en total.`);
      setStatus('success');
      setFiles([]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('❌ Error en handleProcessPDFs:', msg);
      setErrorDetail(msg); // ← Ahora muestra el error REAL
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navbar Superior de Admin */}
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
        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-mono font-medium">
            Role: Coordinador_Admin
          </span>
        </div>
      </header>

      {/* Panel Central */}
      <main className="flex-1 overflow-y-auto p-8 max-w-4xl w-full mx-auto grid grid-cols-1 gap-8">
        
        {/* Alerta Informativa */}
        <div className="bg-blue-950/40 border border-blue-800/50 p-4 rounded-2xl flex gap-4 items-start">
          <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h3 className="font-bold text-blue-300 mb-0.5">Alimentación de Base de Conocimiento</h3>
            <p className="text-slate-400 leading-relaxed">
              Los archivos cargados aquí serán procesados de forma automática. El sistema extraerá el texto, lo dividirá en fragmentos semánticos y generará vectores usando el modelo de Google para guardarlos en Supabase.
            </p>
          </div>
        </div>

        {/* Zona de Dropzone */}
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
            {isDragActive ? '¡Suéltalos aquí!' : 'Arrastra y suelta tus reglamentos PDF'}
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-xs">
            O haz clic para explorar los archivos de tu computadora. (Solo archivos .pdf)
          </p>
        </div>

        {/* Lista de Archivos Seleccionados */}
        {files.length > 0 && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              Archivos listos para indexar ({files.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 group">
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm text-slate-300 truncate font-medium">{file.name}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Botón de Procesar */}
            <button
              onClick={(e) => { e.stopPropagation(); handleProcessPDFs(); }}
              disabled={uploading}
              className="w-full mt-5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Generando Vectores e Indexando en Supabase...</span>
                </>
              ) : (
                <span>Procesar e Indexar Documentos</span>
              )}
            </button>
          </div>
        )}

        {/* Estado de Éxito */}
        {status === 'success' && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{successDetail}</span>
          </div>
        )}

        {/* Estado de Error — ahora muestra el error REAL */}
        {status === 'error' && (
          <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-2xl flex flex-col gap-2 text-red-400">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold">Error al procesar</span>
            </div>
            <p className="text-xs font-mono bg-red-950/60 p-3 rounded-xl text-red-300 break-all">
              {errorDetail || 'Error desconocido. Revisa la terminal de VS Code.'}
            </p>
          </div>
        )}

      </main>
    </div>
  );
}