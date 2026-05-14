import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (!apiKey) {
        console.warn("[WeatherTracker] No OPENWEATHERMAP_API_KEY set, serving demo data");
        return NextResponse.json({ weather: getDemoWeather() });
    }

    try {
        // Fetch severe weather alerts from multiple cities around the world
        const cities = [
            { lat: 40.7, lon: -74.0, name: "New York" },
            { lat: 51.5, lon: -0.1, name: "London" },
            { lat: 35.7, lon: 139.7, name: "Tokyo" },
            { lat: 37.9, lon: 23.7, name: "Athens" },
            { lat: -33.9, lon: 18.4, name: "Cape Town" },
            { lat: 28.6, lon: 77.2, name: "Delhi" },
            { lat: -23.5, lon: -46.6, name: "São Paulo" },
            { lat: 55.7, lon: 37.6, name: "Moscow" },
        ];

        const weatherPromises = cities.map(async (city) => {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`,
                    {
                        headers: { "User-Agent": "WorldWideView/1.0" },
                        next: { revalidate: 300 },
                    }
                );
                if (!response.ok) return null;
                const data = await response.json();
                return {
                    id: `WX-${city.name.replace(/\s/g, "")}`,
                    name: `${city.name}: ${data.weather?.[0]?.main || "N/A"} ${Math.round(data.main?.temp || 0)}°C`,
                    latitude: city.lat,
                    longitude: city.lon,
                    temp: data.main?.temp,
                    description: data.weather?.[0]?.description,
                    wind_speed: data.wind?.speed,
                    humidity: data.main?.humidity,
                };
            } catch {
                return null;
            }
        });

        const results = (await Promise.all(weatherPromises)).filter(Boolean);
        
        if (results.length > 0) {
            return NextResponse.json({ weather: results });
        }
    } catch (error: any) {
        console.error("[WeatherTracker] Error:", error);
    }

    return NextResponse.json({ weather: getDemoWeather() });
}

function getDemoWeather() {
    return [
        { id: "WX001", name: "Hurricane (Demo)", latitude: 25.0, longitude: -80.0, temp: 28, description: "severe storm", wind_speed: 45 },
        { id: "WX002", name: "Tornado Warning (Demo)", latitude: 35.5, longitude: -97.5, temp: 22, description: "tornado risk", wind_speed: 30 },
        { id: "WX003", name: "Flash Flood (Demo)", latitude: 30.0, longitude: -90.0, temp: 26, description: "heavy rain", wind_speed: 15 },
        { id: "WX004", name: "Severe Storm (Demo)", latitude: 40.0, longitude: -100.0, temp: 18, description: "thunderstorm", wind_speed: 25 },
        { id: "WX005", name: "Heat Wave (Demo)", latitude: 33.0, longitude: -112.0, temp: 42, description: "extreme heat", wind_speed: 5 },
    ];
}
