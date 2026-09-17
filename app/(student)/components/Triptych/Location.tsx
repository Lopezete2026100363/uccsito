'use client';
import { useRef, useState, useCallback } from 'react';
import { images, svgFallbacks } from '@/app/config/images';
import { ImageWithFallback } from '../ImageFallback';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export function Location() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const zoomBy = useCallback((delta: number) => {
    setScale((prev) => {
      const next = clamp(prev + delta, MIN_SCALE, MAX_SCALE);
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 0.2 : -0.2);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= MIN_SCALE) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, offsetX: offset.x, offsetY: offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: dragStart.current.offsetX + dx, y: dragStart.current.offsetY + dy });
  };

  const stopDragging = () => setDragging(false);

  const handleDoubleClick = () => {
    setScale((prev) => (prev > MIN_SCALE ? MIN_SCALE : 2));
    setOffset({ x: 0, y: 0 });
  };

  const reset = () => {
    setScale(MIN_SCALE);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📍 Ubicación del Campus UCSS
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => zoomBy(-0.4)}
            disabled={scale <= MIN_SCALE}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Alejar"
          >
            −
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => zoomBy(0.4)}
            disabled={scale >= MAX_SCALE}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Acercar"
          >
            +
          </button>
          <button
            onClick={reset}
            className="ml-1 text-xs font-medium text-blue-600 hover:underline px-2"
          >
            Restablecer
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onDoubleClick={handleDoubleClick}
        className={`relative rounded-lg overflow-hidden bg-gray-100 flex justify-center items-center h-96 border border-gray-200 select-none ${
          scale > MIN_SCALE ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: dragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <ImageWithFallback
            imagePath={images.campusMap.path}
            fallbackSvg={svgFallbacks.campusMap}
            alt={images.campusMap.alt}
            className="w-full h-full object-contain p-4 pointer-events-none"
          />
        </div>

        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-[11px] text-gray-500 px-2 py-1 rounded-md border border-gray-200">
          Doble clic o + / − para zoom · Arrastra para mover
        </div>
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