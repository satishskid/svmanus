import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { consultationId: v.id("appointments") },
  handler: async (ctx, args) => {
    // Auth check: ensure user is part of this consultation
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const appointment = await ctx.db.get(args.consultationId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }

    const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", q => q.eq("userId", identity.subject))
        .unique();

    if (!userProfile) {
        throw new Error("User profile not found");
    }
    
    // In a real app, provider ID would be on the appointment
    // Here we assume any provider can see any consultation for simplicity of the demo
    if (appointment.userId !== userProfile._id && userProfile.role !== 'PROVIDER') {
        throw new Error("Not authorized to view these messages");
    }

    return await ctx.db
      .query("consultationMessages")
      .withIndex("by_consultation_id", (q) => q.eq("consultationId", args.consultationId))
      .collect();
  },
});

export const send = mutation({
  args: {
    consultationId: v.id("appointments"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", q => q.eq("userId", identity.subject))
        .unique();
    if (!userProfile) {
        throw new Error("User profile not found");
    }
    
    const appointment = await ctx.db.get(args.consultationId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }

    if (appointment.userId !== userProfile._id && userProfile.role !== 'PROVIDER') {
        throw new Error("Not authorized to send messages to this consultation");
    }

    await ctx.db.insert("consultationMessages", {
      consultationId: args.consultationId,
      body: args.body,
      authorId: userProfile._id,
      authorRole: userProfile.role === 'PROVIDER' ? 'PROVIDER' : 'USER',
    });
  },
});
