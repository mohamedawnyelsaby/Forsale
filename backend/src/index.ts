// ============================================
// 📄 FILENAME: index.ts
// 📍 PATH: backend/src/index.ts
// 🎯 PURPOSE: Main server entry point - Production ready
// ============================================

import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import piRoutes from './routes/pi.routes';

/**
 * Main Application Class
 * Handles server initialization and configuration
 */
class Server {
  private app: Application;
  private readonly PORT: number;
  private readonly MONGODB_URI: string;
  private readonly NODE_ENV: string;

  constructor() {
    this.app = express();
    this.PORT = parseInt(process.env.PORT || '5000', 10);
    this.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forsale';
    this.NODE_ENV = process.env.NODE_ENV || 'development';

    // Initialize server
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize all middleware
   */
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Compression
    this.app.use(compression());

    // Body parsers
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (this.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);

    console.log('✅ Middlewares initialized');
  }

  /**
   * Initialize all routes
   */
  private initializeRoutes(): void {
    // Health check endpoint
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

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Forsale API - Global E-commerce Platform',
        version: '1.0.0',
        docs: '/api/docs',
        health: '/health'
      });
    });

    // API routes
    this.app.use('/api/pi', piRoutes);

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: [
          'GET /',
          'GET /health',
          'GET /api/health',
          'POST /api/pi/create-payment',
          'POST /api/pi/approve-payment',
          'POST /api/pi/complete-payment',
          'POST /api/pi/cancel-payment',
          'POST /api/pi/payment-callback',
          'GET /api/pi/auth',
          'GET /api/pi/auth/callback'
        ]
      });
    });

    console.log('✅ Routes initialized');
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('❌ Server error:', err);

      // Handle specific error types
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: err.message
        });
      }

      if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or missing authentication token'
        });
      }

      // Generic error response
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: this.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        stack: this.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    console.log('✅ Error handling initialized');
  }

  /**
   * Connect to MongoDB
   */
  private async connectDatabase(): Promise<void> {
    try {
      await mongoose.connect(this.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ Connected to MongoDB');
      console.log(`📍 Database: ${mongoose.connection.name}`);
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      
      // In production, we might want to retry or exit
      if (this.NODE_ENV === 'production') {
        console.error('💀 Exiting due to database connection failure');
        process.exit(1);
      } else {
        console.warn('⚠️  Continuing without database in development mode');
      }
    }

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Connect to database
      await this.connectDatabase();

      // Start listening
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

      // Graceful shutdown handlers
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

      try {
        // Close database connection
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');

        console.log('✅ Server shut down gracefully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('💀 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💀 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }
}

// Create and start server
const server = new Server();
server.start().catch((error) => {
  console.error('💀 Fatal error during server startup:', error);
  process.exit(1);
});

export default server;
