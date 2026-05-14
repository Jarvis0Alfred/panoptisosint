import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const revalidate = 86400;

export async function GET() {
  try {
    // Read the pre-processed ACLED conflict data
    const filePath = join(process.cwd(), "public", "data", "acled", "conflicts.json");
    const data = await readFile(filePath, "utf-8");
    const conflicts = JSON.parse(data);

    return NextResponse.json({ data: conflicts });
  } catch (error: any) {
    console.error("[ConflictZones] Error reading ACLED data:", error.message);
    return NextResponse.json({ data: getDemoConflicts() });
  }
}

function getDemoConflicts() {
  return [
    { id: "ACLD-DEMO-001", event_type: "Battles", sub_event_type: "Armed clash", country: "Ukraine", admin1: "Donetsk", latitude: 48.0, longitude: 37.8, fatalities: 12, events: 3, disorder_type: "Political violence" },
    { id: "ACLD-DEMO-002", event_type: "Violence against civilians", sub_event_type: "Attack", country: "Gaza Strip", admin1: "Gaza", latitude: 31.5, longitude: 34.5, fatalities: 8, events: 2, disorder_type: "Political violence" },
    { id: "ACLD-DEMO-003", event_type: "Protests", sub_event_type: "Peaceful protest", country: "Sudan", admin1: "Khartoum", latitude: 15.5, longitude: 32.5, fatalities: 0, events: 5, disorder_type: "Demonstrations" },
    { id: "ACLD-DEMO-004", event_type: "Riots", sub_event_type: "Violent demonstration", country: "Myanmar", admin1: "Rakhine", latitude: 20.0, longitude: 93.0, fatalities: 3, events: 1, disorder_type: "Political violence" },
    { id: "ACLD-DEMO-005", event_type: "Strategic developments", sub_event_type: "Looting/property destruction", country: "Ethiopia", admin1: "Tigray", latitude: 14.0, longitude: 38.0, fatalities: 5, events: 2, disorder_type: "Political violence" },
  ];
}
