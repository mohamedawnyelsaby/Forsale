// ============================================
// 📄 FILENAME: env.ts (FIXED - ALL TYPES RESOLVED)
// 📍 PATH: backend/src/config/env.ts
// ============================================

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRE: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRE: z.string().default('30d'),
  
  // Pi Network
  PI_API_KEY: z.string(),
  PI_APP_SECRET: z.string(),
  PI_APP_ID: z.string(),
  PI_CALLBACK_BASE: z.string().url(),
  
  // CORS
  CORS_ORIGIN: z.string().default('*'),
  
  // S3/Spaces
  S3_ENDPOINT: z.string().url(),
  S3_BUCKET: z.string(),
  S3_KEY: z.string(),
  S3_SECRET: z.string(),
  
  // SMTP
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string(),
  
  // Optional
  LOG_LEVEL: z.string().default('info'),
  REDIS_URL: z.string().optional(),
  AI_SERVICE_URL: z.string().url().optional(),
  AI_SERVICE_KEY: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
