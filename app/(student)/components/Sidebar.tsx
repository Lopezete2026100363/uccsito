'use client';
import { useState, type ReactElement } from 'react';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from './ImageFallback';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [openTriptico, setOpenTriptico] = useState(true);
  const [openTools, setOpenTools] = useState(true);

  const navButton = (label: string, tab: string, Icon: (props: { className?: string }) => ReactElement) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => onTabChange(tab)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span>{label}</span>
      </button>
    );
  };

  const groupHeader = (
    title: string,
    Icon: (props: { className?: string }) => ReactElement,
    isOpen: boolean,
    onToggle: () => void
  ) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-medium transition-all"
    >
      <span className="flex items-center gap-3">
        <Icon className="w-5 h-5 shrink-0" />
        {title}
      </span>
      <ChevronIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );

  const subNavButton = (label: string, tab: string, Icon: (props: { className?: string }) => ReactElement) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => onTabChange(tab)}
        className={`w-full text-left py-2 px-2 text-sm rounded-lg transition-all flex items-center gap-2 ${
          isActive
            ? 'text-blue-600 font-semibold bg-blue-50'
            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/60'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white text-gray-700 flex flex-col flex-shrink-0 border-r border-gray-100">
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3 px-1">
            Sección principal
          </p>
          <div className="space-y-1.5">
            {navButton('Inicio', 'inicio', HomeIcon)}
            {navButton('Chatbot UCCSito', 'chat', ChatIcon)}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3 px-1">
            Tríptico UCCS
          </p>
          {groupHeader('Tríptico UCCS', BookIcon, openTriptico, () => setOpenTriptico(!openTriptico))}
          {openTriptico && (
            <div className="ml-4 pl-3 border-l border-gray-100 mt-1 space-y-0.5">
              {subNavButton('Ubicación', 'ubicacion', PinIcon)}
              {subNavButton('Servicios', 'servicios', GearIcon)}
              {subNavButton('Orientación Personalizada', 'orientacion', UsersIcon)}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3 px-1">
            APIs externas
          </p>
          {groupHeader('APIs Externas', CloudIcon, openTools, () => setOpenTools(!openTools))}
          {openTools && (
            <div className="ml-4 pl-3 border-l border-gray-100 mt-1 space-y-0.5">
              {subNavButton('Clima', 'clima', CloudIcon)}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3 px-1">
            Módulos adicionales
          </p>
          <div className="space-y-1">
            {subNavButton('Reglamento de Estudios', 'reglamento', DocIcon)}
            {subNavButton('Notas y Evaluaciones', 'notas', ListIcon)}
            {subNavButton('Trámites Académicos', 'tramites', FolderIcon)}
            {subNavButton('Becas y Ayudas Económicas', 'becas', GraduationIcon)}
            {subNavButton('Preguntas Frecuentes', 'faq', HelpIcon)}
          </div>
        </div>
      </nav>

      {/* Footer help card */}
      <div className="p-4">
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 shrink-0">
            <ImageWithFallback
              imagePath={images.uccsito.path}
              fallbackSvg={svgFallbacks.uccsito}
              alt="Avatar UCCSito"
              className="w-full h-full rounded-full"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">¿Necesitas ayuda?</p>
            <p className="text-[11px] text-gray-500">Estamos aquí para apoyarte en todo momento.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* --- Minimal inline icon set (stroke, 24x24, no external deps) --- */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 1 1-3.5-6.6" />
      <path d="M21 3v6h-6" />
      <circle cx="9" cy="12" r="0.5" />
    </svg>
  );
}
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18Z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  );
}
function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17.5" cy="9" r="2.6" />
      <path d="M15 12.3a4.6 4.6 0 0 1 6 4.3" />
    </svg>
  );
}
function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18a4.5 4.5 0 0 1-1-8.9 5.5 5.5 0 0 1 10.7-1.8A4 4 0 0 1 17 18H7Z" />
    </svg>
  );
}
function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}
function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
    </svg>
  );
}
function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}
function GraduationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 9 10-5 10 5-10 5-10-5Z" />
      <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
      <path d="M22 9v6" />
    </svg>
  );
}
function HelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1-1.5 2.2" />
      <path d="M12 17.2h.01" />
    </svg>
  );
}
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
'use client';
import { useState, type ReactElement } from 'react';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from './ImageFallback';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [openTriptico, setOpenTriptico] = useState(true);
  const [openTools, setOpenTools] = useState(true);

  const navButton = (label: string, tab: string, Icon: (props: { className?: string }) => ReactElement) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => onTabChange(tab)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-[#1b1b26] text-cyan-300 shadow-[inset_3px_3px_6px_#08080c,inset_-3px_-3px_6px_#22222e] border border-cyan-500/30'
            : 'text-gray-400 hover:text-cyan-300 hover:bg-[#1b1b26]/60'
        }`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'drop-shadow-[0_0_4px_rgba(34,211,238,0.7)]' : ''}`} />
        <span>{label}</span>
      </button>
    );
  };

  const groupHeader = (
    title: string,
    Icon: (props: { className?: string }) => ReactElement,
    isOpen: boolean,
    onToggle: () => void
  ) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-cyan-300 hover:bg-[#1b1b26]/60 rounded-xl font-medium transition-all"
    >
      <span className="flex items-center gap-3">
        <Icon className="w-5 h-5 shrink-0" />
        {title}
      </span>
      <ChevronIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );

  const subNavButton = (label: string, tab: string, Icon: (props: { className?: string }) => ReactElement) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => onTabChange(tab)}
        className={`w-full text-left py-2 px-2 text-sm rounded-lg transition-all flex items-center gap-2 ${
          isActive
            ? 'text-cyan-300 font-semibold bg-[#1b1b26] shadow-[0_0_8px_rgba(34,211,238,0.25)]'
            : 'text-gray-500 hover:text-cyan-300 hover:bg-[#1b1b26]/50'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-[#0f0f16] text-gray-300 flex flex-col flex-shrink-0 border-r-2 border-black/40">
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="text-[10px] font-bold text-gray-600 tracking-wider uppercase mb-3 px-1">Sección principal</p>
          <div className="space-y-1.5">
            {navButton('Inicio', 'inicio', HomeIcon)}
            {navButton('Chatbot UCCSito', 'chat', ChatIcon)}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-600 tracking-wider uppercase mb-3 px-1">Tríptico UCCS</p>
          {groupHeader('Tríptico UCCS', BookIcon, openTriptico, () => setOpenTriptico(!openTriptico))}
          {openTriptico && (
            <div className="ml-4 pl-3 border-l border-cyan-500/10 mt-1 space-y-0.5">
              {subNavButton('Ubicación', 'ubicacion', PinIcon)}
              {subNavButton('Servicios', 'servicios', GearIcon)}
              {subNavButton('Orientación Personalizada', 'orientacion', UsersIcon)}
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-600 tracking-wider uppercase mb-3 px-1">APIs externas</p>
          {groupHeader('APIs Externas', CloudIcon, openTools, () => setOpenTools(!openTools))}
          {openTools && (
            <div className="ml-4 pl-3 border-l border-cyan-500/10 mt-1 space-y-0.5">
              {subNavButton('Clima', 'clima', CloudIcon)}
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-600 tracking-wider uppercase mb-3 px-1">Módulos adicionales</p>
          <div className="space-y-1">
            {subNavButton('Reglamento de Estudios', 'reglamento', DocIcon)}
            {subNavButton('Notas y Evaluaciones', 'notas', ListIcon)}
            {subNavButton('Trámites Académicos', 'tramites', FolderIcon)}
            {subNavButton('Becas y Ayudas Económicas', 'becas', GraduationIcon)}
            {subNavButton('Preguntas Frecuentes', 'faq', HelpIcon)}
          </div>
        </div>
      </nav>

      <div className="p-4">
        <div className="bg-[#1b1b26] rounded-xl p-4 flex items-center gap-3 shadow-[3px_3px_6px_#08080c,-3px_-3px_6px_#22222e]">
          <div className="w-9 h-9 shrink-0 rounded-full ring-2 ring-cyan-400/40">
            <ImageWithFallback
              imagePath={images.uccsito.path}
              fallbackSvg={svgFallbacks.uccsito}
              alt="Avatar UCCSito"
              className="w-full h-full rounded-full"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-200">¿Necesitas ayuda?</p>
            <p className="text-[10px] text-gray-500">Estamos aquí para apoyarte.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>);
}
function ChatIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 1 1-3.5-6.6" /><path d="M21 3v6h-6" /><circle cx="9" cy="12" r="0.5" /></svg>);
}
function BookIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18Z" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /></svg>);
}
function PinIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>);
}
function GearIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" /></svg>);
}
function UsersIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><circle cx="17.5" cy="9" r="2.6" /><path d="M15 12.3a4.6 4.6 0 0 1 6 4.3" /></svg>);
}
function CloudIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18a4.5 4.5 0 0 1-1-8.9 5.5 5.5 0 0 1 10.7-1.8A4 4 0 0 1 17 18H7Z" /></svg>);
}
function DocIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></svg>);
}
function ListIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></svg>);
}
function FolderIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></svg>);
}
function GraduationIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 9 10-5 10 5-10 5-10-5Z" /><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /><path d="M22 9v6" /></svg>);
}
function HelpIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1-1.5 2.2" /><path d="M12 17.2h.01" /></svg>);
}
function ChevronIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>);
}