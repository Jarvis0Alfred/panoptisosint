import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
    try {
        const response = await fetch(
            "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json",
            {
                headers: { "User-Agent": "WorldWideView/1.0", "Accept": "application/json" },
                next: { revalidate },
            }
        );
        if (response.ok) {
            const data = await response.json();
            const sats = (data || []).slice(0, 50).map((s: any) => ({
                id: s.NORAD_CAT_ID?.toString() || s.OBJECT_NAME,
                name: s.OBJECT_NAME,
                latitude: null,
                longitude: null,
                altitude: s.PERIGEE ? s.PERIGEE * 1.60934 : null,
                inclination: s.INCLINATION,
            }));
            return NextResponse.json({ satellites: sats });
        }
    } catch {}

    const demo = [
        { id: "MSAT001", name: "USA-223", latitude: null, longitude: null, altitude: 35786 },
        { id: "MSAT002", name: "USA-245", latitude: null, longitude: null, altitude: 20000 },
        { id: "MSAT003", name: "Kosmos 2542", latitude: null, longitude: null, altitude: 1200 },
        { id: "MSAT004", name: "Tianlian 2-01", latitude: null, longitude: null, altitude: 35786 },
    ];
    return NextResponse.json({ satellites: demo });
}
