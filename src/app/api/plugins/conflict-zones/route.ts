import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
    try {
        const response = await fetch(
            "https://api.acleddata.com/acled/read?terms=accept&limit=50",
            {
                headers: { "User-Agent": "WorldWideView/1.0", "Accept": "application/json" },
                next: { revalidate },
            }
        );
        if (response.ok) {
            const data = await response.json();
            const events = (data?.data || []).map((e: any) => ({
                event_id_cnty: e.event_id_cnty,
                location: e.location,
                latitude: Number(e.latitude),
                longitude: Number(e.longitude),
            })).filter((e: any) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude));
            return NextResponse.json({ data: events });
        }
    } catch {}

    const demo = [
        { event_id_cnty: "UKR001", location: "Kyiv Region", latitude: 50.4, longitude: 30.5 },
        { event_id_cnty: "GAZ001", location: "Gaza Strip", latitude: 31.5, longitude: 34.5 },
        { event_id_cnty: "SYR001", location: "Aleppo", latitude: 36.2, longitude: 37.2 },
        { event_id_cnty: "SUD001", location: "Khartoum", latitude: 15.5, longitude: 32.5 },
        { event_id_cnty: "MYA001", location: "Rakhine State", latitude: 20.0, longitude: 93.0 },
    ];
    return NextResponse.json({ data: demo });
}
