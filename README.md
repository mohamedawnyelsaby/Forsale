# 🌍 FORSALE - AI-Powered Global Marketplace

The world's first truly AI-native marketplace powered by Pi Network.

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm 9+
- PostgreSQL 16
- Pi Network Developer Account

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/forsale.git
cd forsale

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate database
pnpm db:generate
pnpm db:push

# Start development
pnpm dev
```

### Access Points
- Web: http://localhost:3000
- API: http://localhost:4000

## 📦 Project Structure
```
forsale/
├── apps/
│   └── web/              # Next.js web application
├── services/
│   ├── api/              # Main API server
│   └── payments/         # Pi Network integration
├── packages/
│   ├── database/         # Prisma schema
│   ├── types/            # TypeScript types
│   └── utils/            # Shared utilities
└── docs/                 # Documentation
```

## 🔐 Security

- All API keys in environment variables
- Never commit `.env` files
- Railway/Vercel for production secrets

## 📝 License

Proprietary © 2025 Forsale
# Production Ready
