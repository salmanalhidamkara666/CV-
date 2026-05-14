import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialize the Gemini API client to avoid startup errors if the API key is missing
let aiClient: GoogleGenAI | null = null;

export function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in the environment. Please add it via Secrets Panel.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export interface AIRirekishoResponse {
  motivation: string;
  self_pr: string;
  isOptimized: boolean;
  optimizedFields?: {
    education?: { school: string; major: string; description: string }[];
    workExperience?: { company: string; position: string; description: string; achievement: string }[];
  };
}

/**
 * AI Service for translating and formatting resume fields according to HR Japanese standards
 */
export async function translateAndImproveToJapanese(
  text: string,
  fieldType: 'motivation' | 'self_pr' | 'education' | 'experience'
): Promise<string> {
  try {
    const ai = getAIClient();
    const prompt = `
      You are a professional Japanese HR Specialist and Recruitment Consultant.
      Perform standard resume optimization for the field: "${fieldType}".

      Input text to transform: "${text}"

      Task:
      1. Translate the input into formal Business Japanese (Keigo, specifically using polite, humble, or active verb forms like 〜ております, 〜に尽力いたしました, etc.).
      2. Match traditional recruiter standards in Japan.
      3. Avoid robotic AI phrasing; write as if a natural, ambitious, professional candidate is applying.
      4. Avoid literal translations; use industry-standard corporate Japanese terminology.
      5. Output ONLY the polished Japanese text. No commentary or English explanation.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("AI Error in translateAndImproveToJapanese:", error);
    throw error;
  }
}

/**
 * AI Service for auditing photo professional alignment
 */
export async function auditResumePhoto(base64Image: string): Promise<{
  score: number;
  isProfessional: boolean;
  issues: string[];
  tips: string[];
}> {
  try {
    const ai = getAIClient();
    // Validate the base64 format and strip prefix if needed
    const cleanedBase64 = base64Image.includes(",") 
      ? base64Image.split(",")[1] 
      : base64Image;

    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: cleanedBase64,
      }
    };

    const prompt = {
      text: `
        Analyze this candidate profile photo for a Japanese CV/Resume (履歴書 / Rirekisho).
        Validate it against strict Japanese recruiter expectations:
        1. Professional attire (suit, clean shirt, professional grooming).
        2. Well lit with clean, bright, or pure white background.
        3. Formal passport alignment (should face forwards, eyes to camera, neutral or positive slight smile).
        4. Detect blurryness, head slant/tilt, low contrast, or unprofessional settings.

        Return a JSON response conforming strictly to this format:
        {
          "score": number (0 to 100),
          "isProfessional": boolean,
          "issues": string[] (list of standard visual issues like "Tilt detected", "Background not white", "Casual clothing"),
          "tips": string[] (constructive Japanese/English hybrid advice for improvement)
        }
      `
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, prompt] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            isProfessional: { type: Type.BOOLEAN },
            issues: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "isProfessional", "issues", "tips"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return {
      score: parsed.score ?? 75,
      isProfessional: parsed.isProfessional ?? true,
      issues: parsed.issues ?? [],
      tips: parsed.tips ?? ["Good posture", "Keep lighting high"]
    };
  } catch (error) {
    console.error("AI Error in auditResumePhoto:", error);
    // Graceful fallback
    return {
      score: 80,
      isProfessional: true,
      issues: [],
      tips: ["AI could not scan photo live. Follow standard 3:4 white-background rules."]
    };
  }
}

/**
 * AI self-PR generator helper
 */
export async function generateSelfPRWithAI(
  skills: string[],
  achievements: string,
  motivationKeyword: string
): Promise<string> {
  try {
    const ai = getAIClient();
    const prompt = `
      Create a compelling and recruiter-grade Japanese Self-PR (自己PR) statement using these candidate credentials:
      - Skills: ${skills.join(", ")}
      - Major achievements: ${achievements}
      - Key thematic focus: ${motivationKeyword}

      Rules for Japan 自己PR standard:
      1. Start with a clear headline or opening sentence summarizing the core strength (私の強みは〜ことです).
      2. Provide specific logical support based on the work achievements.
      3. Conclude by demonstrating how this strength directly contributes to the prospective company (この強みを活かし、貴社の業務にお役立ちしたいと考えております).
      4. Use polite Keigo grammar (です・ます調).
      5. Do not write too long, keep to around 300-400 Japanese letters.
      6. Provide ONLY the Japanese PR text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.4
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Error in generateSelfPRWithAI:", error);
    return "AI generation failed. Please enter your 自己PR manually.";
  }
}

/**
 * AI motivation statement generator helper
 */
export async function generateMotivationWithAI(
  targetCompany: string,
  roleName: string,
  userExperienceSummary: string,
  keyReason: string
): Promise<string> {
  try {
    const ai = getAIClient();
    const prompt = `
      Create a high-impact Japanese Motivation Statement (志望動機 / Shibou Douki) for a Rirekisho using these inputs:
      - Target Company: ${targetCompany}
      - Role: ${roleName}
      - User's Experience & Skills: ${userExperienceSummary}
      - Core Personal Motivation/Reason: ${keyReason}

      Japanese Recruiter Invariants:
      1. Start by detailing why the prospective company is highly attractive, showcasing understanding of their goals (貴社の〜というビジョンに深く共感し〜).
      2. Link the candidate's past skills and background directly to show how they fit the role.
      3. State clearly how the candidate is passionate to contribute to the company's growth.
      4. Maintain polite formatting (〜に尽力したいと考え、志望いたしました).
      5. Tone should be modest, yet highly motivated and business-oriented.
      6. Output ONLY the Japanese text. No explanation. Limit to roughly 300-400 characters.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.4
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Error in generateMotivationWithAI:", error);
    return "AI generation failed. Please enter your 志望動機 manually.";
  }
}
