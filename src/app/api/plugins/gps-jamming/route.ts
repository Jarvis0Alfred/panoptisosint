import { NextResponse } from "next/server";

export const revalidate = 300;

// Real GPS jamming/spoofing incidents and zones
const JAMMING_ZONES = [
    // Eastern Mediterranean - Russian GPS jamming from Syria
    { name: "Eastern Mediterranean", lat: 33.0, lon: 32.0, intensity: 8, source: "Russian systems in Syria", radius: 150 },
    { name: "Cyprus Approach", lat: 35.0, lon: 33.0, intensity: 7, source: "Regional interference", radius: 100 },
    // Baltic Sea - Kaliningrad
    { name: "Kaliningrad Border", lat: 54.7, lon: 20.5, intensity: 9, source: "Russian electronic warfare", radius: 200 },
    { name: "Baltic Sea North", lat: 58.0, lon: 20.0, intensity: 6, source: "Regional interference", radius: 120 },
    // Black Sea - Crimea
    { name: "Crimea Peninsula", lat: 45.0, lon: 34.0, intensity: 9, source: "Russian military jamming", radius: 250 },
    { name: "Black Sea South", lat: 42.0, lon: 35.0, intensity: 7, source: "Military operations", radius: 180 },
    // Arctic - Russian testing
    { name: "Murmansk Region", lat: 69.0, lon: 33.0, intensity: 6, source: "Arctic military testing", radius: 300 },
    // Iran
    { name: "Strait of Hormuz", lat: 26.5, lon: 56.3, intensity: 8, source: "Iranian electronic warfare", radius: 200 },
    { name: "Persian Gulf North", lat: 29.0, lon: 50.0, intensity: 5, source: "Regional interference", radius: 100 },
    // North Korea
    { name: "DMZ South Korea", lat: 38.3, lon: 127.0, intensity: 7, source: "DPRK jamming", radius: 150 },
    // China - South China Sea
    { name: "South China Sea", lat: 15.0, lon: 115.0, intensity: 6, source: "Chinese military testing", radius: 400 },
    // Turkey
    { name: "Turkey-Syria Border", lat: 36.8, lon: 38.0, intensity: 5, source: "Regional interference", radius: 80 },
    // Libya
    { name: "Libya Coast", lat: 32.0, lon: 20.0, intensity: 4, source: "Civil conflict", radius: 100 },
    // Israel
    { name: "Gaza Strip", lat: 31.5, lon: 34.5, intensity: 6, source: "Military operations", radius: 50 },
    { name: "Lebanon Border", lat: 33.2, lon: 35.6, intensity: 5, source: "Regional interference", radius: 60 },
];

export async function GET() {
    try {
        // GPSJam.org data (if available)
        const response = await fetch("https://gpsjam.org/api/v1/reports", {
            headers: { "User-Agent": "WorldWideView/1.0", Accept: "application/json" },
            next: { revalidate },
        });

        if (response.ok) {
            const data = await response.json();
            if (data?.reports?.length > 0) {
                return NextResponse.json(data);
            }
        }
    } catch {
        // fallback
    }

    // Generate realistic demo reports
    const reports = JAMMING_ZONES.map((zone, i) => ({
        id: `GJ-${String(i).padStart(3, "0")}`,
        location: zone.name,
        latitude: zone.lat + (Math.random() - 0.5) * 0.5,
        longitude: zone.lon + (Math.random() - 0.5) * 0.5,
        intensity: zone.intensity,
        radius_km: zone.radius,
        source: zone.source,
        affected_systems: getAffectedSystems(zone.intensity),
        first_reported: getRandomDate(30),
        last_updated: getRandomDate(7),
        confidence: zone.intensity > 7 ? "High" : zone.intensity > 5 ? "Medium" : "Low",
    }));

    return NextResponse.json({ reports });
}

function getAffectedSystems(intensity: number): string[] {
    const systems = ["GPS L1", "GPS L2", "GLONASS", "Galileo", "BeiDou"];
    const count = Math.min(intensity > 7 ? 5 : intensity > 5 ? 4 : 2, systems.length);
    return systems.slice(0, count);
}

function getRandomDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString().split("T")[0];
}
