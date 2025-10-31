import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { randomUUID } from "crypto";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  screening: router({
    // Vision Screening
    createVisionSession: protectedProcedure
      .input(z.object({
        ageGroup: z.enum(["0-2", "3-5", "6-12", "13-18", "18+"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = randomUUID();
        await db.createVisionScreeningSession({
          id: sessionId,
          userId: ctx.user.id,
          ageGroup: input.ageGroup,
          notes: input.notes,
        });
        return { sessionId };
      }),

    addPhotoscreeningResult: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        eyeSide: z.enum(["left", "right", "both"]),
        redReflexStatus: z.enum(["normal", "abnormal", "unclear"]).optional(),
        eyeAlignment: z.enum(["normal", "esotropia", "exotropia", "unclear"]).optional(),
        refractionEstimate: z.string().optional(),
        imageUrl: z.string().optional(),
        confidence: z.number().int().min(0).max(100).optional(),
      }))
      .mutation(async ({ input }) => {
        const resultId = randomUUID();
        await db.addPhotoscreeningResult({
          id: resultId,
          sessionId: input.sessionId,
          eyeSide: input.eyeSide,
          redReflexStatus: input.redReflexStatus,
          eyeAlignment: input.eyeAlignment,
          refractionEstimate: input.refractionEstimate,
          imageUrl: input.imageUrl,
          confidence: input.confidence,
        });
        return { resultId };
      }),

    addVisualAcuityResult: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        eyeSide: z.enum(["left", "right", "both"]),
        acuityMeasurement: z.string(),
        acuityDecimal: z.string().optional(),
        testMethod: z.enum(["snellen", "tumbling_e", "lea_symbols", "picture_matching"]),
        distanceMeters: z.number().int(),
        correctionUsed: z.boolean().optional(),
        correctionType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const resultId = randomUUID();
        await db.addVisualAcuityResult({
          id: resultId,
          sessionId: input.sessionId,
          eyeSide: input.eyeSide,
          acuityMeasurement: input.acuityMeasurement,
          acuityDecimal: input.acuityDecimal,
          testMethod: input.testMethod,
          distanceMeters: input.distanceMeters,
          correctionUsed: input.correctionUsed,
          correctionType: input.correctionType,
        });
        return { resultId };
      }),

    // Hearing Screening
    createHearingSession: protectedProcedure
      .input(z.object({
        ageGroup: z.enum(["0-2", "3-5", "6-12", "13-18", "18+"]),
        environmentNoise: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = randomUUID();
        await db.createHearingScreeningSession({
          id: sessionId,
          userId: ctx.user.id,
          ageGroup: input.ageGroup,
          environmentNoise: input.environmentNoise,
          notes: input.notes,
        });
        return { sessionId };
      }),

    addPureToneResult: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        earSide: z.enum(["left", "right"]),
        frequency: z.number().int(),
        threshold: z.number().int(),
        conduction: z.enum(["air", "bone"]),
      }))
      .mutation(async ({ input }) => {
        const resultId = randomUUID();
        await db.addPureToneAudiometryResult({
          id: resultId,
          sessionId: input.sessionId,
          earSide: input.earSide,
          frequency: input.frequency,
          threshold: input.threshold,
          conduction: input.conduction,
        });
        return { resultId };
      }),

    addSpeechInNoiseResult: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        testType: z.enum(["quick_sin", "azbio", "hint", "custom"]),
        signalNoiseRatio: z.number().int().optional(),
        percentCorrect: z.number().min(0).max(100),
        wordsPresented: z.number().int().optional(),
        wordsCorrect: z.number().int().optional(),
        presentationLevel: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        const resultId = randomUUID();
        await db.addSpeechInNoiseResult({
          id: resultId,
          sessionId: input.sessionId,
          testType: input.testType,
          signalNoiseRatio: input.signalNoiseRatio,
          percentCorrect: input.percentCorrect,
          wordsPresented: input.wordsPresented,
          wordsCorrect: input.wordsCorrect,
          presentationLevel: input.presentationLevel,
        });
        return { resultId };
      }),

    // Summary and History
    createSummaryReport: protectedProcedure
      .input(z.object({
        visionSessionId: z.string().optional(),
        hearingSessionId: z.string().optional(),
        overallStatus: z.enum(["pass", "refer", "inconclusive"]),
        visionStatus: z.enum(["pass", "refer", "inconclusive", "not_tested"]).optional(),
        hearingStatus: z.enum(["pass", "refer", "inconclusive", "not_tested"]).optional(),
        visionRecommendations: z.string().optional(),
        hearingRecommendations: z.string().optional(),
        followUpRequired: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const reportId = randomUUID();
        await db.createScreeningSummaryReport({
          id: reportId,
          userId: ctx.user.id,
          visionSessionId: input.visionSessionId,
          hearingSessionId: input.hearingSessionId,
          overallStatus: input.overallStatus,
          visionStatus: input.visionStatus,
          hearingStatus: input.hearingStatus,
          visionRecommendations: input.visionRecommendations,
          hearingRecommendations: input.hearingRecommendations,
          followUpRequired: input.followUpRequired,
        });
        return { reportId };
      }),

    getScreeningHistory: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserScreeningHistory(ctx.user.id);
      }),

    getVisionSessionDetails: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getVisionSessionDetails(input.sessionId);
      }),

    getHearingSessionDetails: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getHearingSessionDetails(input.sessionId);
      }),
  }),

  admin: router({
    // Whitelist Management
    addToWhitelist: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        subscriptionTier: z.enum(["trial", "paid"]),
        accessDurationDays: z.number().int(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can add to whitelist
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const entryId = randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.accessDurationDays);

        await db.addToWhitelist({
          id: entryId,
          email: input.email,
          subscriptionTier: input.subscriptionTier,
          accessDurationDays: input.accessDurationDays,
          status: "active",
          addedBy: ctx.user.id,
          expiresAt,
          notes: input.notes,
        });

        return { success: true, entryId };
      }),

    getWhitelistEntries: protectedProcedure
      .query(async ({ ctx }) => {
        // Only admins can view whitelist
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        return await db.getAllWhitelistEntries();
      }),

    removeFromWhitelist: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can remove from whitelist
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        await db.deleteFromWhitelist(input.email);
        return { success: true };
      }),

    updateWhitelistEntry: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        subscriptionTier: z.enum(["trial", "paid"]).optional(),
        status: z.enum(["active", "expired", "revoked"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can update whitelist
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const updates: any = {};
        if (input.subscriptionTier) updates.subscriptionTier = input.subscriptionTier;
        if (input.status) updates.status = input.status;
        if (input.notes !== undefined) updates.notes = input.notes;

        await db.updateWhitelistEntry(input.email, updates);
        return { success: true };
      }),

    // Check user access
    checkUserAccess: protectedProcedure
      .query(async ({ ctx }) => {
        const hasAccess = await db.checkUserAccess(ctx.user.id);
        const accessLog = await db.getUserAccessLog(ctx.user.id);
        return {
          hasAccess,
          subscriptionTier: accessLog?.subscriptionTier,
          expiresAt: accessLog?.accessExpiresAt,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

