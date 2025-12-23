"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Error:', err);
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
        return;
    }
    if (err.name === 'PrismaClientKnownRequestError') {
        res.status(400).json({
            success: false,
            message: 'Database operation failed'
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map