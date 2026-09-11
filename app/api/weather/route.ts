import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const cities = {
  Lima: { latitude: -12.0464, longitude: -77.0428, country: "Perú" },
  Puno: { latitude: -15.8402, longitude: -70.0219, country: "Perú" },
  Cusco: { latitude: -13.5319, longitude: -71.9675, country: "Perú" },
  Arequipa: { latitude: -16.409, longitude: -71.5375, country: "Perú" },
  Trujillo: { latitude: -8.1116, longitude: -79.0287, country: "Perú" },
  Madrid: { latitude: 40.4168, longitude: -3.7038, country: "España" },
  Tokio: { latitude: 35.6762, longitude: 139.6503, country: "Japón" },
} as const;

type CityName = keyof typeof cities;

export async function GET(req: NextRequest) {
  try {
    const requested = req.nextUrl.searchParams.get("city") ?? "Lima";
    if (!(requested in cities)) return NextResponse.json({ error: "Ciudad no admitida." }, { status: 400 });
    const city = requested as CityName;
    const place = cities[city];
    const params = new URLSearchParams({
      latitude: String(place.latitude), longitude: String(place.longitude),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,surface_pressure,wind_speed_10m",
      daily: "temperature_2m_max,temperature_2m_min", timezone: "auto", forecast_days: "1",
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Open-Meteo respondió ${response.status}`);
    const data = await response.json();
    return NextResponse.json({
      city, country: place.country, updatedAt: data.current?.time,
      temperature: data.current?.temperature_2m, apparent: data.current?.apparent_temperature,
      humidity: data.current?.relative_humidity_2m, wind: data.current?.wind_speed_10m,
      pressure: data.current?.surface_pressure, clouds: data.current?.cloud_cover,
      weatherCode: data.current?.weather_code, min: data.daily?.temperature_2m_min?.[0], max: data.daily?.temperature_2m_max?.[0],
    });
  } catch (error) {
    console.error("/api/weather", error);
    return NextResponse.json({ error: "No pudimos obtener el clima en este momento." }, { status: 502 });
  }
}
