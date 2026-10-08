export interface UserEntity {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: 'VOLUNTEER' | 'COORDINATOR' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerProfileEntity {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  skills: string[];
  availability: Record<string, string[]>;
  identityVerified: boolean;
  identityDocType: string;
  identityDocNumber?: string;
  backgroundCheckStatus: 'UNSUBMITTED' | 'PENDING' | 'CLEARED' | 'FLAGGED';
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  digitalSignatureHash?: string;
  serviceHoursCompleted: number;
  completedAssignmentsCount: number;
}

export interface OpportunityEntity {
  id: string;
  title: string;
  category: 'FOOD_RELIEF' | 'EDUCATION' | 'HEALTHCARE' | 'BLOOD_DRIVE';
  description: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  assignedCount: number;
  skillsRequired: string[];
  urgencyLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  expectedImpact: string;
  status: 'DRAFT' | 'PUBLISHED' | 'FILLED' | 'COMPLETED';
}

export interface ApplicationEntity {
  applicationId: string;
  opportunityId: string;
  opportunityTitle: string;
  volunteerId: string;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  matchScore: number;
  appliedAt: string;
}

export interface AssignmentEntity {
  assignmentId: string;
  opportunityId: string;
  opportunityTitle: string;
  volunteerId: string;
  date: string;
  time: string;
  venue: string;
  status: 'CONFIRMED' | 'ATTENDED' | 'MISSED';
  qrToken: string;
  serviceHours: number;
}

export interface DonationEntity {
  id: string;
  donorName: string;
  amount: number;
  purpose: string;
  date: string;
  panMasked?: string;
  panHash?: string;
  transactionRef: string;
  receiptNumber: string;
  status: 'COMPLETED' | 'VERIFIED' | 'PENDING';
  is80GEligible: boolean;
  blockHash: string;
}

export interface ReliefCampEntity {
  id: string;
  name: string;
  location: string;
  coordinator: string;
  coordinatorPhone: string;
  mealsServed: number;
  mealsTarget: number;
  status: 'Active' | 'Mobilizing' | 'Completed';
  lastVerifiedAt: string;
  auditPhotosCount: number;
}

export interface EventFeedEntity {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  desc: string;
  img: string;
  category: string;
  volunteersRegistered: number;
  targetVolunteers: number;
}

export interface AuditRecordEntity {
  blockIndex: number;
  timestamp: string;
  recordType: 'DONATION' | 'MEAL_DISTRIBUTION' | 'CAMP_INSPECTION' | 'VOLUNTEER_VERIFICATION';
  referenceId: string;
  beneficiarySummary: string;
  amountOrUnits: number;
  prevBlockHash: string;
  blockHash: string;
}

export interface CertificateEntity {
  certificateId: string;
  volunteerId: string;
  volunteerName: string;
  hoursServed: number;
  initiatives: string[];
  issuedAt: string;
  digitalSignatureHash: string;
}

