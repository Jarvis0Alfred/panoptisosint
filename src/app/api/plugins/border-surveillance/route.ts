import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
    const demo = [
        { id: "BS001", location: "US-Mexico Border", latitude: 32.5, longitude: -116.8 },
        { id: "BS002", location: "Turkey-Syria Border", latitude: 36.8, longitude: 38.9 },
        { id: "BS003", location: "India-Pakistan Border", latitude: 32.0, longitude: 74.5 },
        { id: "BS004", location: "South Korea DMZ", latitude: 38.3, longitude: 127.0 },
        { id: "BS005", location: "Poland-Belarus Border", latitude: 53.0, longitude: 23.5 },
    ];
    return NextResponse.json({ incidents: demo });
}
