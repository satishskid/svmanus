import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const signUpWithPassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    // This creates a user in Convex's internal _users table.
    // The client will then call createUserProfile to store app-specific data.
    return await ctx.auth.signUp({ email, password });
  },
});


export const signInWithPassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    return await ctx.auth.signIn({ email, password });
  },
});