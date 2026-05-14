const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const INBOUND = '/home/dimitrios/.openclaw/media/inbound';
const OUTDIR = path.join(__dirname, '../public/data/acled');

const FILES = [
  'Africa_aggregated_data_up_to_week_of-2026-05-02_0---37c25ffc-f7bd-4eb8-a543-7fb76f92a981.xlsx',
  'Asia-Pacific_aggregated_data_up_to_week_of-2026-05-02---33a8dfbd-73ea-4182-9a2d-2c592c5b2cc0.xlsx',
  'Middle-East_aggregated_data_up_to_week_of-2026-05-02_0---d3fe6888-8764-4af4-ae66-799d15c6f683.xlsx',
  'Latin_America_the_Caribbean_aggregated_data_up_to_week_of_20---86817847-1b74-4c2a-a64e-6ab6dfe582a5.xlsx',
  'US-and-Canada_aggregated_data_up_to_week_of-2026-05-02---54659387-6a01-4bd9-8e80-07c31cdb5d51.xlsx',
  'Europe_Central_Asia_aggregated_data_up_to_week_of_2026_05_02---ddcdd19e-c1bc-4af2-97de-088fdb0d1c0e.xlsx',
];

function processFile(filepath) {
  if (!fs.existsSync(filepath)) {
    console.warn(`Missing: ${filepath}`);
    return 0;
  }

  const wb = XLSX.readFile(filepath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const headers = rows[0];

  const weekIdx = headers.indexOf('WEEK');
  const regionIdx = headers.indexOf('REGION');
  const countryIdx = headers.indexOf('COUNTRY');
  const admin1Idx = headers.indexOf('ADMIN1');
  const eventTypeIdx = headers.indexOf('EVENT_TYPE');
  const subEventTypeIdx = headers.indexOf('SUB_EVENT_TYPE');
  const eventsIdx = headers.indexOf('EVENTS');
  const fatalitiesIdx = headers.indexOf('FATALITIES');
  const latIdx = headers.indexOf('CENTROID_LATITUDE');
  const lonIdx = headers.indexOf('CENTROID_LONGITUDE');
  const disorderIdx = headers.indexOf('DISORDER_TYPE');

  const seen = new Set();
  let count = 0;
  const CHUNK = [];
  const CHUNK_SIZE = 5000;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[latIdx] || !row[lonIdx]) continue;

    const lat = Number(row[latIdx]);
    const lon = Number(row[lonIdx]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const eventCount = Number(row[eventsIdx]) || 1;
    const fatalities = Number(row[fatalitiesIdx]) || 0;
    if (eventCount <= 0) continue;

    const key = `${Math.round(lat*100)/100},${Math.round(lon*100)/100},${row[countryIdx]},${row[weekIdx]}`;
    if (seen.has(key)) continue;
    seen.add(key);

    CHUNK.push({
      id: `ACLED-${String(row[weekIdx]).padStart(5,'0')}-${count}`,
      week: row[weekIdx],
      region: row[regionIdx],
      country: row[countryIdx],
      admin1: row[admin1Idx],
      event_type: row[eventTypeIdx],
      sub_event_type: row[subEventTypeIdx],
      events: eventCount,
      fatalities,
      latitude: lat,
      longitude: lon,
      disorder_type: row[disorderIdx],
    });

    count++;
    if (CHUNK.length >= CHUNK_SIZE) {
      // Will write all at end
    }
  }

  console.log(`${path.basename(filepath)}: ${count} unique events`);
  return CHUNK;
}

function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });

  // Process one file at a time to avoid memory/stack issues
  let allEntries = [];
  for (const file of FILES) {
    const filepath = path.join(INBOUND, file);
    const entries = processFile(filepath);
    allEntries = allEntries.concat(entries);
    // Force GC if available
    if (global.gc) global.gc();
  }

  // Sort by fatalities descending
  allEntries.sort((a, b) => b.fatalities - a.fatalities || b.events - a.events);

  // Cap at 2000 for bundle size
  const final = allEntries.slice(0, 2000);

  const outputPath = path.join(OUTDIR, 'conflicts.json');
  fs.writeFileSync(outputPath, JSON.stringify(final, null, 2));
  console.log(`\nTotal unique events: ${allEntries.length}`);
  console.log(`Written ${final.length} entries to ${outputPath}`);
  console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
}

main();
