/**
 * Test Fixtures & Mock Datasets for Seva Sphoorthi Platform Testing Suite
 * Sphoorthi Seva Trust (Reg: 402/2021)
 */

export interface TestVolunteer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  bloodGroup: string;
  clearanceLevel: number; // 1, 2, 3
  skills: string[];
  availability: string[];
  totalHours: number;
  completedMissions: number;
  isVerified: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface TestOpportunity {
  id: string;
  title: string;
  category: "Annadana" | "Vidya Education" | "Medical Camp" | "Disaster Relief";
  location: string;
  city: string;
  date: string;
  requiredSkills: string[];
  slotsTotal: number;
  slotsFilled: number;
  minClearanceLevel: number;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
}

export interface TestDonation {
  id: string;
  donorName: string;
  donorPan: string;
  amount: number;
  currency: string;
  cause: string;
  date: string;
  paymentMethod: "UPI" | "NET_BANKING" | "CARD";
  status: "SUCCESS" | "PENDING" | "FAILED";
  taxExempt80G: boolean;
  receiptNumber: string;
}

export const MOCK_VOLUNTEERS: TestVolunteer[] = [
  {
    id: "VOL-2026-001",
    name: "Anjali Sharma",
    phone: "+919876543210",
    email: "anjali.sharma@sevasphoorthi.org",
    city: "Bengaluru",
    bloodGroup: "O+",
    clearanceLevel: 2,
    skills: ["Annadana Food Handling", "Emergency First Aid & CPR", "Kannada-English Translation"],
    availability: ["Saturday", "Sunday"],
    totalHours: 148.5,
    completedMissions: 24,
    isVerified: true,
    emergencyContact: {
      name: "Ramesh Sharma",
      phone: "+919876511223",
      relationship: "Father"
    }
  },
  {
    id: "VOL-2026-002",
    name: "Kiran Kumar",
    phone: "+919845012345",
    email: "kiran.k@sevasphoorthi.org",
    city: "Nelamangala",
    bloodGroup: "B+",
    clearanceLevel: 1,
    skills: ["Crowd Safety Management", "Annadana Food Handling"],
    availability: ["Sunday"],
    totalHours: 42.0,
    completedMissions: 8,
    isVerified: true,
    emergencyContact: {
      name: "Lakshmi Kumar",
      phone: "+919845099887",
      relationship: "Mother"
    }
  },
  {
    id: "VOL-2026-003",
    name: "Dr. Suresh Varma",
    phone: "+919820011223",
    email: "dr.suresh@sevasphoorthi.org",
    city: "Bengaluru",
    bloodGroup: "A-",
    clearanceLevel: 3,
    skills: ["Pediatric First Aid", "Emergency First Aid & CPR", "Donor Registration"],
    availability: ["Saturday", "Sunday", "Emergency"],
    totalHours: 310.0,
    completedMissions: 45,
    isVerified: true,
    emergencyContact: {
      name: "Dr. Geetha Varma",
      phone: "+919820044556",
      relationship: "Spouse"
    }
  }
];

export const MOCK_OPPORTUNITIES: TestOpportunity[] = [
  {
    id: "OPP-101",
    title: "Nelamangala Highway Annadana Meal Distribution",
    category: "Annadana",
    location: "NH48 Toll Relief Tent, Nelamangala",
    city: "Nelamangala",
    date: "2026-09-27",
    requiredSkills: ["Annadana Food Handling", "Crowd Safety Management"],
    slotsTotal: 25,
    slotsFilled: 18,
    minClearanceLevel: 1,
    status: "ACTIVE"
  },
  {
    id: "OPP-102",
    title: "Pediatric ICU Blood Donation Screening Camp",
    category: "Medical Camp",
    location: "Town Hall Center, Bengaluru",
    city: "Bengaluru",
    date: "2026-09-28",
    requiredSkills: ["Emergency First Aid & CPR", "Donor Registration"],
    slotsTotal: 15,
    slotsFilled: 15,
    minClearanceLevel: 2,
    status: "ACTIVE"
  },
  {
    id: "OPP-103",
    title: "Vidya School Kit & Solar Lamp Distribution",
    category: "Vidya Education",
    location: "Govt School, Chintamani",
    city: "Chintamani",
    date: "2026-10-02",
    requiredSkills: ["Kannada-English Translation"],
    slotsTotal: 12,
    slotsFilled: 4,
    minClearanceLevel: 1,
    status: "ACTIVE"
  }
];

export const MOCK_DONATIONS: TestDonation[] = [
  {
    id: "DON-8801",
    donorName: "Prakash Narayanan",
    donorPan: "ABCDE1234F",
    amount: 5000,
    currency: "INR",
    cause: "Nelamangala Rural Annadana",
    date: "2026-09-20",
    paymentMethod: "UPI",
    status: "SUCCESS",
    taxExempt80G: true,
    receiptNumber: "SST-80G-2026-08801"
  },
  {
    id: "DON-8802",
    donorName: "Venkatesh Rao",
    donorPan: "BKZPR9918K",
    amount: 12500,
    currency: "INR",
    cause: "Vidya Rural Education Program",
    date: "2026-09-18",
    paymentMethod: "NET_BANKING",
    status: "SUCCESS",
    taxExempt80G: true,
    receiptNumber: "SST-80G-2026-08802"
  }
];

/**
 * Lightweight assertion helper library for standalone test execution
 */
export class Assert {
  static equals<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(
        `${message ? message + " : " : ""}Expected [${String(expected)}] but received [${String(actual)}]`
      );
    }
  }

  static deepEquals<T>(actual: T, expected: T, message?: string): void {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new Error(
        `${message ? message + " : " : ""}Deep equality mismatch.\nActual: ${actStr}\nExpected: ${expStr}`
      );
    }
  }

  static isTrue(value: boolean, message?: string): void {
    if (value !== true) {
      throw new Error(`${message ? message + " : " : ""}Expected true, but got false`);
    }
  }

  static isFalse(value: boolean, message?: string): void {
    if (value !== false) {
      throw new Error(`${message ? message + " : " : ""}Expected false, but got true`);
    }
  }

  static greaterThan(actual: number, threshold: number, message?: string): void {
    if (actual <= threshold) {
      throw new Error(
        `${message ? message + " : " : ""}Expected ${actual} to be strictly greater than ${threshold}`
      );
    }
  }

  static lessThanOrEqual(actual: number, threshold: number, message?: string): void {
    if (actual > threshold) {
      throw new Error(
        `${message ? message + " : " : ""}Expected ${actual} to be <= ${threshold}`
      );
    }
  }

  static contains(text: string, substring: string, message?: string): void {
    if (!text.includes(substring)) {
      throw new Error(
        `${message ? message + " : " : ""}Expected string to contain "${substring}". Found: "${text}"`
      );
    }
  }

  static match(text: string, regex: RegExp, message?: string): void {
    if (!regex.test(text)) {
      throw new Error(
        `${message ? message + " : " : ""}Text "${text}" does not match pattern ${regex}`
      );
    }
  }

  static throws(fn: () => void, message?: string): void {
    let didThrow = false;
    try {
      fn();
    } catch {
      didThrow = true;
    }
    if (!didThrow) {
      throw new Error(`${message ? message + " : " : ""}Expected function to throw an error, but it did not`);
    }
  }
}
