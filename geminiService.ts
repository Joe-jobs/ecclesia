
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const getFollowUpStrategy = async (notes: string, name: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a short, friendly, and practical follow-up strategy for a new church visitor named ${name}. 
      Visitor's notes: "${notes}". 
      Keep the response as a simple list of 3 bullet points. No conversational filler.`,
    });

    return response.text || "No strategy generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI advisor. Please try again later.";
  }
};

export const getWarmMessage = async (name: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 distinct short, warm, welcoming follow-up message options to send to a new church visitor named ${name}. 
      Separate the options with "|||". 
      Only return the messages, nothing else.`,
    });
    return response.text ? response.text.split('|||').map(m => m.trim()) : ["Welcome to our church!"];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Welcome to our church!"];
  }
};
