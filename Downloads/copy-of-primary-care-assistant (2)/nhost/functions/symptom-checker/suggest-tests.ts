// Lab test recommendations - Uses Groq for fast inference with Gemini fallback
import type { Request, Response } from 'express';
import { SmartAIService } from '../shared/smart-ai-service';

// FIX: Wrapped the serverless function logic in an exported default handler function to resolve scoping and syntax errors.
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    // FIX: Changed send to json for consistent error responses.
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provisionalCondition } = req.body as {
    provisionalCondition: string;
  };

  if (!provisionalCondition) {
    return res.status(400).json({ error: 'Missing provisionalCondition.' });
  }

  // Initialize Smart AI Service (Groq for lab operations with Gemini fallback)
  let aiService;
  try {
    aiService = new SmartAIService();
  } catch (error) {
    console.error("AI service initialization failed:", error.message);
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  const prompt = `
    Based on the provisional condition "${provisionalCondition}", suggest a list of 2-3 common, non-invasive diagnostic tests a doctor might consider to confirm or investigate further.
    
    Your tasks:
    1.  Provide a list of test names.
    2.  Do not provide explanations or any other text.
    3.  Your output must be a simple JSON array of strings.
  `;

  try {
    // Use Groq for fast lab test recommendations with Gemini fallback
    const response = await aiService.generateResponse('lab', prompt, { requireJson: true });
    
    let jsonStr = response.text.trim();
    const tests = JSON.parse(jsonStr) as string[];
    res.status(200).json(tests);
  } catch (error) {
    console.error("Error in lab test suggestion:", error);
    res.status(500).json({ error: 'An error occurred while suggesting tests.' });
  }
}
