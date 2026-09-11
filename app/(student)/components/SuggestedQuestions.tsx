'use client';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export function SuggestedQuestions({
  questions,
  onSelectQuestion,
}: SuggestedQuestionsProps) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Preguntas sugeridas
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {questions.map((question, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(question)}
            className="text-left p-3 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-sm text-gray-700 hover:text-blue-700 transition-all group"
          >
            <span className="flex items-center gap-2">
              <span className="text-xs text-gray-400 group-hover:text-blue-400">
                →
              </span>
              {question}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
