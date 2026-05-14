import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
    try {
        const response = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true",
            {
                headers: { "User-Agent": "WorldWideView/1.0", "Accept": "application/json" },
                next: { revalidate },
            }
        );
        if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
                weather: [{
                    id: "WX001",
                    name: `Temp: ${data.current_weather?.temperature}°C`,
                    latitude: 52.52,
                    longitude: 13.41,
                }]
            });
        }
    } catch {}

    const demo = [
        { id: "WX001", name: "Hurricane (Demo)", latitude: 25.0, longitude: -80.0 },
        { id: "WX002", name: "Tornado Warning (Demo)", latitude: 35.5, longitude: -97.5 },
        { id: "WX003", name: "Flash Flood (Demo)", latitude: 30.0, longitude: -90.0 },
        { id: "WX004", name: "Severe Storm (Demo)", latitude: 40.0, longitude: -100.0 },
        { id: "WX005", name: "Heat Wave (Demo)", latitude: 33.0, longitude: -112.0 },
    ];
    return NextResponse.json({ weather: demo });
}
