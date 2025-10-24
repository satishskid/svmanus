// Doctor notes generation - Uses Gemini for clinical documentation
import type { Request, Response } from 'express';
import { PatientProfile } from '../../types';
import { SmartAIService } from '../shared/smart-ai-service';

// FIX: Wrapped the serverless function logic in an exported default handler function to resolve scoping and syntax errors.
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    // FIX: Changed send to json for consistent error responses.
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { symptoms, provisionalDiagnosis, patientProfile, testResultsSummary } = req.body as {
    symptoms: string;
    provisionalDiagnosis: string;
    patientProfile?: PatientProfile;
    testResultsSummary?: string | null;
  };

  if (!symptoms || !provisionalDiagnosis) {
    return res.status(400).json({ error: 'Missing symptoms or provisionalDiagnosis.' });
  }

  // Initialize Smart AI Service (Gemini for clinical documentation)
  let aiService;
  try {
    aiService = new SmartAIService();
  } catch (error) {
    console.error("AI service initialization failed:", error.message);
    return res.status(500).json({ error: 'AI service is not configured.' });
  }
  const profileContext = patientProfile ? `Patient Profile: Age ${patientProfile.age}, History: ${patientProfile.pastHistory || 'N/A'}` : '';
  const testContext = testResultsSummary ? `Uploaded Test Results Summary: "${testResultsSummary}"` : '';

  const prompt = `
    As an AI medical scribe, generate a concise, structured pre-consultation note for a doctor based on the provided information. The note should be in a standard clinical format (e.g., SOAP or similar structure).

    Patient's Reported Symptoms: "${symptoms}"
    Initial AI Assessment: "${provisionalDiagnosis}"
    ${profileContext}
    ${testContext}

    Your tasks:
    1.  Create a "Subjective" section summarizing the patient's reported symptoms and history.
    2.  Create an "Objective" section if any objective data is available (like from test results), otherwise state "Pending clinical examination."
    3.  Create an "Assessment" section stating the provisional diagnosis.
    4.  Create a "Plan" section suggesting initial points for the doctor to consider, such as "Confirm diagnosis", "Discuss treatment options", and "Review test results with patient".
    5.  The entire output must be a single string of text, well-formatted with newlines for readability. Do not use markdown.
  `;

  try {
    // Use Gemini for doctor notes generation (clinical documentation)
    const response = await aiService.generateResponse('clinic', prompt);
    
    const doctorNote = response.text;
    // Send response as plain text
    res.status(200).send(doctorNote);
  } catch (error) {
    console.error("Error generating doctor notes:", error);
    res.status(500).json({ error: 'An error occurred while generating doctor notes.' });
  }
}
