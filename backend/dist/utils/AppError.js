"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    message;
    statusCode;
    errors;
    constructor(message, statusCode = 500, errors) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=AppError.js.map