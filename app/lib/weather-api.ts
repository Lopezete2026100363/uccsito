/**
 * API DE CLIMA - Open-Meteo
 * ========================
 * No requiere API key. Datos meteorológicos en tiempo real.
 * Endpoint: https://api.open-meteo.com/v1/forecast
 */

export interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  condition: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  tempMin: number;
  tempMax: number;
  cloudiness: number;
  timestamp: Date;
}

// Mapeo de códigos WMO a descripciones en español
const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Cielo despejado',
  1: 'Parcialmente nublado',
  2: 'Nublado',
  3: 'Muy nublado',
  45: 'Niebla',
  48: 'Niebla helada',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna densa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia fuerte',
  71: 'Nieve ligera',
  73: 'Nieve moderada',
  75: 'Nieve fuerte',
  80: 'Aguacero ligero',
  81: 'Aguacero',
  82: 'Aguacero fuerte',
  85: 'Chaparrón de nieve ligero',
  86: 'Chaparrón de nieve',
  95: 'Tormenta',
  96: 'Tormenta con granizo',
  99: 'Tormenta con granizo fuerte',
};

const WMO_EMOJIS: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌧️',
  53: '🌧️',
  55: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '⛈️',
  71: '❄️',
  73: '❄️',
  75: '❄️',
  80: '🌧️',
  81: '⛈️',
  82: '⛈️',
  85: '❄️',
  86: '❄️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

export async function fetchWeather(
  cityName: string,
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,weather_code&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`,
      { cache: 'no-store' }
    );

    if (!response.ok) throw new Error('Error fetching weather');

    const data = await response.json() as any;
    const current = data.current;

    return {
      city: cityName,
      temperature: Math.round(current.temperature_2m * 10) / 10,
      description:
        WMO_DESCRIPTIONS[current.weather_code] || 'Condición desconocida',
      condition: current.weather_code,
      feelsLike: Math.round(current.apparent_temperature * 10) / 10,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      pressure: current.pressure_msl,
      tempMin: Math.round(current.temperature_2m * 10) / 10,
      tempMax: Math.round(current.temperature_2m * 10) / 10,
      cloudiness: 50,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
}

export function getWeatherEmoji(code: number): string {
  return WMO_EMOJIS[code] || '🌤️';
}

// Ciudades predefinidas
export const CITIES = [
  { name: 'Lima', latitude: -12.0464, longitude: -77.0428 },
  { name: 'Puno', latitude: -15.8402, longitude: -70.1317 },
  { name: 'Cusco', latitude: -13.5319, longitude: -71.9753 },
  { name: 'Arequipa', latitude: -16.3988, longitude: -71.5350 },
  { name: 'Trujillo', latitude: -8.1272, longitude: -79.0293 },
  { name: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Tokio', latitude: 35.6762, longitude: 139.6503 },
];
