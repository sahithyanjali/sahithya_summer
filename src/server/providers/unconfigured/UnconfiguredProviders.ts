import type {
  IAuthProvider,
  ISmsProvider,
  INotificationProvider,
  IPaymentProvider,
  IMapsProvider,
  IAIProvider,
  IStorageProvider,
  ProviderMetadata,
  AuthUserRecord,
  SmsResult,
  NotificationResult,
  CreatePaymentOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  GeocodeResult,
  DistanceResult,
  VolunteerMatchResult,
  UploadResult
} from "../types.ts";
import { logger } from "../../logger.ts";

export class ServiceConfigurationError extends Error {
  public readonly code = "SERVICE_UNCONFIGURED";
  constructor(serviceName: string) {
    super(`[PRODUCTION LOCKDOWN] ${serviceName} is not configured in this production environment. Please inject the required credentials via Google Cloud Secret Manager / environment variables.`);
    this.name = "ServiceConfigurationError";
  }
}

// 1. Unconfigured Auth Provider
export class UnconfiguredAuthProvider implements IAuthProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "UNCONFIGURED_AUTH_SERVICE",
    isMock: false,
    version: "1.0.0"
  };

  async verifyToken(_idToken: string): Promise<AuthUserRecord | null> {
    logger.warn("UnconfiguredAuthProvider: Attempted token verification in production without Firebase credentials");
    return null;
  }

  async sendPhoneOtp(_phone: string): Promise<{ success: boolean; verificationId: string; message: string }> {
    throw new ServiceConfigurationError("Production Phone Authentication / SMS OTP Service");
  }

  async verifyPhoneOtp(_verificationId: string, _otp: string): Promise<{ success: boolean; user?: AuthUserRecord; token?: string }> {
    throw new ServiceConfigurationError("Production Phone Authentication Service");
  }

  async setCustomRole(_uid: string, _role: string): Promise<boolean> {
    throw new ServiceConfigurationError("Production Auth Custom Role Service");
  }
}

// 2. Unconfigured SMS Provider
export class UnconfiguredSmsProvider implements ISmsProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "UNCONFIGURED_SMS_SERVICE",
    isMock: false,
    version: "1.0.0"
  };

  async sendSms(to: string, _message: string, _templateId?: string): Promise<SmsResult> {
    logger.error("UnconfiguredSmsProvider: Blocked simulated SMS in production mode", { recipient: to });
    return {
      success: false,
      messageId: "",
      deliveryStatus: "FAILED",
      recipient: to,
      timestamp: new Date().toISOString()
    };
  }
}

// 3. Unconfigured Notification Provider
export class UnconfiguredNotificationProvider implements INotificationProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "UNCONFIGURED_NOTIFICATION_SERVICE",
    isMock: false,
    version: "1.0.0"
  };

  async sendToUser(userId: string, _title: string, _body: string): Promise<NotificationResult> {
    logger.error("UnconfiguredNotificationProvider: Push notifications unconfigured in production", { userId });
    return {
      success: false,
      notificationId: "",
      deliveredCount: 0,
      failureCount: 1
    };
  }

  async broadcastToTopic(topic: string, _title: string, _body: string): Promise<NotificationResult> {
    logger.error("UnconfiguredNotificationProvider: Topic broadcast unconfigured in production", { topic });
    return {
      success: false,
      notificationId: "",
      deliveredCount: 0,
      failureCount: 1
    };
  }
}

// 4. Unconfigured Payment Provider
export class UnconfiguredPaymentProvider implements IPaymentProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "UNCONFIGURED_PAYMENT_GATEWAY",
    isMock: false,
    version: "1.0.0"
  };

  getPublicKey(): string {
    return "";
  }

  async createOrder(_params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    logger.error("UnconfiguredPaymentProvider: Blocked payment order creation in production mode without live gateway credentials");
    throw new ServiceConfigurationError("Production Payment Gateway (Razorpay)");
  }

  async verifySignature(_params: VerifyPaymentParams): Promise<boolean> {
    logger.error("UnconfiguredPaymentProvider: Blocked signature verification in unconfigured production mode");
    return false;
  }

  async refund(_paymentId: string, _amountInRupees?: number, _reason?: string): Promise<{ success: boolean; refundId: string }> {
    throw new ServiceConfigurationError("Production Payment Refund Gateway");
  }
}

// 5. Unconfigured Maps Provider
export class UnconfiguredMapsProvider implements IMapsProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "UNCONFIGURED_MAPS_SERVICE",
    isMock: false,
    version: "1.0.0"
  };

  async geocodeAddress(_address: string): Promise<GeocodeResult | null> {
    logger.warn("UnconfiguredMapsProvider: Geocoding requested in production without Google Maps API key");
    return null;
  }

  async calculateDistance(_origin: { lat: number; lng: number }, _destination: { lat: number; lng: number }): Promise<DistanceResult> {
    logger.warn("UnconfiguredMapsProvider: Distance calculation requested in production without Maps API key");
    return {
      distanceKm: 0,
      durationMinutes: 0
    };
  }
}

// 6. Unconfigured AI Provider
export class UnconfiguredAIProvider implements IAIProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "UNCONFIGURED_AI_SERVICE",
    isMock: false,
    version: "1.0.0"
  };

  async generateText(_prompt: string, _systemInstruction?: string): Promise<string> {
    throw new ServiceConfigurationError("Production Gemini AI Service");
  }

  async matchVolunteerSkills(_volunteerProfile: any, opportunities: any[]): Promise<VolunteerMatchResult> {
    logger.warn("UnconfiguredAIProvider: AI matching unavailable in production, using zero-match fallback");
    return {
      matchScore: 0,
      recommendedOpportunities: opportunities.slice(0, 1).map(o => o.id),
      rationale: "Production Gemini AI credentials not configured."
    };
  }
}

// 7. Unconfigured Storage Provider
export class UnconfiguredStorageProvider implements IStorageProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "UNCONFIGURED_STORAGE_SERVICE",
    isMock: false,
    version: "1.0.0"
  };

  async uploadFile(_buffer: Buffer, _filename: string, _mimeType: string): Promise<UploadResult> {
    throw new ServiceConfigurationError("Production Cloud Storage Service (Google Cloud Storage)");
  }

  async getDownloadUrl(_fileKey: string): Promise<string> {
    throw new ServiceConfigurationError("Production Cloud Storage Service");
  }

  async deleteFile(_fileKey: string): Promise<boolean> {
    throw new ServiceConfigurationError("Production Cloud Storage Service");
  }
}
