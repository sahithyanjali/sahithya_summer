/**
 * Unit Tests: Volunteer Profile Service, Level Progression & Badge Hash Generation
 * Sphoorthi Seva Trust (Reg: 402/2021)
 */
import { Assert, MOCK_VOLUNTEERS, TestVolunteer } from "../mocks/testFixtures";

export class VolunteerService {
  static calculateClearanceLevel(hours: number, hasFirstAid: boolean): { level: number; title: string } {
    if (hours >= 100 && hasFirstAid) {
      return { level: 3, title: "Level 3: Medical Responder & Disaster Lead" };
    }
    if (hours >= 25) {
      return { level: 2, title: "Level 2: Camp Coordinator" };
    }
    return { level: 1, title: "Level 1: General Seva Karta" };
  }

  static generateBadgeNumber(city: string, sequence: number): string {
    const cityCode = city.toUpperCase().slice(0, 3) || "BLR";
    const padded = sequence.toString().padStart(4, "0");
    return `SST-${cityCode}-${padded}`;
  }

  static generateQrHash(volunteerId: string, secretKey: string = "SPHOORTHI_SEVA_2021"): string {
    // Simple deterministic hash simulation for QR token verification
    let hash = 0;
    const str = `${volunteerId}:${secretKey}:TRUST_402_2021`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return `SHA256:${hex}${hex.split("").reverse().join("")}`;
  }

  static accumulateDutyHours(currentHours: number, sessionDurationHours: number): number {
    if (sessionDurationHours < 0) {
      throw new Error("Cannot accumulate negative duty hours");
    }
    return Number((currentHours + sessionDurationHours).toFixed(1));
  }
}

export function runVolunteerServiceUnitTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const testCases: [string, () => void][] = [
    [
      "Clearance Level - Promotes to Level 2 at 25+ hours",
      () => {
        const res = VolunteerService.calculateClearanceLevel(35, false);
        Assert.equals(res.level, 2);
        Assert.contains(res.title, "Camp Coordinator");
      }
    ],
    [
      "Clearance Level - Promotes to Level 3 only with 100+ hours AND First Aid certification",
      () => {
        const withoutFirstAid = VolunteerService.calculateClearanceLevel(120, false);
        Assert.equals(withoutFirstAid.level, 2, "Should remain Level 2 without First Aid");

        const withFirstAid = VolunteerService.calculateClearanceLevel(120, true);
        Assert.equals(withFirstAid.level, 3, "Should elevate to Level 3 with First Aid");
        Assert.contains(withFirstAid.title, "Medical Responder");
      }
    ],
    [
      "Badge Number Formatter - Generates SST-{CITY}-{0000} standard syntax",
      () => {
        Assert.equals(VolunteerService.generateBadgeNumber("Bengaluru", 482), "SST-BEN-0482");
        Assert.equals(VolunteerService.generateBadgeNumber("Nelamangala", 9), "SST-NEL-0009");
      }
    ],
    [
      "QR Hash Generator - Returns deterministic verifiable signature",
      () => {
        const hash1 = VolunteerService.generateQrHash("VOL-2026-001");
        const hash2 = VolunteerService.generateQrHash("VOL-2026-001");
        Assert.equals(hash1, hash2, "Identical volunteer IDs must generate identical QR hashes");
        Assert.match(hash1, /^SHA256:[a-f0-9]{16}$/);

        const hashDiff = VolunteerService.generateQrHash("VOL-2026-002");
        Assert.isTrue(hash1 !== hashDiff, "Different IDs must yield different hashes");
      }
    ],
    [
      "Hours Accumulation - Accurately updates hours and rejects negative durations",
      () => {
        const total = VolunteerService.accumulateDutyHours(148.5, 4.5);
        Assert.equals(total, 153.0);

        Assert.throws(() => {
          VolunteerService.accumulateDutyHours(10, -2);
        }, "Negative duration must throw error");
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
