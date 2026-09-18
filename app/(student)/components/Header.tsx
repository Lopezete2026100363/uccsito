'use client';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from './ImageFallback';

export function Header() {
  return (
    <header className="relative bg-[#14141c] border-b-2 border-black/40 px-6 py-3">
      <div className="flex items-center justify-between gap-6">
        {/* Izquierda: menú + logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1b1b26] text-cyan-300 shadow-[3px_3px_6px_#0a0a0f,-3px_-3px_6px_#22222e] hover:shadow-[0_0_10px_rgba(34,211,238,0.5)] active:scale-95 transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1
            className="text-lg text-cyan-300 tracking-wide"
            style={{ fontFamily: "'Press Start 2P', system-ui", textShadow: '0 0 8px rgba(34,211,238,0.6)' }}
          >
            UCCSito
          </h1>
        </div>

        {/* Centro: búsqueda */}
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-2 bg-[#0f0f16] rounded-full px-4 py-2.5 shadow-[inset_3px_3px_6px_#08080c,inset_-3px_-3px_6px_#1a1a24] border border-cyan-500/10">
            <svg className="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Buscar en UCCSito..."
              className="flex-1 bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-500"
            />
            <kbd className="hidden sm:inline text-[10px] font-medium text-cyan-400 bg-black/40 border border-cyan-500/20 rounded px-1.5 py-0.5">
              Ctrl + K
            </kbd>
          </div>
        </div>

        {/* Derecha: logo institucional */}
        <div className="hidden md:flex items-center gap-3 shrink-0 bg-[#1b1b26] rounded-xl px-3 py-1.5 shadow-[3px_3px_6px_#0a0a0f,-3px_-3px_6px_#22222e]">
          <div className="w-9 h-9">
            <ImageWithFallback
              imagePath={images.ucssLogo.path}
              fallbackSvg={svgFallbacks.ucssLogo}
              alt={images.ucssLogo.alt}
              className="w-full h-full object-contain rounded"
            />
          </div>
          <div className="text-right leading-tight">
            <p className="text-[10px] font-semibold text-gray-300">Universidad Católica</p>
            <p className="text-[10px] font-semibold text-cyan-300">Sedes Sapientiae</p>
          </div>
        </div>
      </div>
    </header>
  );
}