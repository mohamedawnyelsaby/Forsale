// Server-side source of truth. Keep listings in sync with public/index.html until a database replaces both.
// All PAYMENTS are in Pi. Listing prices are shown in USD with a Pi estimate at a fixed reference rate.
const LISTINGS = [
  { id: 1, title: 'Skyline Penthouse', city: 'New York, USA', type: 'commercial', price_usd: 1250000, beds: 4, area: 310 },
  { id: 2, title: 'Oceanfront Villa', city: 'Dubai, UAE', type: 'villa', price_usd: 980000, beds: 6, area: 620 },
  { id: 3, title: 'Nile View Residence', city: 'Cairo, Egypt', type: 'apartment', price_usd: 95000, beds: 3, area: 180 },
  { id: 4, title: 'Modern Loft', city: 'Berlin, Germany', type: 'apartment', price_usd: 340000, beds: 2, area: 105 },
  { id: 5, title: 'City Centre Office Floor', city: 'London, UK', type: 'commercial', price_usd: 2100000, beds: 0, area: 540 },
  { id: 6, title: 'Bosphorus Land Plot', city: 'Istanbul, Turkiye', type: 'land', price_usd: 140000, beds: 0, area: 1200 }
];
const LISTING_FEE = 1; // Pi
// Editable in Vercel -> Environment Variables (PI_USD_RATE, RESERVATION_PI)
const cfg = () => ({
  rate: Number(process.env.PI_USD_RATE) > 0 ? Number(process.env.PI_USD_RATE) : 0.07, // USD per 1 Pi, a fixed REFERENCE rate (not live)
  reserve_pi: Number(process.env.RESERVATION_PI) > 0 ? Number(process.env.RESERVATION_PI) : 10,
  listing_fee_pi: LISTING_FEE
});
module.exports = { LISTINGS, LISTING_FEE, cfg };
