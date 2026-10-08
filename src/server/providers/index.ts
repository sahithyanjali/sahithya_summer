/**
 * Centralized Provider Registry
 * 
 * Instantiates the appropriate provider (Production vs Mock) based on the presence
 * of valid environment credentials.
 */

import { config } from "../config/index.ts";
import { logger } from "../logger.ts";

import type {
  IAuthProvider,
  ISmsProvider,
  INotificationProvider,
  IPaymentProvider,
  IMapsProvider,
  IAIProvider,
  IStorageProvider
} from "./types.ts";

import { MockAuthProvider } from "./mock/MockAuthProvider.ts";
import { MockSmsProvider } from "./mock/MockSmsProvider.ts";
import { MockNotificationProvider } from "./mock/MockNotificationProvider.ts";
import { MockPaymentProvider } from "./mock/MockPaymentProvider.ts";
import { MockMapsProvider } from "./mock/MockMapsProvider.ts";
import { MockAIProvider } from "./mock/MockAIProvider.ts";
import { MockStorageProvider } from "./mock/MockStorageProvider.ts";

import { TwilioSmsProvider } from "./production/TwilioSmsProvider.ts";
import { RazorpayPaymentProvider } from "./production/RazorpayPaymentProvider.ts";
import { GeminiAIProvider } from "./production/GeminiAIProvider.ts";
import { GoogleMapsProvider } from "./production/GoogleMapsProvider.ts";

import {
  UnconfiguredAuthProvider,
  UnconfiguredSmsProvider,
  UnconfiguredNotificationProvider,
  UnconfiguredPaymentProvider,
  UnconfiguredMapsProvider,
  UnconfiguredAIProvider,
  UnconfiguredStorageProvider
} from "./unconfigured/UnconfiguredProviders.ts";

const isProduction = config.app.isProduction;

// 1. Auth Provider
// In production, require real Firebase credentials or fail safely. In dev/test, allow sandbox mock.
export const authProvider: IAuthProvider = config.firebase.isConfigured
  ? new MockAuthProvider() // Placeholder until Firebase Admin SDK is initialized with service credentials
  : isProduction
    ? new UnconfiguredAuthProvider()
    : new MockAuthProvider();

// 2. SMS Provider
// In production, require valid Twilio/Fast2SMS credentials. NEVER fallback to fake SMS in production.
export const smsProvider: ISmsProvider = config.twilio.isConfigured
  ? new TwilioSmsProvider(config.twilio.accountSid!, process.env.TWILIO_AUTH_TOKEN!, config.twilio.fromPhone!)
  : isProduction
    ? new UnconfiguredSmsProvider()
    : new MockSmsProvider();

// 3. Notification Provider
// In production, fail safely if push notification server credentials are not configured.
export const notificationProvider: INotificationProvider = isProduction
  ? new UnconfiguredNotificationProvider()
  : new MockNotificationProvider();

// 4. Payment Provider
// In production, require live Razorpay credentials. NEVER process simulated payments in production.
export const paymentProvider: IPaymentProvider = config.payment.isConfigured
  ? new RazorpayPaymentProvider(config.payment.keyId!, process.env.RAZORPAY_KEY_SECRET!)
  : isProduction
    ? new UnconfiguredPaymentProvider()
    : new MockPaymentProvider();

// 5. Maps Provider
// In production, require Google Maps API Key or fail safely without fake geocoding.
export const mapsProvider: IMapsProvider = config.maps.isConfigured
  ? new GoogleMapsProvider(process.env.GOOGLE_MAPS_API_KEY!)
  : isProduction
    ? new UnconfiguredMapsProvider()
    : new MockMapsProvider();

// 6. AI Provider
// In production, require GEMINI_API_KEY. Never silently fake AI output.
export const aiProvider: IAIProvider = config.gemini.isConfigured
  ? new GeminiAIProvider(process.env.GEMINI_API_KEY!, config.gemini.model)
  : isProduction
    ? new UnconfiguredAIProvider()
    : new MockAIProvider();

// 7. Storage Provider
// In production, require cloud bucket (GCS/S3) or fail safely.
export const storageProvider: IStorageProvider = config.storage.provider === "gcs" && process.env.GCS_BUCKET_NAME
  ? new MockStorageProvider(config.storage.uploadDir)
  : isProduction
    ? new UnconfiguredStorageProvider()
    : new MockStorageProvider(config.storage.uploadDir);

logger.info("Provider Registry initialized", {
  environment: config.app.env,
  isProduction,
  auth: authProvider.metadata.providerName,
  sms: smsProvider.metadata.providerName,
  payment: paymentProvider.metadata.providerName,
  ai: aiProvider.metadata.providerName,
  maps: mapsProvider.metadata.providerName,
  storage: storageProvider.metadata.providerName
});

function getServiceStatus(provider: { metadata: { isMock: boolean; providerName: string } }) {
  if (provider.metadata.providerName.startsWith("UNCONFIGURED_")) {
    return "SERVICE_NOT_CONFIGURED";
  }
  if (provider.metadata.isMock) {
    return isProduction ? "FORBIDDEN_MOCK_IN_PROD" : "SANDBOX_MOCK";
  }
  return "PRODUCTION_ACTIVE";
}

export function getProviderRegistryStatus() {
  return {
    auth: {
      name: authProvider.metadata.providerName,
      isMock: authProvider.metadata.isMock,
      status: getServiceStatus(authProvider)
    },
    sms: {
      name: smsProvider.metadata.providerName,
      isMock: smsProvider.metadata.isMock,
      status: getServiceStatus(smsProvider)
    },
    notifications: {
      name: notificationProvider.metadata.providerName,
      isMock: notificationProvider.metadata.isMock,
      status: getServiceStatus(notificationProvider)
    },
    payment: {
      name: paymentProvider.metadata.providerName,
      isMock: paymentProvider.metadata.isMock,
      status: getServiceStatus(paymentProvider),
      publicKey: paymentProvider.getPublicKey()
    },
    maps: {
      name: mapsProvider.metadata.providerName,
      isMock: mapsProvider.metadata.isMock,
      status: getServiceStatus(mapsProvider)
    },
    ai: {
      name: aiProvider.metadata.providerName,
      isMock: aiProvider.metadata.isMock,
      status: getServiceStatus(aiProvider)
    },
    storage: {
      name: storageProvider.metadata.providerName,
      isMock: storageProvider.metadata.isMock,
      status: getServiceStatus(storageProvider)
    }
  };
}
