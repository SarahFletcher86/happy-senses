import type { Venue } from "./types";

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_VENUES_TABLE_ID = process.env.AIRTABLE_VENUES_TABLE_ID!;
const AIRTABLE_PAT = process.env.AIRTABLE_PAT!;

export interface FeaturedVenue {
  id: string;
  slug: string;
  name: string;
  city: string;
  category: string;
  tier: "Tier 1 - Verified" | "Tier 2 - Likely" | "Tier 3 - Needs Verification" | "Hidden";
  featuredPhotoUrl: string | null;
  sensory: { quiet: number; light: number; crowd: number };
  certification?: string;
}

export async function fetchFeaturedVenues(): Promise<FeaturedVenue[]> {
  const filter = encodeURIComponent("AND({featured_on_homepage}, {published})");
  const sort = "sort%5B0%5D%5Bfield%5D=featured_order&sort%5B0%5D%5Bdirection%5D=asc";
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_VENUES_TABLE_ID}?filterByFormula=${filter}&maxRecords=4&${sort}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_PAT}` },
    next: { revalidate: 3600, tags: ["featured-venues"] },
  });

  if (!res.ok) {
    console.error("Featured venues fetch failed:", res.status);
    return [];
  }

  const data = await res.json();
  return data.records.map((r: any) => ({
    id: r.id,
    slug: r.fields.slug,
    name: r.fields.name,
    city: r.fields.city,
    category: r.fields.category,
    tier: r.fields.tier,
    featuredPhotoUrl: r.fields.featured_photo_url ?? null,
    sensory: {
      quiet: r.fields.sens_noise_1to5 ?? 0,
      light: r.fields.sens_light_1to5 ?? 0,
      crowd: r.fields.sens_crowd_1to5 ?? 0,
    },
    certification: r.fields.sens_certification,
  }));
}

export interface CityCounts {
  toronto: number;
  ottawa: number;
  gta: number;
  kwg: number;
  belleville: number;
}

const GTA_CITIES = ["Mississauga", "Brampton", "Markham", "Vaughan", "Scarborough", "North York", "Etobicoke", "Richmond Hill"];
const KWG_CITIES = ["Kitchener", "Waterloo", "Guelph"];

export async function fetchCityCounts(): Promise<CityCounts> {
  const filter = encodeURIComponent("{published}");
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_VENUES_TABLE_ID}?filterByFormula=${filter}&fields%5B%5D=city&pageSize=100`;

  const counts: Record<string, number> = {};
  let offset: string | undefined;

  do {
    const u = offset ? `${url}&offset=${offset}` : url;
    const res = await fetch(u, {
      headers: { Authorization: `Bearer ${AIRTABLE_PAT}` },
      next: { revalidate: 3600, tags: ["city-counts"] },
    });
    if (!res.ok) break;
    const data = await res.json();
    for (const r of data.records) {
      const c = (r.fields.city ?? "").trim();
      if (!c) continue;
      counts[c] = (counts[c] ?? 0) + 1;
    }
    offset = data.offset;
  } while (offset);

  const sum = (cities: string[]) => cities.reduce((acc, c) => acc + (counts[c] ?? 0), 0);

  return {
    toronto: counts["Toronto"] ?? 0,
    ottawa: counts["Ottawa"] ?? 0,
    gta: sum(GTA_CITIES),
    kwg: sum(KWG_CITIES),
    belleville: counts["Belleville"] ?? 0,
  };
}
