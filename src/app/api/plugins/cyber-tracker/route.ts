import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
    try {
        // Abuse.ch ThreatFox (free API for threat intel)
        const response = await fetch("https://threatfox.abuse.ch/api/v1/", {
            method: "POST",
            headers: {
                "User-Agent": "WorldWideView/1.0",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: "get_iocs", limit: 50 }),
            next: { revalidate },
        });
        if (response.ok) {
            const data = await response.json();
            const threats = (data?.data || []).map((t: any) => ({
                id: t.id || t.ioc,
                name: t.threat_type || "Unknown Threat",
                latitude: 37.0 + (Math.random() - 0.5) * 40,
                longitude: -20.0 + (Math.random() - 0.5) * 80,
            }));
            return NextResponse.json({ threats });
        }
    } catch {}

    const demo = [
        { id: "CT001", name: "Ransomware C2", latitude: 55.7, longitude: 37.6 },
        { id: "CT002", name: "Phishing Server", latitude: 51.5, longitude: -0.1 },
        { id: "CT003", name: "Botnet Node", latitude: 39.9, longitude: 116.4 },
        { id: "CT004", name: "Malware Drop", latitude: 37.5, longitude: -122.0 },
    ];
    return NextResponse.json({ threats: demo });
}
