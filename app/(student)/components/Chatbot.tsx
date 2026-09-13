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

const WELCOME_MESSAGE = `¡Hola! Soy UCCSito, tu asistente virtual de la UCSS. 👋

Puedo ayudarte con información sobre el reglamento, trámites, notas, becas y mucho más. ¿En qué te puedo colaborar hoy?`;

const SUGGESTED_QUESTIONS = [
  '¿Cuáles son los requisitos para un retiro de curso?',
  '¿Cómo puedo postular a una beca?',
  '¿Cuántos créditos puedo llevar por semestre?',
  '¿Dónde se encuentra la biblioteca?',
  '¿Qué pasa si desapruebo una materia?',
];

export function Chatbot() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 flex items-center gap-6 shadow-sm">
        <div className="w-20 h-20 shrink-0 bg-white/10 rounded-2xl p-2 hidden sm:block">
          <ImageWithFallback
            imagePath={images.uccsito.path}
            fallbackSvg={svgFallbacks.uccsito}
            alt="Avatar UCCSito"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold mb-1">Hola, soy UCCSito</h2>
          <p className="text-sm text-blue-100 mb-1">Tu Asistente Virtual de la Universidad Católica Sedes Sapientiae.</p>
          <p className="text-sm text-blue-100">
            Estoy aquí para ayudarte con consultas sobre el reglamento de estudios, trámites académicos, notas, becas y todo lo relacionado con tu vida universitaria.
          </p>
          <button
            onClick={() => document.getElementById('chat-input')?.focus()}
            className="mt-4 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-50 transition-colors"
          >
            ¿Qué necesitas hacer hoy?
          </button>
        </div>
      </div>

      {/* Panel de chat */}
      <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
            <ChatBubbleIcon className="w-4 h-4 text-blue-600" />
            Chat
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              Nuevo chat
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto bg-white">
          {messages.map((m, idx) => (
            <ChatMessage key={idx} role={m.role} content={m.content} sources={m.sources} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-2xl rounded-2xl rounded-bl-none px-4 py-3 bg-gray-100 text-gray-700 text-sm flex items-center gap-2">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse [animation-delay:0.15s]">●</span>
                <span className="animate-pulse [animation-delay:0.3s]">●</span>
                UCCSito está pensando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preguntas sugeridas */}
        {messages.length === 1 && !loading && (
          <div className="px-5 py-4 border-t border-gray-100 bg-blue-50/40">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-3">
              <BulbIcon className="w-4 h-4 text-amber-500" />
              Preguntas sugeridas
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="flex items-center justify-between text-left text-sm text-gray-700 bg-white border border-gray-200 rounded-full px-4 py-2.5 hover:border-blue-400 hover:text-blue-700 transition-colors"
                >
                  <span>{q}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-4 pr-1.5 py-1.5">
            <PaperclipIcon className="w-4 h-4 text-gray-400 shrink-0" />
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
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !question.trim()}
              className="w-9 h-9 shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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

/* --- Icons --- */
function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 1 1-3.5-6.6" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
    </svg>
  );
}
function BulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.5h6c0-1.2.4-1.9 1-2.5A6 6 0 0 0 12 2Z" />
    </svg>
  );
}
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.4 11.6-9.2 9.2a5 5 0 0 1-7.1-7.1l9.2-9.2a3.5 3.5 0 0 1 5 5l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
    </svg>
  );
}
function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 11.5 21 3l-7.5 18-2.6-7.4L3 11.5Z" />
    </svg>
  );
}
