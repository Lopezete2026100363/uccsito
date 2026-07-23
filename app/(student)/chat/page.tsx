'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sun, Moon, GraduationCap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_CHIPS = [
  { label: '📅 Matrícula 2026', query: '¿Cuáles son los requisitos y fechas de matrícula 2026?' },
  { label: '🎓 Becas',          query: '¿Cómo puedo solicitar una beca en la UCSS?' },
  { label: '📜 Reglamentos',    query: '¿Dónde puedo encontrar los reglamentos estudiantiles?' },
  { label: '🏛️ Secretaría',    query: '¿Qué trámites puedo hacer en secretaría?' },
];

// ── Sonidos ──────────────────────────────────────────────────────────────────
function playSound(type: 'send' | 'receive') {
  try {
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
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

// ── fmt ───────────────────────────────────────────────────────────────────────
function fmt(text: string): string {
  let html = text
    .replace(/\[IMG:(https?:\/\/[^\|]+)\|([^\]]+)\]/g, '<img src="$1" alt="$2" class="chat-img"/>')
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

// ── Avatar ────────────────────────────────────────────────────────────────────
function UccsitoAvatar({ size = 40 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/uccsito-avatar.png"
      alt="Uccsito"
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ dark }: { dark: boolean }) {
  return (
    <div className="flex gap-3 items-end">
      <div className="shrink-0 drop-shadow-md"><UccsitoAvatar size={34} /></div>
      <div className={`px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}
        style={{boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,43,73,0.08)'}}>
        {[0,150,300].map(d => (
          <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{background:'#00A3E0', animationDelay:`${d}ms`}}/>
        ))}
      </div>
    </div>
  );
}

// ── Partículas / Luciérnagas ──────────────────────────────────────────────────
function FirefliesCanvas({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Paleta: turquesa, dorado, rosa, violeta
    const palette = ['#00A3E0','#fbbf24','#f9a8d4','#a78bfa','#7dd3fc','#86efac'];

    const count = 38;
    const flies = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      color: palette[Math.floor(Math.random() * palette.length)],
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.012 + 0.006,
      glow: Math.random() * 8 + 4,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 1;
      flies.forEach(f => {
        f.x += f.vx;
        f.y += f.vy;
        if (f.x < 0) f.x = canvas.width;
        if (f.x > canvas.width) f.x = 0;
        if (f.y < 0) f.y = canvas.height;
        if (f.y > canvas.height) f.y = 0;
        const alpha = dark
          ? 0.45 + 0.45 * Math.sin(t * f.speed + f.phase)
          : 0.18 + 0.18 * Math.sin(t * f.speed + f.phase);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = f.glow * (dark ? 2.5 : 1.2);
        ctx.shadowColor = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ChatPage() {
  const [dark, setDark] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '¡Hola! Soy **uccsito**, tu asistente virtual de la UCSS 🎓\n\nPuedo ayudarte con información sobre reglamentos, trámites, evaluaciones y más. ¿En qué te puedo ayudar hoy?',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Speech to Text ──────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'es-PE';
    rec.continuous = false;
    rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setInput(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
  }, [listening]);

  // ── Enviar mensaje ──────────────────────────────────────────────────────────
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Colores según modo ──────────────────────────────────────────────────────
  const bg       = dark ? '#0F172A' : '#F4F7FA';
  const bubble   = dark ? { bg: '#1E293B', border: '#334155', text: '#F8FAFC' }
                        : { bg: '#ffffff', border: '#E2E8F0', text: '#334155' };
  const glassBar = dark
    ? 'rgba(30,41,59,0.85)'
    : 'rgba(255,255,255,0.82)';

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden" style={{ background: bg, transition: 'background 0.4s' }}>

      <style>{`
        .chat-img { border-radius:.75rem; max-width:100%; height:auto; margin-top:.5rem; display:block; box-shadow:0 4px 16px rgba(0,0,0,0.15); }
        .chat-list { margin:.4rem 0 0 1.1rem; padding:0; list-style:disc; }
        .chat-list li { margin-bottom:.25rem; }
        .chip { transition:all .18s ease; cursor:pointer; }
        .chip:hover { background:#0B2545 !important; color:#fff !important; border-color:#0B2545 !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(11,37,69,.2); }
        .send-btn { transition:all .15s ease; }
        .send-btn:hover:not(:disabled) { transform:scale(1.08); box-shadow:0 4px 16px rgba(0,163,224,.4); }
        .send-btn:disabled { opacity:.4; }
        .mic-btn { transition:all .15s ease; }
        .mic-btn:hover { transform:scale(1.1); }
        @keyframes ping-slow { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:0} }
        .ping-ring { animation: ping-slow 1.6s ease-in-out infinite; }
        @keyframes pulse-mic { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0)} }
        .mic-active { animation: pulse-mic 1s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center gap-0 px-4 sm:px-6 z-20 shadow-xl"
        style={{ background: 'linear-gradient(100deg,#002B49 0%,#0B2545 60%,#0d3060 100%)', minHeight: '64px' }}>

        {/* Logo UCSS */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-ucss.png" alt="UCSS" className="w-8 h-8 object-contain"
              onError={e => { (e.target as HTMLImageElement).replaceWith((() => { const d = document.createElementNS('http://www.w3.org/2000/svg','svg'); return d; })()); }} />
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-bold text-[11px] leading-none tracking-wide">UCSS</p>
            <p className="text-white/50 text-[9px] leading-none mt-0.5 tracking-wider uppercase">Institucional</p>
          </div>
        </div>

        {/* Divisor */}
        <div className="w-px h-8 mx-4 shrink-0" style={{ background: 'rgba(0,163,224,.35)' }}/>

        {/* Avatar + nombre */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="drop-shadow-lg"><UccsitoAvatar size={44} /></div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#002B49] rounded-full">
              <span className="ping-ring absolute inset-0 rounded-full bg-green-400"/>
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-base leading-none truncate">uccsito</h1>
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider"
                style={{ background: 'rgba(0,163,224,.25)', color: '#7dd3fc', border: '1px solid rgba(0,163,224,.3)' }}>IA</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" style={{ boxShadow: '0 0 4px #4ade80' }}/>
              <p className="text-[11px] truncate" style={{ color: 'rgba(125,211,252,.85)' }}>En línea · Asistente Virtual 24/7</p>
            </div>
          </div>
        </div>

        {/* Toggle dark mode */}
        <button onClick={() => setDark(d => !d)}
          className="shrink-0 ml-3 p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          title={dark ? 'Modo claro' : 'Modo oscuro'}>
          {dark
            ? <Sun className="w-4 h-4 text-yellow-300" />
            : <Moon className="w-4 h-4 text-sky-200" />}
        </button>
      </header>

      {/* ── ÁREA DE MENSAJES (con canvas de fondo) ─────────────────────────── */}
      <main className="flex-1 overflow-hidden relative">
        <FirefliesCanvas dark={dark} />
        <div className="relative z-10 h-full overflow-y-auto">
          <div className="px-4 py-5 space-y-5 max-w-3xl w-full mx-auto">

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 items-end ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant'
                  ? <div className="shrink-0 drop-shadow-md"><UccsitoAvatar size={34} /></div>
                  : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ background: 'linear-gradient(135deg,#002B49,#00A3E0)' }}>Tú</div>}

                <div className={`max-w-[88%] md:max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'assistant' ? 'rounded-2xl rounded-bl-none' : 'text-white rounded-2xl rounded-br-none'
                }`} style={msg.role === 'assistant'
                  ? { background: bubble.bg, border: `1px solid ${bubble.border}`, color: bubble.text,
                      boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 2px 16px rgba(0,43,73,0.08)', transition: 'all .3s' }
                  : { background: 'linear-gradient(135deg,#002B49 0%,#00A3E0 100%)',
                      boxShadow: '0 4px 16px rgba(0,43,73,0.25)' }}>
                  <span className="chat-bubble" dangerouslySetInnerHTML={{ __html: fmt(msg.content) }} />
                </div>
              </div>
            ))}

            {loading && <TypingIndicator dark={dark} />}
            <div ref={bottomRef} />
          </div>
        </div>
      </main>

      {/* ── CHIPS ──────────────────────────────────────────────────────────── */}
      {messages.length === 1 && (
        <div className="shrink-0 px-4 pb-2 max-w-3xl w-full mx-auto relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#00A3E0' }}>Acceso rápido</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip, i) => (
              <button key={i} onClick={() => sendMessage(chip.query)}
                className="chip text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: dark ? '#1E293B' : 'white',
                  color: dark ? '#cbd5e1' : '#0B2545',
                  border: `1.5px solid ${dark ? '#334155' : '#CBD5E1'}`,
                  boxShadow: '0 1px 4px rgba(0,43,73,.08)',
                }}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── INPUT BAR GLASSMORPHISM ─────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pb-5 pt-1 max-w-3xl w-full mx-auto relative z-10">
        <div className="flex gap-2 rounded-2xl p-2 transition-all"
          style={{
            background: glassBar,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1.5px solid ${dark ? 'rgba(0,163,224,.2)' : 'rgba(0,163,224,.25)'}`,
            boxShadow: dark
              ? '0 8px 32px rgba(0,0,0,.4)'
              : '0 8px 32px rgba(0,43,73,.1)',
          }}>

          {/* Micrófono */}
          <button onClick={toggleMic}
            className={`mic-btn w-9 h-9 rounded-xl flex items-center justify-center shrink-0 self-end transition-all ${listening ? 'mic-active' : ''}`}
            style={{
              background: listening ? '#ef4444' : 'transparent',
              border: listening ? 'none' : `1.5px solid ${dark ? '#334155' : '#e2e8f0'}`,
            }}
            title={listening ? 'Detener grabación' : 'Hablar'}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"
              stroke={listening ? 'white' : '#00A3E0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="9" y1="22" x2="15" y2="22"/>
            </svg>
          </button>

          {/* Campo de texto */}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? '🎙️ Escuchando...' : 'Escribe tu pregunta aquí...'}
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none py-1.5 max-h-32"
            style={{ color: dark ? '#f8fafc' : '#334155' }}
          />

          {/* Botón enviar */}
          <button onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="send-btn p-2.5 rounded-xl text-white shrink-0 self-end"
            style={{ background: 'linear-gradient(135deg,#002B49,#00A3E0)' }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] mt-2" style={{ color: dark ? '#475569' : '#94a3b8' }}>
          uccsito puede cometer errores · Verifica información importante con tu coordinador
        </p>
      </div>
    </div>
  );
}