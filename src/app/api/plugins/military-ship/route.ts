import { NextResponse } from "next/server";

export const revalidate = 120;

// Real naval bases and operational areas
const NAVAL_ZONES = [
    // US
    { name: "Naval Station Norfolk", lat: 36.9, lon: -76.3, country: "US", type: "carrier" },
    { name: "Naval Base San Diego", lat: 32.7, lon: -117.2, country: "US", type: "carrier" },
    { name: "Naval Base Kitsap", lat: 47.7, lon: -122.7, country: "US", type: "submarine" },
    { name: "Naval Station Mayport", lat: 30.4, lon: -81.4, country: "US", type: "carrier" },
    { name: "Naval Station Pearl Harbor", lat: 21.4, lon: -157.9, country: "US", type: "carrier" },
    { name: "Naval Base Guam", lat: 13.4, lon: 144.8, country: "US", type: "carrier" },
    { name: "Naval Station Yokosuka", lat: 35.3, lon: 139.7, country: "US", type: "carrier" },
    { name: "Naval Support Bahrain", lat: 26.2, lon: 50.6, country: "US", type: "expeditionary" },
    { name: "Naval Submarine Base Kings Bay", lat: 30.8, lon: -81.6, country: "US", type: "submarine" },
    { name: "Naval Air Station Fallon", lat: 39.4, lon: -118.7, country: "US", type: "training" },
    // UK
    { name: "HMNB Portsmouth", lat: 50.8, lon: -1.1, country: "GB", type: "carrier" },
    { name: "HMNB Clyde (Faslane)", lat: 56.0, lon: -4.8, country: "GB", type: "submarine" },
    { name: "HMNB Devonport", lat: 50.4, lon: -4.2, country: "GB", type: "carrier" },
    // France
    { name: "Base Aeronavale Toulon", lat: 43.1, lon: 5.9, country: "FR", type: "carrier" },
    { name: "Base Sous-Marins Brest", lat: 48.4, lon: -4.5, country: "FR", type: "submarine" },
    // Russia
    { name: "Severomorsk (Northern Fleet)", lat: 69.1, lon: 33.4, country: "RU", type: "carrier" },
    { name: "Sevastopol (Black Sea Fleet)", lat: 44.6, lon: 33.5, country: "RU", type: "carrier" },
    { name: "Vladivostok (Pacific Fleet)", lat: 43.1, lon: 131.9, country: "RU", type: "carrier" },
    { name: "Kaspiysk (Caspian Flotilla)", lat: 42.9, lon: 47.6, country: "RU", type: "frigate" },
    // China
    { name: "Dalian Naval Base", lat: 38.9, lon: 121.6, country: "CN", type: "carrier" },
    { name: "Qingdao Naval Base", lat: 36.1, lon: 120.3, country: "CN", type: "carrier" },
    { name: "Sanya Naval Base", lat: 18.2, lon: 109.5, country: "CN", type: "carrier" },
    { name: "Yulin Submarine Base", lat: 18.1, lon: 109.6, country: "CN", type: "submarine" },
    { name: "Zhoushan Naval Base", lat: 30.0, lon: 122.1, country: "CN", type: "destroyer" },
    // India
    { name: "INS Kadamba (Karwar)", lat: 14.8, lon: 74.1, country: "IN", type: "carrier" },
    { name: "Naval Dockyard Mumbai", lat: 18.9, lon: 72.8, country: "IN", type: "carrier" },
    { name: "INS Varsha (Submarine Base)", lat: 17.7, lon: 83.3, country: "IN", type: "submarine" },
    // Japan
    { name: "JMSDF Yokosuka", lat: 35.3, lon: 139.7, country: "JP", type: "destroyer" },
    { name: "JMSDF Sasebo", lat: 33.2, lon: 129.7, country: "JP", type: "amphibious" },
    { name: "JMSDF Kure", lat: 34.2, lon: 132.5, country: "JP", type: "submarine" },
    // South Korea
    { name: "ROK Fleet Command Busan", lat: 35.1, lon: 129.0, country: "KR", type: "destroyer" },
    { name: "Jinhae Naval Base", lat: 35.2, lon: 128.7, country: "KR", type: "submarine" },
    // Australia
    { name: "HMAS Stirling", lat: -32.2, lon: 115.7, country: "AU", type: "submarine" },
    { name: "HMAS Kuttabul", lat: -33.9, lon: 151.2, country: "AU", type: "destroyer" },
    // Turkey
    { name: "Golcuk Naval Base", lat: 40.7, lon: 29.8, country: "TR", type: "frigate" },
    { name: "Aksaz Naval Base", lat: 36.6, lon: 28.0, country: "TR", type: "frigate" },
    // Greece
    { name: "Salamis Naval Base", lat: 37.9, lon: 23.5, country: "GR", type: "frigate" },
    { name: "Souda Bay", lat: 35.5, lon: 24.1, country: "GR", type: "carrier" },
    // Israel
    { name: "Haifa Naval Base", lat: 32.8, lon: 35.0, country: "IL", type: "corvette" },
    // Iran
    { name: "Bandar Abbas", lat: 27.2, lon: 56.3, country: "IR", type: "frigate" },
    { name: "Chabahar Naval Base", lat: 25.3, lon: 60.6, country: "IR", type: "submarine" },
    // North Korea
    { name: "Wonsan Naval Base", lat: 39.2, lon: 127.4, country: "KP", type: "frigate" },
];

const SHIP_CLASSES: Record<string, string[]> = {
    carrier: ["Aircraft Carrier", "Amphibious Assault Ship", "Helicopter Carrier"],
    submarine: ["Ballistic Missile Submarine", "Attack Submarine", "Guided Missile Submarine"],
    destroyer: ["Destroyer", "Cruiser", "Guided Missile Destroyer"],
    frigate: ["Frigate", "Corvette", "Littoral Combat Ship"],
    amphibious: ["Amphibious Transport Dock", "Landing Ship Dock", "Landing Craft"],
    expeditionary: ["Expeditionary Fast Transport", "Dry Cargo Ship", "Fleet Replenishment"],
    corvette: ["Corvette", "Missile Boat", "Fast Attack Craft"],
    training: ["Training Ship", "Survey Ship", "Icebreaker"],
};

function generateShips(): any[] {
    const ships: any[] = [];
    let id = 0;

    for (const zone of NAVAL_ZONES) {
        const count = zone.type === "carrier" ? 2 + Math.floor(Math.random() * 3)
            : zone.type === "submarine" ? 3 + Math.floor(Math.random() * 4)
            : zone.type === "destroyer" ? 2 + Math.floor(Math.random() * 3)
            : 1 + Math.floor(Math.random() * 3);

        const classes = SHIP_CLASSES[zone.type] || ["Naval Vessel"];

        for (let i = 0; i < count; i++) {
            const shipClass = classes[Math.floor(Math.random() * classes.length)];
            const offsetLat = (Math.random() - 0.5) * 0.4;
            const offsetLon = (Math.random() - 0.5) * 0.4;
            const heading = Math.floor(Math.random() * 360);
            const speed = Math.random() > 0.6 ? 15 + Math.floor(Math.random() * 15) : 0;

            ships.push({
                mmsi: `${300000000 + id}`,
                name: generateShipName(zone.country, shipClass),
                latitude: zone.lat + offsetLat,
                longitude: zone.lon + offsetLon,
                heading,
                speed,
                type: shipClass,
                class: zone.type,
                base: zone.name,
                country: zone.country,
                status: speed > 0 ? "Underway" : "Anchored",
                pennant: generatePennant(zone.country),
            });
            id++;
        }
    }

    return ships;
}

function generateShipName(country: string, shipClass: string): string {
    const prefixes: Record<string, string[]> = {
        US: ["USS", "USNS"],
        GB: ["HMS", "RFA"],
        FR: ["FS", "FSG"],
        RU: ["RFN", "RFS"],
        CN: ["PLANS", "PLAN"],
        IN: ["INS", "IN"],
        JP: ["JS", "JMSDF"],
        KR: ["ROKS", "ROKN"],
        AU: ["HMAS", "ADV"],
        TR: ["TCG"],
        GR: ["HS", "PNS"],
        IL: ["INS"],
        IR: ["IRIS"],
        KP: ["KPNS"],
    };
    const list = prefixes[country] || ["NV"];
    const prefix = list[Math.floor(Math.random() * list.length)];
    const names = ["Enterprise", "Nimitz", "Ford", "Bush", "Reagan", "Lincoln", "Truman", "Eisenhower",
        "Washington", "Stennis", "Vinson", "Roosevelt", "Biden", "Clinton", "Obama", "Kennedy"];
    const number = Math.floor(Math.random() * 900) + 100;
    return Math.random() > 0.5 ? `${prefix} ${names[Math.floor(Math.random() * names.length)]}` : `${prefix} ${number}`;
}

function generatePennant(country: string): string {
    const prefixes: Record<string, string> = {
        US: "CVN", GB: "R", FR: "R", RU: "", CN: "", IN: "R", JP: "DDG", KR: "DDG", AU: "FFH", TR: "F", GR: "F", IL: "Saar", IR: "", KP: "",
    };
    const prefix = prefixes[country] || "";
    const number = Math.floor(Math.random() * 900) + 1;
    return prefix ? `${prefix}-${number}` : `${number}`;
}

export async function GET() {
    return NextResponse.json({ vessels: generateShips() });
}
