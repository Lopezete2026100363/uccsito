
'use client';
import { useState } from 'react';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from './ImageFallback';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [openTriptico, setOpenTriptico] = useState(true);
  const [openAcademic, setOpenAcademic] = useState(true);
  const [openTools, setOpenTools] = useState(true);

  const navButton = (
    label: string,
    tab: string,
    icon: string,
    isActive: boolean
  ) => (
    <button
      onClick={() => onTabChange(tab)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const collapsibleGroup = (
    title: string,
    icon: string,
    isOpen: boolean,
    onToggle: () => void,
    children: React.ReactNode
  ) => (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg font-medium transition-all"
      >
        <span className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          {title}
        </span>
        <span className="text-xs">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      {isOpen && <div className="ml-4 pl-3 border-l border-gray-600 mt-1 space-y-1">
        {children}
      </div>}
    </div>
  );

  const subNavButton = (label: string, tab: string, icon: string) => (
    <button
      onClick={() => onTabChange(tab)}
      className={`w-full text-left py-2 px-2 text-sm rounded-md transition-all ${
        activeTab === tab
          ? 'text-blue-400 font-semibold bg-gray-700/50'
          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
      }`}
    >
      <span className="flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </span>
    </button>
  );

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 border-r border-gray-800">
      {/* Header del Sidebar */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8">
            <ImageWithFallback
              imagePath={images.uccsito.path}
              fallbackSvg={svgFallbacks.uccsito}
              alt="Avatar UCCSito"
              className="w-full h-full rounded-full"
            />
          </div>
          <div>
            <p className="text-sm font-bold">UCCSito</p>
            <p className="text-xs text-gray-400">Tu asistente virtual</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* SECCIÓN PRINCIPAL */}
        <div>
          <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-3">
            Principal
          </p>
          <div className="space-y-2">
            {navButton('Inicio', 'inicio', '🏠', activeTab === 'inicio')}
            {navButton('Chatbot UCCSito', 'chat', '🤖', activeTab === 'chat')}
          </div>
        </div>

        {/* TRÍPTICO UCSS */}
        <div>
          <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-3">
            Tríptico UCSS
          </p>
          {collapsibleGroup(
            'Tríptico',
            '📖',
            openTriptico,
            () => setOpenTriptico(!openTriptico),
            <>
              {subNavButton('Ubicación', 'ubicacion', '📍')}
              {subNavButton('Servicios', 'servicios', '🏥')}
              {subNavButton('Orientación', 'orientacion', '🎓')}
            </>
          )}
        </div>

        {/* CENTRO ACADÉMICO */}
        <div>
          <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-3">
            Centro Académico
          </p>
          {collapsibleGroup(
            'Módulos',
            '📚',
            openAcademic,
            () => setOpenAcademic(!openAcademic),
            <>
              {subNavButton('Reglamento', 'reglamento', '📚')}
              {subNavButton('Notas', 'notas', '📝')}
              {subNavButton('Trámites', 'tramites', '📄')}
              {subNavButton('Becas', 'becas', '🎓')}
              {subNavButton('FAQ', 'faq', '❓')}
            </>
          )}
        </div>

        {/* HERRAMIENTAS */}
        <div>
          <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-3">
            Herramientas
          </p>
          {collapsibleGroup(
            'Utilidades',
            '🔧',
            openTools,
            () => setOpenTools(!openTools),
            <>
              {subNavButton('Clima', 'clima', '🌤️')}
            </>
          )}
        </div>
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        <p>UCCSito v1.0</p>
      </div>
    </aside>
  );
}
