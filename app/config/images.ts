/**
 * CONFIGURACIÓN CENTRALIZADA DE IMÁGENES
 * =======================================
 * Todas las imágenes institucionales se refieren a /public/images/
 * Se incluyen fallbacks SVG elegantes por si la imagen no existe
 */

export const images = {
  // Avatar de UCCSito
  // Ruta: /public/images/uccsito-avatar.png
  // Tamaño recomendado: 200x200px, fondo transparente
  uccsito: {
    path: '/images/uccsito-avatar.png',
    alt: 'Avatar de UCCSito',
    fallback: true,
  },

  // Logo oficial de la UCSS
  // Ruta: /public/images/ucss-logo.png
  // Tamaño recomendado: 200x80px, alto contraste
  ucssLogo: {
    path: '/images/ucss-logo.png',
    alt: 'Logo Universidad Católica Sedes Sapientiae',
    fallback: true,
  },

  // Imagen/Banner institucional del campus
  // Ruta: /public/images/ucss-campus.jpg
  // Tamaño recomendado: 1200x600px
  campusImage: {
    path: '/images/ucss-campus.jpg',
    alt: 'Campus UCSS',
    fallback: true,
  },

  // Mapa del campus (o plano)
  // Ruta: /public/images/mapa-campus.png
  // Tamaño recomendado: 1000x1000px o más
  campusMap: {
    path: '/images/mapa-campus.png',
    alt: 'Mapa del Campus UCSS',
    fallback: true,
  },
};

/**
 * SVG FALLBACKS ELEGANTES
 * =======================
 * Se usan si la imagen correspondiente no existe
 */

export const svgFallbacks = {
  // Avatar simple y moderno para UCCSito
  uccsito: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="100" fill="#0066ff" opacity="0.08"/>
      <circle cx="100" cy="100" r="95" fill="none" stroke="#0066ff" stroke-width="2"/>
      <circle cx="100" cy="70" r="35" fill="#0066ff"/>
      <circle cx="88" cy="65" r="5" fill="white"/>
      <circle cx="112" cy="65" r="5" fill="white"/>
      <path d="M 88 80 Q 100 85 112 80" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="75" y="110" width="50" height="50" rx="8" fill="#0066ff"/>
      <line x1="115" y1="50" x2="120" y2="35" stroke="#0066ff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="120" cy="32" r="4" fill="#0066ff"/>
      <line x1="85" y1="50" x2="80" y2="35" stroke="#0066ff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="80" cy="32" r="4" fill="#0066ff"/>
      <path d="M 100 125 L 95 130 L 95 120 Z" fill="white" opacity="0.6"/>
    </svg>
  `,

  ucssLogo: `
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="80" fill="white" stroke="#003d99" stroke-width="2" rx="4"/>
      <g transform="translate(30, 20)">
        <rect x="8" y="0" width="4" height="30" fill="#003d99"/>
        <rect x="0" y="12" width="20" height="4" fill="#003d99"/>
        <circle cx="10" cy="32" r="5" fill="#003d99"/>
      </g>
      <text x="60" y="55" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#003d99">UCSS</text>
    </svg>
  `,

  campusImage: `
    <svg viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#87ceeb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0f6ff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="600" fill="url(#skyGradient)"/>
      <rect y="400" width="1200" height="200" fill="#2d7f2d"/>
      <rect x="100" y="250" width="200" height="180" fill="#8b4513" stroke="#654321" stroke-width="2"/>
      <rect x="350" y="200" width="250" height="220" fill="#a0522d" stroke="#654321" stroke-width="2"/>
      <rect x="700" y="280" width="180" height="140" fill="#8b4513" stroke="#654321" stroke-width="2"/>
      <rect x="120" y="270" width="30" height="30" fill="#87ceeb"/>
      <rect x="170" y="270" width="30" height="30" fill="#87ceeb"/>
      <rect x="120" y="320" width="30" height="30" fill="#87ceeb"/>
      <rect x="170" y="320" width="30" height="30" fill="#87ceeb"/>
      <text x="600" y="320" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#003d99" text-anchor="middle">UCSS Campus</text>
      <text x="600" y="360" font-family="Arial, sans-serif" font-size="14" fill="#555" text-anchor="middle">Imagen disponible próximamente</text>
    </svg>
  `,

  campusMap: `
    <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f8ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e6f2ff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1000" height="1000" fill="url(#mapGradient)"/>
      <rect x="100" y="100" width="200" height="250" fill="#ddd" stroke="#666" stroke-width="2"/>
      <text x="200" y="235" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#333">P1</text>
      <rect x="380" y="100" width="200" height="250" fill="#ddd" stroke="#666" stroke-width="2"/>
      <text x="480" y="235" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#333">P2</text>
      <rect x="660" y="100" width="200" height="250" fill="#ddd" stroke="#666" stroke-width="2"/>
      <text x="760" y="235" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#333">P3</text>
      <rect x="380" y="450" width="200" height="250" fill="#ddd" stroke="#666" stroke-width="2"/>
      <text x="480" y="585" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#333">P4</text>
      <line x1="300" y1="500" x2="700" y2="500" stroke="#ccc" stroke-width="8"/>
      <line x1="480" y1="0" x2="480" y2="900" stroke="#ccc" stroke-width="8"/>
      <text x="50" y="900" font-family="Arial" font-size="12" fill="#666">P1: Pabellón 1 | P2: Pabellón 2 | P3: Pabellón 3 | P4: Pabellón 4</text>
    </svg>
  `,
};
