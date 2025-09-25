import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Gets the user profile for the currently signed-in user.
 */
export const getCurrentUserProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();
    return userProfile;
  },
});

/**
 * Creates a new user profile record in the database.
 * This is called from the AuthPage component after a user successfully signs up.
 */
export const createUserProfile = mutation({
  args: {
    name: v.string(),
    corporatePlanId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Cannot create profile for unauthenticated user.");
    }

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();
    
    if (existingProfile) {
        console.warn("User profile already exists, skipping creation.");
        return existingProfile._id;
    }

    return await ctx.db.insert("userProfiles", {
      userId: identity.subject,
      name: args.name,
      corporatePlanId: args.corporatePlanId || undefined,
      role: "USER",
    });
  },
});

/**
 * Updates an existing user's role. Intended for admin use.
 * Note: Finds user by their profile ID, not by Clerk ID anymore.
 */
export const updateUserProfileRole = mutation({
    args: {
        userProfileId: v.id("userProfiles"),
        role: v.union(v.literal("USER"), v.literal("HR"), v.literal("PROVIDER"), v.literal("MANAGER")),
    },
    handler: async (ctx, { userProfileId, role }) => {
        // In a real app, you'd add an admin role check here.
        const user = await ctx.db.get(userProfileId);
        if (!user) {
            throw new Error("User profile not found");
        }
        await ctx.db.patch(userProfileId, { role });
    }
});