// Refined diagnosis based on test results - Uses Gemini for complex medical reasoning
import type { Request, Response } from 'express';
import { PatientProfile, ProvisionalDiagnosisResult } from '../../types';
import { SmartAIService } from '../shared/smart-ai-service';
import { ProvisionalDiagnosisSchema } from '../shared/schemas';

// FIX: Wrapped the serverless function logic in an exported default handler function to resolve scoping and syntax errors.
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    // FIX: Changed send to json for consistent error responses.
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provisionalDiagnosis, testResultsSummary, patientProfile } = req.body as {
    provisionalDiagnosis: string;
    testResultsSummary: string;
    patientProfile?: PatientProfile;
  };

  if (!provisionalDiagnosis || !testResultsSummary) {
    return res.status(400).json({ error: 'Missing provisionalDiagnosis or testResultsSummary.' });
  }

  // Initialize Smart AI Service (Gemini for patient interactions)
  let aiService;
  try {
    aiService = new SmartAIService();
  } catch (error) {
    console.error("AI service initialization failed:", error.message);
    return res.status(500).json({ error: 'AI service is not configured.' });
  }
  const profileContext = patientProfile ? `Patient Profile: Age ${patientProfile.age}, History: ${patientProfile.pastHistory || 'N/A'}` : '';

  const prompt = `
    A patient was provisionally assessed with "${provisionalDiagnosis}". They have now provided the following summary of their test results: "${testResultsSummary}".
    ${profileContext}

    Your tasks:
    1.  Analyze the test results in the context of the initial diagnosis.
    2.  Provide an updated "condition". This could be a more specific diagnosis, a confirmation of the original, or a different condition altogether.
    3.  Update the "confidence" level.
    4.  Write a new "summaryForPatient" explaining the findings in simple terms.
    5.  Suggest updated "nextSteps".
    6.  Ensure the output is a single, valid JSON object.
  `;

  try {
    // Define the response schema for structured output
    const schema = ProvisionalDiagnosisSchema;

    // Use Gemini for refined diagnosis (complex medical reasoning)
    const response = await aiService.generateResponse('patient', prompt, { schema });
    
    let jsonStr = response.text.trim();
    const refinedResult = JSON.parse(jsonStr) as ProvisionalDiagnosisResult;
    res.status(200).json(refinedResult);
  } catch (error) {
    console.error("Error in refined diagnosis:", error);
    res.status(500).json({ error: 'An error occurred while refining the diagnosis.' });
  }
}
