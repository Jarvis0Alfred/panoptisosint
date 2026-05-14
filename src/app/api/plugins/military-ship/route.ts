import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
    const demo = [
        { mmsi: "MIL001", name: "USS Demo", latitude: 36.0, longitude: -75.0, heading: 90, speed: 25 },
        { mmsi: "MIL002", name: "HMS Demo", latitude: 50.0, longitude: -4.0, heading: 180, speed: 20 },
        { mmsi: "MIL003", name: "FS Demo", latitude: 43.0, longitude: 6.0, heading: 270, speed: 22 },
        { mmsi: "MIL004", name: "JMSDF Demo", latitude: 35.0, longitude: 140.0, heading: 45, speed: 18 },
        { mmsi: "MIL005", name: "PLAN Demo", latitude: 30.0, longitude: 122.0, heading: 135, speed: 24 },
    ];
    return NextResponse.json({ vessels: demo });
}
