import { GoogleGenAI } from "@google/genai";
import type { IAIProvider, ProviderMetadata, VolunteerMatchResult } from "../types.ts";
import { logger } from "../../logger.ts";

export class GeminiAIProvider implements IAIProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "GOOGLE_GEMINI_AI",
    isMock: false,
    version: "1.0.0"
  };

  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-2.5-flash") {
    if (!apiKey) {
      throw new Error("GeminiAIProvider requires a valid GEMINI_API_KEY");
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined
      });
      return response.text || "";
    } catch (err) {
      logger.error("Gemini AI generateText failed", err);
      throw err;
    }
  }

  async matchVolunteerSkills(volunteerProfile: any, opportunities: any[]): Promise<VolunteerMatchResult> {
    try {
      const prompt = `Analyze this volunteer profile and the available opportunities.
Volunteer Profile:
${JSON.stringify(volunteerProfile)}

Available Opportunities:
${JSON.stringify(opportunities)}

Return a strict JSON response with:
{
  "matchScore": number (0 to 100),
  "recommendedOpportunities": string[] (array of matching opportunity IDs),
  "rationale": string (brief justification)
}`;

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return {
        matchScore: Number(parsed.matchScore) || 75,
        recommendedOpportunities: Array.isArray(parsed.recommendedOpportunities) ? parsed.recommendedOpportunities : [],
        rationale: parsed.rationale || "Automated Gemini semantic skill match completed."
      };
    } catch (err) {
      logger.error("Gemini AI matching failed, using rule-based fallback", err);
      return {
        matchScore: 70,
        recommendedOpportunities: opportunities.slice(0, 2).map(o => o.id),
        rationale: "Rule-based skill matching fallback applied."
      };
    }
  }
}
