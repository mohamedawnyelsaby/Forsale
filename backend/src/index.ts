// ============================================
// 📄 FILENAME: index.ts
// 📍 PATH: backend/src/index.ts
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';
import { connectDB } from './config/database';
import { WebSocketService } from './services/websocket.service';

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
const wsService = new WebSocketService(server);

// Security & Performance Middleware
app.use(helmet());
app.use(compression());

// ✅ إعدادات CORS المحدثة (للإنتاج و Pi Network)
app.use(cors({
  origin: [
    config.CORS_ORIGIN,               // القيمة من ملف البيئة
    'https://pi-forsale.vercel.app',  // رابط الفرونت إند
    'https://minepi.com',             // متصفح باي
    'http://localhost:5173',          // اللوكل هوست
    /\.vercel\.app$/                  // أي صب دومين
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// ✅ نقطة البداية (Root Endpoint) لضمان عمل Railway
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Forsale AI Backend Ready 🚀',
    timestamp: new Date().toISOString() 
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.PORT, () => {
      logger.info(`🚀 Server running on port ${config.PORT}`);
      logger.info(`📡 Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
