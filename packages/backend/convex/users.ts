import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authKit } from "./auth";

/**
 * Get the currently authenticated user
 */
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		// Find user by authId (WorkOS user ID)
		const user = await ctx.db
			.query("users")
			.withIndex("by_authId", (q) => q.eq("authId", identity.subject))
			.unique();

		return user;
	},
});

/**
 * Get WorkOS auth user data directly
 */
export const getAuthUser = query({
	args: {},
	handler: async (ctx) => {
		return await authKit.getAuthUser(ctx);
	},
});

/**
 * Create or update user from WorkOS identity
 * Called when user signs in for the first time or updates their profile
 */
export const upsertUser = mutation({
	args: {
		authId: v.string(),
		email: v.string(),
		name: v.optional(v.string()),
		profileImageUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity || identity.subject !== args.authId) {
			throw new Error("Unauthorized");
		}

		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_authId", (q) => q.eq("authId", args.authId))
			.unique();

		const now = Date.now();

		if (existingUser) {
			await ctx.db.patch(existingUser._id, {
				email: args.email,
				name: args.name,
				profileImageUrl: args.profileImageUrl,
				updatedAt: now,
			});
			return existingUser._id;
		}

		return await ctx.db.insert("users", {
			authId: args.authId,
			email: args.email,
			name: args.name,
			profileImageUrl: args.profileImageUrl,
			createdAt: now,
			updatedAt: now,
		});
	},
});
