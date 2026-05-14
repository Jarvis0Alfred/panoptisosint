import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
    try {
        // NASA EONET wildfire events
        const response = await fetch(
            "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=50",
            {
                headers: {
                    "User-Agent": "WorldWideView/1.0",
                    "Accept": "application/json",
                },
                next: { revalidate },
            }
        );

        if (response.ok) {
            const data = await response.json();
            const events = (data?.events || []).map((e: any) => ({
                id: e.id,
                title: e.title,
                geometries: e.geometry
                    ? [{ coordinates: e.geometry.coordinates || [0, 0] }]
                    : (e.geometries || []).map((g: any) => ({
                          coordinates: g.coordinates || [0, 0],
                      })),
            }));
            return NextResponse.json({ events });
        }
    } catch {
        // Fallback
    }

    // Demo wildfire data
    const demoEvents = [
        { id: "WF001", title: "California Wildfire", geometries: [{ coordinates: [-120.5, 39.5] }] },
        { id: "WF002", title: "Australian Bushfire", geometries: [{ coordinates: [147.0, -35.3] }] },
        { id: "WF003", title: "Greek Forest Fire", geometries: [{ coordinates: [23.7, 38.0] }] },
        { id: "WF004", title: "Amazon Deforestation", geometries: [{ coordinates: [-62.0, -8.0] }] },
        { id: "WF005", title: "Siberian Fire", geometries: [{ coordinates: [100.0, 55.0] }] },
    ];

    return NextResponse.json({ events: demoEvents });
}
