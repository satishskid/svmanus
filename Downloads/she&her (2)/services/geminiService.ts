import { GoogleGenAI, Chat } from "@google/genai";
import { GEMINI_MODEL_NAME } from "../constants";

let ai: GoogleGenAI | null = null;
let lastUsedApiKey: string | null = null;

function getAiClient(): GoogleGenAI | null {
  const userApiKey = localStorage.getItem('gemini_api_key');
  // Fix: Cast import.meta to any to resolve TypeScript error for VITE env vars.
  const apiKey = userApiKey || (import.meta as any).env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Gemini API key not found. Please provide one in settings.");
    return null;
  }

  // If we have a cached client and the key hasn't changed, return it.
  if (ai && apiKey === lastUsedApiKey) {
    return ai;
  }
  
  // Otherwise, create a new instance
  ai = new GoogleGenAI({ apiKey });
  lastUsedApiKey = apiKey;
  return ai;
}

export function initializeChatSession(systemInstruction: string): Chat | null {
  const localAi = getAiClient();
  if (!localAi) return null;

  try {
    const newChatSession = localAi.chats.create({ 
      model: GEMINI_MODEL_NAME, 
      config: { systemInstruction } 
    });
    return newChatSession;
  } catch (e) {
    console.error("Failed to initialize chat session:", e);
    return null;
  }
}
