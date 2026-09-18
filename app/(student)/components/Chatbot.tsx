'use client';
import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from './ImageFallback';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ filename?: string; titulo?: string }>;
}

interface ChatbotProps {
  initialQuestion?: string | null;
  onInitialQuestionConsumed?: () => void;
}

const WELCOME_MESSAGE = `¡Hola! Soy UCCSito, tu asistente virtual de la UCSS. 👋

Puedo ayudarte con información sobre el reglamento, trámites, notas, becas y mucho más. ¿En qué te puedo colaborar hoy?`;

const SUGGESTED_QUESTIONS = [
  '¿Cuáles son los requisitos para un retiro de curso?',
  '¿Cómo puedo postular a una beca?',
  '¿Cuántos créditos puedo llevar por semestre?',
  '¿Dónde se encuentra la biblioteca?',
  '¿Qué pasa si desapruebo una materia?',
];

export function Chatbot({ initialQuestion, onInitialQuestionConsumed }: ChatbotProps = {}) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialQuestion) {
      handleSend(initialQuestion);
      onInitialQuestionConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  const handleSend = async (queryToSend?: string) => {
    const finalQuestion = queryToSend || question.trim();
    if (!finalQuestion) return;

    setMessages((prev) => [...prev, { role: 'user', content: finalQuestion }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: finalQuestion }),
      });
      const data = await res.json();
      const sources = data.sources || [];
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'No pude procesar tu pregunta.',
          sources: sources.length > 0 ? sources : undefined,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ocurrió un error al conectar con el servidor.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ role: 'assistant', content: WELCOME_MESSAGE }]);
    setQuestion('');
  };

  return (
    <div className="space-y-4">
      {/* Banner de bienvenida */}
      <div className="relative overflow-hidden rounded-2xl bg-[#14141c] border border-cyan-500/20 text-white p-6 flex items-center gap-6 shadow-[6px_6px_16px_#08080c,-6px_-6px_16px_#1c1c28]">
        <div className="w-20 h-20 shrink-0 bg-black/30 rounded-2xl p-2 hidden sm:block ring-1 ring-cyan-400/30">
          <ImageWithFallback
            imagePath={images.uccsito.path}
            fallbackSvg={svgFallbacks.uccsito}
            alt="Avatar UCCSito"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold mb-1 text-cyan-300" style={{ textShadow: '0 0 10px rgba(34,211,238,0.4)' }}>
            Hola, soy UCCSito
          </h2>
          <p className="text-sm text-gray-400 mb-1">Tu Asistente Virtual de la Universidad Católica Sedes Sapientiae.</p>
          <p className="text-sm text-gray-400">
            Estoy aquí para ayudarte con consultas sobre el reglamento de estudios, trámites académicos, notas, becas y todo lo relacionado con tu vida universitaria.
          </p>
          <button
            onClick={() => document.getElementById('chat-input')?.focus()}
            className="mt-4 bg-cyan-500 text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_16px_rgba(34,211,238,0.5)]"
          >
            ¿Qué necesitas hacer hoy?
          </button>
        </div>
      </div>

      {/* Panel de chat */}
      <div className="flex flex-col bg-[#14141c] rounded-2xl border border-white/5 shadow-[6px_6px_16px_#08080c,-6px_-6px_16px_#1c1c28] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
            <ChatBubbleIcon className="w-4 h-4" />
            Chat
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-black/30 hover:bg-black/50 hover:text-cyan-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              Nuevo chat
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-black/30 hover:bg-black/50 hover:text-cyan-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
          {messages.map((m, idx) => (
            <ChatMessage key={idx} role={m.role} content={m.content} sources={m.sources} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-2xl rounded-2xl rounded-bl-sm px-4 py-3 bg-[#1b1b26] text-gray-300 text-sm flex items-center gap-2 border border-white/5">
                <span className="animate-pulse text-cyan-400">●</span>
                <span className="animate-pulse text-cyan-400 [animation-delay:0.15s]">●</span>
                <span className="animate-pulse text-cyan-400 [animation-delay:0.3s]">●</span>
                UCCSito está pensando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && !loading && (
          <div className="px-5 py-4 border-t border-white/5 bg-black/20">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-3">
              <BulbIcon className="w-4 h-4 text-yellow-400" />
              Preguntas sugeridas
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="flex items-center justify-between text-left text-sm text-gray-300 bg-[#1b1b26] border border-white/5 rounded-full px-4 py-2.5 hover:border-cyan-400/40 hover:text-cyan-300 active:scale-[0.98] transition-all"
                >
                  <span>{q}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-gray-600 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 bg-black/30 rounded-full pl-4 pr-1.5 py-1.5 shadow-[inset_2px_2px_5px_#08080c,inset_-2px_-2px_5px_#1c1c28] border border-white/5">
            <PaperclipIcon className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              id="chat-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Escribe tu consulta sobre el reglamento, trámites, notas, etc..."
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-600 disabled:opacity-60"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !question.trim()}
              className="w-9 h-9 shrink-0 flex items-center justify-center bg-cyan-500 text-black rounded-full hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all shadow-[0_0_10px_rgba(34,211,238,0.4)]"
              aria-label="Enviar"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 1 1-3.5-6.6" /><path d="M21 3v6h-6" /></svg>);
}
function RefreshIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 21v-5h5" /></svg>);
}
function TrashIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></svg>);
}
function BulbIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.5h6c0-1.2.4-1.9 1-2.5A6 6 0 0 0 12 2Z" /></svg>);
}
function ArrowRightIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
}
function PaperclipIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.4 11.6-9.2 9.2a5 5 0 0 1-7.1-7.1l9.2-9.2a3.5 3.5 0 0 1 5 5l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" /></svg>);
}
function SendIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 11.5 21 3l-7.5 18-2.6-7.4L3 11.5Z" /></svg>);
}