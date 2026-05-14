import { NextResponse } from "next/server";

export const revalidate = 86400;

export async function GET() {
    try {
        const response = await fetch("https://api.opensanctions.org/names/default", {
            headers: { "User-Agent": "WorldWideView/1.0", "Accept": "application/json" },
            next: { revalidate },
        });
        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
        }
    } catch {}

    const demo = [
        { id: "SAN001", name: "Sanctioned Entity 1", latitude: 55.7, longitude: 37.6 },
        { id: "SAN002", name: "Sanctioned Entity 2", latitude: 35.0, longitude: 105.0 },
        { id: "SAN003", name: "Sanctioned Entity 3", latitude: 39.0, longitude: 125.7 },
        { id: "SAN004", name: "Sanctioned Entity 4", latitude: 28.6, longitude: 77.2 },
    ];
    return NextResponse.json({ data: demo });
}
