import { NextResponse } from "next/server";

export const revalidate = 30;

export async function GET() {
    try {
        // ADSBExchange free API (rate limited)
        const response = await fetch("https://api.adsbexchange.com/api/v2/mil", {
            headers: {
                "User-Agent": "WorldWideView/1.0",
                "Accept": "application/json",
            },
            next: { revalidate },
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

    // Demo military aircraft
    const demoAircraft = [
        { hex: "AE1234", flight: "REACH001", lat: 51.5, lon: -0.5, heading: 90, gs: 450, alt_baro: 32000 },
        { hex: "AE5678", flight: "COBRA02", lat: 35.2, lon: 139.4, heading: 180, gs: 380, alt_baro: 25000 },
        { hex: "AE9ABC", flight: "TANKER03", lat: 37.8, lon: -122.4, heading: 270, gs: 300, alt_baro: 28000 },
        { hex: "AEDEF0", flight: "STRAT04", lat: 48.9, lon: 2.3, heading: 45, gs: 420, alt_baro: 35000 },
        { hex: "AE1111", flight: "AWACS05", lat: 39.9, lon: 116.4, heading: 135, gs: 350, alt_baro: 30000 },
    ];

    return NextResponse.json({ aircraft: demoAircraft });
}
