"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const pi_routes_1 = __importDefault(require("./routes/pi.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
class Server {
    app;
    PORT;
    NODE_ENV;
    constructor() {
        this.app = (0, express_1.default)();
        this.PORT = parseInt(process.env.PORT || '3000', 10);
        this.NODE_ENV = process.env.NODE_ENV || 'development';
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false
        }));
        this.app.use((0, cors_1.default)({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: 'Too many requests, please try again later.',
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use('/api/', limiter);
        logger_1.logger.info('✅ Middlewares initialized');
    }
    initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Server is healthy',
                timestamp: new Date().toISOString(),
                environment: this.NODE_ENV,
                uptime: process.uptime()
            });
        });
        this.app.get('/api/health', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'API is healthy',
                timestamp: new Date().toISOString()
            });
        });
        this.app.get('/', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Forsale API - Global E-commerce Platform',
                version: '2.0.0',
                docs: '/api/docs',
                health: '/health'
            });
        });
        this.app.use('/api/auth', auth_routes_1.default);
        this.app.use('/api/users', user_routes_1.default);
        this.app.use('/api/products', product_routes_1.default);
        this.app.use('/api/orders', order_routes_1.default);
        this.app.use('/api/pi', pi_routes_1.default);
        this.app.use('/api/upload', upload_routes_1.default);
        this.app.use('/api/reviews', review_routes_1.default);
        this.app.use('/api/messages', message_routes_1.default);
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Route not found',
                message: `Cannot ${req.method} ${req.originalUrl}`
            });
        });
        logger_1.logger.info('✅ Routes initialized');
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
        logger_1.logger.info('✅ Error handling initialized');
    }
    async connectDatabase() {
        try {
            await (0, database_1.connectDB)();
            logger_1.logger.info('✅ Database connected successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Database connection failed:', error);
            if (this.NODE_ENV === 'production') {
                process.exit(1);
            }
        }
    }
    async start() {
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
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`\n⚠️  ${signal} received. Starting graceful shutdown...`);
            try {
                await (0, database_1.disconnectDB)();
                logger_1.logger.info('✅ Database connection closed');
                logger_1.logger.info('✅ Server shut down gracefully');
                process.exit(0);
            }
            catch (error) {
                logger_1.logger.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            logger_1.logger.error('💀 Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error('💀 Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('unhandledRejection');
        });
    }
}
const server = new Server();
server.start().catch((error) => {
    logger_1.logger.error('💀 Fatal error during server startup:', error);
    process.exit(1);
});
exports.default = server;
//# sourceMappingURL=index.js.map