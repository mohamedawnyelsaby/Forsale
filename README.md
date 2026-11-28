# Forsale
Global real-estate marketplace paid in Pi, with an AI advisor. Static front-end in `public/`, Vercel serverless functions in `api/`.

## Deploy on Vercel
1. Import this repo. Vercel reads `vercel.json` (serves `public/`, runs `api/*`).
2. Project Settings -> Environment Variables: `PI_API_KEY`, plus at least TWO AI keys for failover: `GEMINI_API_KEY` (free, Google AI Studio) and `GROQ_API_KEY` (free, console.groq.com). Optional: `ANTHROPIC_API_KEY` (paid), `AI_PROVIDERS` (order), `GEMINI_MODEL`, `GROQ_MODEL`.
3. Pi Developer Portal: set the app URL, and put the Validation Key in `public/validation-key.txt`.
4. Test in Pi Browser (sandbox), then set `sandbox:false` in `public/index.html`.

## Notes
- Prices are checked server-side in `api/pi/approve.js` against `api/_data.js` (keep in sync with the sample listings until a database exists).
- Listings are sample data.

## Payments and prices
- **Every price and payment in Forsale is in Pi** (reservation fee, listing fee). No fiat currency and no other token is used or displayed, in line with Pi's mainnet listing requirements.
- Sellers set their own Pi price. The reservation fee is `RESERVATION_PI` (Vercel env var, default 10). The server validates every amount before approving a payment.
- Before a mainnet launch, re-check the current Pi App Studio / Mainnet listing checklist.
