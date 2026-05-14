import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
    try {
        // Smithsonian Global Volcanism Program (volcanoes with recent activity)
        const response = await fetch(
            "https://volcano.si.edu/database/webservice.cfm?service=getVolcanoList",
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
            const volcanoes = (data || []).slice(0, 50).map((v: any) => ({
                id: v.volcanoNumber || v.id || String(Math.random()),
                name: v.name || "Unknown Volcano",
                latitude: Number(v.latitude || v.lat),
                longitude: Number(v.longitude || v.lon),
                elevation: Number(v.elevation),
            })).filter((v: any) => Number.isFinite(v.latitude) && Number.isFinite(v.longitude));

            return NextResponse.json({ data: volcanoes });
        }
    } catch {
        // Fallback
    }

    // Demo volcano data (real active volcanoes)
    const demoVolcanoes = [
        { id: "V001", name: "Mount Etna", latitude: 37.75, longitude: 14.99, elevation: 3357 },
        { id: "V002", name: "Kilauea", latitude: 19.42, longitude: -155.29, elevation: 1247 },
        { id: "V003", name: "Mount St. Helens", latitude: 46.19, longitude: -122.19, elevation: 2549 },
        { id: "V004", name: "Popocatépetl", latitude: 19.02, longitude: -98.62, elevation: 5426 },
        { id: "V005", name: "Krakatoa", latitude: -6.10, longitude: 105.42, elevation: 813 },
        { id: "V006", name: "Mount Fuji", latitude: 35.36, longitude: 138.73, elevation: 3776 },
        { id: "V007", name: "Yellowstone", latitude: 44.43, longitude: -110.50, elevation: 2805 },
        { id: "V008", name: "Vesuvius", latitude: 40.82, longitude: 14.43, elevation: 1281 },
    ];

    return NextResponse.json({ data: demoVolcanoes });
}
