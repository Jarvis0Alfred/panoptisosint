import { NextResponse } from "next/server";

export const revalidate = 30;

const OPENSKY_URL = "https://opensky-network.org/api/states/all";

export async function GET() {
    try {
        const username = process.env.OPENSKY_USERNAME;
        const password = process.env.OPENSKY_PASSWORD;
        
        const headers: Record<string, string> = {
            "User-Agent": "WorldWideView/1.0",
            "Accept": "application/json",
        };

        // Add Basic Auth if credentials are available (10x better rate limits)
        if (username && password) {
            headers["Authorization"] = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
        }

        const response = await fetch(OPENSKY_URL, {
            headers,
            next: { revalidate },
        });

        if (!response.ok) {
            // Return demo data on API failure so UI still works
            console.warn(`[AviationRoute] OpenSky returned ${response.status}, serving demo data`);
            return NextResponse.json({ states: getDemoAircraft() });
        }

        const data = await response.json();
        
        const states = data?.states ?? [];
        const features = states.map((state: any) => ({
            icao24: state[0],
            callsign: state[1]?.trim() || "Unknown",
            origin_country: state[2],
            latitude: state[6],
            longitude: state[5],
            geo_altitude: state[13],
            velocity: state[9],
            true_track: state[10],
            vertical_rate: state[11],
            on_ground: state[8],
            last_contact: state[4],
            last_position_update: state[3],
        })).filter((a: any) => Number.isFinite(a.latitude) && Number.isFinite(a.longitude));

        return NextResponse.json({ states: features.length > 0 ? features : getDemoAircraft() });
    } catch (error: any) {
        console.error("[AviationRoute] Error:", error);
        return NextResponse.json({ states: getDemoAircraft() });
    }
}

function getDemoAircraft() {
    return [
        { icao24: "demo01", callsign: "DEMO01", origin_country: "USA", latitude: 40.7, longitude: -74.0, geo_altitude: 35000, velocity: 450, true_track: 90, vertical_rate: 0, on_ground: false },
        { icao24: "demo02", callsign: "DEMO02", origin_country: "UK", latitude: 51.5, longitude: -0.1, geo_altitude: 32000, velocity: 420, true_track: 180, vertical_rate: 0, on_ground: false },
        { icao24: "demo03", callsign: "DEMO03", origin_country: "Germany", latitude: 52.5, longitude: 13.4, geo_altitude: 28000, velocity: 380, true_track: 270, vertical_rate: 0, on_ground: false },
        { icao24: "demo04", callsign: "DEMO04", origin_country: "Japan", latitude: 35.7, longitude: 139.7, geo_altitude: 30000, velocity: 400, true_track: 45, vertical_rate: 0, on_ground: false },
        { icao24: "demo05", callsign: "DEMO05", origin_country: "Greece", latitude: 37.9, longitude: 23.7, geo_altitude: 25000, velocity: 350, true_track: 135, vertical_rate: 0, on_ground: false },
    ];
}
