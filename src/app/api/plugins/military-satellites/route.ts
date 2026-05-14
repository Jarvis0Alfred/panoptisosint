import { NextResponse } from "next/server";

export const revalidate = 300;

// Military/special interest satellite groups from CelesTrak
const GROUPS = [
    { group: "gps-ops", type: "GPS", color: "#22d3ee" },
    { group: "galileo", type: "Navigation", color: "#a855f7" },
    { group: "beidou", type: "Navigation", color: "#ef4444" },
    { group: "glonass-ops", type: "Navigation", color: "#f59e0b" },
    { group: "iridium", type: "Communications", color: "#3b82f6" },
    { group: "orbcomm", type: "Communications", color: "#06b6d4" },
    { group: "globalstar", type: "Communications", color: "#84cc16" },
    { group: "intelsat", type: "Communications", color: "#ec4899" },
    { group: "military", type: "Military", color: "#ef4444" },
    { group: "radar", type: "Radar", color: "#f97316" },
    { group: "noaa", type: "Weather", color: "#0ea5e9" },
    { group: "goes", type: "Weather", color: "#0ea5e9" },
    { group: "resource", type: "Earth Observation", color: "#10b981" },
];

export async function GET() {
    try {
        // Fetch from multiple groups in parallel
        const promises = GROUPS.map(async (g) => {
            try {
                const response = await fetch(
                    `https://celestrak.org/NORAD/elements/gp.php?GROUP=${g.group}&FORMAT=json`,
                    {
                        headers: { "User-Agent": "WorldWideView/1.0" },
                        next: { revalidate },
                    }
                );
                if (!response.ok) return [];
                const data = await response.json();
                return (data || []).map((s: any) => ({
                    id: `${g.group}-${s.NORAD_CAT_ID || s.OBJECT_ID}`,
                    name: s.OBJECT_NAME,
                    type: g.type,
                    group: g.group,
                    norad_id: s.NORAD_CAT_ID,
                    inclination: s.INCLINATION,
                    period: s.PERIOD,
                    apogee: s.APOGEE,
                    perigee: s.PERIGEE,
                    // These need TLE propagation for real-time position
                    // We'll use approximate position based on orbital elements
                    latitude: null,
                    longitude: null,
                    altitude: s.PERIGEE ? s.PERIGEE * 1.60934 : null,
                    color: g.color,
                }));
            } catch {
                return [];
            }
        });

        const results = (await Promise.all(promises)).flat();

        if (results.length > 0) {
            return NextResponse.json({ satellites: results });
        }
    } catch {
        // fallback
    }

    return NextResponse.json({ satellites: getDemoSatellites() });
}

function getDemoSatellites() {
    return [
        { id: "MSAT001", name: "USA-223 (MILSTAR)", type: "Military", group: "military", norad_id: 38070, latitude: null, longitude: null, altitude: 35786, color: "#ef4444" },
        { id: "MSAT002", name: "USA-245 (KH-11)", type: "Reconnaissance", group: "military", norad_id: 39232, latitude: null, longitude: null, altitude: 250, color: "#ef4444" },
        { id: "MSAT003", name: "Kosmos 2542", type: "Inspector", group: "military", norad_id: 44835, latitude: null, longitude: null, altitude: 1200, color: "#ef4444" },
        { id: "MSAT004", name: "GPS III SV04", type: "GPS", group: "gps-ops", norad_id: 46826, latitude: null, longitude: null, altitude: 20200, color: "#22d3ee" },
        { id: "MSAT005", name: "Iridium 163", type: "Communications", group: "iridium", norad_id: 43478, latitude: null, longitude: null, altitude: 780, color: "#3b82f6" },
    ];
}
