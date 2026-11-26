// Server-side source of truth for prices. Keep in sync with the listings in public/index.html
// until a real database replaces both.
const LISTINGS = [
  { id: 1, title: 'Skyline Penthouse', city: 'New York, USA', type: 'commercial', price_pi: 1200000, beds: 4, area: 310 },
  { id: 2, title: 'Oceanfront Villa', city: 'Dubai, UAE', type: 'villa', price_pi: 480000, beds: 6, area: 620 },
  { id: 3, title: 'Nile View Residence', city: 'Cairo, Egypt', type: 'apartment', price_pi: 85000, beds: 3, area: 180 },
  { id: 4, title: 'Modern Loft', city: 'Berlin, Germany', type: 'apartment', price_pi: 150000, beds: 2, area: 105 },
  { id: 5, title: 'City Centre Office Floor', city: 'London, UK', type: 'commercial', price_pi: 900000, beds: 0, area: 540 },
  { id: 6, title: 'Bosphorus Land Plot', city: 'Istanbul, Turkiye', type: 'land', price_pi: 60000, beds: 0, area: 1200 }
];
const PRICES = Object.fromEntries(LISTINGS.map(l => [l.id, l.price_pi]));
const LISTING_FEE = 1;
module.exports = { LISTINGS, PRICES, LISTING_FEE };
