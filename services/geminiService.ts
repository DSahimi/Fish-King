
import { GoogleGenAI } from "@google/genai";

export const generateCatchAnalysis = async (
  fishName: string,
  weight: number,
  score: number,
  rarity: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Ask the developer to add one for AI insights!";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      I caught a ${rarity} ${fishName} weighing ${weight.toFixed(2)} lbs.
      The game assigned a score of ${score}/100.
      
      Act as a judge in a fishing competition.
      1. Give a 1-sentence witty remark about the catch.
      2. Explain specifically why it got that score based on its size compared to an average ${fishName}.
      Keep the total response under 40 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "A fine catch indeed!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The Fish Gods remain silent on this catch.";
  }
};
