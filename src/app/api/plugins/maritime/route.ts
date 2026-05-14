import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
    try {
        // Try to fetch from AISHub (free, no key required for basic)
        const response = await fetch("https://data.aishub.net/ws.php?output=json&username= DEMO", {
            headers: {
                "User-Agent": "WorldWideView/1.0",
                "Accept": "application/json",
            },
            next: { revalidate },
        });

        if (response.ok) {
            const data = await response.json();
            const vessels = (data || []).map((v: any) => ({
                mmsi: v.MMSI || v.mmsi || String(Math.random()).slice(2, 11),
                name: v.NAME || v.name || `Vessel ${v.MMSI?.slice(-4) || "Unknown"}`,
                latitude: Number(v.LATITUDE || v.latitude),
                longitude: Number(v.LONGITUDE || v.longitude),
                heading: Number(v.COURSE || v.heading || 0),
                speed: Number(v.SOG || v.speed || 0),
            })).filter((v: any) => Number.isFinite(v.latitude) && Number.isFinite(v.longitude));

            return NextResponse.json({ vessels });
        }
    } catch {
        // Fallback to demo data
    }

    // Demo maritime data (some real vessel positions)
    const demoVessels = [
        { mmsi: "123456789", name: "Demo Cargo 1", latitude: 37.9, longitude: 23.6, heading: 45, speed: 12 },
        { mmsi: "987654321", name: "Demo Tanker 2", latitude: 51.5, longitude: -0.1, heading: 90, speed: 8 },
        { mmsi: "456789123", name: "Demo Ferry 3", latitude: 35.7, longitude: 139.7, heading: 180, speed: 15 },
        { mmsi: "789123456", name: "Demo Yacht 4", latitude: 40.7, longitude: -74.0, heading: 270, speed: 5 },
        { mmsi: "321654987", name: "Demo Ship 5", latitude: -33.9, longitude: 18.4, heading: 135, speed: 10 },
    ];

    return NextResponse.json({ vessels: demoVessels });
}
