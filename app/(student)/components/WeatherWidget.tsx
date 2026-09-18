'use client';
import { useState, useEffect } from 'react';
import { fetchWeather, CITIES, getWeatherEmoji, type WeatherData } from '@/app/lib/weather-api';

export function WeatherWidget() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async (city = selectedCity) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(city.name, city.latitude, city.longitude);
      setWeather(data);
    } catch (err) {
      setError('No se pudo obtener el clima');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCityChange = (city: (typeof CITIES)[0]) => {
    setSelectedCity(city);
    loadWeather(city);
  };

  return (
    <div className="bg-[#14141c] rounded-2xl border border-cyan-500/10 shadow-[6px_6px_14px_#08080c,-6px_-6px_14px_#1c1c28] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <CloudIcon className="w-4 h-4" />
          Clima en {weather?.city ?? selectedCity.name}
        </div>
        <button
          onClick={() => loadWeather()}
          disabled={loading}
          className="text-gray-500 hover:text-cyan-300 transition-colors disabled:opacity-50"
          aria-label="Actualizar"
        >
          <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !weather && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
        </div>
      )}

      {error && !weather && <p className="text-xs text-gray-500 py-4 text-center">{error}</p>}

      {weather && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-white" style={{ textShadow: '0 0 10px rgba(34,211,238,0.4)' }}>
                {weather.temperature}°C
              </p>
              <p className="text-sm text-gray-400 capitalize">{weather.description}</p>
              <p className="text-xs text-gray-600 mt-0.5">Sensación térmica: {weather.feelsLike}°C</p>
            </div>
            <div className="text-5xl drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">{getWeatherEmoji(weather.condition)}</div>
          </div>

          <div className="space-y-2 text-sm border-t border-white/5 pt-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Humedad</span>
              <span className="font-medium text-gray-200">{weather.humidity}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Viento</span>
              <span className="font-medium text-gray-200">{weather.windSpeed} km/h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Presión</span>
              <span className="font-medium text-gray-200">{Math.round(weather.pressure)} hPa</span>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-3 gap-2">
        {CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => handleCityChange(city)}
            disabled={loading}
            className={`text-[11px] font-medium py-1.5 rounded-lg transition-all duration-150 ${
              selectedCity.name === city.name
                ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)] border border-cyan-500/30'
                : 'bg-black/20 text-gray-500 hover:text-gray-300'
            } disabled:opacity-50`}
          >
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18a4.5 4.5 0 0 1-1-8.9 5.5 5.5 0 0 1 10.7-1.8A4 4 0 0 1 17 18H7Z" /></svg>);
}
function RefreshIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 21v-5h5" /></svg>);
}