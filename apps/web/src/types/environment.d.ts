/**
 * ============================================
 * ENVIRONMENT VARIABLES TYPE DEFINITIONS
 * ============================================
 * 
 * @file apps/web/src/types/environment.d.ts
 * @description TypeScript type definitions for environment variables
 * 
 * This file ensures type safety for all environment variables
 * used throughout the application.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // ============================================
      // NEXT.JS CONFIGURATION
      // ============================================
      
      /** Node environment (development, production, or test) */
      NODE_ENV: 'development' | 'production' | 'test';
      
      /** Public URL of the application */
      NEXT_PUBLIC_APP_URL: string;

      // ============================================
      // PI NETWORK CONFIGURATION
      // ============================================
      
      /** Pi Network API base URL */
      PI_API_URL: string;
      
      /** Pi Network API key (secret - never expose to client) */
      PI_API_KEY: string;
      
      /** Pi Network mode (testnet for development, mainnet for production) */
      NEXT_PUBLIC_PI_NETWORK_MODE: 'testnet' | 'mainnet';
      
      /** Pi Network SDK URL (optional override) */
      NEXT_PUBLIC_PI_SDK_URL?: string;

      // ============================================
      // API CONFIGURATION
      // ============================================
      
      /** API request timeout in milliseconds (default: 30000) */
      API_TIMEOUT?: string;
      
      /** Rate limit window duration in milliseconds (default: 60000) */
      API_RATE_LIMIT_WINDOW?: string;
      
      /** Maximum requests per rate limit window (default: 100) */
      API_RATE_LIMIT_MAX_REQUESTS?: string;

      // ============================================
      // AUTHENTICATION (Optional)
      // ============================================
      
      /** NextAuth secret for JWT signing */
      NEXTAUTH_SECRET?: string;
      
      /** NextAuth base URL */
      NEXTAUTH_URL?: string;

      // ============================================
      // DATABASE (Optional)
      // ============================================
      
      /** Database connection URL */
      DATABASE_URL?: string;
      
      /** Database connection pool size */
      DATABASE_POOL_SIZE?: string;

      // ============================================
      // VERIFICATION & SEO (Optional)
      // ============================================
      
      /** Google Search Console verification code */
      NEXT_PUBLIC_GOOGLE_VERIFICATION?: string;
      
      /** Yandex Webmaster verification code */
      NEXT_PUBLIC_YANDEX_VERIFICATION?: string;
      
      /** Facebook domain verification code */
      NEXT_PUBLIC_FB_VERIFICATION?: string;

      // ============================================
      // ANALYTICS & MONITORING (Optional)
      // ============================================
      
      /** Google Analytics measurement ID */
      NEXT_PUBLIC_GA_ID?: string;
      
      /** Sentry DSN for error tracking */
      NEXT_PUBLIC_SENTRY_DSN?: string;
      
      /** LogRocket application ID */
      NEXT_PUBLIC_LOGROCKET_ID?: string;

      // ============================================
      // PAYMENT & CRYPTO (Optional)
      // ============================================
      
      /** Stripe publishable key */
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
      
      /** Stripe secret key */
      STRIPE_SECRET_KEY?: string;

      // ============================================
      // EMAIL & NOTIFICATIONS (Optional)
      // ============================================
      
      /** SendGrid API key */
      SENDGRID_API_KEY?: string;
      
      /** Email sender address */
      EMAIL_FROM?: string;
      
      /** Twilio Account SID */
      TWILIO_ACCOUNT_SID?: string;
      
      /** Twilio Auth Token */
      TWILIO_AUTH_TOKEN?: string;

      // ============================================
      // STORAGE (Optional)
      // ============================================
      
      /** AWS S3 bucket name */
      AWS_S3_BUCKET?: string;
      
      /** AWS access key ID */
      AWS_ACCESS_KEY_ID?: string;
      
      /** AWS secret access key */
      AWS_SECRET_ACCESS_KEY?: string;
      
      /** AWS region */
      AWS_REGION?: string;

      // ============================================
      // REDIS (Optional)
      // ============================================
      
      /** Redis connection URL */
      REDIS_URL?: string;
      
      /** Redis password */
      REDIS_PASSWORD?: string;

      // ============================================
      // SECURITY (Optional)
      // ============================================
      
      /** CORS allowed origins (comma-separated) */
      CORS_ALLOWED_ORIGINS?: string;
      
      /** Session secret */
      SESSION_SECRET?: string;
      
      /** JWT secret */
      JWT_SECRET?: string;
      
      /** Encryption key for sensitive data */
      ENCRYPTION_KEY?: string;

      // ============================================
      // FEATURE FLAGS (Optional)
      // ============================================
      
      /** Enable maintenance mode */
      MAINTENANCE_MODE?: string;
      
      /** Enable debug mode */
      DEBUG_MODE?: string;
      
      /** Enable rate limiting */
      ENABLE_RATE_LIMITING?: string;
    }
  }
}

// This export is required for TypeScript to treat this file as a module
export {};
