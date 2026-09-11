'use client';
import { useState, useEffect } from 'react';
import { fetchWeather, CITIES, getWeatherEmoji, type WeatherData } from '@/app/lib/weather-api';

export function Weather() {
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
      setError('No pudimos obtener el clima en este momento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const handleCityChange = (city: typeof CITIES[0]) => {
    setSelectedCity(city);
    loadWeather(city);
  };

  if (loading && !weather) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">🌤️ Clima</h2>
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Obteniendo información del clima...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">🌤️ Clima</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadWeather()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tarjeta principal del clima */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-1">{weather.city}</h2>
            <p className="text-blue-100 text-sm">Actualizado hace unos momentos</p>
          </div>
          <button
            onClick={() => loadWeather()}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition disabled:opacity-50"
          >
            ↻
          </button>
        </div>

        {/* Temperatura y condición principal */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-6xl font-black mb-2">
              {weather.temperature}°C
            </div>
            <p className="text-lg text-blue-100">{weather.description}</p>
          </div>
          <div className="text-7xl opacity-80">
            {getWeatherEmoji(weather.condition)}
          </div>
        </div>

        {/* Grid de datos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-xs font-semibold mb-1">Sensación</p>
            <p className="text-2xl font-bold">{weather.feelsLike}°C</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-xs font-semibold mb-1">Humedad</p>
            <p className="text-2xl font-bold">{weather.humidity}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-xs font-semibold mb-1">Viento</p>
            <p className="text-2xl font-bold">{weather.windSpeed} km/h</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-xs font-semibold mb-1">Presión</p>
            <p className="text-2xl font-bold">{Math.round(weather.pressure)} mb</p>
          </div>
        </div>
      </div>

      {/* Selector de ciudades */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Ciudades disponibles
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => handleCityChange(city)}
              disabled={loading}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                selectedCity.name === city.name
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
