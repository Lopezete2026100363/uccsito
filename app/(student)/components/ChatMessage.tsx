'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ filename?: string; titulo?: string }>;
}

export function ChatMessage({ role, content, sources }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/30 rounded-br-sm shadow-[0_0_10px_rgba(34,211,238,0.15)]'
            : 'bg-[#1b1b26] text-gray-200 rounded-bl-sm border border-white/5'
        }`}
      >
        {content}

        {!isUser && sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-gray-500 font-semibold mb-1">📚 Fuentes:</p>
            <ul className="text-xs text-gray-500 space-y-0.5">
              {sources.map((source, idx) => (
                <li key={idx}>• {source.filename || source.titulo || 'Documento oficial'}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}