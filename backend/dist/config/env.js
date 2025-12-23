"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('3000'),
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRE: zod_1.z.string().default('7d'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_EXPIRE: zod_1.z.string().default('30d'),
    PI_API_KEY: zod_1.z.string(),
    PI_APP_SECRET: zod_1.z.string(),
    PI_APP_ID: zod_1.z.string(),
    PI_CALLBACK_BASE: zod_1.z.string().url(),
    CORS_ORIGIN: zod_1.z.string().default('*'),
    S3_ENDPOINT: zod_1.z.string().url(),
    S3_BUCKET: zod_1.z.string(),
    S3_KEY: zod_1.z.string(),
    S3_SECRET: zod_1.z.string(),
    SMTP_HOST: zod_1.z.string(),
    SMTP_PORT: zod_1.z.string().transform(Number),
    SMTP_USER: zod_1.z.string().email(),
    SMTP_PASS: zod_1.z.string(),
    LOG_LEVEL: zod_1.z.string().default('info')
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
}
exports.config = parsed.data;
//# sourceMappingURL=env.js.map