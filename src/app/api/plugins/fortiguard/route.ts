import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
    try {
        const response = await fetch("https://fortiguard.com/webfilter/categories", {
            headers: { "User-Agent": "WorldWideView/1.0", "Accept": "application/json" },
            next: { revalidate },
        });
        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
        }
    } catch {}

    const demo = [
        { id: "FG001", name: "Malware", latitude: 37.0, longitude: -122.0 },
        { id: "FG002", name: "Phishing", latitude: 51.5, longitude: -0.1 },
        { id: "FG003", name: "Botnet", latitude: 35.7, longitude: 139.7 },
        { id: "FG004", name: "Exploit", latitude: 40.7, longitude: -74.0 },
    ];
    return NextResponse.json({ categories: demo });
}
