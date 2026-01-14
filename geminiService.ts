
import { GoogleGenAI } from "@google/genai";

export const getFollowUpStrategy = async (notes: string, name: string) => {
  try {
    // Initialize inside the function to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Upgraded to Pro for higher quality follow-up reasoning
      contents: `Generate a short, friendly, and practical follow-up strategy for a new church visitor named ${name}. 
      Visitor's notes: "${notes}". 
      Keep the response as a simple list of 3 bullet points. No conversational filler.`,
    });

    // Access .text property directly as per the latest @google/genai guidelines
    return response.text || "No strategy generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI advisor. Please try again later.";
  }
};
