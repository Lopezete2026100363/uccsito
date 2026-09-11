'use client';
import { useState } from 'react';

interface ImageWithFallbackProps {
  imagePath: string;
  fallbackSvg: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * COMPONENTE PARA MOSTRAR IMÁGENES CON FALLBACK SVG
 * Si la imagen no carga, muestra un SVG elegante en su lugar
 */
export function ImageWithFallback({
  imagePath,
  fallbackSvg,
  alt,
  className = '',
  width,
  height,
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div
        className={className}
        style={{ width, height }}
        dangerouslySetInnerHTML={{ __html: fallbackSvg }}
      />
    );
  }

  return (
    <img
      src={imagePath}
      alt={alt}
      onError={() => setImageError(true)}
      className={className}
      width={width}
      height={height}
    />
  );
}
