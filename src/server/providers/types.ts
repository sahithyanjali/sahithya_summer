/**
 * External Integration Provider Interfaces
 * 
 * Provides clean architectural boundaries so external services (Firebase, Twilio,
 * Razorpay, Google Maps, Gemini AI, Cloud Storage) can be injected with real credentials
 * or run with high-fidelity, deterministic mock implementations without altering business logic.
 */

export interface ProviderMetadata {
  providerName: string;
  isMock: boolean;
  version: string;
}

// -------------------------------------------------------------
// 1. AUTH PROVIDER
// -------------------------------------------------------------
export interface AuthUserRecord {
  uid: string;
  phone?: string;
  email?: string;
  displayName?: string;
  role: "volunteer" | "donor" | "admin" | "coordinator" | "guest";
  customClaims?: Record<string, any>;
  createdAt: string;
}

export interface IAuthProvider {
  readonly metadata: ProviderMetadata;
  verifyToken(idToken: string): Promise<AuthUserRecord | null>;
  sendPhoneOtp(phone: string): Promise<{ success: boolean; verificationId: string; message: string }>;
  verifyPhoneOtp(verificationId: string, otp: string): Promise<{ success: boolean; user?: AuthUserRecord; token?: string }>;
  setCustomRole(uid: string, role: string): Promise<boolean>;
}

// -------------------------------------------------------------
// 2. SMS PROVIDER
// -------------------------------------------------------------
export interface SmsResult {
  success: boolean;
  messageId: string;
  deliveryStatus: "SENT" | "QUEUED" | "SIMULATED_MOCK" | "FAILED";
  recipient: string;
  timestamp: string;
}

export interface ISmsProvider {
  readonly metadata: ProviderMetadata;
  sendSms(to: string, message: string, templateId?: string): Promise<SmsResult>;
}

// -------------------------------------------------------------
// 3. NOTIFICATION PROVIDER
// -------------------------------------------------------------
export interface NotificationResult {
  success: boolean;
  notificationId: string;
  deliveredCount: number;
  failureCount: number;
}

export interface INotificationProvider {
  readonly metadata: ProviderMetadata;
  sendToUser(userId: string, title: string, body: string, data?: Record<string, string>): Promise<NotificationResult>;
  broadcastToTopic(topic: string, title: string, body: string, data?: Record<string, string>): Promise<NotificationResult>;
}

// -------------------------------------------------------------
// 4. PAYMENT PROVIDER
// -------------------------------------------------------------
export interface CreatePaymentOrderParams {
  amountInRupees: number;
  currency: string;
  receiptId: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  success: boolean;
  orderId: string;
  amountInPaise: number;
  currency: string;
  keyId: string;
  isMock: boolean;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface IPaymentProvider {
  readonly metadata: ProviderMetadata;
  getPublicKey(): string;
  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>;
  verifySignature(params: VerifyPaymentParams): Promise<boolean>;
  refund(paymentId: string, amountInRupees?: number, reason?: string): Promise<{ success: boolean; refundId: string }>;
}

// -------------------------------------------------------------
// 5. MAPS PROVIDER
// -------------------------------------------------------------
export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId?: string;
}

export interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
}

export interface IMapsProvider {
  readonly metadata: ProviderMetadata;
  geocodeAddress(address: string): Promise<GeocodeResult | null>;
  calculateDistance(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<DistanceResult>;
}

// -------------------------------------------------------------
// 6. AI PROVIDER
// -------------------------------------------------------------
export interface VolunteerMatchResult {
  matchScore: number; // 0 - 100
  recommendedOpportunities: string[];
  rationale: string;
}

export interface IAIProvider {
  readonly metadata: ProviderMetadata;
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
  matchVolunteerSkills(volunteerProfile: any, opportunities: any[]): Promise<VolunteerMatchResult>;
}

// -------------------------------------------------------------
// 7. STORAGE PROVIDER
// -------------------------------------------------------------
export interface UploadResult {
  success: boolean;
  fileUrl: string;
  fileKey: string;
  sizeBytes: number;
}

export interface IStorageProvider {
  readonly metadata: ProviderMetadata;
  uploadFile(buffer: Buffer, filename: string, mimeType: string, destinationFolder?: string): Promise<UploadResult>;
  getDownloadUrl(fileKey: string): Promise<string>;
  deleteFile(fileKey: string): Promise<boolean>;
}
