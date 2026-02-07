
import { GoogleGenAI, Type } from "@google/genai";
import { SmartSuggestion } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getSmartSuggestion(taskTitle: string): Promise<SmartSuggestion> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Refine this task title for better productivity and suggest 3-4 actionable subtasks: "${taskTitle}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedTitle: { 
              type: Type.STRING, 
              description: "A more professional, action-oriented version of the input task."
            },
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-4 simple steps to complete the task."
            }
          },
          required: ["refinedTitle", "subtasks"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Suggester Error:", error);
    return {
      refinedTitle: taskTitle,
      subtasks: ["Break down task into steps", "Set a timer", "Start with the easiest part"]
    };
  }
}
