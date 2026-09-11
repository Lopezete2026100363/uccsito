'use client';
import { useState } from 'react';
import { academicModules, faqs } from '@/app/config/academic';

interface AcademicCenterProps {
  activeModule?: string;
  onQuestionSelect?: (question: string) => void;
}

export function AcademicCenter({
  activeModule,
  onQuestionSelect,
}: AcademicCenterProps) {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Módulos */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          📚 Centro Académico
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {academicModules.map((module) => (
            <div
              key={module.id}
              className="bg-white border border-gray-200 rounded-lg p-5 text-center hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition">
                {module.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">
                {module.title}
              </h3>
              <p className="text-xs text-gray-600">{module.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          ❓ Preguntas Frecuentes
        </h3>

        <div className="space-y-2">
          {faqs.map((faq) => (
            <button
              key={faq.id}
              onClick={() => {
                setExpandedFaq(expandedFaq === faq.id ? null : faq.id);
                if (onQuestionSelect) {
                  onQuestionSelect(faq.question);
                }
              }}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {faq.question}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{faq.category}</p>
                </div>
                <span
                  className={`text-gray-400 group-hover:text-blue-600 transition ${
                    expandedFaq === faq.id ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            ¿No encontraste tu pregunta? Consulta directamente con{' '}
            <span className="font-semibold text-blue-600">UCCSito</span> en el
            chatbot.
          </p>
        </div>
      </div>
    </div>
  );
}
