'use client';
import { useState, type ReactElement } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Chatbot } from '../components/Chatbot';
import { Location } from '../components/Triptych/Location';
import { Services } from '../components/Triptych/Services';
import { Orientation } from '../components/Triptych/Orientation';
import { AcademicCenter } from '../components/AcademicCenter';
import { Weather } from '../components/Weather';
import { WeatherWidget } from '../components/WeatherWidget';

type TabType = 'inicio' | 'chat' | 'ubicacion' | 'servicios' | 'orientacion' | 'reglamento' | 'notas' | 'tramites' | 'becas' | 'faq' | 'clima';

const EXPLORE_CARDS: Array<{ title: string; desc: string; action: TabType; icon: ReactElement; tint: string }> = [
  {
    title: 'Chatbot UCCSito',
    desc: 'Consulta sobre el reglamento, trámites, notas y más.',
    action: 'chat',
    tint: 'bg-emerald-50 text-emerald-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a8 8 0 1 1-3.5-6.6" /><path d="M21 3v6h-6" />
      </svg>
    ),
  },
  {
    title: 'Tríptico UCCS',
    desc: 'Ubicación, servicios y orientación personalizada.',
    action: 'ubicacion',
    tint: 'bg-violet-50 text-violet-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18Z" />
      </svg>
    ),
  },
  {
    title: 'APIs Externas',
    desc: 'Clima en tiempo real y más servicios.',
    action: 'clima',
    tint: 'bg-sky-50 text-sky-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 18a4.5 4.5 0 0 1-1-8.9 5.5 5.5 0 0 1 10.7-1.8A4 4 0 0 1 17 18H7Z" />
      </svg>
    ),
  },
  {
    title: 'Módulos Académicos',
    desc: 'Reglamento, notas, trámites y becas.',
    action: 'reglamento',
    tint: 'bg-amber-50 text-amber-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" /><path d="M14 2v6h6" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  const askUCCSito = (question: string) => {
    setPendingQuestion(question);
    setActiveTab('chat');
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'inicio':
      case 'chat':
        return (
          <Chatbot
            initialQuestion={pendingQuestion}
            onInitialQuestionConsumed={() => setPendingQuestion(null)}
          />
        );
      case 'ubicacion':
        return <Location />;
      case 'servicios':
        return <Services />;
      case 'orientacion':
        return <Orientation />;
      case 'reglamento':
      case 'notas':
      case 'tramites':
      case 'becas':
      case 'faq':
        return <AcademicCenter onQuestionSelect={askUCCSito} />;
      case 'clima':
        return <Weather />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f7fb] overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabType)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
            {/* Columna principal */}
            <div>{renderMainContent()}</div>

            {/* Columna lateral derecha */}
            <div className="space-y-6">
              <WeatherWidget />

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Accesos rápidos</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('ubicacion')}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">Mapa del Campus</p>
                      <p className="text-xs text-gray-400">Ubicación y distribución</p>
                    </div>
                    <span className="text-gray-300">›</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('servicios')}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">Servicios UCSS</p>
                      <p className="text-xs text-gray-400">Servicios para tu bienestar</p>
                    </div>
                    <span className="text-gray-300">›</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orientacion')}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">Orientación Personalizada</p>
                      <p className="text-xs text-gray-400">Facultades y contacto</p>
                    </div>
                    <span className="text-gray-300">›</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-800 to-blue-950 text-white p-5 min-h-[140px] flex flex-col justify-end">
                <p className="text-xs font-medium text-blue-200 mb-1">UCSS | Más que una universidad, una comunidad.</p>
                <p className="text-lg font-bold leading-tight">Tu futuro empieza aquí</p>
              </div>
            </div>
          </div>

          {/* Explora más */}
          <div className="max-w-[1400px] mx-auto mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Explora más en UCCSito</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXPLORE_CARDS.map((card) => (
                <button
                  key={card.title}
                  onClick={() => setActiveTab(card.action)}
                  className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.tint}`}>
                    {card.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{card.title}</p>
                  <p className="text-xs text-gray-500 mb-3">{card.desc}</p>
                  <span className="text-blue-600 text-sm">→</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
