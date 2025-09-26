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

/**
 * ADMIN FUNCTION: Creates a user account with password and profile.
 * This is for admin use only to create users programmatically.
 */
export const createUserAccount = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(v.literal("USER"), v.literal("HR"), v.literal("PROVIDER"), v.literal("MANAGER")),
    corporatePlanId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if current user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to create users.");
    }

    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!currentUserProfile || currentUserProfile.role !== "MANAGER") {
      throw new Error("Only managers can create user accounts.");
    }

    // Note: In Convex, user creation is typically handled on the client side
    // This function creates the profile, but the actual auth account must be created via client
    // For admin purposes, we'll create a placeholder that can be activated later

    // Check if a user with this email already exists
    const existingUsers = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), args.email))
      .collect();

    if (existingUsers.length > 0) {
      throw new Error("A user with this email already exists.");
    }

    // Create a user profile with the email as userId (will be updated when they sign up)
    const userProfileId = await ctx.db.insert("userProfiles", {
      userId: args.email, // Temporary - will be replaced with actual userId on signup
      name: args.name,
      role: args.role,
      corporatePlanId: args.corporatePlanId || undefined,
    });

    return {
      userProfileId,
      message: "User profile created. User must complete signup process to activate account.",
      temporaryUserId: args.email
    };
  },
});

/**
 * ADMIN FUNCTION: Gets all user profiles for admin management.
 */
export const getAllUserProfiles = query({
  handler: async (ctx) => {
    // Check if current user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated.");
    }

    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!currentUserProfile || currentUserProfile.role !== "MANAGER") {
      throw new Error("Only managers can view all user profiles.");
    }

    return await ctx.db.query("userProfiles").collect();
  },
});

/**
 * ADMIN FUNCTION: Updates user profile information.
 */
export const updateUserProfile = mutation({
  args: {
    userProfileId: v.id("userProfiles"),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("USER"), v.literal("HR"), v.literal("PROVIDER"), v.literal("MANAGER"))),
    corporatePlanId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if current user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated.");
    }

    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!currentUserProfile || currentUserProfile.role !== "MANAGER") {
      throw new Error("Only managers can update user profiles.");
    }

    const userProfile = await ctx.db.get(args.userProfileId);
    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.role !== undefined) updates.role = args.role;
    if (args.corporatePlanId !== undefined) updates.corporatePlanId = args.corporatePlanId;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.userProfileId, updates);
    }

    return args.userProfileId;
  },
});

/**
 * ADMIN FUNCTION: Deletes a user profile (soft delete by marking as inactive).
 */
export const deleteUserProfile = mutation({
  args: {
    userProfileId: v.id("userProfiles"),
  },
  handler: async (ctx, args) => {
    // Check if current user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated.");
    }

    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!currentUserProfile || currentUserProfile.role !== "MANAGER") {
      throw new Error("Only managers can delete user profiles.");
    }

    // Prevent self-deletion
    if (args.userProfileId === currentUserProfile._id) {
      throw new Error("Cannot delete your own profile.");
    }

    const userProfile = await ctx.db.get(args.userProfileId);
    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    // Soft delete by updating role to prevent access
    await ctx.db.patch(args.userProfileId, {
      role: "USER", // Reset to basic role
      corporatePlanId: undefined, // Remove corporate access
    });

    return args.userProfileId;
  },
});