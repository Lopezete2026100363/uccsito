'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

function UccsitoAvatar({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#0ea5e9"/>
      <rect x="18" y="22" width="44" height="6" rx="3" fill="white"/>
      <rect x="36" y="16" width="8" height="10" rx="2" fill="white"/>
      <line x1="58" y1="25" x2="62" y2="34" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="62" cy="36" r="3" fill="#fbbf24"/>
      <circle cx="40" cy="46" r="16" fill="#fde68a"/>
      <circle cx="34" cy="43" r="2.5" fill="#1e3a5f"/>
      <circle cx="46" cy="43" r="2.5" fill="#1e3a5f"/>
      <circle cx="35" cy="42" r="0.8" fill="white"/>
      <circle cx="47" cy="42" r="0.8" fill="white"/>
      <path d="M33 50 Q40 56 47 50" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="30" cy="49" r="3" fill="#fca5a5" opacity="0.6"/>
      <circle cx="50" cy="49" r="3" fill="#fca5a5" opacity="0.6"/>
      <path d="M24 68 Q28 58 40 56 Q52 58 56 68" fill="#1e3a5f"/>
      <path d="M32 62 L40 70 L48 62" fill="white" opacity="0.3"/>
    </svg>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async () => {
    if (!email || !password) {
      setMessage({ text: 'Completa todos los campos.', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: '¡Cuenta creada! Revisa tu correo para confirmar.', type: 'success' });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ text: 'Correo o contraseña incorrectos.', type: 'error' });
      } else {
        window.location.href = '/chat';
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#e0f2fe 0%,#f0f9ff 50%,#e8f4fd 100%)' }}>

      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header azul UCSS */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg,#0369a1,#0ea5e9)' }}>
            <div className="flex justify-center mb-3">
              <UccsitoAvatar size={80} />
            </div>
            <h1 className="text-white font-bold text-2xl">uccsito</h1>
            <p className="text-sky-100 text-sm mt-1">Asistente Virtual · UCSS</p>
          </div>

          {/* Tabs login/registro */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setMode('login'); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'text-sky-600 border-b-2 border-sky-500'
                  : 'text-slate-400 hover:text-slate-600'
              }`}>
              Iniciar sesión
            </button>
            <button
              onClick={() => { setMode('register'); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'text-sky-600 border-b-2 border-sky-500'
                  : 'text-slate-400 hover:text-slate-600'
              }`}>
              Crear cuenta
            </button>
          </div>

          {/* Formulario */}
          <div className="px-8 py-6 space-y-4">

            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Correo institucional</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alumno@ucss.edu.pe"
                className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>

            {/* Mensaje error/éxito */}
            {message && (
              <div className={`px-4 py-3 rounded-xl text-sm ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Botón principal */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#0369a1,#0ea5e9)' }}>
              {loading ? 'Procesando...' : mode === 'login' ? 'Entrar al chat' : 'Crear mi cuenta'}
            </button>

            <p className="text-center text-xs text-slate-400 pt-1">
              {mode === 'login'
                ? '¿No tienes cuenta? '
                : '¿Ya tienes cuenta? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
                className="text-sky-500 font-semibold hover:underline">
                {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-sky-400 mt-4">
          Universidad Católica Sedes Sapientiae · Sistema de IA Educativa
        </p>
      </div>
    </div>
  );
}
