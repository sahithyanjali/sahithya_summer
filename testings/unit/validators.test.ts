/**
 * Unit Tests: Input Validators, Form Normalizers & Legal Regexp Compliance
 * Sphoorthi Seva Trust (Reg: 402/2021)
 */
import { Assert } from "../mocks/testFixtures";

export function validateIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, "");
  // Matches +91 followed by 10 digits starting with 6, 7, 8, or 9
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
}

export function normalizePhoneE164(phone: string): string {
  let cleaned = phone.replace(/[\s-]/g, "");
  if (!cleaned.startsWith("+91")) {
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      cleaned = "+" + cleaned;
    } else if (cleaned.length === 10) {
      cleaned = "+91" + cleaned;
    }
  }
  return cleaned;
}

export function validatePanCard(pan: string): boolean {
  // Format: 5 uppercase letters, 4 digits, 1 uppercase letter
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

export function validateIndianPincode(pincode: string): boolean {
  // 6 digits, first digit non-zero (1-9)
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

export function validateBloodGroup(bg: string): boolean {
  const allowed = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  return allowed.includes(bg.trim().toUpperCase());
}

export function validateTaxDeductionLimit(amount: number): boolean {
  // Minimum donation for 80G tax receipt is INR 100
  return typeof amount === "number" && amount >= 100 && Number.isFinite(amount);
}

export function runValidatorUnitTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const testCases: [string, () => void][] = [
    [
      "Phone Validator - Valid Indian Numbers (+91)",
      () => {
        Assert.isTrue(validateIndianPhone("+919876543210"));
        Assert.isTrue(validateIndianPhone("+91 98450 12345"));
        Assert.isTrue(validateIndianPhone("9876543210"));
        Assert.isTrue(validateIndianPhone("+91-7012345678"));
      }
    ],
    [
      "Phone Validator - Reject Invalid Numbers (Short, letters, wrong prefix)",
      () => {
        Assert.isFalse(validateIndianPhone("12345"));
        Assert.isFalse(validateIndianPhone("+910123456789")); // Starts with 0
        Assert.isFalse(validateIndianPhone("+14155552671")); // US number
        Assert.isFalse(validateIndianPhone("+9198765abcde")); // Letters
      }
    ],
    [
      "Phone E.164 Normalizer - Converts local strings into +91 E.164 format",
      () => {
        Assert.equals(normalizePhoneE164("9876543210"), "+919876543210");
        Assert.equals(normalizePhoneE164("+91 98450 12345"), "+919845012345");
        Assert.equals(normalizePhoneE164("919845012345"), "+919845012345");
      }
    ],
    [
      "PAN Card Validator - Valid 10-char alphanumeric syntax",
      () => {
        Assert.isTrue(validatePanCard("ABCDE1234F"));
        Assert.isTrue(validatePanCard("bkzpr9918k")); // auto uppercase
        Assert.isFalse(validatePanCard("ABC123456F")); // wrong letter count
        Assert.isFalse(validatePanCard("ABCDE12345")); // ends in digit
        Assert.isFalse(validatePanCard("ABCDE12")); // too short
      }
    ],
    [
      "Indian Postal Pincode Validator - 6-digit numeric pattern",
      () => {
        Assert.isTrue(validateIndianPincode("560001")); // Bengaluru Central
        Assert.isTrue(validateIndianPincode("562123")); // Nelamangala
        Assert.isFalse(validateIndianPincode("012345")); // starts with 0
        Assert.isFalse(validateIndianPincode("56000")); // 5 digits
        Assert.isFalse(validateIndianPincode("5600012")); // 7 digits
        Assert.isFalse(validateIndianPincode("56000A")); // non-numeric
      }
    ],
    [
      "Blood Group Validator - Standard 8 clinical types",
      () => {
        Assert.isTrue(validateBloodGroup("O+"));
        Assert.isTrue(validateBloodGroup("b-"));
        Assert.isTrue(validateBloodGroup("AB+"));
        Assert.isFalse(validateBloodGroup("C+"));
        Assert.isFalse(validateBloodGroup("O"));
      }
    ],
    [
      "80G Tax Exemption Minimum Threshold",
      () => {
        Assert.isTrue(validateTaxDeductionLimit(500));
        Assert.isTrue(validateTaxDeductionLimit(100));
        Assert.isFalse(validateTaxDeductionLimit(50));
        Assert.isFalse(validateTaxDeductionLimit(-100));
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
