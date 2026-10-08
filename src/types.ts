export interface DartFile {
  name: string;
  path: string;
  content: string;
  description: string;
}

export interface AppStep {
  id: number;
  title: string;
  teaser: string;
  description: string;
  terminalCommands: string[];
  filesCreated: string[];
  filesModified: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type SkillCategory = 'Education' | 'Healthcare' | 'Relief' | 'Logistics' | 'IT & Media' | 'Community';

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
}

export type AvailabilityTimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface AvailabilitySchedule {
  weekdays: AvailabilityTimeSlot[];
  weekends: AvailabilityTimeSlot[];
}

export type IdentityDocType = 'AADHAAR' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE';

export type BackgroundCheckStatus = 'UNSUBMITTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'FLAGGED';

export type OnboardingStage = 
  | 'DEMOGRAPHICS'
  | 'SKILLS_AVAILABILITY'
  | 'IDENTITY_VERIFICATION'
  | 'BACKGROUND_CHECK'
  | 'TERMS_CONDUCT'
  | 'COMPLETED';

export interface VolunteerProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  skills: string[];
  availability: AvailabilitySchedule;
  identityVerified: boolean;
  identityDocType?: IdentityDocType;
  identityDocName?: string;
  backgroundCheckStatus: BackgroundCheckStatus;
  backgroundCheckNotes?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  termsSignatureHash?: string;
  onboardingStage: OnboardingStage;
  totalServiceHours: number;
  completedEngagementsCount: number;
}

export type OpportunityCategory = 'EDUCATION' | 'HEALTHCARE' | 'RELIEF' | 'ENVIRONMENT' | 'COMMUNITY' | 'TEMPLE';

export type OpportunityStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'FILLED' | 'COMPLETED' | 'CANCELLED';

export interface SevaTemplateItem {
  id: string;
  title: string;
  category: OpportunityCategory;
  organization: string;
  icon: string;
  tagline: string;
  defaultDescription: string;
  defaultVenue: string;
  city: string;
  durationHours: number;
  timeSlot: string;
  capacity: number;
  requiredSkills: string[];
  responsibilities: string[];
  benefits: string[];
  perksBadge: string;
  urgency: "HIGH" | "MEDIUM" | "STANDARD";
}

export interface OpportunityItem {
  opportunityId: string;
  title: string;
  description: string;
  category: OpportunityCategory;
  location: {
    venueName: string;
    city: string;
  };
  requiredSkills: string[];
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  capacity: number;
  assignedCount: number;
  expectedImpact: string;
  status: OpportunityStatus;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  createdBy: string;
  matchScore?: number;
  matchRationale?: string;
}

export interface VolunteerAssignment {
  assignmentId: string;
  opportunityId: string;
  volunteerId: string;
  opportunityTitle: string;
  venueName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  checkInTime?: string;
  assignedAt: string;
}

export interface VolunteerFormState {
  fullName: string;
  email: string;
  phone: string;
  interestArea: string;
  experience: string;
  isSubmitting: boolean;
  success: boolean;
}

export interface DonationFormState {
  donorName: string;
  email: string;
  phone?: string;
  pan?: string;
  amount: number;
  purpose: string;
  isProcessing: boolean;
  success: boolean;
  paymentId: string | null;
  orderId?: string;
  receiptId?: string;
  utrRef?: string;
}

export interface VolunteerRegistrationRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state?: string;
  skills: string[];
  interestArea?: string;
  availability?: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedDate: string;
  source: "mobile_app" | "volunteer_portal";
  notes?: string;
}

export interface OpportunityApplicationRecord {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  category?: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedDate: string;
  notes?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  email: string;
  phone?: string;
  pan?: string;
  amount: number;
  purpose: string;
  date: string;
  method: string;
  upiVpa: string;
  utrRef: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  taxExemptionEligible: boolean;
}

// -------------------------------------------------------------
// PRODUCTION PAYMENT & REFUND DATA MODELS (FinTech Architecture)
// -------------------------------------------------------------
export type PaymentStatus = 
  | 'INITIATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUND_INITIATED'
  | 'REFUNDED';

export type PaymentMethodType = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'OFFLINE';

export interface PaymentRecord {
  paymentId: string;              // Primary Key (e.g. PAY_1720000000_ABC)
  orderId: string;                // Order reference ID (e.g. order_K3jH9x1)
  gatewayTransactionId?: string;  // Gateway transaction / payment ID (e.g. pay_K3jH9x2)
  idempotencyKey: string;         // Unique client UUID preventing duplicate orders
  userId?: string;                // Optional User / Volunteer ID
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorPan?: string;              // Section 80G statutory tax declaration
  amount: number;                 // Monetary sum in INR
  currency: 'INR';
  purpose: string;                // e.g. "Annadana Food Security Drive"
  programId?: string;             // Optional Program reference ID
  planId?: string;                // Optional Membership / Plan ID
  paymentMethod: PaymentMethodType;
  gatewayName: 'RAZORPAY' | 'CASHFREE' | 'OFFLINE_RECORD';
  status: PaymentStatus;
  failureReason?: string;
  receiptId?: string;             // Official Digital Receipt ID (e.g. RCP-2026-0922-8491)
  taxExemptionEligible: boolean;
  refundStatus?: 'NONE' | 'REQUESTED' | 'PROCESSED' | 'FAILED';
  refundAmount?: number;
  refundReason?: string;
  refundId?: string;
  createdAt: string;              // ISO string
  updatedAt: string;              // ISO string
  paidAt?: string;                // ISO string when verified
  metadata?: Record<string, any>;
}

export interface RefundRecord {
  refundId: string;               // REF_XXXXXX
  paymentId: string;
  orderId: string;
  gatewayRefundId?: string;
  amount: number;
  currency: 'INR';
  reason: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED';
  authorizedBy: string;          // Admin ID / Trustee
  requestedAt: string;
  processedAt?: string;
  gatewayResponse?: string;
}

export interface CreateOrderRequest {
  amount: number;
  purpose: string;
  donorName: string;
  email: string;
  phone?: string;
  pan?: string;
  programId?: string;
  planId?: string;
  idempotencyKey: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: 'INR';
  keyId: string;
  gatewayName: string;
  error?: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status: PaymentStatus;
  payment?: PaymentRecord;
  receiptId?: string;
  error?: string;
}

export interface DigitalReceiptData {
  receiptId: string;
  ngoName: string;
  trustRegNumber: string;
  section80GNumber: string;
  panNumber: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorPan?: string;
  amount: number;
  amountInWords: string;
  currency: string;
  purpose: string;
  paymentMethod: string;
  transactionId: string;
  orderId: string;
  paidAt: string;
  status: PaymentStatus;
  taxExemptionEligible?: boolean;
  signatory: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  screenTarget: string; // deep link target e.g., 'home', 'programs', 'events', 'donation', 'onboarding', 'opportunities', 'schedule', 'temples'
}

export interface TempleSevaSlot {
  id: string;
  title: string;
  time: string;
  date: string;
  volunteersNeeded: number;
  volunteersJoined: number;
  category: "Annadana" | "Swachh Mandir" | "Kalyani Cleaning" | "Goshaala" | "Heritage" | "Queue Assist";
  description: string;
}

export interface TempleSponsorship {
  id: string;
  title: string;
  amount: number;
  description: string;
  eligible80G: boolean;
}

export interface TempleItem {
  id: string;
  name: string;
  kannadaName: string;
  deity: string;
  location: string;
  district: string;
  distanceFromBangalore: string;
  heritageEra: string;
  category: "Heritage" | "Annadana" | "Swachh Seva" | "Goshaala";
  img: string;
  darshanTimings: string;
  annadanaTimings: string;
  description: string;
  trustInitiatives: string[];
  sevaSlots: TempleSevaSlot[];
  sponsorships: TempleSponsorship[];
  geoCoords: {
    lat: number;
    lng: number;
    mapsQuery: string;
  };
}

export type AuthRole = 'volunteer' | 'donor' | 'admin' | 'guest';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: AuthRole;
  token: string;
  location?: string;
  avatar?: string;
  verifiedAt: string;
  serviceHours?: number;
  totalDonated?: number;
}

export interface OtpState {
  target: string;
  type: 'phone' | 'email';
  role: AuthRole;
  otpSent: boolean;
  activeOtpCode?: string;
  expiresAt?: number;
  remainingSeconds: number;
  isVerifying: boolean;
  error?: string;
  message?: string;
}

export type NotificationType = 
  | 'APPLICATION_STATUS' 
  | 'VERIFICATION' 
  | 'ASSIGNMENT' 
  | 'SHIFT_REMINDER' 
  | 'COMPLETION' 
  | 'ANNOUNCEMENT';

export interface NotificationRecord {
  id: string;
  recipientId: string; // 'ALL' | volunteerId
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  details: string;
  targetEntity: string;
  targetId: string;
  timestamp: string;
  ipAddress?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminReportsSummary {
  totalVolunteers: number;
  verifiedVolunteers: number;
  pendingVerifications: number;
  flaggedVerifications: number;
  totalServiceHours: number;
  completedEngagements: number;
  totalOpportunities: number;
  activeOpportunities: number;
  fillRatePercent: number;
  totalDonationsSum: number;
  donationsCount: number;
  categoryBreakdown: { category: string; hours: number; volunteersCount: number }[];
  monthlyGrowth: { month: string; newVolunteers: number; hours: number }[];
  systemHealth: {
    uptimeSeconds: number;
    memoryUsageMb: number;
    totalQueries: number;
    averageQueryTimeMs: number;
    activeSessionsCount: number;
  };
}

