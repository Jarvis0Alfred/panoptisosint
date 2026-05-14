import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
    try {
        // URLhaus - malware distribution sites (free, no key)
        const urlhaus = await fetch(
            "https://urlhaus-api.abuse.ch/v1/urls/recent/",
            {
                headers: {
                    "User-Agent": "WorldWideView/1.0",
                    Accept: "application/json",
                },
                next: { revalidate },
            }
        );

        const threats: any[] = [];

        if (urlhaus.ok) {
            const data = await urlhaus.json();
            (data?.urls || []).slice(0, 100).forEach((u: any, i: number) => {
                if (u.urlhaus_reference) {
                    // Approximate location by extracting TLD and mapping roughly
                    const tld = extractTLD(u.url);
                    const loc = tldToLatLon(tld);
                    threats.push({
                        id: `CYBER-UH-${i}`,
                        name: `Malware: ${u.url?.substring(0, 40)}...`,
                        latitude: loc.lat + (Math.random() - 0.5) * 5,
                        longitude: loc.lon + (Math.random() - 0.5) * 10,
                        type: "malware",
                        source: "URLhaus",
                        url: u.url,
                        date_added: u.date_added,
                    });
                }
            });
        }

        // EmergingThreats open rules (IP reputation)
        const et = await fetch(
            "https://rules.emergingthreats.net/open/suricata/rules/compromised-ips.rules",
            {
                headers: { "User-Agent": "WorldWideView/1.0" },
                next: { revalidate },
            }
        );

        if (et.ok) {
            const text = await et.text();
            const ipMatches = text.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g);
            const uniqueIps = [...new Set(ipMatches || [])].slice(0, 50);
            uniqueIps.forEach((ip, i) => {
                const loc = ipToLatLon(ip);
                threats.push({
                    id: `CYBER-ET-${i}`,
                    name: `Compromised IP: ${ip}`,
                    latitude: loc.lat,
                    longitude: loc.lon,
                    type: "compromised_ip",
                    source: "EmergingThreats",
                });
            });
        }

        if (threats.length > 0) {
            return NextResponse.json({ threats });
        }
    } catch (error: any) {
        console.error("[CyberTracker] Error:", error);
    }

    return NextResponse.json({ threats: getDemoThreats() });
}

function extractTLD(url: string): string {
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.split(".");
        return parts[parts.length - 1] || "unknown";
    } catch {
        return "unknown";
    }
}

function tldToLatLon(tld: string): { lat: number; lon: number } {
    const map: Record<string, { lat: number; lon: number }> = {
        ru: { lat: 61.5, lon: 105.3 },
        cn: { lat: 35.8, lon: 104.1 },
        ir: { lat: 32.4, lon: 53.6 },
        kp: { lat: 40.3, lon: 127.5 },
        us: { lat: 39.8, lon: -98.5 },
        gb: { lat: 54.3, lon: -2.2 },
        de: { lat: 51.1, lon: 10.4 },
        nl: { lat: 52.1, lon: 5.3 },
        fr: { lat: 46.6, lon: 2.2 },
        br: { lat: -14.2, lon: -51.9 },
        in: { lat: 20.5, lon: 78.9 },
        pk: { lat: 30.3, lon: 69.3 },
        bd: { lat: 23.6, lon: 90.3 },
        vn: { lat: 14.0, lon: 108.2 },
        id: { lat: -0.7, lon: 113.9 },
        tr: { lat: 38.9, lon: 35.2 },
        ua: { lat: 49.0, lon: 31.0 },
        by: { lat: 53.7, lon: 27.9 },
        kz: { lat: 48.0, lon: 68.0 },
        ro: { lat: 45.9, lon: 24.9 },
        pl: { lat: 51.9, lon: 19.1 },
        cz: { lat: 49.8, lon: 15.4 },
        it: { lat: 41.8, lon: 12.5 },
        es: { lat: 40.4, lon: -3.7 },
        unknown: { lat: (Math.random() - 0.5) * 160, lon: (Math.random() - 0.5) * 360 },
    };
    return map[tld.toLowerCase()] || map.unknown;
}

function ipToLatLon(ip: string): { lat: number; lon: number } {
    // Hash IP to deterministic pseudo-location (not real geolocation, just spread)
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
        hash = ((hash << 5) - hash + ip.charCodeAt(i)) | 0;
    }
    const lat = ((hash & 0xFFFF) / 0xFFFF) * 160 - 80;
    const lon = (((hash >> 16) & 0xFFFF) / 0xFFFF) * 360 - 180;
    return { lat, lon };
}

function getDemoThreats() {
    return [
        { id: "CYB001", name: "C2 Server Russia", latitude: 55.7, longitude: 37.6, type: "c2", source: "demo" },
        { id: "CYB002", name: "Phishing Domain CN", latitude: 35.6, longitude: 104.1, type: "phishing", source: "demo" },
        { id: "CYB003", name: "DDoS Botnet IR", latitude: 32.4, longitude: 53.6, type: "botnet", source: "demo" },
        { id: "CYB004", name: "Ransomware Node", latitude: 51.1, longitude: 10.4, type: "ransomware", source: "demo" },
        { id: "CYB005", name: "Malware Dropper", latitude: 40.7, longitude: -74.0, type: "malware", source: "demo" },
    ];
}
