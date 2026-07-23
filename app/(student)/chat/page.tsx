'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, GraduationCap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_CHIPS = [
  { label: '📅 Matrícula 2026', query: '¿Cuáles son los requisitos y fechas de matrícula 2026?' },
  { label: '🎓 Becas', query: '¿Cómo puedo solicitar una beca en la UCSS?' },
  { label: '📜 Reglamentos', query: '¿Dónde puedo encontrar los reglamentos estudiantiles?' },
  { label: '🏛️ Secretaría', query: '¿Qué trámites puedo hacer en secretaría?' },
];

// ── Sonidos sintéticos ───────────────────────────────────────────────────────
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
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.22);
    }
  } catch {}
}

// ── Avatar uccsito ───────────────────────────────────────────────────────────
function UccsitoAvatar({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#00A3E0"/>
      <rect x="18" y="22" width="44" height="6" rx="3" fill="white"/>
      <rect x="36" y="16" width="8" height="10" rx="2" fill="white"/>
      <line x1="58" y1="25" x2="62" y2="34" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="62" cy="36" r="3" fill="#fbbf24"/>
      <circle cx="40" cy="46" r="16" fill="#fde68a"/>
      <circle cx="34" cy="43" r="2.5" fill="#0B2545"/>
      <circle cx="46" cy="43" r="2.5" fill="#0B2545"/>
      <circle cx="35" cy="42" r="0.8" fill="white"/>
      <circle cx="47" cy="42" r="0.8" fill="white"/>
      <path d="M33 50 Q40 56 47 50" stroke="#0B2545" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="30" cy="49" r="3" fill="#fca5a5" opacity="0.6"/>
      <circle cx="50" cy="49" r="3" fill="#fca5a5" opacity="0.6"/>
      <path d="M24 68 Q28 58 40 56 Q52 58 56 68" fill="#0B2545"/>
      <path d="M32 62 L40 70 L48 62" fill="white" opacity="0.3"/>
    </svg>
  );
}

// ── Indicador de escritura ───────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="shrink-0 drop-shadow-md"><UccsitoAvatar size={36} /></div>
      <div className="bg-white border border-slate-200 shadow-md px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full animate-bounce" style={{background:'#00A3E0', animationDelay:'0ms'}}/>
        <span className="w-2 h-2 rounded-full animate-bounce" style={{background:'#00A3E0', animationDelay:'150ms'}}/>
        <span className="w-2 h-2 rounded-full animate-bounce" style={{background:'#00A3E0', animationDelay:'300ms'}}/>
      </div>
    </div>
  );
}

// ── fmt: renderiza markdown + imágenes, bloquea scripts ──────────────────────
function fmt(text: string): string {
  let html = text
    .replace(/\[IMG:(https?:\/\/[^\|]+)\|([^\]]+)\]/g,
      '<img src="$1" alt="$2" class="chat-img"/>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[\*\-] (.+)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>');
  html = html.replace(/(<li>[\s\S]*?<\/li>(<br\/>)?)+/g, (m) =>
    `<ul class="chat-list">${m.replace(/<br\/>/g, '')}</ul>`);
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/on\w+="[^"]*"/gi, '');
  return html;
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '¡Hola! Soy **uccsito**, tu asistente virtual de la UCSS 🎓\n\nPuedo ayudarte con información sobre reglamentos, trámites, evaluaciones y más. ¿En qué te puedo ayudar hoy?',
  }]);
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
    <div className="flex flex-col h-screen font-sans overflow-hidden" style={{background:'#F4F7FA'}}>

      <style>{`
        /* Imágenes en el chat */
        .chat-img {
          border-radius: 0.75rem;
          max-width: 100%;
          height: auto;
          margin-top: 0.5rem;
          display: block;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        /* Listas en el chat */
        .chat-list {
          margin: 0.4rem 0 0 1.1rem;
          padding: 0;
          list-style: disc;
        }
        .chat-list li { margin-bottom: 0.25rem; }

        /* Watermark institucional en el área de chat */
        .chat-bg {
          background-color: #F4F7FA;
          background-image: repeating-linear-gradient(
            45deg,
            rgba(0,43,73,0.025) 0px,
            rgba(0,43,73,0.025) 1px,
            transparent 1px,
            transparent 28px
          ),
          repeating-linear-gradient(
            -45deg,
            rgba(0,43,73,0.025) 0px,
            rgba(0,43,73,0.025) 1px,
            transparent 1px,
            transparent 28px
          );
        }

        /* Glassmorphism input bar */
        .glass-bar {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid rgba(0,163,224,0.25);
          box-shadow: 0 8px 32px rgba(0,43,73,0.10), 0 1.5px 4px rgba(0,163,224,0.08);
        }

        /* Ping animado */
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0; }
        }
        .ping-dot::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #22c55e;
          animation: ping-slow 1.6s ease-in-out infinite;
        }

        /* Chip hover */
        .chip {
          transition: all 0.18s ease;
          cursor: pointer;
        }
        .chip:hover {
          background: #0B2545;
          color: white;
          border-color: #0B2545;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(11,37,69,0.18);
        }

        /* Botón enviar hover */
        .send-btn {
          transition: all 0.15s ease;
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(0,163,224,0.4);
        }
        .send-btn:disabled { opacity: 0.4; }
      `}</style>

      {/* ── HEADER INSTITUCIONAL ─────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center gap-0 px-4 sm:px-6 shadow-xl z-10" style={{
        background: 'linear-gradient(100deg, #002B49 0%, #0B2545 60%, #0d3060 100%)',
        minHeight: '64px',
      }}>
        {/* Logo UCSS */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-ucss.png"
              alt="UCSS"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
              }}
            />
            <GraduationCap className="w-5 h-5 text-white hidden" />
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-bold text-[11px] leading-none tracking-wide">UCSS</p>
            <p className="text-white/50 text-[9px] leading-none mt-0.5 tracking-wider uppercase">Institucional</p>
          </div>
        </div>

        {/* Divisor vertical */}
        <div className="w-px h-8 mx-4 shrink-0" style={{background:'rgba(0,163,224,0.35)'}}/>

        {/* Avatar + nombre uccsito */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="drop-shadow-lg"><UccsitoAvatar size={44} /></div>
            {/* Indicador online con ping */}
            <span className="ping-dot absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#002B49] rounded-full" style={{position:'absolute'}}/>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-base leading-none tracking-tight truncate">uccsito</h1>
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider" style={{background:'rgba(0,163,224,0.25)', color:'#7dd3fc', border:'1px solid rgba(0,163,224,0.3)'}}>IA</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" style={{boxShadow:'0 0 4px #4ade80'}}/>
              <p className="text-[11px] truncate" style={{color:'rgba(125,211,252,0.8)'}}>En línea · Asistente Virtual 24/7</p>
            </div>
          </div>
        </div>

        {/* Universidad (solo desktop) */}
        <div className="hidden md:block text-right shrink-0 ml-2">
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Universidad Católica</p>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Sedes Sapientiae</p>
        </div>
      </header>

      {/* ── ÁREA DE MENSAJES ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto chat-bg">
        <div className="px-4 py-5 space-y-5 max-w-3xl w-full mx-auto">

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 items-end ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              {msg.role === 'assistant' ? (
                <div className="shrink-0 drop-shadow-md"><UccsitoAvatar size={34} /></div>
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{background:'linear-gradient(135deg,#002B49,#00A3E0)'}}>
                  Tú
                </div>
              )}

              {/* Burbuja */}
              <div className={`max-w-[88%] md:max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-white rounded-2xl rounded-bl-none text-slate-700'
                  : 'text-white rounded-2xl rounded-br-none'
              }`} style={
                msg.role === 'assistant'
                  ? { border:'1px solid #E2E8F0', boxShadow:'0 2px 16px rgba(0,43,73,0.08), 0 1px 3px rgba(0,0,0,0.05)' }
                  : { background:'linear-gradient(135deg, #002B49 0%, #00A3E0 100%)', boxShadow:'0 4px 16px rgba(0,43,73,0.25)' }
              }>
                <span className="chat-bubble" dangerouslySetInnerHTML={{ __html: fmt(msg.content) }} />
              </div>
            </div>
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* ── CHIPS DE ACCESO RÁPIDO ───────────────────────────────────────── */}
      {messages.length === 1 && (
        <div className="shrink-0 px-4 pb-3 max-w-3xl w-full mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:'#00A3E0'}}>Acceso rápido</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip, i) => (
              <button key={i} onClick={() => sendMessage(chip.query)}
                className="chip text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background:'white',
                  color:'#0B2545',
                  border:'1.5px solid #CBD5E1',
                  boxShadow:'0 1px 4px rgba(0,43,73,0.08)'
                }}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── INPUT FLOTANTE GLASSMORPHISM ─────────────────────────────────── */}
      <div className="shrink-0 px-4 pb-5 pt-1 max-w-3xl w-full mx-auto">
        <div className="glass-bar flex gap-2 rounded-2xl p-2">
          <Mic className="w-5 h-5 self-center ml-1 shrink-0" style={{color:'#00A3E0'}} />
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
            className="send-btn p-2.5 rounded-xl text-white shrink-0 self-end"
            style={{background:'linear-gradient(135deg, #002B49, #00A3E0)'}}>
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] mt-2" style={{color:'#94a3b8'}}>
          uccsito puede cometer errores · Verifica información importante con tu coordinador
        </p>
      </div>

    </div>
  );
}