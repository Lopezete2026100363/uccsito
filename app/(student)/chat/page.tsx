'use client';
import { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Chatbot } from '../components/Chatbot';
import { Location } from '../components/Triptych/Location';
import { Services } from '../components/Triptych/Services';
import { Orientation } from '../components/Triptych/Orientation';
import { AcademicCenter } from '../components/AcademicCenter';
import { Weather } from '../components/Weather';

type TabType = 'inicio' | 'chat' | 'ubicacion' | 'servicios' | 'orientacion' | 'reglamento' | 'notas' | 'tramites' | 'becas' | 'faq' | 'clima';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Bienvenido a UCCSito
              </h1>
              <p className="text-lg text-gray-600">
                Tu asistente virtual universitario
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {[
                {
                  icon: '🤖',
                  title: 'Chatbot UCCSito',
                  desc: 'Haz preguntas sobre temas académicos',
                  action: 'chat',
                },
                {
                  icon: '📍',
                  title: 'Mapa del Campus',
                  desc: 'Ubícate en la universidad',
                  action: 'ubicacion',
                },
                {
                  icon: '🏥',
                  title: 'Servicios UCSS',
                  desc: 'Descubre todos nuestros servicios',
                  action: 'servicios',
                },
                {
                  icon: '🎓',
                  title: 'Orientación',
                  desc: 'Contacta con tu facultad',
                  action: 'orientacion',
                },
                {
                  icon: '📚',
                  title: 'Centro Académico',
                  desc: 'Reglamento, trámites y más',
                  action: 'reglamento',
                },
                {
                  icon: '🌤️',
                  title: 'Clima',
                  desc: 'Información meteorológica',
                  action: 'clima',
                },
              ].map((item: any) => (
                <button
                  key={item.action}
                  onClick={() => setActiveTab(item.action as TabType)}
                  className="bg-white border border-gray-200 rounded-lg p-6 text-left hover:shadow-lg hover:border-blue-400 transition-all group"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'chat':
        return <Chatbot />;
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
        return <AcademicCenter />;
      case 'clima':
        return <Weather />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as TabType)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
