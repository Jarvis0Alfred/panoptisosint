import { NextResponse } from "next/server";

export const revalidate = 86400;

export async function GET() {
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat",
            {
                headers: { "User-Agent": "WorldWideView/1.0" },
                next: { revalidate },
            }
        );

        if (response.ok) {
            const text = await response.text();
            const airports = text.split("\n").slice(0, 200).map((line, i) => {
                const parts = line.split(",");
                if (parts.length < 8) return null;
                const lat = Number(parts[6]?.replace(/"/g, ""));
                const lon = Number(parts[7]?.replace(/"/g, ""));
                if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
                return {
                    id: parts[4]?.replace(/"/g, "") || String(i),
                    name: parts[1]?.replace(/"/g, ""),
                    latitude: lat,
                    longitude: lon,
                };
            }).filter(Boolean);
            return NextResponse.json({ airports });
        }
    } catch {}

    const demo = [
        { id: "ATH", name: "Athens International", latitude: 37.9364, longitude: 23.9443 },
        { id: "LHR", name: "Heathrow", latitude: 51.4700, longitude: -0.4543 },
        { id: "JFK", name: "JFK International", latitude: 40.6413, longitude: -73.7781 },
        { id: "NRT", name: "Narita International", latitude: 35.7647, longitude: 140.3864 },
        { id: "DXB", name: "Dubai International", latitude: 25.2532, longitude: 55.3657 },
    ];
    return NextResponse.json({ airports: demo });
}
