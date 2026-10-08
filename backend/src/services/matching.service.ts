import { VolunteerProfileEntity, OpportunityEntity } from "../models/types.js";

export interface MatchScoreBreakdown {
  totalScore: number;
  skillsScore: number;
  availabilityScore: number;
  locationScore: number;
  experienceScore: number;
  preferenceScore: number;
  rationale: string[];
}

export function calculateDeterministicMatch(
  volunteer: VolunteerProfileEntity,
  opportunity: OpportunityEntity
): MatchScoreBreakdown {
  // 1. Skill Match (40% weight)
  let matchedSkillsCount = 0;
  for (const skill of opportunity.skillsRequired) {
    if (volunteer.skills.includes(skill)) matchedSkillsCount++;
  }
  const skillRatio = opportunity.skillsRequired.length === 0 
    ? 1.0 
    : matchedSkillsCount / opportunity.skillsRequired.length;
  const skillsScore = Math.round(skillRatio * 40);

  // 2. Availability Match (20% weight)
  const hasAvailability = volunteer.availability && Object.keys(volunteer.availability).length > 0;
  const availabilityScore = hasAvailability ? 20 : 10;

  // 3. Location Match (15% weight)
  const locationMatches = opportunity.venue.toLowerCase().includes(volunteer.city.toLowerCase());
  const locationScore = locationMatches ? 15 : 7;

  // 4. Past Experience (10% weight)
  const experienceScore = Math.min(10, volunteer.completedAssignmentsCount * 2);

  // 5. Cleared Verification (15% weight)
  const preferenceScore = volunteer.backgroundCheckStatus === "CLEARED" ? 15 : 5;

  const totalScore = Math.min(
    100,
    skillsScore + availabilityScore + locationScore + experienceScore + preferenceScore
  );

  const rationale: string[] = [];
  if (matchedSkillsCount > 0) {
    rationale.push(`Matched ${matchedSkillsCount} required skill(s) (${opportunity.skillsRequired[0]})`);
  }
  if (locationMatches) {
    rationale.push(`Opportunity venue is within volunteer home base (${volunteer.city})`);
  }
  if (volunteer.backgroundCheckStatus === "CLEARED") {
    rationale.push("Background audit clearance verified by coordinator");
  }

  return {
    totalScore,
    skillsScore,
    availabilityScore,
    locationScore,
    experienceScore,
    preferenceScore,
    rationale,
  };
}
