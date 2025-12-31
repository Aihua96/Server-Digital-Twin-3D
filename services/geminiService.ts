
import { GoogleGenAI, Type } from "@google/genai";

// Always use named parameter and direct process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHardwareImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Identify the main hardware components in this PC/server build. Focus on the GPU (brand, model if visible), CPU cooler type, and power supply. Return a JSON structure with detected items."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            components: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "category"]
              }
            }
          }
        }
      }
    });

    // Access .text property directly, do not call as a method
    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
