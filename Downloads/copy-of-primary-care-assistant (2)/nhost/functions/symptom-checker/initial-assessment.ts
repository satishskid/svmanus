// Patient symptom assessment - Uses Gemini for complex medical reasoning
import type { Request, Response } from 'express';
import { ChatMessage, PatientProfile, GeneratedQuestion } from '../../types';
import { SmartAIService } from '../shared/smart-ai-service';
import { GeneratedQuestionSchema } from '../shared/schemas';

// This function will be the handler for the serverless function.
// Nhost automatically provides environment variables like API_KEY.
// FIX: Wrapped the serverless function logic in an exported default handler function to resolve scoping and syntax errors.
export default async function handler(req: Request, res: Response) {
  // 1. Security and Input Validation
  if (req.method !== 'POST') {
    // FIX: Changed send to json for consistent error responses.
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { symptoms, chatHistory, patientProfile } = req.body as {
    symptoms: string;
    chatHistory: ChatMessage[];
    patientProfile?: PatientProfile;
  };

  if (!symptoms || typeof symptoms !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "symptoms" field.' });
  }

  // 2. Initialize Smart AI Service (Gemini for patient interactions)
  let aiService;
  try {
    aiService = new SmartAIService();
  } catch (error) {
    console.error("AI service initialization failed:", error.message);
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  // 3. Construct the Prompt
  const historyContext = (chatHistory || []).map(msg => `${msg.sender}: ${msg.text}`).join('\n');
  let profileContext = "";
  if (patientProfile) {
    profileContext = "The patient has provided the following profile information:\n";
    if (patientProfile.name) profileContext += `- Name: ${patientProfile.name}\n`;
    if (patientProfile.age) profileContext += `- Age: ${patientProfile.age}\n`;
    if (patientProfile.pastHistory) profileContext += `- Past Medical History: ${patientProfile.pastHistory}\n`;
    if (patientProfile.habits) profileContext += `- Lifestyle Habits: ${patientProfile.habits}\n`;
  }

  const prompt = `You are a highly empathetic and understanding medical assistant AI. Your goal is to help the patient clarify their symptoms gently and effectively for a healthcare professional.
Patient's initial symptoms: "${symptoms}"
${profileContext}
${(chatHistory || []).length > 0 ? `Previous conversation context:\n${historyContext}` : ''}

Your tasks:
1.  Acknowledge the patient's input with warmth and understanding.
2.  Ask ONE clear, concise, and highly relevant follow-up question to gather more specific information. Use the patient's profile to make your question more personalized if appropriate.
3.  Optionally, provide 1-2 "metaSymptomQuestions". Each meta symptom question should have a "prompt" and an array of "options" (3-4 brief, clickable answer choices).
4.  Ensure your response is a valid JSON object.
5.  Do NOT provide any diagnosis or medical advice yet.
6.  If you feel you have enough information, set "isFinal": true in the JSON.
`;

  // 4. Call the AI Model (Gemini for patient interactions)
  try {
    const schema = GeneratedQuestionSchema;

    const response = await aiService.generateResponse('patient', prompt, { schema });
    
    let jsonStr = response.text.trim();
    const parsedResponse = JSON.parse(jsonStr) as GeneratedQuestion;
    res.status(200).json(parsedResponse);
  } catch (error) {
    console.error("Error in patient symptom assessment:", error);
    res.status(500).json({ error: 'An error occurred while processing the AI request.' });
  }
}
