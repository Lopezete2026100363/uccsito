'use client';
import { academicModules, faqs } from '@/app/config/academic';

interface AcademicCenterProps {
  activeModule?: string;
  onQuestionSelect?: (question: string) => void;
}

export function AcademicCenter({
  activeModule,
  onQuestionSelect,
}: AcademicCenterProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Módulos */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          📚 Centro Académico
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Haz clic en un módulo para preguntarle a UCCSito sobre ese tema.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {academicModules.map((module) => (
            <button
              key={module.id}
              onClick={() => onQuestionSelect?.(module.suggestedQuestions[0])}
              className="text-left bg-white border border-gray-200 rounded-lg p-5 text-center hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition">
                {module.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">
                {module.title}
              </h3>
              <p className="text-xs text-gray-600 mb-3">{module.description}</p>

              <div className="pt-3 border-t border-gray-100 text-left space-y-1">
                {module.suggestedQuestions.slice(0, 2).map((q) => (
                  <p
                    key={q}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuestionSelect?.(q);
                    }}
                    className="text-[11px] text-blue-600 hover:underline truncate"
                  >
                    {q}
                  </p>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          ❓ Preguntas Frecuentes
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Haz clic en cualquier pregunta para que UCCSito te responda al instante.
        </p>

        <div className="space-y-2">
          {faqs.map((faq) => (
            <button
              key={faq.id}
              onClick={() => onQuestionSelect?.(faq.question)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {faq.question}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{faq.category}</p>
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 transition">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            ¿No encontraste tu pregunta? Escríbele directo a{' '}
            <span className="font-semibold text-blue-600">UCCSito</span> en el
            chat.
          </p>
        </div>
      </div>
    </div>
  );
}
