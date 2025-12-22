// ============================================
// 📄 FILENAME: index.ts (FIXED - PRODUCTION READY)
// 📍 PATH: backend/src/index.ts
// ============================================

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import { prisma, connectDB, disconnectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import piRoutes from './routes/pi.routes';
import uploadRoutes from './routes/upload.routes';
import reviewRoutes from './routes/review.routes';
import messageRoutes from './routes/message.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

class Server {
  private app: Application;
  private readonly PORT: number;
  private readonly NODE_ENV: string;

  constructor() {
    this.app = express();
    this.PORT = parseInt(process.env.PORT || '3000', 10);
    this.NODE_ENV = process.env.NODE_ENV || 'development';

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));

    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);

    logger.info('✅ Middlewares initialized');
  }

  private initializeRoutes(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: this.NODE_ENV,
        uptime: process.uptime()
      });
    });

    this.app.get('/api/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Forsale API - Global E-commerce Platform',
        version: '2.0.0',
        docs: '/api/docs',
        health: '/health'
      });
    });

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/products', productRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/pi', piRoutes);
    this.app.use('/api/upload', uploadRoutes);
    this.app.use('/api/reviews', reviewRoutes);
    this.app.use('/api/messages', messageRoutes);

    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    });

    logger.info('✅ Routes initialized');
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
    logger.info('✅ Error handling initialized');
  }

  private async connectDatabase(): Promise<void> {
    try {
      await connectDB();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      if (this.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

  public async start(): Promise<void> {
    try {
      await this.connectDatabase();

      this.app.listen(this.PORT, '0.0.0.0', () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 Forsale Server Started Successfully');
        console.log('='.repeat(50));
        console.log(`📡 Environment: ${this.NODE_ENV}`);
        console.log(`🌐 Server: http://0.0.0.0:${this.PORT}`);
        console.log(`🏥 Health: http://0.0.0.0:${this.PORT}/health`);
        console.log(`💰 Pi Network: http://0.0.0.0:${this.PORT}/api/pi`);
        console.log('='.repeat(50) + '\n');
      });

      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

      try {
        await disconnectDB();
        logger.info('✅ Database connection closed');
        logger.info('✅ Server shut down gracefully');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('💀 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💀 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }
}

const server = new Server();
server.start().catch((error) => {
  logger.error('💀 Fatal error during server startup:', error);
  process.exit(1);
});

export default server;
