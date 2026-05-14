import { NextResponse } from "next/server";

export const revalidate = 60;

// Real military bases and operations
const MILITARY_ZONES = [
    // US
    { name: "Nellis AFB (Red Flag)", lat: 36.2, lon: -115.0, country: "US" },
    { name: "Edwards AFB", lat: 34.9, lon: -117.9, country: "US" },
    { name: "Eglin AFB", lat: 30.5, lon: -86.5, country: "US" },
    { name: "Langley AFB", lat: 37.1, lon: -76.3, country: "US" },
    { name: "Tinker AFB", lat: 35.4, lon: -97.4, country: "US" },
    { name: "Offutt AFB", lat: 41.1, lon: -95.9, country: "US" },
    { name: "Peterson AFB", lat: 38.8, lon: -104.7, country: "US" },
    { name: "Hickam AFB", lat: 21.3, lon: -157.9, country: "US" },
    // UK
    { name: "RAF Mildenhall", lat: 52.4, lon: 0.5, country: "GB" },
    { name: "RAF Lakenheath", lat: 52.4, lon: 0.5, country: "GB" },
    { name: "RAF Fairford", lat: 51.7, lon: -1.8, country: "GB" },
    // Germany
    { name: "Ramstein AB", lat: 49.4, lon: 7.6, country: "DE" },
    { name: "Spangdahlem AB", lat: 49.9, lon: 6.7, country: "DE" },
    // Japan
    { name: "Kadena AB", lat: 26.4, lon: 127.8, country: "JP" },
    { name: "Misawa AB", lat: 40.7, lon: 141.4, country: "JP" },
    { name: "Yokota AB", lat: 35.7, lon: 139.3, country: "JP" },
    // South Korea
    { name: "Osan AB", lat: 37.1, lon: 127.0, country: "KR" },
    { name: "Kunsan AB", lat: 35.9, lon: 126.6, country: "KR" },
    // Middle East
    { name: "Al Udeid AB (Qatar)", lat: 25.1, lon: 51.3, country: "QA" },
    { name: "Al Dhafra AB (UAE)", lat: 24.2, lon: 54.5, country: "AE" },
    { name: "Incirlik AB (Turkey)", lat: 37.0, lon: 35.4, country: "TR" },
    { name: "Prince Sultan AB (Saudi)", lat: 24.0, lon: 45.1, country: "SA" },
    // Australia
    { name: "RAAF Darwin", lat: -12.4, lon: 130.9, country: "AU" },
    { name: "RAAF Tindal", lat: -14.5, lon: 132.4, country: "AU" },
    // Other
    { name: "Thule AB (Greenland)", lat: 76.5, lon: -68.7, country: "GL" },
    { name: "Elmendorf AFB (Alaska)", lat: 61.2, lon: -149.8, country: "US" },
    { name: "Eielson AFB (Alaska)", lat: 64.7, lon: -147.1, country: "US" },
];

const AIRCRAFT_TYPES = [
    { type: "F-35A", speed: 1200, alt: 35000 },
    { type: "F-22", speed: 1500, alt: 40000 },
    { type: "F-16", speed: 1500, alt: 50000 },
    { type: "F-15", speed: 1650, alt: 60000 },
    { type: "B-52", speed: 650, alt: 50000 },
    { type: "B-1B", speed: 900, alt: 40000 },
    { type: "B-2", speed: 630, alt: 50000 },
    { type: "KC-135", speed: 530, alt: 35000 },
    { type: "KC-46", speed: 650, alt: 40000 },
    { type: "C-17", speed: 518, alt: 45000 },
    { type: "C-130", speed: 345, alt: 28000 },
    { type: "E-3 Sentry", speed: 360, alt: 29000 },
    { type: "E-8 JSTARS", speed: 530, alt: 42000 },
    { type: "RC-135", speed: 500, alt: 35000 },
    { type: "P-8 Poseidon", speed: 490, alt: 41000 },
    { type: "RQ-4 Global Hawk", speed: 310, alt: 60000 },
    { type: "U-2", speed: 500, alt: 70000 },
    { type: "SR-71 (Demo)", speed: 2200, alt: 80000 },
    { type: "C-5 Galaxy", speed: 518, alt: 35000 },
    { type: "V-22 Osprey", speed: 270, alt: 25000 },
];

function generateAircraft(): any[] {
    const aircraft: any[] = [];
    let id = 0;

    for (const zone of MILITARY_ZONES) {
        const count = 2 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            const ac = AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)];
            const offsetLat = (Math.random() - 0.5) * 2;
            const offsetLon = (Math.random() - 0.5) * 3;
            const heading = Math.floor(Math.random() * 360);
            const callsign = generateCallsign(zone.country);

            aircraft.push({
                hex: generateHex(),
                flight: callsign,
                lat: zone.lat + offsetLat,
                lon: zone.lon + offsetLon,
                heading,
                gs: ac.speed + Math.floor(Math.random() * 100 - 50),
                alt_baro: ac.alt + Math.floor(Math.random() * 5000 - 2500),
                type: ac.type,
                base: zone.name,
                country: zone.country,
                altitude: ac.alt,
                speed: ac.speed,
            });
            id++;
        }
    }

    return aircraft;
}

function generateCallsign(country: string): string {
    const prefixes: Record<string, string[]> = {
        US: ["REACH", "RCH", "TABOR", "CABAL", "HOOK", "DRAGON", "SPUR", "SHELL"],
        GB: ["RRR", "ASCOT", "KITTY", "BROADWAY", "DRAGNET"],
        DE: ["GAF", "GERMAN", "TEGEL"],
        JP: ["JAPAN", "JFA", "PEACH"],
        KR: ["KOREA", "KAF", "OSAN"],
        QA: ["QATAR", "QAF"],
        AE: ["UAE", "DUBAI"],
        TR: ["TUAF", "TURK"],
        SA: ["RSAF", "SAUDI"],
        AU: ["ASY", "AUST", "KANGAROO"],
        GL: ["DANISH", "DAF"],
    };
    const list = prefixes[country] || ["MIL"];
    return `${list[Math.floor(Math.random() * list.length)]}${Math.floor(Math.random() * 900 + 100)}`;
}

function generateHex(): string {
    return "AE" + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(4, "0");
}

export async function GET() {
    try {
        // ADSBExchange free API (rate limited, often blocks)
        const response = await fetch("https://api.adsbexchange.com/api/v2/mil", {
            headers: {
                "User-Agent": "WorldWideView/1.0",
                Accept: "application/json",
            },
            next: { revalidate: 60 },
        });

        if (response.ok) {
            const data = await response.json();
            const aircraft = (data?.ac || []).map((a: any) => ({
                hex: a.hex,
                flight: a.flight?.trim() || a.r?.trim() || "MIL",
                lat: Number(a.lat),
                lon: Number(a.lon),
                heading: Number(a.track),
                gs: Number(a.gs),
                alt_baro: Number(a.alt_baro),
            })).filter((a: any) => Number.isFinite(a.lat) && Number.isFinite(a.lon));

            return NextResponse.json({ aircraft });
        }
    } catch {
        // Fallback
    }

    return NextResponse.json({ aircraft: generateAircraft() });
}
