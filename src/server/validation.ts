import { sanitizeString, validateEmail, validatePhone } from "./security.ts";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateVolunteerRegistration(input: any): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Missing request body"] };
  }

  const fullName = sanitizeString(input.fullName, 100);
  if (!fullName || fullName.length < 2) {
    errors.push("Full name must be at least 2 characters long");
  }

  const email = sanitizeString(input.email, 120);
  if (!email || !validateEmail(email)) {
    errors.push("A valid email address is required");
  }

  const phone = sanitizeString(input.phone, 20);
  if (!phone || !validatePhone(phone)) {
    errors.push("A valid 10-digit phone number is required");
  }

  if (input.skills && !Array.isArray(input.skills)) {
    errors.push("Skills must be provided as an array");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateApplicationSubmission(input: any): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Missing request body"] };
  }

  const opportunityId = sanitizeString(input.opportunityId, 80);
  if (!opportunityId) {
    errors.push("opportunityId is required");
  }

  const volunteerName = sanitizeString(input.volunteerName, 100);
  if (!volunteerName || volunteerName.length < 2) {
    errors.push("volunteerName must be at least 2 characters long");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Strict Allowed State Transitions
const REGISTRATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending: ["Approved", "Rejected"],
  UnderReview: ["Approved", "Rejected"],
  Approved: ["Rejected"],
  Rejected: ["Pending"]
};

export function validateRegistrationStatusTransition(currentStatus: string, newStatus: string): ValidationResult {
  const allowed = REGISTRATION_STATUS_TRANSITIONS[currentStatus];
  if (!allowed) {
    return {
      valid: false,
      errors: [`Current status '${currentStatus}' is invalid or unknown`]
    };
  }

  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      errors: [`Transition from '${currentStatus}' to '${newStatus}' is not permitted. Allowed: ${allowed.join(", ")}`]
    };
  }

  return { valid: true, errors: [] };
}

export function validateJobCreation(input: any): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Missing request body"] };
  }

  const title = sanitizeString(input.title, 120);
  if (!title || title.length < 3) {
    errors.push("Job title must be at least 3 characters");
  }

  const department = sanitizeString(input.department, 80);
  if (!department) {
    errors.push("Department is required");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateCampCreation(input: any): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Missing request body"] };
  }

  const name = sanitizeString(input.name, 120);
  if (!name || name.length < 3) {
    errors.push("Camp name must be at least 3 characters");
  }

  const location = sanitizeString(input.location, 150);
  if (!location) {
    errors.push("Location is required");
  }

  const targetCapacity = Number(input.targetCapacity || input.mealsTarget);
  if (isNaN(targetCapacity) || targetCapacity <= 0 || targetCapacity > 100000) {
    errors.push("Target capacity must be a positive number up to 100,000");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateDonationCreation(input: any): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Missing request body"] };
  }

  const donorName = sanitizeString(input.donorName || input.name, 100);
  if (!donorName || donorName.length < 2) {
    errors.push("Donor name must be at least 2 characters");
  }

  const amount = Number(input.amount);
  if (isNaN(amount) || amount < 1 || amount > 10000000) {
    errors.push("Donation amount must be between ₹1 and ₹1,00,00,000");
  }

  const email = sanitizeString(input.email, 120);
  if (email && !validateEmail(email)) {
    errors.push("Provided email format is invalid");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
