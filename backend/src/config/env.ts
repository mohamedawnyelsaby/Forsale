mkdir -p src/config

cat > src/config/env.ts << 'EOF'
// ============================================
// 📄 FILENAME: env.ts
// 📍 PATH: backend/src/config/env.ts
// ============================================

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// ✅ Schema للتحقق من المتغيرات
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Pi Network
  PI_API_KEY: z.string(),
  PI_APP_SECRET: z.string(),
  PI_APP_ID: z.string(),
  PI_CALLBACK_BASE: z.string().url(),
  
  // Optional
  FRONTEND_URL: z.string().url().optional(),
});

// ✅ Parse and validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;

// ✅ Export individual values for convenience
export const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  PI_API_KEY,
  PI_APP_SECRET,
  PI_APP_ID,
  PI_CALLBACK_BASE,
  FRONTEND_URL,
} = config;
EOF
