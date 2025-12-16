// ============================================
// 📄 FILENAME: env.ts
// 📍 PATH: backend/src/config/env.ts
// ============================================

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),

  // ✅ السطر الوحيد اللي اتغير
  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : '*',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',
  
  // Pi Network
  PI_APP_ID: process.env.PI_APP_ID!,
  PI_API_KEY: process.env.PI_API_KEY!,
  PI_APP_SECRET: process.env.PI_APP_SECRET!,
  PI_CALLBACK_BASE: process.env.PI_CALLBACK_BASE!,
  
  // AI Service
  AI_SERVICE_URL: process.env.AI_SERVICE_URL!,
  AI_SERVICE_KEY: process.env.AI_SERVICE_KEY!,
  
  // AWS S3 / Spaces
  S3_ENDPOINT: process.env.S3_ENDPOINT!,
  S3_BUCKET: process.env.S3_BUCKET!,
  S3_KEY: process.env.S3_KEY!,
  S3_SECRET: process.env.S3_SECRET!,
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
};
