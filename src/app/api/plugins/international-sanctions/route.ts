import { NextResponse } from "next/server";

export const revalidate = 3600;

// Datasets to pull (high-value sanctions collections)
const DATASETS = [
  { name: "ca_listed_terrorists", country: "CA", weight: 2 },
  { name: "md_terror_sanctions", country: "MD", weight: 2 },
  { name: "ge_ot_list", country: "GE", weight: 2 },
  { name: "us_ofac_sdn", country: "US", weight: 3 },
  { name: "eu_sanctions_list", country: "EU", weight: 3 },
  { name: "gb_hmt_sanctions", country: "GB", weight: 2 },
  { name: "au_dfat_sanctions", country: "AU", weight: 2 },
  { name: "ch_seco_sanctions", country: "CH", weight: 2 },
  { name: "un_sc_sanctions", country: "UN", weight: 3 },
  { name: "ua_nabc_blacklist", country: "UA", weight: 2 },
  { name: "ru_nsd_blacklist", country: "RU", weight: 2 },
  { name: "kz_fiu_sanctions", country: "KZ", weight: 1 },
  { name: "pk_proscribed_persons", country: "PK", weight: 1 },
  { name: "tr_mevduat_blacklist", country: "TR", weight: 1 },
  { name: "jp_mof_sanctions", country: "JP", weight: 1 },
  { name: "sg_terrorism_suppression", country: "SG", weight: 1 },
];

const BASE_DATE = "20260514";

// Country centroids for positioning on globe
const CENTROIDS: Record<string, { lat: number; lon: number }> = {
  US: { lat: 39.8, lon: -98.5 },
  EU: { lat: 50.8, lon: 4.3 },
  GB: { lat: 54.3, lon: -2.2 },
  CA: { lat: 56.1, lon: -106.3 },
  AU: { lat: -25.2, lon: 133.7 },
  CH: { lat: 46.8, lon: 8.2 },
  UA: { lat: 49.0, lon: 31.0 },
  MD: { lat: 47.4, lon: 28.3 },
  GE: { lat: 42.3, lon: 43.5 },
  RU: { lat: 61.5, lon: 105.3 },
  KZ: { lat: 48.0, lon: 68.0 },
  PK: { lat: 30.3, lon: 69.3 },
  TR: { lat: 38.9, lon: 35.2 },
  JP: { lat: 36.2, lon: 138.2 },
  SG: { lat: 1.3, lon: 103.8 },
  UN: { lat: 40.7, lon: -74.0 },
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function fetchDataset(
  dataset: string,
  maxEntries: number
): Promise<any[]> {
  try {
    const url = `https://data.opensanctions.org/datasets/${BASE_DATE}/${dataset}/targets.simple.csv`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "WorldWideView/1.0",
        Accept: "text/csv",
      },
      next: { revalidate },
    });

    if (!response.ok) {
      console.warn(`[Sanctions] ${dataset} returned ${response.status}`);
      return [];
    }

    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);
    if (lines.length <= 1) return [];

    const headers = parseCSVLine(lines[0]);
    const idIdx = headers.indexOf("id");
    const nameIdx = headers.indexOf("name");
    const countriesIdx = headers.indexOf("countries");
    const schemaIdx = headers.indexOf("schema");

    if (idIdx === -1 || nameIdx === -1) return [];

    const entries: any[] = [];
    for (let i = 1; i < Math.min(lines.length, maxEntries + 1); i++) {
      const parts = parseCSVLine(lines[i]);
      const id = parts[idIdx]?.trim();
      const name = parts[nameIdx]?.trim();
      const countriesRaw = parts[countriesIdx]?.trim();
      const schema = parts[schemaIdx]?.trim() || "Entity";

      if (!id || !name || name === "name") continue;

      // Determine country code
      const countryCode =
        countriesRaw?.split(";")[0]?.toUpperCase() ||
        DATASETS.find((d) => d.name === dataset)?.country ||
        "UN";

      const centroid = CENTROIDS[countryCode] || {
        lat: (Math.random() - 0.5) * 160,
        lon: (Math.random() - 0.5) * 360,
      };

      entries.push({
        id: `${dataset}_${id}`,
        name,
        latitude: centroid.lat + (Math.random() - 0.5) * 3,
        longitude: centroid.lon + (Math.random() - 0.5) * 6,
        country: countryCode,
        type: schema,
        source: dataset,
      });
    }

    return entries;
  } catch (err: any) {
    console.warn(`[Sanctions] ${dataset} error:`, err.message);
    return [];
  }
}

export async function GET() {
  try {
    // Fetch from all datasets in parallel
    const allPromises = DATASETS.map((ds) =>
      fetchDataset(ds.name, 20 + (ds.weight || 1) * 10)
    );
    const results = await Promise.all(allPromises);
    const allEntities = results
      .flat()
      .filter((e) => e.latitude && e.longitude)
      .slice(0, 500); // Hard cap

    if (allEntities.length > 0) {
      return NextResponse.json({ data: allEntities });
    }

    console.warn("[Sanctions] No data from any dataset, using demo");
    return NextResponse.json({ data: getDemoSanctions() });
  } catch (error: any) {
    console.error("[Sanctions] Fatal error:", error);
    return NextResponse.json({ data: getDemoSanctions() });
  }
}

function getDemoSanctions() {
  return [
    {
      id: "SAN001",
      name: "Russian Oligarch A",
      latitude: 55.7,
      longitude: 37.6,
      country: "RU",
      type: "Person",
      source: "demo",
    },
    {
      id: "SAN002",
      name: "Iranian Entity B",
      latitude: 35.6,
      longitude: 51.3,
      country: "IR",
      type: "Organization",
      source: "demo",
    },
    {
      id: "SAN003",
      name: "DPRK Individual C",
      latitude: 39.0,
      longitude: 125.7,
      country: "KP",
      type: "Person",
      source: "demo",
    },
    {
      id: "SAN004",
      name: "Syrian Entity D",
      latitude: 33.5,
      longitude: 36.3,
      country: "SY",
      type: "Organization",
      source: "demo",
    },
    {
      id: "SAN005",
      name: "Belarusian Official E",
      latitude: 53.9,
      longitude: 27.5,
      country: "BY",
      type: "Person",
      source: "demo",
    },
  ];
}
