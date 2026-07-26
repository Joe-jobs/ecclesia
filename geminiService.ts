
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = 
    (typeof process !== 'undefined' && process.env && (process.env.API_KEY || process.env.GEMINI_API_KEY)) ||
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY)) ||
    '';

  if (!apiKey) {
    return null;
  }

  try {
    return new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.warn("Could not initialize GoogleGenAI client:", err);
    return null;
  }
};

export const getFollowUpStrategy = async (notes: string, name: string) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return "Follow-up Strategy:\n• Reach out via phone call within 24 hours to welcome them.\n• Send a personalized welcome message with upcoming church events.\n• Invite them to the next fellowship or unit meeting.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, friendly, and practical follow-up strategy for a new church visitor named ${name}. 
      Visitor's notes: "${notes}". 
      Keep the response as a simple list of 3 bullet points. No conversational filler.`,
    });

    return response.text || "No strategy generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Follow-up Strategy:\n• Reach out via phone call within 24 hours to welcome them.\n• Send a personalized welcome message with upcoming church events.\n• Invite them to the next fellowship or unit meeting.";
  }
};

export const getWarmMessage = async (name: string) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return [
        `Hi ${name}, thank you so much for joining us at church! We hope you felt at home and were blessed by the service.`,
        `Dear ${name}, it was wonderful having you with us today! If you have any prayer requests or questions, please let us know.`,
        `Hello ${name}, warm greetings! Thank you for visiting our church. We would love to see you again this Sunday!`
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 3 distinct short, warm, welcoming follow-up message options to send to a new church visitor named ${name}. 
      Separate the options with "|||". 
      Only return the messages, nothing else.`,
    });
    return response.text ? response.text.split('|||').map(m => m.trim()) : [
      `Hi ${name}, thank you so much for joining us at church!`,
      `Dear ${name}, it was wonderful having you with us today!`,
      `Hello ${name}, warm greetings! Thank you for visiting.`
    ];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      `Hi ${name}, thank you so much for joining us at church! We hope you felt at home and were blessed by the service.`,
      `Dear ${name}, it was wonderful having you with us today! If you have any prayer requests or questions, please let us know.`,
      `Hello ${name}, warm greetings! Thank you for visiting our church. We would love to see you again this Sunday!`
    ];
  }
};

