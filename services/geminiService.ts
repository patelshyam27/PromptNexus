import { GoogleGenAI } from "@google/genai";

// Initialize the client.
// We allow runtime configuration via localStorage for the demo.
let apiKey = process.env.API_KEY || '';

// Try to get from localStorage if in browser environment
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('gemini_api_key');
  if (stored) apiKey = stored;
}

let ai = new GoogleGenAI({ apiKey });

export const setGeminiApiKey = (key: string) => {
  apiKey = key;
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_api_key', key);
  }
  ai = new GoogleGenAI({ apiKey });
};

export const hasApiKey = () => !!apiKey;

export const optimizePromptWithGemini = async (originalPrompt: string): Promise<string> => {
  if (!apiKey) {
    console.warn("Gemini API Key not found. Returning original prompt.");
    // We throw specific error to let UI know key is missing
    throw new Error("MISSING_API_KEY");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert prompt engineer. Optimize the following prompt to be more effective for a large language model. 
      Make it clearer, more specific, and structured. Do not lose the original intent.
      
      Original Prompt:
      "${originalPrompt}"
      
      Return ONLY the optimized prompt text, no explanations.`,
    });

    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Error optimizing prompt with Gemini:", error);
    return originalPrompt;
  }
};

export const generateDescriptionWithGemini = async (content: string): Promise<string> => {
  if (!apiKey) {
    return "A user submitted prompt.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a very short (one sentence, max 15 words) description for this AI prompt:
            
            "${content}"`,
    });
    return response.text?.trim() || "A user submitted prompt.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "A user submitted prompt.";
  }
}