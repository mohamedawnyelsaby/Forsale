rm src/config/env.ts

cat > src/config/env.ts << 'ENDOFFILE'
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PI_API_KEY: z.string(),
  PI_APP_SECRET: z.string(),
  PI_APP_ID: z.string(),
  PI_CALLBACK_BASE: z.string().url(),
  FRONTEND_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
export const NODE_ENV = config.NODE_ENV;
export const PORT = config.PORT;
export const DATABASE_URL = config.DATABASE_URL;
export const JWT_SECRET = config.JWT_SECRET;
export const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;
export const PI_API_KEY = config.PI_API_KEY;
export const PI_APP_SECRET = config.PI_APP_SECRET;
export const PI_APP_ID = config.PI_APP_ID;
export const PI_CALLBACK_BASE = config.PI_CALLBACK_BASE;
export const FRONTEND_URL = config.FRONTEND_URL;
ENDOFFILE
