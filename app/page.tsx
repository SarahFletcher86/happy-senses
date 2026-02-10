'use client';

import { useState, useMemo } from 'react';

// Venue data type based on CSV structure
interface Venue {
  name: string;
  slug: string;
  category: string;
  description: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  website: string;
  phone: string;
  email: string;
  image_url: string;
}

// Sample venue data for the directory (first 50 from the CSV)
const venueData: Venue[] = [
  { name: "Amesbury Sports", slug: "amesbury-sports", category: "Community Centre", description: "", city: "", address: "", lat: 43.7060012, lng: -79.4867845, website: "", phone: "", email: "", image_url: "" },
  { name: "Jacob Hespeler Stadium", slug: "jacob-hespeler-stadium", category: "Park", description: "", city: "", address: "", lat: 43.4213592, lng: -80.3180554, website: "", phone: "", email: "", image_url: "" },
  { name: "Kin Family Park", slug: "kin-family-park", category: "Park", description: "", city: "", address: "", lat: 43.9216063, lng: -80.1189189, website: "", phone: "", email: "", image_url: "" },
  { name: "The Gables Park", slug: "the-gables-park-barrie", category: "Park", description: "", city: "Barrie", address: "250 Tollendal Mill Road", lat: 44.3731069, lng: -79.6599961, website: "", phone: "", email: "", image_url: "" },
  { name: "Black Creek Provincial Park", slug: "black-creek-provincial-park", category: "Park", description: "", city: "", address: "", lat: 44.9736587, lng: -81.3621313, website: "", phone: "", email: "", image_url: "" },
  { name: "Camilla Park", slug: "camilla-park", category: "Park", description: "", city: "", address: "", lat: 43.5750767, lng: -79.6029908, website: "", phone: "", email: "", image_url: "" },
  { name: "The Village Green", slug: "the-village-green", category: "Park", description: "", city: "", address: "780 Village Green Boulevard", lat: 43.5739554, lng: -79.5682591, website: "https://www.mississauga.ca/events-and-attractions/parks/the-village-green/", phone: "", email: "", image_url: "" },
  { name: "Richard Jones Park", slug: "richard-jones-park", category: "Park", description: "", city: "", address: "", lat: 43.5871302, lng: -79.61457, website: "", phone: "", email: "", image_url: "" },
  { name: "Neebin Park", slug: "neebin-park", category: "Park", description: "", city: "", address: "", lat: 43.6384405, lng: -79.7235726, website: "", phone: "", email: "", image_url: "" },
  { name: "Applewood Heights", slug: "applewood-heights", category: "Park", description: "", city: "", address: "3119 Constitution Boulevard", lat: 43.6062077, lng: -79.593124, website: "", phone: "", email: "", image_url: "" },
  { name: "Hawkins Glen Park", slug: "hawkins-glen-park", category: "Park", description: "", city: "", address: "2970 Rymal Road", lat: 43.6000338, lng: -79.5968323, website: "", phone: "", email: "", image_url: "" },
  { name: "Applewood Hills", slug: "applewood-hills", category: "Park", description: "", city: "", address: "1204 Bloor Street", lat: 43.6169552, lng: -79.6039712, website: "https://www.mississauga.ca/events-and-attractions/parks/applewood-hills/", phone: "", email: "", image_url: "" },
  { name: "Willowcreek Park", slug: "willowcreek-park", category: "Park", description: "", city: "", address: "", lat: 43.6148247, lng: -79.583828, website: "", phone: "", email: "", image_url: "" },
  { name: "Bethesda Common", slug: "bethesda-common", category: "Park", description: "", city: "", address: "3311 Fieldgate Drive", lat: 43.6222264, lng: -79.5851172, website: "", phone: "", email: "", image_url: "" },
  { name: "Burnhamdale Park", slug: "burnhamdale-park", category: "Park", description: "", city: "", address: "3316 Cardross Road", lat: 43.6193278, lng: -79.5881334, website: "https://www.mississauga.ca/events-and-attractions/parks/burnhamdale-park/", phone: "", email: "", image_url: "" },
  { name: "Rathwood District Park", slug: "rathwood-district-park", category: "Park", description: "", city: "", address: "", lat: 43.6199766, lng: -79.6159622, website: "", phone: "", email: "", image_url: "" },
  { name: "Golden Orchard Park", slug: "golden-orchard-park", category: "Park", description: "", city: "", address: "", lat: 43.6221068, lng: -79.6075805, website: "", phone: "", email: "", image_url: "" },
  { name: "Shelby Park", slug: "shelby-park", category: "Park", description: "", city: "", address: "", lat: 43.6146728, lng: -79.6207045, website: "", phone: "", email: "", image_url: "" },
  { name: "Windrush Woods", slug: "windrush-woods", category: "Park", description: "", city: "", address: "2780 Gulfstream Way", lat: 43.5975836, lng: -79.7713548, website: "", phone: "", email: "", image_url: "" },
  { name: "Point Pelee National Park", slug: "point-pelee-national-park", category: "Park", description: "", city: "", address: "", lat: 41.8345185, lng: -82.5948376, website: "https://www.pc.gc.ca/en/pn-np/on/pelee", phone: "+1-888-773-8888", email: "", image_url: "" },
  { name: "Biener's Bush", slug: "bieners-bush", category: "Park", description: "", city: "", address: "", lat: 44.4533916, lng: -81.3969488, website: "", phone: "", email: "", image_url: "" },
  { name: "Lebovic Campus", slug: "lebovic-campus", category: "Community Centre", description: "", city: "", address: "9600 Bathurst Street", lat: 43.8534359, lng: -79.4623495, website: "", phone: "", email: "", image_url: "" },
  { name: "Godwick Green", slug: "godwick-green", category: "Park", description: "", city: "", address: "", lat: 43.6229912, lng: -79.7414585, website: "", phone: "", email: "", image_url: "" },
  { name: "Old Ridge Park", slug: "old-ridge-park", category: "Park", description: "", city: "", address: "", lat: 43.624631, lng: -79.7287725, website: "", phone: "", email: "", image_url: "" },
  { name: "Bluffer's Park", slug: "bluffers-park", category: "Park", description: "", city: "", address: "", lat: 43.7080671, lng: -79.2343788, website: "", phone: "", email: "", image_url: "" },
  { name: "Alex Robertson Park", slug: "alex-robertson-park", category: "Park", description: "", city: "", address: "", lat: 43.8150567, lng: -79.0728563, website: "", phone: "", email: "", image_url: "" },
  { name: "Rotary Park", slug: "rotary-park", category: "Park", description: "", city: "", address: "", lat: 43.8109532, lng: -79.0938675, website: "", phone: "", email: "", image_url: "" },
  { name: "Beachfront Park", slug: "beachfront-park", category: "Park", description: "", city: "", address: "", lat: 43.8119848, lng: -79.0806166, website: "", phone: "", email: "", image_url: "" },
  { name: "Dixie Woods Park", slug: "dixie-woods-park", category: "Park", description: "", city: "", address: "", lat: 43.6198974, lng: -79.6004185, website: "", phone: "", email: "", image_url: "" },
  { name: "Kennedy Park", slug: "kennedy-park", category: "Park", description: "", city: "", address: "3505 Golden Orchard Drive", lat: 43.6175813, lng: -79.5995229, website: "https://www.mississauga.ca/events-and-attractions/parks/kennedy-park/", phone: "", email: "", image_url: "" },
  { name: "Hnatyshyn Park", slug: "hnatyshyn-park", category: "Park", description: "", city: "", address: "", lat: 46.4935149, lng: -80.990346, website: "", phone: "", email: "", image_url: "" },
  { name: "Queen's Athletic Field", slug: "queens-athletic-field", category: "Park", description: "", city: "", address: "", lat: 46.4917274, lng: -81.0059376, website: "", phone: "", email: "", image_url: "" },
  { name: "Memorial Park", slug: "memorial-park", category: "Park", description: "", city: "", address: "", lat: 46.4902154, lng: -80.9925745, website: "", phone: "", email: "", image_url: "" },
  { name: "Tom Davies Square", slug: "tom-davies-square", category: "Park", description: "", city: "", address: "", lat: 46.4904521, lng: -80.9905411, website: "", phone: "", email: "", image_url: "" },
  { name: "Eyre Playground", slug: "eyre-playground", category: "Park", description: "", city: "", address: "", lat: 46.4982089, lng: -80.9639852, website: "", phone: "", email: "", image_url: "" },
  { name: "Eastern Avenue Park", slug: "eastern-avenue-park", category: "Park", description: "", city: "", address: "35 Eastern Avenue", lat: 44.0280333, lng: -79.8031017, website: "", phone: "", email: "", image_url: "" },
  { name: "Joan Sutherland Park", slug: "joan-sutherland-park", category: "Park", description: "", city: "", address: "", lat: 44.029192, lng: -79.8019838, website: "", phone: "", email: "", image_url: "" },
  { name: "O'Connor Park", slug: "oconnor-park", category: "Park", description: "", city: "", address: "", lat: 46.5055469, lng: -80.99169, website: "", phone: "", email: "", image_url: "" },
  { name: "Percy Park", slug: "percy-park", category: "Park", description: "", city: "", address: "", lat: 46.5070726, lng: -80.9813324, website: "", phone: "", email: "", image_url: "" },
  { name: "Diorite Playground", slug: "diorite-playground", category: "Park", description: "", city: "", address: "", lat: 46.4795143, lng: -81.0650683, website: "", phone: "", email: "", image_url: "" },
  { name: "Victory Park", slug: "victory-park", category: "Park", description: "", city: "", address: "", lat: 46.5050432, lng: -81.0063818, website: "", phone: "", email: "", image_url: "" },
  { name: "Ryan Heights Playground", slug: "ryan-heights-playground", category: "Park", description: "", city: "", address: "", lat: 46.507838, lng: -80.9930222, website: "", phone: "", email: "", image_url: "" },
  { name: "Optimist Harbourview Park", slug: "optimist-harbourview-park", category: "Park", description: "", city: "", address: "", lat: 44.5043657, lng: -80.2284681, website: "", phone: "", email: "", image_url: "" },
  { name: "Adamsdale Playground", slug: "adamsdale-playground", category: "Park", description: "", city: "", address: "", lat: 46.4969397, lng: -80.9348928, website: "", phone: "", email: "", image_url: "" },
  { name: "Bancroft Waterfront Park", slug: "bancroft-waterfront-park", category: "Park", description: "", city: "", address: "", lat: 46.4937326, lng: -80.9540158, website: "", phone: "", email: "", image_url: "" },
  { name: "Bobbie Rosenfeld Park", slug: "bobbie-rosenfeld-park-toronto", category: "Park", description: "", city: "Toronto", address: "294 Bremner Boulevard", lat: 43.6418631, lng: -79.3873695, website: "", phone: "", email: "", image_url: "" },
  { name: "Meatbird Park", slug: "meatbird-park", category: "Park", description: "", city: "", address: "", lat: 46.4503419, lng: -81.1507346, website: "", phone: "", email: "", image_url: "" },
  { name: "Fielding Memorial Park", slug: "fielding-memorial-park", category: "Park", description: "", city: "", address: "", lat: 46.4272733, lng: -81.09505, website: "", phone: "", email: "", image_url: "" },
  { name: "Parkview Gardens Parkette", slug: "parkview-gardens-parkette-toronto", category: "Park", description: "", city: "Toronto", address: "34 Parkview Gardens", lat: 43.6534428, lng: -79.4694312, website: "https://www.toronto.ca/data/parks/prd/facilities/complex/271/index.html", phone: "", email: "", image_url: "" },
  { name: "Blackfriar Park", slug: "blackfriar-park-etobicoke", category: "Park", description: "", city: "Etobicoke", address: "41 Bridlesburg Drive", lat: 43.6951015, lng: -79.5622164, website: "", phone: "", email: "", image_url: "" },
];

const categories = ["All", "Park", "Community Centre", "Museum", "Library"];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  // Get unique cities from the data
  const cities = useMemo(() => {
    const uniqueCities = new Set(venueData.filter(v => v.city).map(v => v.city));
    return ["All", ...Array.from(uniqueCities).sort()];
  }, []);

  // Filter venues based on search and filters
  const filteredVenues = useMemo(() => {
    return venueData.filter(venue => {
      const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          venue.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || venue.category === selectedCategory;
      const matchesCity = selectedCity === "All" || venue.city === selectedCity;
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [searchQuery, selectedCategory, selectedCity]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Happy Senses</h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Discover inclusive spaces across Ontario
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {venueData.length} venues in our directory
          </p>
        </header>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-wrap gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city === "All" ? "All Cities" : city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Venue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map(venue => (
            <div
              key={venue.slug}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold">{venue.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  venue.category === 'Park' ? 'bg-green-100 text-green-800' :
                  venue.category === 'Community Centre' ? 'bg-blue-100 text-blue-800' :
                  venue.category === 'Museum' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {venue.category}
                </span>
              </div>

              {venue.city && (
                <p className="text-sm text-muted-foreground mb-2">{venue.city}</p>
              )}

              {venue.address && (
                <p className="text-sm text-muted-foreground mb-2">{venue.address}</p>
              )}

              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Visit Website →
                </a>
              )}
            </div>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No venues found matching your criteria.
          </p>
        )}
      </div>
    </main>
  );
}
