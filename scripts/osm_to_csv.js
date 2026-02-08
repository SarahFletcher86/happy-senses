// scripts/osm_to_csv.js
// Convert Overpass/OSM JSON to HappySenses CSV schema

import fs from "fs";
import path from "path";
import { stringify } from "csv-stringify/sync";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------- Helpers for HTML processing ----------
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function extractSummary(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const summary = sentences.slice(0, 2).join('. ');
  return summary ? summary + (sentences.length > 2 ? '.' : '') : '';
}

// ---------- Config ----------
const INPUT = path.join(__dirname, "..", "data", "overpass.json");
const OUTPUT = path.join(__dirname, "..", "data", "venues.cleaned.csv");

// CSV headers expected by your app
const HEADERS = [
  "name",
  "slug",
  "category",
  "description",
  "city",
  "address",
  "lat",
  "lng",
  "website",
  "phone",
  "email",
  "image_url",
  "sens_noise_1to5",
  "sens_light_1to5",
  "sens_crowd_1to5",
  "sens_quiet_room",
  "sens_headphones",
  "sens_staff_trained",
  "sens_certification",
  "sens_last_verified",
];

// ---------- Helpers ----------
const kd = (s) =>
  s
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

function makeSlug(name, city, existing) {
  let base = kd(`${name}-${city || ""}`.trim().replace(/-+$/, ""));
  if (!base) base = "venue";
  let slug = base;
  let i = 2;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  existing.add(slug);
  return slug;
}

function pickCategory(tags = {}) {
  const a = tags.amenity;
  const t = tags.tourism;
  const l = tags.leisure;

  if (a === "library") return "Library";
  if (a === "community_centre" || a === "arts_centre") return "Community Centre";
  if (t === "museum") return "Museum";
  if (l === "park") return "Park";
  return "Other";
}

function buildAddress(tags = {}) {
  // Try addr:full, then housenumber+street, else whatever’s available
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [];
  if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
  if (tags["addr:street"]) parts.push(tags["addr:street"]);
  const addr = parts.join(" ").trim();
  return addr || "";
}

function pickCity(tags = {}) {
  return (
    tags["addr:city"] ||
    tags["addr:town"] ||
    tags["addr:municipality"] ||
    tags["addr:suburb"] ||
    ""
  );
}

function getLatLng(geom) {
  if (geom && geom.type === 'Point' && Array.isArray(geom.coordinates) && geom.coordinates.length >= 2) {
    return { lat: geom.coordinates[1], lng: geom.coordinates[0] };
  }
  return { lat: null, lng: null };
}

function safe(val) {
  if (val === undefined || val === null) return "";
  return String(val).trim();
}

// Ontario bounding box sanity check (approx)
function inOntarioBBox(lat, lng) {
  if (lat == null || lng == null) return false;
  const minLat = 41.5,
    maxLat = 56.0,
    minLng = -95.2,
    maxLng = -74.3;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

// ---------- Main ----------
(function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let sitesFolder = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--sites' && i + 1 < args.length) {
      sitesFolder = args[i + 1];
      i++;
    }
  }

  const raw = fs.readFileSync(INPUT, "utf-8");
  const json = JSON.parse(raw);

  if (!json.features || !Array.isArray(json.features)) {
    throw new Error("Invalid GeoJSON: missing features array");
  }

  const seenSlugs = new Set();
  const dedupeKeySeen = new Set();

  const rows = [];

  for (const feature of json.features) {
    const tags = feature.properties || {};
    const geometry = feature.geometry;
    const name = safe(tags.name);
    if (!name) continue;

    const { lat, lng } = getLatLng(geometry);
    if (!inOntarioBBox(lat, lng)) continue; // skip out-of-province/no coords

    const city = safe(pickCity(tags));
    const address = safe(buildAddress(tags));
    const website = safe(tags.website);
    const phone = safe(tags.phone);
    const email = safe(tags.email);
    const category = pickCategory(tags);

    // Simple dedupe: name+city+category
    const key = `${name.toLowerCase()}|${city.toLowerCase()}|${category.toLowerCase()}`;
    if (dedupeKeySeen.has(key)) continue;
    dedupeKeySeen.add(key);

    const slug = makeSlug(name, city, seenSlugs);

    // Extract description from HTML if sites folder provided
    let description = "";
    if (sitesFolder) {
      const htmlPath = path.join(sitesFolder, `${slug}.html`);
      if (fs.existsSync(htmlPath)) {
        try {
          const html = fs.readFileSync(htmlPath, 'utf-8');
          const text = stripHtml(html);
          description = extractSummary(text);
        } catch (err) {
          console.warn(`Warning: Failed to read or process ${htmlPath}: ${err.message}`);
        }
      }
    }

    const row = {
      name,
      slug,
      category,
      description,
      city,
      address,
      lat: lat ?? "",
      lng: lng ?? "",
      website,
      phone,
      email,
      image_url: "",

      // Sensory fields start empty (to be enriched from official pages later)
      sens_noise_1to5: "",
      sens_light_1to5: "",
      sens_crowd_1to5: "",
      sens_quiet_room: "",
      sens_headphones: "",
      sens_staff_trained: "",
      sens_certification: "",
      sens_last_verified: "",
    };

    rows.push(row);
  }

  // Create CSV
  const records = rows.map((r) => HEADERS.map((h) => (r[h] !== undefined ? r[h] : "")));
  const csv = stringify([HEADERS, ...records]);

  fs.writeFileSync(OUTPUT, csv, "utf-8");

  console.log(`✅ Wrote ${rows.length} venues to ${OUTPUT}`);
})();
