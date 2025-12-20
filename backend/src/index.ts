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
import path from 'path'; // <--- (1) IMPORT ADDED
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
// <--- (2) MODIFIED: Adjusted Helmet to allow external fonts/scripts (CDN) for the new design
app.use(helmet({
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(cors({
  origin: config.CORS_ORIGIN || '*', // Fallback to * if not set
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// <--- (3) ADDED: Serve Static Files (The Frontend)
// This tells Express: "Look for HTML/CSS/JS files in the 'public' folder at the project root"
app.use(express.static(path.join(process.cwd(), 'public')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// <--- (4) ADDED: Catch-All Route to serve index.html
// This ensures that when you visit the main URL, the site loads.
app.get('*', (req, res, next) => {
  // If the request is for API but not found, let the Error Handler handle it
  if (req.url.startsWith('/api')) {
    return next();
  }
  // Otherwise, serve the frontend
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.PORT, () => {
      logger.info(`🚀 Server running on port ${config.PORT}`);
      logger.info(`📡 Environment: ${config.NODE_ENV}`);
      logger.info(`🎨 Frontend served from: ${path.join(process.cwd(), 'public')}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
