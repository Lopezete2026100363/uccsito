'use client';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from './ImageFallback';

export function Header() {
  return (
    <header className="relative bg-white border-b border-gray-100 px-6 py-3 overflow-hidden">
      {/* Decoración sutil de fondo */}
      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-white via-white to-blue-50/40 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-6">
        {/* Izquierda: menú + logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Abrir menú">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-baseline gap-1">
            <h1 className="text-xl font-extrabold text-blue-700">UCCSito</h1>
            <svg className="w-4 h-4 text-blue-400 -translate-y-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 14 9 21 11 14 13 12 20 10 13 3 11 10 9Z" />
            </svg>
          </div>
        </div>

        {/* Centro: barra de búsqueda */}
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5">
            <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Buscar en UCCSito..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            <kbd className="hidden sm:inline text-[11px] font-medium text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
              Ctrl + K
            </kbd>
          </div>
        </div>

        {/* Derecha: logo institucional */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="w-11 h-11">
            <ImageWithFallback
              imagePath={images.ucssLogo.path}
              fallbackSvg={svgFallbacks.ucssLogo}
              alt={images.ucssLogo.alt}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-right leading-tight">
            <p className="text-xs font-semibold text-gray-800">Universidad Católica</p>
            <p className="text-xs font-semibold text-gray-800">Sedes Sapientiae</p>
          </div>
        </div>
      </div>
    </header>
  );
}
