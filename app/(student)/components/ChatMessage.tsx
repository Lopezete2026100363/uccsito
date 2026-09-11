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
            ? 'bg-blue-600 text-white rounded-br-none shadow-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
        }`}
      >
        {content}

        {!isUser && sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-xs text-gray-600 font-semibold mb-1">
              📚 Fuentes:
            </p>
            <ul className="text-xs text-gray-700 space-y-0.5">
              {sources.map((source, idx) => (
                <li key={idx} className="text-gray-600">
                  • {source.filename || source.titulo || 'Documento oficial'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
