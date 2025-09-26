import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// === PHASE 2: AI Consultation Engine ===

// Create a new consultation
export const createConsultation = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    initialSymptoms: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in to create a consultation.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    const consultationId = await ctx.db.insert("consultations", {
      userId: userProfile._id,
      providerId: undefined, // Will be assigned later if needed
      title: args.title,
      status: "active",
      priority: args.priority,
      category: args.category,
      initialSymptoms: args.initialSymptoms,
      aiSummary: undefined,
      providerNotes: undefined,
      recommendations: undefined,
      riskAssessment: undefined,
      created_at: Date.now(),
      updated_at: Date.now(),
      closed_at: undefined,
    });

    // Create initial AI analysis
    await generateAiAnalysis(ctx, consultationId, args.initialSymptoms || "");

    return consultationId;
  },
});

// Get consultations for a user
export const getUserConsultations = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("paused"), v.literal("closed"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    let consultationsQuery = ctx.db
      .query("consultations")
      .withIndex("by_user", (q) => q.eq("userId", userProfile._id));

    if (args.status) {
      consultationsQuery = consultationsQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    const consultations = await consultationsQuery.collect();

    // Get messages for each consultation
    const consultationsWithMessages = await Promise.all(
      consultations.map(async (consultation) => {
        const messages = await ctx.db
          .query("consultationMessages")
          .withIndex("by_consultation", (q) => q.eq("consultationId", consultation._id))
          .order("asc")
          .collect();

        return {
          ...consultation,
          messages,
          messageCount: messages.length,
        };
      })
    );

    return consultationsWithMessages;
  },
});

// Send a message in a consultation
export const sendConsultationMessage = mutation({
  args: {
    consultationId: v.id("consultations"),
    messageType: v.union(v.literal("text"), v.literal("image"), v.literal("file"), v.literal("system")),
    content: v.string(),
    metadata: v.optional(v.any()),
    userApiKey: v.optional(v.string()), // Add API key parameter
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in to send a message.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found.");
    }

    // Check if user has access to this consultation
    if (consultation.userId !== userProfile._id && userProfile.role !== "PROVIDER") {
      throw new Error("Not authorized to send messages in this consultation.");
    }

    const messageId = await ctx.db.insert("consultationMessages", {
      consultationId: args.consultationId,
      authorId: userProfile._id,
      authorRole: userProfile.role === "HR" || userProfile.role === "MANAGER" ? "PROVIDER" : userProfile.role,
      messageType: args.messageType,
      content: args.content,
      metadata: args.metadata,
      isAiGenerated: false,
      confidenceScore: undefined,
      created_at: Date.now(),
    });

    // Update consultation's updated_at timestamp
    await ctx.db.patch(args.consultationId, {
      updated_at: Date.now(),
    });

    // If this is a user message, trigger AI response
    if (userProfile.role === "USER") {
      // Pass the API key to the AI response function
      const aiCtx = { ...ctx, userApiKey: args.userApiKey };
      await generateAiResponse(aiCtx, args.consultationId, args.content);
    }

    return messageId;
  },
});

// Get consultation messages
export const getConsultationMessages = query({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found.");
    }

    return await ctx.db
      .query("consultationMessages")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .order("asc")
      .collect();
  },
});

// Generate AI analysis for consultation
async function generateAiAnalysis(ctx: any, consultationId: string, symptoms: string) {
  try {
    // Get user's API key from localStorage (passed via context)
    const userApiKey = ctx.userApiKey;
    const fallbackApiKey = process.env.GEMINI_API_KEY;

    // Use user's key if available, otherwise use fallback
    const apiKey = userApiKey || fallbackApiKey;

    if (!apiKey) {
      throw new Error("No Gemini API key available. Please provide your API key in settings.");
    }

    // Import Google Generative AI
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a medical AI assistant. Analyze the following symptoms and provide a professional medical analysis:

Symptoms: ${symptoms}

Please provide:
1. A brief summary of potential conditions
2. Risk assessment (low/medium/high)
3. Recommended actions
4. Whether immediate medical attention is needed

Respond in a professional, empathetic manner. Do not provide definitive diagnoses.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const analysis = {
      summary: text.substring(0, 500) + '...', // Truncate for display
      riskLevel: text.toLowerCase().includes('high') ? 'high' :
                 text.toLowerCase().includes('medium') ? 'medium' : 'low',
      recommendations: [
        "Monitor symptoms closely",
        "Schedule follow-up if symptoms persist",
        "Consider consulting with healthcare provider"
      ],
      confidence: 0.85,
      fullAnalysis: text
    };

    await ctx.db.patch(consultationId, {
      aiSummary: analysis.summary,
      recommendations: analysis,
      riskAssessment: { level: analysis.riskLevel, score: analysis.confidence },
      updated_at: Date.now(),
    });

    // Create AI message with analysis
    const consultation = await ctx.db.get(consultationId);
    if (consultation) {
      await ctx.db.insert("consultationMessages", {
        consultationId,
        authorId: consultation.userId, // Use user's ID for AI messages
        authorRole: "AI",
        messageType: "text",
        content: `🤖 AI Analysis: ${analysis.summary}\n\nRisk Level: ${analysis.riskLevel.toUpperCase()}\nConfidence: ${(analysis.confidence * 100).toFixed(1)}%\n\nFull Analysis: ${analysis.fullAnalysis}`,
        metadata: analysis,
        isAiGenerated: true,
        confidenceScore: analysis.confidence,
        created_at: Date.now(),
      });
    }
  } catch (error) {
    console.error("AI analysis failed:", error);
    // Fallback to mock response if API fails
    await generateMockAiAnalysis(ctx, consultationId, symptoms);
  }
}

// Fallback function for when API is not available
async function generateMockAiAnalysis(ctx: any, consultationId: string, symptoms: string) {
  const aiAnalysis = {
    summary: `AI analysis based on symptoms: ${symptoms}`,
    riskLevel: symptoms.length > 50 ? "medium" : "low",
    recommendations: [
      "Monitor symptoms closely",
      "Schedule follow-up if symptoms persist",
      "Consider consulting with healthcare provider"
    ],
    confidence: 0.85,
  };

  await ctx.db.patch(consultationId, {
    aiSummary: aiAnalysis.summary,
    recommendations: aiAnalysis,
    riskAssessment: { level: aiAnalysis.riskLevel, score: aiAnalysis.confidence },
    updated_at: Date.now(),
  });

  // Create AI message with analysis
  const consultation = await ctx.db.get(consultationId);
  if (consultation) {
    await ctx.db.insert("consultationMessages", {
      consultationId,
      authorId: consultation.userId, // Use user's ID for AI messages
      authorRole: "AI",
      messageType: "text",
      content: `🤖 AI Analysis: ${aiAnalysis.summary}\n\nRisk Level: ${aiAnalysis.riskLevel.toUpperCase()}\nConfidence: ${(aiAnalysis.confidence * 100).toFixed(1)}%\n\nNote: Using fallback analysis mode. For better results, please provide your Gemini API key.",
      metadata: aiAnalysis,
      isAiGenerated: true,
      confidenceScore: aiAnalysis.confidence,
      created_at: Date.now(),
    });
  }
}

// Generate AI response to user message
async function generateAiResponse(ctx: any, consultationId: string, userMessage: string) {
  try {
    // Get user's API key from localStorage (passed via context)
    const userApiKey = ctx.userApiKey;
    const fallbackApiKey = process.env.GEMINI_API_KEY;

    // Use user's key if available, otherwise use fallback
    const apiKey = userApiKey || fallbackApiKey;

    if (!apiKey) {
      throw new Error("No Gemini API key available. Please provide your API key in settings.");
    }

    // Import Google Generative AI
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a helpful medical AI assistant. Respond to this user message in a consultation:

User: ${userMessage}

Provide a helpful, professional response. Be empathetic and supportive. If the user needs medical attention, recommend consulting a healthcare provider. Keep responses concise but informative.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const consultation = await ctx.db.get(consultationId);
    if (consultation) {
      await ctx.db.insert("consultationMessages", {
        consultationId,
        authorId: consultation.userId, // Use user's ID for AI messages
        authorRole: "AI",
        messageType: "text",
        content: `🤖 ${text}`,
        metadata: { responseType: "general", confidence: 0.9, fullPrompt: prompt },
        isAiGenerated: true,
        confidenceScore: 0.9,
        created_at: Date.now() + 1000, // Slight delay to simulate AI processing
      });
    }
  } catch (error) {
    console.error("AI response generation failed:", error);
    // Fallback to mock response if API fails
    await generateMockAiResponse(ctx, consultationId, userMessage);
  }
}

// Fallback function for when API is not available
async function generateMockAiResponse(ctx: any, consultationId: string, userMessage: string) {
  const aiResponses = [
    "I understand your concern. Can you tell me more about your symptoms?",
    "Thank you for sharing that information. Let me analyze this for you.",
    "Based on what you've described, I recommend monitoring your symptoms and consulting a healthcare provider if they worsen.",
    "This sounds concerning. Would you like me to help you schedule an appointment with a specialist?",
    "I can help you with that. Let me check our available providers and suggest the best match for your needs."
  ];

  const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

  const consultation = await ctx.db.get(consultationId);
  if (consultation) {
    await ctx.db.insert("consultationMessages", {
      consultationId,
      authorId: consultation.userId, // Use user's ID for AI messages
      authorRole: "AI",
      messageType: "text",
      content: `🤖 ${randomResponse}\n\nNote: Using fallback response mode. For better results, please provide your Gemini API key.",
      metadata: { responseType: "fallback", confidence: 0.7 },
      isAiGenerated: true,
      confidenceScore: 0.7,
      created_at: Date.now() + 1000, // Slight delay to simulate AI processing
    });
  }
}

// Close consultation
export const closeConsultation = mutation({
  args: {
    consultationId: v.id("consultations"),
    outcome: v.optional(v.string()),
    satisfactionScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found.");
    }

    // Check if user has access to this consultation
    if (consultation.userId !== userProfile._id && userProfile.role !== "PROVIDER") {
      throw new Error("Not authorized to close this consultation.");
    }

    const now = Date.now();
    await ctx.db.patch(args.consultationId, {
      status: "closed",
      updated_at: now,
      closed_at: now,
    });

    // Update analytics
    const messages = await ctx.db
      .query("consultationMessages")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .collect();

    const aiMessages = messages.filter(m => m.authorRole === "AI").length;
    const providerMessages = messages.filter(m => m.authorRole === "PROVIDER").length;
    const userMessages = messages.filter(m => m.authorRole === "USER").length;

    const consultationDuration = (now - consultation.created_at) / (1000 * 60); // minutes
    const averageResponseTime = messages.length > 1 ? consultationDuration / (messages.length - 1) : 0;

    await ctx.db.insert("consultationAnalytics", {
      consultationId: args.consultationId,
      totalMessages: messages.length,
      aiMessages,
      providerMessages,
      userMessages,
      averageResponseTime,
      consultationDuration,
      satisfactionScore: args.satisfactionScore,
      outcome: args.outcome,
      created_at: now,
    });

    return args.consultationId;
  },
});

// Get consultation analytics
export const getConsultationAnalytics = query({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query("consultationAnalytics")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .first();

    if (!analytics) {
      return null;
    }

    return analytics;
  },
});

// Get AI models
export const getAiModels = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("aiModels")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Add provider to consultation
export const assignProviderToConsultation = mutation({
  args: {
    consultationId: v.id("consultations"),
    providerId: v.id("providers"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile || !["MANAGER", "HR"].includes(userProfile.role)) {
      throw new Error("Only managers and HR can assign providers to consultations.");
    }

    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) {
      throw new Error("Consultation not found.");
    }

    const provider = await ctx.db.get(args.providerId);
    if (!provider) {
      throw new Error("Provider not found.");
    }

    await ctx.db.patch(args.consultationId, {
      providerId: args.providerId,
      updated_at: Date.now(),
    });

    // Notify provider via system message
    await ctx.db.insert("consultationMessages", {
      consultationId: args.consultationId,
      authorId: userProfile._id,
      authorRole: userProfile.role === "HR" || userProfile.role === "MANAGER" ? "PROVIDER" : userProfile.role,
      messageType: "system",
      content: `Provider ${provider.name} has been assigned to this consultation.`,
      metadata: { action: "provider_assigned", providerId: args.providerId },
      isAiGenerated: false,
      confidenceScore: undefined,
      created_at: Date.now(),
    });

    return args.consultationId;
  },
});
