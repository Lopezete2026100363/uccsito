'use client';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from '../ImageFallback';

export function Location() {
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        📍 Ubicación del Campus UCSS
      </h2>

      <div className="rounded-lg overflow-hidden bg-gray-100 flex justify-center items-center h-96 border border-gray-200">
        <ImageWithFallback
          imagePath={images.campusMap.path}
          fallbackSvg={svgFallbacks.campusMap}
          alt={images.campusMap.alt}
          className="w-full h-full object-contain p-4"
        />
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
        <p className="text-sm text-blue-800">
          Haz zoom para explorar cada pabellón. Consulta con los servicios UCSS para
          obtener indicaciones más precisas.
        </p>
      </div>
    </div>
  );
}
