import { NextResponse } from "next/server";

export const revalidate = 600;

export async function GET() {
    const apiKey = process.env.FIRMS_MAP_KEY;

    if (!apiKey) {
        console.warn("[Wildfire] No FIRMS_MAP_KEY, serving demo data");
        return NextResponse.json({ events: getDemoWildfires() });
    }

    try {
        // FIRMS WFS - MODIS 24hr global fires
        // Returns CSV: latitude, longitude, brightness, scan, track, acq_date, acq_time, satellite, confidence, version, bright_t31, frp, daynight
        const response = await fetch(
            `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/MODIS_NRT/World/1`,
            {
                headers: {
                    "User-Agent": "WorldWideView/1.0",
                    Accept: "text/csv",
                },
                next: { revalidate },
            }
        );

        if (!response.ok) {
            console.warn(`[Wildfire] FIRMS returned ${response.status}, falling back to EONET`);
            return NextResponse.json({ events: await fetchEONET() });
        }

        const csv = await response.text();
        const lines = csv.split("\n").filter(Boolean);
        if (lines.length <= 1) {
            return NextResponse.json({ events: await fetchEONET() });
        }

        const headers = lines[0].split(",");
        const latIdx = headers.indexOf("latitude");
        const lonIdx = headers.indexOf("longitude");
        const brightIdx = headers.indexOf("brightness");
        const frpIdx = headers.indexOf("frp");
        const confIdx = headers.indexOf("confidence");
        const dateIdx = headers.indexOf("acq_date");
        const satIdx = headers.indexOf("satellite");
        const daynightIdx = headers.indexOf("daynight");

        const fires = lines
            .slice(1)
            .map((line, i) => {
                const parts = line.split(",");
                const lat = parseFloat(parts[latIdx]);
                const lon = parseFloat(parts[lonIdx]);
                if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

                const brightness = parseFloat(parts[brightIdx]) || 0;
                const frp = parseFloat(parts[frpIdx]) || 0;
                const confidence = parts[confIdx]?.trim() || "n";
                const date = parts[dateIdx]?.trim();
                const satellite = parts[satIdx]?.trim();
                const isDay = parts[daynightIdx]?.trim() === "D";

                // Filter: only high-confidence fires
                if (confidence === "l") return null;

                return {
                    id: `FIRE-${satellite}-${i}`,
                    title: `Fire ${isDay ? "(Day)" : "(Night)"} - ${confidence.toUpperCase()} confidence`,
                    latitude: lat,
                    longitude: lon,
                    brightness,
                    frp, // Fire Radiative Power (MW)
                    confidence,
                    satellite,
                    date,
                    isDay,
                };
            })
            .filter(Boolean)
            .slice(0, 2000); // Cap for performance

        if (fires.length > 0) {
            return NextResponse.json({ events: fires });
        }
    } catch (error: any) {
        console.error("[Wildfire] FIRMS error:", error);
    }

    // Fallback to EONET
    return NextResponse.json({ events: await fetchEONET() });
}

async function fetchEONET() {
    try {
        const response = await fetch(
            "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=200",
            {
                headers: { "User-Agent": "WorldWideView/1.0" },
                next: { revalidate: 600 },
            }
        );
        if (!response.ok) return getDemoWildfires();
        const data = await response.json();
        return (data.events || []).map((e: any) => ({
            id: e.id,
            title: e.title,
            latitude: e.geometry?.[0]?.coordinates?.[1],
            longitude: e.geometry?.[0]?.coordinates?.[0],
            date: e.geometry?.[0]?.date,
            link: e.link,
            categories: e.categories?.map((c: any) => c.title),
        })).filter((e: any) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude));
    } catch {
        return getDemoWildfires();
    }
}

function getDemoWildfires() {
    return [
        { id: "WF001", title: "Amazon Fire (Demo)", latitude: -8.0, longitude: -55.0, brightness: 350, frp: 45, confidence: "h" },
        { id: "WF002", title: "California Wildfire (Demo)", latitude: 37.0, longitude: -120.0, brightness: 380, frp: 120, confidence: "h" },
        { id: "WF003", title: "Australian Bushfire (Demo)", latitude: -35.0, longitude: 148.0, brightness: 400, frp: 200, confidence: "h" },
        { id: "WF004", title: "Siberian Fire (Demo)", latitude: 60.0, longitude: 100.0, brightness: 320, frp: 30, confidence: "n" },
        { id: "WF005", title: "Indonesia Fire (Demo)", latitude: 0.0, longitude: 110.0, brightness: 360, frp: 80, confidence: "h" },
    ];
}
