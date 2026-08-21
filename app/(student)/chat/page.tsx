'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sun, Moon, GraduationCap, Volume2, VolumeX, Menu, Plus, Trash2, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

const QUICK_CHIPS = [
  { label: '📅 Matrícula 2026', query: '¿Cuáles son los requisitos y fechas de matrícula 2026?' },
  { label: '🎓 Becas',          query: '¿Cómo puedo solicitar una beca en la UCSS?' },
  { label: '📜 Reglamentos',    query: '¿Dónde puedo encontrar los reglamentos estudiantiles?' },
  { label: '🏛️ Secretaría',    query: '¿Qué trámites puedo hacer en secretaría?' },
];

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: '¡Hola! Soy **uccsito**, tu asistente virtual de la UCSS 🎓\n\nPuedo ayudarte con información sobre reglamentos, trámites, evaluaciones y más. ¿En qué te puedo ayudar hoy?',
};

const STORAGE_KEY = 'uccsito_chat_sessions';

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

// ── Disparo global de ráfagas cósmicas (usado por hover en Acceso Rápido) ────
function fireCosmicBurst(x: number, y: number, n = 26) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('uccsito-burst', { detail: { x, y, n } }));
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
      <div className="shrink-0"><UccsitoAvatar size={32} /></div>
      <div className="px-4 py-3 rounded-[22px] rounded-bl-[6px] flex items-center gap-1.5"
        style={{ background: dark ? '#1e293b' : '#f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {[0,150,300].map(d => (
          <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{background:'#00A3E0', animationDelay:`${d}ms`}}/>
        ))}
      </div>
    </div>
  );
}

// ── Fondo Cósmico Sol / Luna (resplandor atmosférico, no discos recortados) ──
function CosmicBackdrop({ dark }: { dark: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base profunda azul-noche / pastel rico según el modo */}
      <div className="absolute inset-0" style={{
        background: dark
          ? 'radial-gradient(ellipse 140% 100% at 50% -10%, #101c3f 0%, #0B132B 40%, #080C1A 100%)'
          : 'linear-gradient(135deg,#E0F2FE 0%,#EAF3FE 35%,#FDF3D6 70%,#FEF3C7 100%)',
        transition: 'background .6s',
      }} />

      {/* Resplandor solar — nebulosa cálida difuminada, lado izquierdo */}
      <div className="absolute" style={{
        left: '-22%', top: '-25%',
        width: '85vmax', height: '85vmax',
        background: 'radial-gradient(circle, rgba(255,221,150,.75) 0%, rgba(251,191,36,.38) 24%, rgba(217,119,6,.16) 44%, rgba(217,119,6,0) 68%)',
        filter: 'blur(90px)',
        opacity: dark ? 1 : 0.9,
        transition: 'opacity .6s',
        mixBlendMode: dark ? 'screen' : 'multiply',
      }} />

      {/* Resplandor lunar — nebulosa fría difuminada, lado derecho */}
      <div className="absolute" style={{
        right: '-24%', bottom: '-28%',
        width: '90vmax', height: '90vmax',
        background: 'radial-gradient(circle, rgba(196,224,255,.6) 0%, rgba(103,181,255,.3) 26%, rgba(56,90,150,.14) 48%, rgba(56,90,150,0) 70%)',
        filter: 'blur(100px)',
        opacity: dark ? 0.95 : 0.8,
        transition: 'opacity .6s',
        mixBlendMode: dark ? 'screen' : 'multiply',
      }} />

      {/* Aura cian adicional que le da profundidad al centro-derecha */}
      <div className="absolute" style={{
        right: '8%', top: '6%',
        width: '46vmax', height: '46vmax',
        background: 'radial-gradient(circle, rgba(34,211,238,.16) 0%, rgba(34,211,238,0) 65%)',
        filter: 'blur(70px)',
        opacity: dark ? 0.85 : 0.35,
      }} />

      {/* Viñeta suave para dar profundidad en los bordes */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 55%, transparent 35%, rgba(3,6,16,.4) 100%)',
        opacity: dark ? 0.6 : 0.08,
      }} />
    </div>
  );
}

// ── Partículas / Luciérnagas interactivas ───────────────────────────────────
function FirefliesCanvas({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const palette = dark
      ? ['#22d3ee', '#7dd3fc', '#fbbf24', '#facc15', '#a78bfa', '#c084fc', '#f9a8d4']
      : ['#1d4ed8', '#2563eb', '#d97706', '#b45309', '#7c3aed', '#9333ea', '#0891b2'];

    const count = 60;
    type Fly = {
      x: number; y: number; r: number; vx: number; vy: number;
      color: string; phase: number; speed: number; glow: number; baseR: number;
    };
    const flies: Fly[] = Array.from({ length: count }, () => {
      const baseR = Math.random() * 2.4 + 0.8;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: baseR,
        baseR,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        color: palette[Math.floor(Math.random() * palette.length)],
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        glow: Math.random() * 10 + 6,
      };
    });

    type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; r: number };
    let sparks: Spark[] = [];

    const spawnBurst = (x: number, y: number, n = 10) => {
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.5;
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: Math.random() * 24 + 18,
          color: palette[Math.floor(Math.random() * palette.length)],
          r: Math.random() * 1.8 + 0.6,
        });
      }
    };

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    let lastBurst = 0;
    const onPointerMove = (e: PointerEvent) => {
      const { x, y } = getPos(e);
      pointerRef.current = { x, y, active: true };
      const now = performance.now();
      if (now - lastBurst > 60) {
        spawnBurst(x, y, 3);
        lastBurst = now;
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const { x, y } = getPos(e);
      pointerRef.current = { x, y, active: true };
      spawnBurst(x, y, 26);
    };
    const onPointerLeave = () => { pointerRef.current.active = false; };

    const onCosmicBurst = (e: Event) => {
      const detail = (e as CustomEvent).detail as { x?: number; y?: number; n?: number } | undefined;
      if (!detail || typeof detail.x !== 'number' || typeof detail.y !== 'number') return;
      spawnBurst(detail.x, detail.y, detail.n ?? 26);
      pointerRef.current = { x: detail.x, y: detail.y, active: true };
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('uccsito-burst', onCosmicBurst as EventListener);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      t += 1;

      const { x: px, y: py, active } = pointerRef.current;
      const REPEL_R = 46;
      const ATTRACT_R = 230;
      const MAX_SPEED = 2.6;

      flies.forEach(f => {
        f.vx += Math.sin(t * 0.0021 + f.phase) * 0.012;
        f.vy += Math.cos(t * 0.0025 + f.phase * 1.3) * 0.012;

        if (active) {
          const dx = px - f.x;
          const dy = py - f.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.001);
          if (dist < REPEL_R) {
            const force = (1 - dist / REPEL_R) * 0.85;
            f.vx -= (dx / dist) * force;
            f.vy -= (dy / dist) * force;
          } else if (dist < ATTRACT_R) {
            const force = (1 - dist / ATTRACT_R) * 0.2;
            f.vx += (dx / dist) * force;
            f.vy += (dy / dist) * force;
          }
          f.r = f.baseR + Math.max(0, (ATTRACT_R - dist) / ATTRACT_R) * 2.2;
        } else {
          f.r += (f.baseR - f.r) * 0.08;
        }

        f.vx *= 0.975;
        f.vy *= 0.975;

        const sp = Math.hypot(f.vx, f.vy);
        if (sp > MAX_SPEED) { f.vx = (f.vx / sp) * MAX_SPEED; f.vy = (f.vy / sp) * MAX_SPEED; }

        f.x += f.vx;
        f.y += f.vy;

        if (f.x < 0) { f.x = 0; f.vx *= -0.85; }
        if (f.x > canvas.width) { f.x = canvas.width; f.vx *= -0.85; }
        if (f.y < 0) { f.y = 0; f.vy *= -0.85; }
        if (f.y > canvas.height) { f.y = canvas.height; f.vy *= -0.85; }

        const alpha = dark
          ? 0.55 + 0.45 * Math.sin(t * f.speed + f.phase)
          : 0.55 + 0.35 * Math.sin(t * f.speed + f.phase);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = f.glow * (dark ? 2.8 : 2.2);
        ctx.shadowColor = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
        ctx.restore();
      });

      sparks = sparks.filter(s => s.life < s.maxLife);
      sparks.forEach(s => {
        s.life += 1;
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        const progress = s.life / s.maxLife;
        const alpha = 1 - progress;
        ctx.save();
        ctx.globalAlpha = Math.max(alpha, 0);
        ctx.shadowBlur = 14;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('uccsito-burst', onCosmicBurst as EventListener);
    };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, width: '100vw', height: '100vh' }}
    />
  );
}

// ── Sidebar de historial ─────────────────────────────────────────────────────
function HistorySidebar({
  open, dark, sessions, activeId, onSelect, onDelete, onNew, onClose,
}: {
  open: boolean;
  dark: boolean;
  sessions: ChatSession[];
  activeId: string;
  onSelect: (s: ChatSession) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onNew: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay para móvil */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-30 transition-opacity"
        style={{
          background: 'rgba(0,0,0,0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      <aside
        className="fixed top-0 left-0 h-full z-40 flex flex-col transition-transform"
        style={{
          width: '280px',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          background: dark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRight: dark ? '1px solid rgba(51,65,85,0.6)' : '1px solid rgba(226,232,240,0.8)',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 shrink-0"
          style={{ borderBottom: dark ? '1px solid rgba(51,65,85,0.5)' : '1px solid rgba(226,232,240,0.8)' }}>
          <h3 className="font-bold text-sm" style={{ color: dark ? '#f8fafc' : '#0f172a' }}>
            Historial de Chats
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70">
            <X className="w-4 h-4" style={{ color: dark ? '#94a3b8' : '#475569' }} />
          </button>
        </div>

        <div className="px-3 pt-3 shrink-0">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#002B49,#00A3E0)', color: 'white' }}
          >
            <Plus className="w-4 h-4" /> Nuevo chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {sessions.length === 0 && (
            <p className="text-xs text-center mt-6" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
              No hay conversaciones guardadas.
            </p>
          )}
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => onSelect(session)}
              className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
              style={{
                background: session.id === activeId
                  ? (dark ? 'rgba(0,163,224,0.15)' : 'rgba(0,163,224,0.1)')
                  : 'transparent',
                border: session.id === activeId ? '1px solid rgba(0,163,224,0.3)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (session.id !== activeId) e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)'; }}
              onMouseLeave={e => { if (session.id !== activeId) e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="text-sm truncate flex-1" style={{ color: dark ? '#e2e8f0' : '#1e293b' }}>
                {session.title}
              </span>
              <button
                onClick={(e) => onDelete(session.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg shrink-0 transition-opacity hover:bg-red-500/10"
                title="Eliminar conversación"
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ChatPage() {
  const [dark, setDark] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const hydratedRef = useRef(false);

  // ── Cargar historial al montar ────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveId(parsed[0].id);
          setMessages(parsed[0].messages);
          hydratedRef.current = true;
          return;
        }
      }
    } catch (e) {
      console.error('Error cargando historial:', e);
    }
    // Si no hay nada guardado, crea la primera sesión
    const id = 'session_' + Date.now();
    const initial: ChatSession = { id, title: 'Nuevo chat', date: new Date().toISOString(), messages: [WELCOME_MESSAGE] };
    setSessions([initial]);
    setActiveId(id);
    setMessages([WELCOME_MESSAGE]);
    hydratedRef.current = true;
  }, []);

  const saveSessions = useCallback((updated: ChatSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error guardando historial:', e);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Nuevo chat ────────────────────────────────────────────────────────────
  const createNewSession = useCallback(() => {
    // Reutiliza la sesión activa si está vacía (sin mensajes de usuario)
    const current = sessions.find(s => s.id === activeId);
    if (current && !current.messages.some(m => m.role === 'user')) {
      setSidebarOpen(false);
      return;
    }
    const id = 'session_' + Date.now();
    const newSession: ChatSession = { id, title: 'Nuevo chat', date: new Date().toISOString(), messages: [WELCOME_MESSAGE] };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveId(id);
    setMessages([WELCOME_MESSAGE]);
    setSidebarOpen(false);
  }, [sessions, activeId, saveSessions]);

  const selectSession = useCallback((session: ChatSession) => {
    setActiveId(session.id);
    setMessages(session.messages);
    setSidebarOpen(false);
  }, []);

  const deleteSession = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    if (updated.length === 0) {
      const newId = 'session_' + Date.now();
      const fresh: ChatSession = { id: newId, title: 'Nuevo chat', date: new Date().toISOString(), messages: [WELCOME_MESSAGE] };
      saveSessions([fresh]);
      setActiveId(newId);
      setMessages([WELCOME_MESSAGE]);
      return;
    }
    saveSessions(updated);
    if (id === activeId) {
      setActiveId(updated[0].id);
      setMessages(updated[0].messages);
    }
  }, [sessions, activeId, saveSessions]);

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

  // ── Text to Speech ───────────────────────────────────────────────────────────
  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !ttsEnabled) return;

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#+/g, '')
      .replace(/📌.*$/gm, '')
      .replace(/\[IMG:.*?\]/g, '')
      .replace(/`/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-PE';
    utterance.rate = 1.05;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const toggleTts = () => {
    setTtsEnabled(v => {
      if (v && speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }
      return !v;
    });
  };

  // ── Enviar mensaje ──────────────────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();

    if (!question || loading) return;

    setInput("");
    playSound("send");

    const userMsg: Message = { role: "user", content: question };
    const afterUser = [...messages, userMsg];
    setMessages(afterUser);
    setLoading(true);

    // Actualiza título de la sesión con el primer mensaje del usuario
    const currentActiveId = activeId;
    const updatedWithUser = sessions.map(s => {
      if (s.id === currentActiveId) {
        const title = s.title === 'Nuevo chat'
          ? question.slice(0, 30) + (question.length > 30 ? '...' : '')
          : s.title;
        return { ...s, title, messages: afterUser };
      }
      return s;
    });
    saveSessions(updatedWithUser);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = (await res.json()) as {
        answer?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? `Error HTTP ${res.status}`);
      }

      playSound("receive");

      const botMsg: Message = {
        role: "assistant",
        content: data.answer ?? "El servidor no devolvió una respuesta.",
      };
      const afterBot = [...afterUser, botMsg];
      setMessages(afterBot);
      saveSessions(updatedWithUser.map(s => s.id === currentActiveId ? { ...s, messages: afterBot } : s));
      speakText(botMsg.content);
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);

      const errMsg: Message = {
        role: "assistant",
        content:
          error instanceof Error
            ? `Error: ${error.message}`
            : "Error de conexión con el servidor.",
      };
      const afterErr = [...afterUser, errMsg];
      setMessages(afterErr);
      saveSessions(updatedWithUser.map(s => s.id === currentActiveId ? { ...s, messages: afterErr } : s));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Colores según modo ──────────────────────────────────────────────────────
  const bg       = dark ? '#0B132B' : '#E0F2FE';
  const bubble   = dark ? { bg: '#1e293b', border: '#334155', text: '#f8fafc' }
                        : { bg: '#f1f5f9', border: '#e2e8f0', text: '#0f172a' };
  const glassBar = dark
    ? 'rgba(30,41,59,0.85)'
    : 'rgba(255,255,255,0.82)';

  return (
    <div className="relative flex flex-col h-screen font-sans overflow-hidden" style={{ background: bg, transition: 'background 0.4s' }}>

      <CosmicBackdrop dark={dark} />
      <FirefliesCanvas dark={dark} />

      <HistorySidebar
        open={sidebarOpen}
        dark={dark}
        sessions={sessions}
        activeId={activeId}
        onSelect={selectSession}
        onDelete={deleteSession}
        onNew={createNewSession}
        onClose={() => setSidebarOpen(false)}
      />

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
      <header className="relative shrink-0 flex items-center gap-3 px-4 sm:px-6 z-20"
        style={{
          background: dark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: dark ? '1px solid rgba(30,41,59,0.5)' : '1px solid rgba(226,232,240,0.5)',
          minHeight: '64px',
          transition: 'background .4s, border-color .4s',
        }}>

        {/* Botón hamburguesa (abre historial) */}
        <button onClick={() => setSidebarOpen(true)}
          className="shrink-0 p-2 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          title="Historial de chats">
          <Menu className="w-5 h-5" style={{ color: dark ? '#e2e8f0' : '#0f172a' }} />
        </button>

        {/* Logo UCSS */}
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-ucss.png" alt="UCSS" className="w-6 h-6 object-contain"
            onError={e => { (e.target as HTMLImageElement).replaceWith((() => { const d = document.createElementNS('http://www.w3.org/2000/svg','svg'); return d; })()); }} />
        </div>

        {/* Avatar + nombre */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative shrink-0">
            <UccsitoAvatar size={36} />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full"
              style={{ border: `2px solid ${dark ? '#0f172a' : '#ffffff'}` }} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base leading-none truncate"
              style={{ color: dark ? '#f8fafc' : '#0f172a' }}>uccsito</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              <p className="text-[11px] truncate" style={{ color: dark ? '#94a3b8' : '#64748b' }}>
                UCSS · Comunidad Académica
              </p>
            </div>
          </div>
        </div>

        {/* Toggle voz (texto a voz) */}
        <button onClick={toggleTts}
          className="shrink-0 p-2 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          title={ttsEnabled ? 'Desactivar voz' : 'Activar voz'}>
          {ttsEnabled
            ? <Volume2 className="w-4 h-4" style={{ color: speaking ? '#00A3E0' : (dark ? '#94a3b8' : '#475569') }} />
            : <VolumeX className="w-4 h-4" style={{ color: dark ? '#94a3b8' : '#475569' }} />}
        </button>

        {/* Toggle dark mode */}
        <button onClick={() => setDark(d => !d)}
          className="shrink-0 p-2 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          title={dark ? 'Modo claro' : 'Modo oscuro'}>
          {dark
            ? <Sun className="w-4 h-4" style={{ color: '#fbbf24' }} />
            : <Moon className="w-4 h-4" style={{ color: '#475569' }} />}
        </button>
      </header>

      {/* ── ÁREA DE MENSAJES ─────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="px-4 py-5 space-y-5 max-w-3xl w-full mx-auto">

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 items-end ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant'
                  ? <div className="shrink-0"><UccsitoAvatar size={32} /></div>
                  : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ background: '#0084FF' }}>Tú</div>}

                <div className={`max-w-[88%] md:max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'assistant' ? 'rounded-[22px] rounded-bl-[6px]' : 'text-white rounded-[22px] rounded-br-[6px]'
                }`} style={msg.role === 'assistant'
                  ? { background: bubble.bg, color: bubble.text,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all .3s' }
                  : { background: '#0084FF',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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
                onMouseEnter={e => {
                  const r = e.currentTarget.getBoundingClientRect();
                  fireCosmicBurst(r.left + r.width / 2, r.top + r.height / 2, 30);
                }}
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
        <div className="flex items-center justify-center gap-2 mt-2 text-[11px]" style={{ color: dark ? '#94a3b8' : '#475569' }}>
          <div className="w-6 h-6 rounded-full overflow-hidden border border-[#00A3E0]/40 shrink-0 bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/meme.jpg" alt="Meme Inge" className="w-full h-full object-cover" />
          </div>
          <span>
            Desarrollado por <span className="font-semibold" style={{ color: '#00A3E0' }}>Luis Lopez</span> <span className="italic opacity-80">(tu inge)</span> · UCSS
          </span>
        </div>
      </div>
    </div>
  );
}