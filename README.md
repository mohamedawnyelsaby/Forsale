# Forsale
Global real-estate marketplace paid in Pi, with an AI advisor. Static front-end in `public/`, Vercel serverless functions in `api/`.

## Deploy on Vercel
1. Import this repo. Vercel reads `vercel.json` (serves `public/`, runs `api/*`).
2. Project Settings -> Environment Variables: `PI_API_KEY`, `ANTHROPIC_API_KEY`.
3. Pi Developer Portal: set the app URL, and put the Validation Key in `public/validation-key.txt`.
4. Test in Pi Browser (sandbox), then set `sandbox:false` in `public/index.html`.

## Notes
- Prices are checked server-side in `api/pi/approve.js` against `api/_data.js` (keep in sync with the sample listings until a database exists).
- Listings are sample data.
