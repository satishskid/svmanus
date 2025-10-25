// Schema definitions for Gemini structured output
export const GeneratedQuestionSchema = {
  type: "object" as const,
  properties: {
    question: { type: "string" as const },
    metaSymptomQuestions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          prompt: { type: "string" as const },
          options: { 
            type: "array" as const, 
            items: { type: "string" as const } 
          }
        },
        required: ['prompt', 'options']
      }
    },
    isFinal: { type: "boolean" as const }
  },
  required: ['question']
};

export const ProvisionalDiagnosisSchema = {
  type: "object" as const,
  properties: {
    condition: { type: "string" as const },
    confidence: { type: "string" as const },
    summaryForPatient: { type: "string" as const },
    nextSteps: { type: "string" as const }
  },
  required: ['condition', 'confidence', 'summaryForPatient', 'nextSteps']
};
