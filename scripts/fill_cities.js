// scripts/fill_cities.js
// Fill missing cities using OpenStreetMap Nominatim reverse geocoding

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------- Config ----------
const INPUT = path.join(__dirname, "..", "data", "venues.cleaned.csv");
const OUTPUT = path.join(__dirname, "..", "data", "venues_with_cities.csv");

// ---------- Helpers ----------
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HappySenses-Geocoding/1.0 (https://github.com/firecrawl/open-lovable)'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data && data.address) {
      return data.address.city || data.address.town || data.address.village || data.address.municipality || "";
    }
    return "";
  } catch (error) {
    console.warn(`Geocoding failed for ${lat},${lng}: ${error.message}`);
    return "";
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------- Main ----------
(async function main() {
  console.log("Reading CSV file...");
  const csvContent = fs.readFileSync(INPUT, "utf-8");
  const records = parse(csvContent, { columns: true, skip_empty_lines: true });

  console.log(`Processing ${records.length} records...`);

  let processed = 0;
  const updatedRecords = [];

  for (const record of records) {
    const city = record.city?.trim() || "";
    const lat = record.lat?.trim();
    const lng = record.lng?.trim();

    if (!city && lat && lng && lat !== "" && lng !== "") {
      console.log(`Geocoding ${processed + 1}/${records.length}: ${lat},${lng}`);
      const newCity = await reverseGeocode(lat, lng);
      if (newCity) {
        record.city = newCity;
        console.log(`  → ${newCity}`);
      }
      // Rate limit: 1 request per 2 seconds
      await delay(2000);
    }

    updatedRecords.push(record);
    processed++;

    if (processed % 100 === 0) {
      console.log(`Progress: ${processed}/${records.length} records processed`);
    }
  }

  console.log("Writing updated CSV...");
  const outputCsv = stringify(updatedRecords, { header: true });
  fs.writeFileSync(OUTPUT, outputCsv, "utf-8");

  console.log(`✅ Done! Saved ${updatedRecords.length} records to ${OUTPUT}`);
})();