import { NextResponse } from "next/server";

export const revalidate = 60;

const TARGET_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

export async function GET() {
    try {
        const response = await fetch(TARGET_URL, {
            headers: {
                "User-Agent": "WorldWideView/1.0",
                "Accept": "application/json",
            },
            next: { revalidate },
        });

        if (!response.ok) {
            return NextResponse.json({ data: [], error: `Upstream returned ${response.status}` }, { status: 200 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("[EarthquakesRoute] Error:", error);
        return NextResponse.json({ data: [] }, { status: 200 });
    }
}
