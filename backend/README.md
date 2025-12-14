# Forsale Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure .env file with your credentials

3. Run Prisma migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start development server:
```bash
npm run dev
```

Server runs on: http://localhost:3000

## API Documentation

- Health Check: `GET /health`
- Auth: `/api/auth/*`
- Products: `/api/products/*`
- Orders: `/api/orders/*`
- Pi Network: `/api/pi/*`
