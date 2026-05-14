import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
    try {
        const response = await fetch(
            "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json",
            {
                headers: {
                    "User-Agent": "WorldWideView/1.0",
                    "Accept": "application/json",
                },
                next: { revalidate },
            }
        );

        if (response.ok) {
            const data = await response.json();
            
            // Transform CelesTrak TLE data into entity format
            // Note: TLE data doesn't have live lat/lon - we'd need SGP4 propagation
            // For demo purposes, we'll generate approximate positions based on orbital elements
            const satellites = (data || []).slice(0, 100).map((s: any) => {
                const inclination = Number(s.INCLINATION) || 0;
                // Generate approximate position based on epoch + orbital params
                const now = Date.now();
                const epoch = new Date(s.EPOCH).getTime();
                const period = Number(s.PERIOD) || 90; // minutes
                const meanAnomaly = Number(s.MEAN_ANOMALY) || 0;
                
                // Simple circular orbit approximation
                const elapsedMinutes = (now - epoch) / 60000;
                const currentAnomaly = (meanAnomaly + (elapsedMinutes / period) * 360) % 360;
                const rad = (currentAnomaly * Math.PI) / 180;
                
                // Approximate position (very simplified)
                const lat = Math.sin(rad) * inclination;
                const lon = (currentAnomaly - 180 + (elapsedMinutes / 4)) % 360;
                
                return {
                    id: s.NORAD_CAT_ID?.toString() || s.OBJECT_NAME,
                    name: s.OBJECT_NAME,
                    latitude: Number.isFinite(lat) ? lat : 0,
                    longitude: Number.isFinite(lon) ? lon : 0,
                    altitude: s.PERIGEE ? s.PERIGEE * 1.60934 : null, // miles to km
                    inclination: s.INCLINATION,
                    period: s.PERIOD,
                    epoch: s.EPOCH,
                };
            }).filter((s: any) => s.id && s.name);

            return NextResponse.json({ satellites });
        }
    } catch (error: any) {
        console.error("[SatelliteRoute] Error:", error);
    }

    // Demo satellite positions
    const demoSatellites = [
        { id: "SAT001", name: "ISS (Zarya)", latitude: 51.6, longitude: -0.1, altitude: 408, inclination: 51.6, period: 92.7, epoch: new Date().toISOString() },
        { id: "SAT002", name: "Hubble", latitude: 28.5, longitude: -80.6, altitude: 540, inclination: 28.5, period: 95.4, epoch: new Date().toISOString() },
        { id: "SAT003", name: "Starlink-1001", latitude: 53.0, longitude: 0.0, altitude: 550, inclination: 53.0, period: 95.0, epoch: new Date().toISOString() },
        { id: "SAT004", name: "GPS IIF-1", latitude: 55.0, longitude: -120.0, altitude: 20180, inclination: 55.0, period: 718.0, epoch: new Date().toISOString() },
        { id: "SAT005", name: "Sentinel-1A", latitude: 98.2, longitude: 20.0, altitude: 693, inclination: 98.2, period: 98.6, epoch: new Date().toISOString() },
    ];

    return NextResponse.json({ satellites: demoSatellites });
}
