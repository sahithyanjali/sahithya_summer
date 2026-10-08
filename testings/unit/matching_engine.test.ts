/**
 * Unit Tests: Volunteer Opportunity Matching Engine
 * Weighted deterministic scoring based on Skills (50%), Proximity (30%), Availability (20%)
 * Sphoorthi Seva Trust (Reg: 402/2021)
 */
import { Assert, TestVolunteer, TestOpportunity, MOCK_VOLUNTEERS, MOCK_OPPORTUNITIES } from "../mocks/testFixtures";

export interface MatchResult {
  volunteerId: string;
  opportunityId: string;
  eligible: boolean;
  ineligibleReason?: string;
  score: number; // 0 to 100
  matchedSkills: string[];
}

export class MatchingEngine {
  static evaluateMatch(volunteer: TestVolunteer, opportunity: TestOpportunity): MatchResult {
    // 1. Clearance Check
    if (volunteer.clearanceLevel < opportunity.minClearanceLevel) {
      return {
        volunteerId: volunteer.id,
        opportunityId: opportunity.id,
        eligible: false,
        ineligibleReason: `Clearance Level ${volunteer.clearanceLevel} below required Level ${opportunity.minClearanceLevel}`,
        score: 0,
        matchedSkills: []
      };
    }

    // 2. Capacity Check
    if (opportunity.slotsFilled >= opportunity.slotsTotal) {
      return {
        volunteerId: volunteer.id,
        opportunityId: opportunity.id,
        eligible: false,
        ineligibleReason: "Opportunity shift slots are full",
        score: 0,
        matchedSkills: []
      };
    }

    // 3. Skill Match (50% weight)
    const matchedSkills = volunteer.skills.filter(s => opportunity.requiredSkills.includes(s));
    const skillRatio = opportunity.requiredSkills.length > 0 
      ? matchedSkills.length / opportunity.requiredSkills.length 
      : 1;
    const skillScore = Math.round(skillRatio * 50);

    // 4. Proximity Match (30% weight)
    let proximityScore = 10;
    if (volunteer.city.toLowerCase() === opportunity.city.toLowerCase()) {
      proximityScore = 30;
    }

    // 5. Verification Bonus (20% weight)
    const verificationScore = volunteer.isVerified ? 20 : 0;

    const totalScore = Math.min(100, skillScore + proximityScore + verificationScore);

    return {
      volunteerId: volunteer.id,
      opportunityId: opportunity.id,
      eligible: true,
      score: totalScore,
      matchedSkills
    };
  }
}

export function runMatchingEngineUnitTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const anjali = MOCK_VOLUNTEERS[0]; // Level 2, Annadana, First Aid, Translation, Blr
  const kiran = MOCK_VOLUNTEERS[1]; // Level 1, Crowd, Annadana, Nelamangala
  const annadanaOpp = MOCK_OPPORTUNITIES[0]; // Level 1, Nelamangala
  const icuOpp = MOCK_OPPORTUNITIES[1]; // Level 2, Full (15/15), Blr

  const testCases: [string, () => void][] = [
    [
      "Clearance Guard - Rejects volunteer if clearance is insufficient",
      () => {
        const strictOpp: TestOpportunity = {
          ...annadanaOpp,
          minClearanceLevel: 3
        };
        const res = MatchingEngine.evaluateMatch(anjali, strictOpp); // anjali is Level 2
        Assert.isFalse(res.eligible);
        Assert.contains(res.ineligibleReason!, "below required Level 3");
      }
    ],
    [
      "Capacity Guard - Rejects match when shift slots are fully booked",
      () => {
        const fullOpp: TestOpportunity = {
          ...annadanaOpp,
          slotsFilled: 25,
          slotsTotal: 25
        };
        const res = MatchingEngine.evaluateMatch(anjali, fullOpp);
        Assert.isFalse(res.eligible);
        Assert.contains(res.ineligibleReason!, "slots are full");
      }
    ],
    [
      "Proximity & Skill Scoring - Scores higher when volunteer lives in identical city",
      () => {
        const kiranMatch = MatchingEngine.evaluateMatch(kiran, annadanaOpp); // Kiran lives in Nelamangala
        Assert.isTrue(kiranMatch.eligible);
        Assert.greaterThan(kiranMatch.score, 60);
        Assert.contains(kiranMatch.matchedSkills.join(","), "Annadana Food Handling");
      }
    ],
    [
      "Verified Volunteer Bonus - Verified volunteers gain full 20 point credibility boost",
      () => {
        const unverifiedKiran: TestVolunteer = { ...kiran, isVerified: false };
        const verifiedScore = MatchingEngine.evaluateMatch(kiran, annadanaOpp).score;
        const unverifiedScore = MatchingEngine.evaluateMatch(unverifiedKiran, annadanaOpp).score;
        Assert.equals(verifiedScore - unverifiedScore, 20);
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
