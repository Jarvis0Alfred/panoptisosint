import { NextResponse } from "next/server";

export const revalidate = 86400;

export async function GET() {
    try {
        // Global Volcanism Program (Smithsonian) - Holocene volcanoes GeoJSON
        const response = await fetch(
            "https://volcano.si.edu/database/volcanoes.json",
            {
                headers: {
                    "User-Agent": "WorldWideView/1.0",
                    Accept: "application/json",
                },
                next: { revalidate },
            }
        );

        if (response.ok) {
            const data = await response.json();
            const volcanoes = (data?.features || []).map((f: any, i: number) => ({
                id: `VOL-${i}`,
                name: f.properties?.v_name || f.properties?.name || `Volcano ${i}`,
                latitude: f.geometry?.coordinates?.[1],
                longitude: f.geometry?.coordinates?.[0],
                elevation: f.properties?.elevation,
                type: f.properties?.v_primary_type,
                status: f.properties?.v_status,
            })).filter((v: any) => Number.isFinite(v.latitude) && Number.isFinite(v.longitude));

            if (volcanoes.length > 0) {
                return NextResponse.json({ data: volcanoes });
            }
        }
    } catch {
        // fallback
    }

    // Fallback: USGS recent significant earthquakes can proxy as volcanic regions
    try {
        const usgs = await fetch(
            "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson",
            {
                headers: { "User-Agent": "WorldWideView/1.0" },
                next: { revalidate: 3600 },
            }
        );
        if (usgs.ok) {
            const data = await usgs.json();
            // Filter deeper quakes (often volcanic)
            const volcanic = (data?.features || [])
                .filter((f: any) => (f.geometry?.coordinates?.[2] || 0) > 50)
                .map((f: any, i: number) => ({
                    id: `VOL-USGS-${i}`,
                    name: f.properties?.place || `Volcanic Region ${i}`,
                    latitude: f.geometry?.coordinates?.[1],
                    longitude: f.geometry?.coordinates?.[0],
                    elevation: -(f.geometry?.coordinates?.[2] || 0),
                    type: "Volcanic",
                    status: "Active",
                }))
                .filter((v: any) => Number.isFinite(v.latitude) && Number.isFinite(v.longitude))
                .slice(0, 100);

            if (volcanic.length > 0) {
                return NextResponse.json({ data: volcanic });
            }
        }
    } catch {
        // fallback
    }

    return NextResponse.json({ data: getDemoVolcanoes() });
}

function getDemoVolcanoes() {
    return [
        { id: "VOL001", name: "Mount Etna", latitude: 37.7, longitude: 15.0, elevation: 3357, type: "Stratovolcano", status: "Active" },
        { id: "VOL002", name: "Mount St. Helens", latitude: 46.2, longitude: -122.1, elevation: 2550, type: "Stratovolcano", status: "Active" },
        { id: "VOL003", name: "Kilauea", latitude: 19.4, longitude: -155.2, elevation: 1247, type: "Shield", status: "Active" },
        { id: "VOL004", name: "Mount Vesuvius", latitude: 40.8, longitude: 14.4, elevation: 1281, type: "Somma-stratovolcano", status: "Dormant" },
        { id: "VOL005", name: "Mount Fuji", latitude: 35.3, longitude: 138.7, elevation: 3776, type: "Stratovolcano", status: "Dormant" },
    ];
}
