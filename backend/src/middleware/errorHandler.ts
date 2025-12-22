// ============================================
// 📄 FILENAME: errorHandler.ts (FIXED)
// 📍 PATH: backend/src/middleware/errorHandler.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', err);
  
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
    return;
  }
  
  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      message: 'Database operation failed'
    });
    return;
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
