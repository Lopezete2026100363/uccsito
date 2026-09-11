'use client';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from './ImageFallback';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
      <div className="max-w-full flex items-center justify-between">
        {/* Logo UCSS lado izquierdo */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12">
            <ImageWithFallback
              imagePath={images.ucssLogo.path}
              fallbackSvg={svgFallbacks.ucssLogo}
              alt={images.ucssLogo.alt}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="border-l border-gray-200 pl-4">
            <p className="text-xs font-semibold text-gray-500 tracking-wide">
              UNIVERSIDAD CATÓLICA
            </p>
            <p className="text-sm font-bold text-gray-900">SEDES SAPIENTIAE</p>
          </div>
        </div>

        {/* Centro: Identidad principal */}
        <div className="flex-1 flex justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-black text-blue-600">UCCSito</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Tu asistente virtual universitario
            </p>
          </div>
        </div>

        {/* Espacio derecha (reservado para futuras acciones) */}
        <div className="w-16"></div>
      </div>
    </header>
  );
}
