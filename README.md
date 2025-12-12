# Forsale AI — Production-ready bundle

This archive contains a production-ready project skeleton for Forsale AI:
- frontend/ (static site)
- backend/ (Node.js Express backend)
- ai_service/ (FastAPI mock)
- migrations/ (Postgres schema)

## Quick start (local)
1. Fill backend/.env with your secrets (see .env.example)
2. Install dependencies:
   - Backend: `cd backend && npm install`
   - AI service: `cd ai_service && pip install fastapi uvicorn`
3. Run database migrations (apply migrations/001_init.sql to your Postgres)
4. Start backend: `cd backend && npm run dev`
5. Start AI mock: `cd ai_service && python main.py`
6. Open frontend: open frontend/index.html

## Notes
- Replace Pi API placeholders with your Pi Developer credentials in backend/.env
- Move screenshot saved to `frontend/public/screenshots/forsale-home.jpg`
- Use Vercel for frontend hosting and Railway (recommended) or Vercel Serverless for backend.
