import { NextResponse } from "next/server";

export const revalidate = 30;

export async function GET() {
    const demo = [
        { id: "DD001", type: "DJI Mavic", latitude: 51.5, longitude: -0.1 },
        { id: "DD002", type: "Bayraktar TB2", latitude: 37.0, longitude: 35.3 },
        { id: "DD003", type: "MQ-9 Reaper", latitude: 33.4, longitude: -110.0 },
        { id: "DD004", type: "FPV Drone", latitude: 50.4, longitude: 30.5 },
        { id: "DD005", type: "Unknown UAV", latitude: 35.7, longitude: 139.7 },
    ];
    return NextResponse.json({ sightings: demo });
}
