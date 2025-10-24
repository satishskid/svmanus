// Provisional diagnosis - Uses Gemini for complex medical reasoning
import type { Request, Response } from 'express';
import { ChatMessage, PatientProfile, ProvisionalDiagnosisResult } from '../../types';
import { SmartAIService } from '../shared/smart-ai-service';
import { ProvisionalDiagnosisSchema } from '../shared/schemas';

// FIX: Wrapped the serverless function logic in an exported default handler function to resolve scoping and syntax errors.
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    // FIX: Changed send to json for consistent error responses.
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { chatHistory, patientProfile } = req.body as {
    chatHistory: ChatMessage[];
    patientProfile?: PatientProfile;
  };

  if (!chatHistory || chatHistory.length === 0) {
    return res.status(400).json({ error: 'Missing or empty chatHistory.' });
  }

  // Initialize Smart AI Service (Gemini for patient interactions)
  let aiService;
  try {
    aiService = new SmartAIService();
  } catch (error) {
    console.error("AI service initialization failed:", error.message);
    return res.status(500).json({ error: 'AI service is not configured.' });
  }
  const historyContext = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
  const profileContext = patientProfile ? `Patient Profile: Age ${patientProfile.age}, History: ${patientProfile.pastHistory || 'N/A'}` : '';

  const prompt = `
    Based on the entire conversation history and patient profile, provide a provisional assessment.

    ${profileContext}
    Conversation History:
    ${historyContext}

    Your tasks:
    1.  Determine a single, most likely "condition". If you cannot determine one, use a general description like "Viral illness symptoms" or state "Insufficient information".
    2.  Assign a "confidence" level: 'high', 'medium', 'low', or 'insufficient information'.
    3.  Write a "summaryForPatient" in clear, non-alarming language, explaining the likely issue and why.
    4.  Suggest clear "nextSteps" for the patient, which should always include consulting a doctor.
    5.  Ensure the entire output is a single, valid JSON object.
    6.  DO NOT give definitive medical advice. Frame everything provisionally.
  `;

  try {
    // Define the response schema for structured output
    const schema = ProvisionalDiagnosisSchema;

    // Use Gemini for patient diagnosis (complex medical reasoning)
    const response = await aiService.generateResponse('patient', prompt, { schema });
    
    let jsonStr = response.text.trim();
    const diagnosisResult = JSON.parse(jsonStr) as ProvisionalDiagnosisResult;
    res.status(200).json(diagnosisResult);
  } catch (error) {
    console.error("Error in provisional diagnosis:", error);
    res.status(500).json({ error: 'An error occurred while processing the diagnosis request.' });
  }
}
