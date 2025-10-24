// Smart AI Service - Handles Gemini + Groq with fallback
// Gemini: Patient interactions, clinic features
// Groq: Lab and pharmacy operations (faster inference)
// Fallback: Gemini if Groq fails

import { GoogleGenerativeAI } from "@google/generative-ai";

// Groq API client
class GroqAPI {
  private apiKey: string;
  private baseURL = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    response_format?: { type: string };
    max_tokens?: number;
  }) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        response_format: params.response_format,
        max_tokens: params.max_tokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content
    };
  }
}

export class SmartAIService {
  private geminiClient: any;
  private groqClient: GroqAPI;
  
  constructor() {
    const geminiKey = process.env.API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    
    if (!geminiKey) throw new Error('GEMINI API_KEY not found');
    if (!groqKey) throw new Error('GROQ_API_KEY not found');
    
    this.geminiClient = new GoogleGenerativeAI(geminiKey);
    this.groqClient = new GroqAPI(groqKey);
  }

  // Patient and Clinic operations - Use Gemini (better for complex medical reasoning)
  async generatePatientResponse(prompt: string, schema?: any) {
    console.log('🧠 Using Gemini for patient interaction');
    
    const model = this.geminiClient.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: "You are an AI medical assistant. Your response must be a valid JSON object and nothing else."
    });
    
    const generationConfig: any = {};
    
    if (schema) {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = schema;
    }
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });
    
    return {
      text: result.response.text()
    };
  }

  // Lab and Pharmacy operations - Use Groq (faster inference) with Gemini fallback
  async generateLabPharmacyResponse(prompt: string, requireJson: boolean = false, maxRetries: number = 2) {
    console.log('⚡ Attempting Groq for lab/pharmacy operation');
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.groqClient.generateContent({
          model: 'llama-3.1-70b-versatile', // Fast Groq model
          messages: [
            {
              role: 'system',
              content: requireJson 
                ? 'You are an AI assistant. Your response must be a valid JSON object and nothing else.'
                : 'You are an AI assistant for healthcare operations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: requireJson ? { type: 'json_object' } : undefined,
          max_tokens: 1000
        });
        
        console.log('✅ Groq succeeded');
        return response;
        
      } catch (error) {
        console.log(`⚠️ Groq attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt === maxRetries - 1) {
          console.log('🔄 Falling back to Gemini');
          return await this.fallbackToGemini(prompt, requireJson);
        }
      }
    }
  }

  // Fallback to Gemini when Groq fails
  private async fallbackToGemini(prompt: string, requireJson: boolean) {
    console.log('🧠 Using Gemini fallback');
    
    const model = this.geminiClient.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: requireJson 
        ? "You are an AI assistant. Your response must be a valid JSON object and nothing else."
        : "You are an AI assistant for healthcare operations."
    });
    
    const generationConfig: any = {};
    
    if (requireJson) {
      generationConfig.responseMimeType = "application/json";
    }
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });
    
    return {
      text: result.response.text()
    };
  }

  // Utility method to determine which AI to use based on operation type
  async generateResponse(operationType: 'patient' | 'clinic' | 'lab' | 'pharmacy', prompt: string, options: {
    requireJson?: boolean;
    schema?: any;
  } = {}) {
    
    if (operationType === 'patient' || operationType === 'clinic') {
      return await this.generatePatientResponse(prompt, options.schema);
    } else {
      return await this.generateLabPharmacyResponse(prompt, options.requireJson);
    }
  }
}

export default SmartAIService;
