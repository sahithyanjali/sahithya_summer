/**
 * End-to-End (E2E) Test Suite: Volunteer Onboarding & Clearance Pipeline
 * Sphoorthi Seva Trust (Reg: 402/2021)
 */
import { Assert } from "../mocks/testFixtures";
import { validateIndianPhone, normalizePhoneE164 } from "../unit/validators.test";
import { VolunteerService } from "../unit/volunteer_service.test";

export interface OnboardingPayload {
  fullName: string;
  phone: string;
  city: string;
  bloodGroup: string;
  skills: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export function simulateVolunteerOnboardingJourney(payload: OnboardingPayload): {
  success: boolean;
  volunteerId: string;
  badgeNumber: string;
  qrCodeSignature: string;
  clearanceLevel: number;
} {
  // 1. Validation Phase
  if (!payload.fullName || payload.fullName.trim().length < 2) {
    throw new Error("Full name must have at least 2 characters");
  }
  if (!validateIndianPhone(payload.phone)) {
    throw new Error("Invalid Indian mobile number format");
  }
  if (!payload.emergencyContact?.name || !validateIndianPhone(payload.emergencyContact.phone)) {
    throw new Error("Valid emergency contact is mandatory");
  }

  // 2. Normalization Phase
  const normalizedPhone = normalizePhoneE164(payload.phone);

  // 3. ID Generation
  const volunteerId = `VOL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // 4. Initial Clearance Assignment (New onboards start at Level 1)
  const clearance = VolunteerService.calculateClearanceLevel(0, false);

  // 5. Official Badge & Cryptographic QR Pass Generation
  const badgeNumber = VolunteerService.generateBadgeNumber(payload.city, 490);
  const qrCodeSignature = VolunteerService.generateQrHash(volunteerId);

  return {
    success: true,
    volunteerId,
    badgeNumber,
    qrCodeSignature,
    clearanceLevel: clearance.level
  };
}

export function runOnboardingJourneyE2ETests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const testCases: [string, () => void][] = [
    [
      "Complete Onboarding Flow - Valid application generates registered badge and credentials",
      () => {
        const payload: OnboardingPayload = {
          fullName: "Sumanth Hegde",
          phone: "+91 98450 67890",
          city: "Nelamangala",
          bloodGroup: "O+",
          skills: ["Annadana Food Handling", "Crowd Safety Management"],
          emergencyContact: {
            name: "Radha Hegde",
            phone: "+91 98450 11122",
            relationship: "Mother"
          }
        };

        const result = simulateVolunteerOnboardingJourney(payload);

        Assert.isTrue(result.success);
        Assert.match(result.volunteerId, /^VOL-2026-\d{4}$/);
        Assert.equals(result.badgeNumber, "SST-NEL-0490");
        Assert.match(result.qrCodeSignature, /^SHA256:/);
        Assert.equals(result.clearanceLevel, 1);
      }
    ],
    [
      "Onboarding Guard - Fails gracefully if phone number format is invalid",
      () => {
        Assert.throws(() => {
          simulateVolunteerOnboardingJourney({
            fullName: "Invalid Phone Tester",
            phone: "000000",
            city: "Bengaluru",
            bloodGroup: "A+",
            skills: [],
            emergencyContact: { name: "SOS", phone: "9876543210", relationship: "Friend" }
          });
        }, "Should throw on bad phone");
      }
    ],
    [
      "Onboarding Guard - Fails if emergency contact is missing",
      () => {
        Assert.throws(() => {
          simulateVolunteerOnboardingJourney({
            fullName: "No SOS Tester",
            phone: "+91 98450 12345",
            city: "Bengaluru",
            bloodGroup: "A+",
            skills: [],
            emergencyContact: { name: "", phone: "", relationship: "" }
          });
        }, "Should throw on missing emergency contact");
      }
    ]
  ];

  for (const [name, testFn] of testCases) {
    try {
      testFn();
      passed++;
    } catch (err: any) {
      failed++;
      errors.push(`[${name}] ${err?.message || err}`);
    }
  }

  return { passed, failed, errors };
}
