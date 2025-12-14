// ============================================
// 📄 FILENAME: AppError.ts
// 📍 PATH: backend/src/utils/AppError.ts
// ============================================

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errors?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
