export type ClearanceLevel = 'Level 1: General Seva' | 'Level 2: Camp Coordinator' | 'Level 3: Medical Responder';

export interface VolunteerEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface VolunteerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  bloodGroup: string;
  clearanceLevel: ClearanceLevel;
  badgeNumber: string;
  totalHours: number;
  completedMissions: number;
  emergencyContact: VolunteerEmergencyContact;
  skills: string[];
  joinedDate: string;
  status: 'ACTIVE' | 'ON_DUTY' | 'STANDBY';
  avatarUrl: string;
  qrCodeSignature: string;
}

export interface SevaShift {
  id: string;
  title: string;
  category: 'Annadana' | 'Vidya Education' | 'Medical Camp' | 'Disaster Relief';
  location: string;
  date: string;
  timeSlot: string;
  reportingVenue: string;
  coordinatorName: string;
  coordinatorPhone: string;
  slotsFilled: number;
  slotsTotal: number;
  requiredSkills: string[];
  pointsAwarded: number;
  isClaimedByUser: boolean;
}

export interface AttendanceRecord {
  id: string;
  shiftTitle: string;
  location: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  hoursEarned: number;
  verifiedBy: string;
  blockHash: string;
  status: 'VERIFIED' | 'UNDER_REVIEW';
}

export interface SevaCertificate {
  certificateId: string;
  recipientName: string;
  volunteerId: string;
  serviceHours: number;
  initiatives: string[];
  issuedOn: string;
  trustRegNo: string;
  verifiedHash: string;
  signatureAuthority: string;
}
