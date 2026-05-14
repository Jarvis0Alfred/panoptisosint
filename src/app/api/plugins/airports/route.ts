import { NextResponse } from "next/server";

export const revalidate = 86400;

export async function GET() {
    try {
        // OurAirports free dataset - global airports with lat/lon
        const response = await fetch(
            "https://davidmegginson.github.io/ourairports-data/airports.csv",
            {
                headers: {
                    "User-Agent": "WorldWideView/1.0",
                    Accept: "text/csv",
                },
                next: { revalidate },
            }
        );

        if (!response.ok) {
            console.warn(`[Airports] OurAirports returned ${response.status}`);
            return NextResponse.json({ airports: getDemoAirports() });
        }

        const csv = await response.text();
        const lines = csv.split("\n").filter(Boolean);
        const headers = lines[0].split(",");
        
        const idIdx = headers.indexOf("ident");
        const nameIdx = headers.indexOf("name");
        const latIdx = headers.indexOf("latitude_deg");
        const lonIdx = headers.indexOf("longitude_deg");
        const typeIdx = headers.indexOf("type");
        const isoIdx = headers.indexOf("iso_country");

        if (idIdx === -1 || latIdx === -1 || lonIdx === -1) {
            return NextResponse.json({ airports: getDemoAirports() });
        }

        const airports = lines
            .slice(1)
            .map((line) => {
                const parts = parseCSVLine(line);
                const id = parts[idIdx]?.trim();
                const name = parts[nameIdx]?.trim();
                const lat = parseFloat(parts[latIdx]);
                const lon = parseFloat(parts[lonIdx]);
                const type = parts[typeIdx]?.trim();
                const country = parts[isoIdx]?.trim();

                if (!id || !name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
                // Skip small/heliports for cleaner display, keep medium+large + international
                if (type === "heliport" || type === "closed" || type === "seaplane_base") return null;

                return {
                    id,
                    name: `${name} (${country})`,
                    latitude: lat,
                    longitude: lon,
                    type,
                    country,
                };
            })
            .filter(Boolean)
            .slice(0, 3000); // Cap for performance

        return NextResponse.json({ airports });
    } catch (error: any) {
        console.error("[Airports] Error:", error);
        return NextResponse.json({ airports: getDemoAirports() });
    }
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function getDemoAirports() {
    return [
        { id: "JFK", name: "John F Kennedy Intl (US)", latitude: 40.6, longitude: -73.7, type: "large_airport", country: "US" },
        { id: "LHR", name: "London Heathrow (GB)", latitude: 51.4, longitude: -0.4, type: "large_airport", country: "GB" },
        { id: "DXB", name: "Dubai Intl (AE)", latitude: 25.2, longitude: 55.3, type: "large_airport", country: "AE" },
        { id: "HND", name: "Tokyo Haneda (JP)", latitude: 35.5, longitude: 139.7, type: "large_airport", country: "JP" },
        { id: "SIN", name: "Singapore Changi (SG)", latitude: 1.3, longitude: 103.9, type: "large_airport", country: "SG" },
    ];
}
