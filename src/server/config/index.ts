/**
 * Centralized Configuration Layer
 * 
 * Provides typed, validated access to environment variables.
 * Protects secrets from client exposure or insecure logging.
 */

export interface AppConfig {
  env: "development" | "production" | "test";
  isProduction: boolean;
  port: number;
  corsOrigin: string;
  appUrl: string;
}

export interface FirebaseConfig {
  isConfigured: boolean;
  projectId?: string;
  clientEmail?: string;
  hasPrivateKey: boolean;
  databaseUrl?: string;
  storageBucket?: string;
}

export interface TwilioConfig {
  isConfigured: boolean;
  accountSid?: string;
  hasAuthToken: boolean;
  fromPhone?: string;
}

export interface PaymentConfig {
  gateway: "RAZORPAY" | "MOCK";
  keyId?: string;
  hasSecret: boolean;
  hasWebhookSecret: boolean;
  isConfigured: boolean;
}

export interface GeminiConfig {
  isConfigured: boolean;
  hasApiKey: boolean;
  model: string;
}

export interface MapsConfig {
  isConfigured: boolean;
  hasApiKey: boolean;
}

export interface StorageConfig {
  provider: "local" | "gcs";
  uploadDir: string;
  bucketName?: string;
}

export interface ServerConfig {
  app: AppConfig;
  firebase: FirebaseConfig;
  twilio: TwilioConfig;
  payment: PaymentConfig;
  gemini: GeminiConfig;
  maps: MapsConfig;
  storage: StorageConfig;
}

function resolvePort(): number {
  const portArgIdx = process.argv.indexOf("--port");
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    return Number(process.argv[portArgIdx + 1]);
  }
  // Cloud Run sets PORT (e.g. 8080). Must take precedence over DEFAULT_APP_PORT.
  return Number(process.env.PORT || process.env.DEFAULT_APP_PORT || 3000);
}

export function loadConfig(): ServerConfig {
  const env = (process.env.NODE_ENV || "development").toLowerCase() as "development" | "production" | "test";
  const isProduction = env === "production";
  
  // App Config
  const app: AppConfig = {
    env,
    isProduction,
    port: resolvePort(),
    corsOrigin: process.env.CORS_ORIGIN || "*",
    appUrl: process.env.APP_URL || "https://sevasphoorthi.org"
  };

  // Firebase Config
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const firebase: FirebaseConfig = {
    projectId: firebaseProjectId,
    clientEmail: firebaseClientEmail,
    hasPrivateKey: Boolean(firebasePrivateKey),
    databaseUrl: process.env.FIREBASE_DATABASE_URL?.trim(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.trim(),
    isConfigured: Boolean(firebaseProjectId && firebasePrivateKey && firebaseClientEmail)
  };

  // Twilio / SMS Config
  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER?.trim();
  const twilio: TwilioConfig = {
    accountSid: twilioSid,
    hasAuthToken: Boolean(twilioToken),
    fromPhone: twilioFrom,
    isConfigured: Boolean(twilioSid && twilioToken && twilioFrom)
  };

  // Razorpay / Payment Config
  const rzpKey = process.env.RAZORPAY_KEY_ID?.trim();
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const rzpWebhook = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  const payment: PaymentConfig = {
    gateway: (rzpKey && rzpSecret) ? "RAZORPAY" : "MOCK",
    keyId: rzpKey || "rzp_test_mock_sevasphoorthi",
    hasSecret: Boolean(rzpSecret),
    hasWebhookSecret: Boolean(rzpWebhook),
    isConfigured: Boolean(rzpKey && rzpSecret)
  };

  // Gemini / AI Config
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const gemini: GeminiConfig = {
    hasApiKey: Boolean(geminiKey),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    isConfigured: Boolean(geminiKey)
  };

  // Google Maps Config
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  const maps: MapsConfig = {
    hasApiKey: Boolean(mapsKey),
    isConfigured: Boolean(mapsKey)
  };

  // Storage Config
  const gcsBucket = process.env.GCS_BUCKET_NAME?.trim();
  const storage: StorageConfig = {
    provider: gcsBucket ? "gcs" : "local",
    uploadDir: process.env.UPLOAD_DIR || "data/uploads",
    bucketName: gcsBucket
  };

  return {
    app,
    firebase,
    twilio,
    payment,
    gemini,
    maps,
    storage
  };
}

export const config = loadConfig();

/**
 * Returns safe summary of external integration status without exposing credentials.
 */
export function getIntegrationStatusSummary() {
  return {
    environment: config.app.env,
    integrations: {
      firebase: {
        status: config.firebase.isConfigured ? "CONFIGURED_ACTIVE" : "MOCK_LOCAL_STORE",
        isMock: !config.firebase.isConfigured,
        projectId: config.firebase.projectId || "none"
      },
      sms: {
        status: config.twilio.isConfigured ? "TWILIO_CONFIGURED" : "MOCK_SMS_ADAPTER",
        isMock: !config.twilio.isConfigured
      },
      payment: {
        status: config.payment.isConfigured ? "RAZORPAY_LIVE_SANDBOX" : "MOCK_PAYMENT_GATEWAY",
        isMock: !config.payment.isConfigured,
        gateway: config.payment.gateway
      },
      ai: {
        status: config.gemini.isConfigured ? "GEMINI_ACTIVE" : "MOCK_AI_RULE_ENGINE",
        isMock: !config.gemini.isConfigured
      },
      maps: {
        status: config.maps.isConfigured ? "GOOGLE_MAPS_ACTIVE" : "MOCK_GEO_LOOKUP",
        isMock: !config.maps.isConfigured
      },
      storage: {
        status: config.storage.provider === "gcs" ? "GOOGLE_CLOUD_STORAGE" : "LOCAL_PERSISTENT_STORE",
        isMock: config.storage.provider !== "gcs"
      }
    }
  };
}
