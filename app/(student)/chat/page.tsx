'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "¿Cuáles son los requisitos de matrícula?",
  "¿Cómo puedo solicitar una beca?",
  "¿Cuál es el reglamento de evaluaciones?",
  "¿Qué trámites puedo hacer en secretaría?",
];

function playSound(type: 'send' | 'receive') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'send') {
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch {}
}

function UccsitoAvatar({ size = 40 }: { size?: number }) {
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

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <UccsitoAvatar size={36} />
      <div className="bg-white border border-sky-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5">
        <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
        <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
        <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
      </div>
    </div>
  );
}

// ✅ Función fmt mejorada: soporta imágenes, listas, negrita y sanitiza HTML
function fmt(text: string): string {
  let html = text
    // Marcador de imagen [IMG:url|alt]
    .replace(
      /\[IMG:(https?:\/\/[^\|]+)\|([^\]]+)\]/g,
      '<img src="$1" alt="$2" class="chat-img"/>'
    )
    // Negrita **texto**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Cursiva *texto*
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Listas con asterisco o guión
    .replace(/^[\*\-] (.+)/gm, '<li>$1</li>')
    // Saltos de línea
    .replace(/\n/g, '<br/>');

  // Envolver <li> sueltos en <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>(<br\/>)?)+/g, (match) => {
    const items = match.replace(/<br\/>/g, '');
    return `<ul class="chat-list">${items}</ul>`;
  });

  // Eliminar etiquetas peligrosas (script, iframe, etc.)
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/on\w+="[^"]*"/gi, '');

  return html;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy **uccsito**, tu asistente virtual de la UCSS 🎓\n\nPuedo ayudarte con información sobre reglamentos, trámites, evaluaciones y más. ¿En qué te puedo ayudar hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput('');
    playSound('send');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      playSound('receive');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || data.error || 'Ocurrió un error inesperado.',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error de conexión. Verifica que el servidor esté corriendo.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-screen font-sans" style={{background:'linear-gradient(135deg,#e0f2fe 0%,#f0f9ff 50%,#e8f4fd 100%)'}}>

      {/* Estilos para imágenes y listas dentro del chat */}
      <style>{`
        .chat-img {
          border-radius: 0.75rem;
          max-width: 100%;
          height: auto;
          margin-top: 0.5rem;
          display: block;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .chat-list {
          margin: 0.25rem 0 0 1rem;
          padding: 0;
          list-style: disc;
        }
        .chat-list li {
          margin-bottom: 0.2rem;
        }
      `}</style>

      {/* Header */}
      <header className="flex items-center gap-3 px-4 sm:px-5 py-3 shadow-md" style={{background:'linear-gradient(90deg,#0369a1,#0ea5e9)'}}>
        <div className="relative shrink-0">
          <UccsitoAvatar size={48} />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-white text-lg leading-none truncate">uccsito</h1>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-mono shrink-0">IA</span>
          </div>
          <p className="text-sky-100 text-xs mt-0.5 truncate">Asistente Virtual · Universidad Católica Sedes Sapientiae</p>
        </div>
        <div className="ml-auto text-right shrink-0 hidden sm:block">
          <p className="text-white/60 text-xs">En línea</p>
          <p className="text-white/40 text-[10px]">Responde al instante</p>
        </div>
      </header>

      {/* Mensajes */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 items-end ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'assistant' ? (
              <UccsitoAvatar size={36} />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{background:'linear-gradient(135deg,#0369a1,#0ea5e9)'}}>
                Tú
              </div>
            )}
            <div className={`max-w-[92%] md:max-w-[78%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.role === 'assistant'
                ? 'bg-white border border-sky-100 rounded-2xl rounded-bl-none text-slate-700'
                : 'text-white rounded-2xl rounded-br-none'
            }`} style={msg.role === 'user' ? {background:'linear-gradient(135deg,#0369a1,#0ea5e9)'} : {}}>
              <span className="chat-bubble" dangerouslySetInnerHTML={{ __html: fmt(msg.content) }} />
            </div>
          </div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </main>

      {/* Sugerencias */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 max-w-3xl w-full mx-auto">
          <p className="text-xs text-sky-600 font-semibold mb-2 uppercase tracking-wide">Preguntas frecuentes</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="text-xs border border-sky-300 text-sky-700 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-full transition-all shadow-sm hover:shadow-md">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-5 max-w-3xl w-full mx-auto">
        <div className="flex gap-2 bg-white border-2 border-sky-200 rounded-2xl p-2 shadow-lg focus-within:border-sky-400 transition-all">
          <Mic className="w-5 h-5 text-sky-300 self-center ml-1 shrink-0" />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta aquí..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 resize-none outline-none py-1.5 max-h-32"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl text-white transition-all shrink-0 self-end disabled:opacity-40"
            style={{background:'linear-gradient(135deg,#0369a1,#0ea5e9)'}}>
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-sky-400 mt-2">
          uccsito puede cometer errores · Verifica información importante con tu coordinador
        </p>
      </div>
    </div>
  );
}