import type { IAIProvider, ProviderMetadata, VolunteerMatchResult } from "../types.ts";
import { logger } from "../../logger.ts";

export class MockAIProvider implements IAIProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "MOCK_AI_RULE_ENGINE",
    isMock: true,
    version: "1.0.0"
  };

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    logger.info("MockAIProvider: Simulated text generation", { promptLength: prompt.length });
    return `[SIMULATED AI RESPONSE]: Analysis complete based on local NGO business taxonomy and verified guidelines.`;
  }

  async matchVolunteerSkills(volunteerProfile: any, opportunities: any[]): Promise<VolunteerMatchResult> {
    logger.info("MockAIProvider: Matching volunteer skills via rule engine", {
      volunteerId: volunteerProfile?.userId,
      opportunitiesCount: opportunities?.length
    });

    const volunteerSkills: string[] = Array.isArray(volunteerProfile?.skills)
      ? volunteerProfile.skills.map((s: any) => (typeof s === "string" ? s : s.name || s.id))
      : [];

    const matches: string[] = [];
    for (const opp of opportunities) {
      const reqSkills: string[] = Array.isArray(opp.requiredSkills) ? opp.requiredSkills : [];
      const overlap = reqSkills.filter(r => volunteerSkills.some(vs => vs.toLowerCase().includes(r.toLowerCase())));
      if (overlap.length > 0) {
        matches.push(opp.id);
      }
    }

    const matchScore = matches.length > 0 ? Math.min(95, 60 + matches.length * 10) : 50;

    return {
      matchScore,
      recommendedOpportunities: matches.slice(0, 3),
      rationale: `Matched ${matches.length} volunteer opportunities based on skill taxonomy alignment.`
    };
  }
}
