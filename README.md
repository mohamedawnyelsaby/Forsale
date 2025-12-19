# 🌍 Forsale - Global AI-Powered Marketplace

> The world's smartest marketplace powered by AI and Pi Network

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](https://github.com/mohamedawnyelsaby/Forsale)
[![Pi Network](https://img.shields.io/badge/Pi%20Network-Integrated-purple.svg)](https://minepi.com)

## 🎯 Vision

Forsale is a next-generation global marketplace that combines:
- 🤖 **AI Intelligence** - Smart search, price analysis, and recommendations
- 🌍 **Global Reach** - Multi-language support for worldwide users
- 🪙 **Pi Network Native** - Seamless cryptocurrency payments
- 🛡️ **Trust & Safety** - Escrow protection and verified sellers
- ⚡ **Lightning Fast** - Optimized for speed and performance

---

## ✨ Key Features

### 🤖 AI-Powered
- **Smart Search**: Natural language understanding + voice + image search
- **Price Intelligence**: Real-time market analysis and deal scoring
- **Logy AI Assistant**: 24/7 AI chatbot for customer support
- **Fraud Detection**: ML-powered security system

### 🌍 Global Platform
- **10 Languages**: English, Arabic, Spanish, French, German, Chinese, Hindi, Portuguese, Russian, Japanese
- **RTL Support**: Proper right-to-left layout for Arabic and Hebrew
- **Multi-Currency**: Pi cryptocurrency + fiat currencies
- **Worldwide Shipping**: International marketplace

### 🛡️ Trust & Security
- **Escrow System**: Payments held until delivery confirmation
- **Seller Verification**: Multi-level verification with badges
- **Rating System**: Transparent reviews and ratings
- **Dispute Resolution**: Fair and fast conflict resolution

### 📱 Modern UX
- **Mobile-First**: Optimized for all devices
- **Fast Loading**: < 3s page load time
- **Accessibility**: WCAG 2.1 AA compliant
- **Smooth Animations**: Delightful micro-interactions

---

## 📁 Project Structure

```
Forsale/
├── frontend/
│   ├── public/
│   │   └── index.html              # Main HTML (English)
│   ├── src/
│   │   ├── styles/
│   │   │   └── style.css           # Complete design system
│   │   ├── scripts/
│   │   │   ├── script.js           # Main application logic
│   │   │   └── i18n.js             # Internationalization (10 languages)
│   │   └── assets/
│   │       ├── images/
│   │       └── fonts/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── controllers/            # API controllers
│   │   ├── services/               # Business logic
│   │   ├── routes/                 # API routes
│   │   ├── middleware/             # Auth, validation, etc.
│   │   └── utils/                  # Helpers
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── migrations/
│   ├── package.json
│   └── README.md
│
├── ai_service/
│   ├── models/                     # ML models
│   ├── services/                   # AI services
│   │   ├── price_analysis.py
│   │   ├── image_recognition.py
│   │   ├── nlp_search.py
│   │   └── fraud_detection.py
│   ├── requirements.txt
│   └── README.md
│
├── docs/
│   ├── analysis.md                 # Project analysis
│   ├── design-strategy.md          # Design system docs
│   ├── wireframes.html             # Interactive wireframes
│   └── api/                        # API documentation
│
├── .gitignore
├── LICENSE
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Python 3.10+ (for AI services)
- Pi Network Browser (optional, for Pi integration)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/mohamedawnyelsaby/Forsale.git
cd Forsale
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

#### 3. Backend Setup
```bash
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Start server
npm run dev
# API available at http://localhost:4000
```

#### 4. AI Services Setup
```bash
cd ai_service
pip install -r requirements.txt

# Start AI service
python main.py
# AI service at http://localhost:5000
```

---

## 🌍 Multi-Language Setup

### How It Works

Forsale uses a comprehensive i18n system supporting 10 languages:

1. **English** (en) - Primary language
2. **Arabic** (ar) - RTL support
3. **Spanish** (es)
4. **French** (fr)
5. **German** (de)
6. **Chinese** (zh)
7. **Hindi** (hi)
8. **Portuguese** (pt)
9. **Russian** (ru)
10. **Japanese** (ja)

### File Structure

```
frontend/
├── index.html                  # English (primary)
├── src/
│   └── scripts/
│       └── i18n.js            # All 10 languages
```

### Usage

The system automatically:
- Detects browser language
- Saves user preference
- Updates all UI text
- Adjusts layout (RTL for Arabic)

```javascript
// In your HTML, add data-i18n attribute
<h1 data-i18n="welcome_back">Welcome Back</h1>

// JavaScript will automatically translate based on user's language
```

### Adding New Language

1. Open `src/scripts/i18n.js`
2. Add new language object:

```javascript
translations.ko = {  // Korean
  welcome_back: "다시 오신 것을 환영합니다",
  // ... add all keys
};
```

3. Update language selector in HTML

---

## 🎨 Design System

### "Velocity Market" Theme

**Philosophy**: Fast • Powerful • Trustworthy

#### Colors
```css
--electric-blue: #0066FF;     /* Primary actions */
--deep-navy: #0A1628;         /* Backgrounds */
--bright-orange: #FF6B35;     /* Accents */
--success-green: #00D9A3;     /* Success states */
--warm-gold: #FFB800;         /* Premium features */
--purple-accent: #8B5CF6;     /* AI features */
```

#### Typography
- **Font**: Inter (system fallback)
- **Scale**: 12px - 48px
- **Weight**: 400 - 900

#### Spacing
- **Base**: 8px grid system
- **Range**: 4px - 80px

### Components
- Glassmorphism cards
- Smooth animations
- Micro-interactions
- Skeleton loading states

---

## 📊 Tech Stack

### Frontend
- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Next.js (planned migration)
- **Styling**: CSS Variables + Custom Design System
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Search**: ElasticSearch (planned)

### AI Services
- **Language**: Python 3.10+
- **ML**: TensorFlow, PyTorch
- **NLP**: Transformers, spaCy
- **Vision**: OpenCV, YOLO
- **API**: FastAPI

### Infrastructure
- **Hosting**: Vercel (Frontend), AWS (Backend)
- **CDN**: Cloudflare
- **Storage**: AWS S3
- **Monitoring**: Datadog
- **Analytics**: Mixpanel

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Weeks 1-2)
- [x] Complete design system
- [x] Multi-language support (10 languages)
- [x] Responsive UI/UX
- [x] JavaScript functionality
- [x] Documentation

### Phase 2: Core Features 🚧 (Weeks 3-5)
- [ ] Backend API implementation
- [ ] User authentication (Pi + traditional)
- [ ] Product CRUD operations
- [ ] Real-time chat
- [ ] Escrow payment system
- [ ] Notification system

### Phase 3: AI Integration (Weeks 6-8)
- [ ] AI price analysis
- [ ] Smart search (NLP)
- [ ] Image recognition
- [ ] Logy AI chatbot
- [ ] Fraud detection
- [ ] Recommendation engine

### Phase 4: Polish & Launch (Weeks 9-12)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Beta testing (100 users)
- [ ] Marketing materials
- [ ] Public launch

### Phase 5: Scale (Months 3-6)
- [ ] Advanced AI features
- [ ] Social features
- [ ] AR product preview
- [ ] Live streaming
- [ ] International expansion
- [ ] Series A funding

---

## 📝 API Documentation

### Base URL
```
Development: http://localhost:4000/api/v1
Production: https://api.forsale.com/v1
```

### Authentication
```bash
# Pi Network Authentication
POST /auth/pi
Body: { piToken: "..." }

# Traditional Login
POST /auth/login
Body: { email: "...", password: "..." }
```

### Products
```bash
# Get all products
GET /products?page=1&limit=20

# Get product by ID
GET /products/:id

# Create product
POST /products
Body: { name, price, description, images, category }

# Update product
PATCH /products/:id

# Delete product
DELETE /products/:id
```

Full API documentation: [docs/api/README.md](docs/api/README.md)

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test                # Unit tests
npm run test:e2e       # E2E tests (Cypress)
npm run test:coverage  # Coverage report
```

### Backend Tests
```bash
cd backend
npm test                # Unit + Integration tests
npm run test:api       # API tests
```

### AI Services Tests
```bash
cd ai_service
pytest                 # All tests
pytest --cov          # With coverage
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel deploy --prod
```

### Backend (AWS)
```bash
# Using Docker
docker build -t forsale-backend .
docker push forsale-backend

# Or using PM2
pm2 start npm --name "forsale-api" -- start
```

### Environment Variables

```bash
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/forsale
REDIS_URL=redis://localhost:6379
PI_API_KEY=your_pi_api_key
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY=your_aws_key
AWS_SECRET_KEY=your_aws_secret
STRIPE_KEY=your_stripe_key
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- **JavaScript**: ESLint + Prettier
- **TypeScript**: Strict mode enabled
- **Python**: Black + Flake8
- **Commits**: Conventional Commits format

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Mohamed Awny Elsaby** - *Creator & Lead Developer* - [@mohamedawnyelsaby](https://github.com/mohamedawnyelsaby)

---

## 🙏 Acknowledgments

- Pi Network for blockchain integration
- Anthropic for AI assistance in development
- Open source community for amazing tools

---

## 📞 Contact & Support

- **Email**: support@forsale.com
- **Discord**: [Join our community](https://discord.gg/forsale)
- **Twitter**: [@ForsaleApp](https://twitter.com/ForsaleApp)
- **Documentation**: [docs.forsale.com](https://docs.forsale.com)

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/mohamedawnyelsaby/Forsale?style=social)
![GitHub forks](https://img.shields.io/github/forks/mohamedawnyelsaby/Forsale?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/mohamedawnyelsaby/Forsale?style=social)

---

<p align="center">
  <strong>Built with ❤️ for the global community</strong>
</p>

<p align="center">
  <a href="#-vision">Vision</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-multi-language-setup">Languages</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-contributing">Contributing</a>
</p>
