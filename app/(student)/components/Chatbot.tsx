'use client';
import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { SuggestedQuestions } from './SuggestedQuestions';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from './ImageFallback';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ filename?: string; titulo?: string }>;
}

const WELCOME_MESSAGE = `¡Hola! Soy **UCCSito** 👋

Tu asistente virtual universitario. Puedo ayudarte a encontrar información sobre reglamentos, trámites, evaluaciones, becas, servicios y otros temas de la vida universitaria.

¿En qué te puedo colaborar hoy?`;

const SUGGESTED_QUESTIONS = [
  '¿Cómo funciona la trica?',
  '¿Dónde está la biblioteca?',
  '¿Cómo solicito una beca?',
  '¿Qué pasa si desapruebo un curso?',
];

export function Chatbot() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryToSend?: string) => {
    const finalQuestion = queryToSend || question.trim();
    if (!finalQuestion) return;

    // Agregar mensaje del usuario
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: finalQuestion },
    ]);

    // Limpiar input
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: finalQuestion }),
      });

      const data = await res.json();

      // Extraer fuentes del response
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
        {
          role: 'assistant',
          content: 'Ocurrió un error al conectar con el servidor.',
        },
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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <ImageWithFallback
              imagePath={images.uccsito.path}
              fallbackSvg={svgFallbacks.uccsito}
              alt="Avatar UCCSito"
              className="w-full h-full rounded-full"
            />
          </div>
          <div>
            <p className="font-bold text-sm">Chatbot UCCSito</p>
            <p className="text-xs text-blue-100">Tu asistente universitario</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="text-xs bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-white font-medium transition-all"
          title="Reiniciar chat"
        >
          🔄 Nuevo
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 opacity-10">
                <ImageWithFallback
                  imagePath={images.uccsito.path}
                  fallbackSvg={svgFallbacks.uccsito}
                  alt="Avatar"
                  className="w-full h-full"
                />
              </div>
              <p className="text-gray-500">Inicia una conversación</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, idx) => (
              <ChatMessage
                key={idx}
                role={m.role}
                content={m.content}
                sources={m.sources}
              />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-2xl rounded-2xl rounded-bl-none px-4 py-3 bg-gray-100 text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">●</div>
                    <div className="animate-pulse animation-delay-100">●</div>
                    <div className="animate-pulse animation-delay-200">●</div>
                  </div>
                  UCCSito está pensando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Preguntas sugeridas (solo al inicio) */}
      {messages.length === 1 && !loading && (
        <div className="px-6 py-4 border-t bg-white">
          <SuggestedQuestions
            questions={SUGGESTED_QUESTIONS}
            onSelectQuestion={handleSend}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribe tu pregunta sobre la universidad..."
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 disabled:bg-gray-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !question.trim()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Presiona Enter o haz clic en enviar
        </p>
      </div>
    </div>
  );
}
