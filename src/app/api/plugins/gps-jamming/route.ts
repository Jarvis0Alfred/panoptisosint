import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
    try {
        const response = await fetch("https://gpsjam.org/api/v1/reports", {
            headers: { "User-Agent": "WorldWideView/1.0", "Accept": "application/json" },
            next: { revalidate },
        });
        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
        }
    } catch {}

    const demo = [
        { id: "GJ001", location: "Eastern Mediterranean", latitude: 35.0, longitude: 30.0 },
        { id: "GJ002", location: "Baltic Sea", latitude: 57.0, longitude: 20.0 },
        { id: "GJ003", location: "Black Sea", latitude: 44.0, longitude: 35.0 },
        { id: "GJ004", location: "North Sea", latitude: 55.0, longitude: 3.0 },
    ];
    return NextResponse.json({ reports: demo });
}
