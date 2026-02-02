import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		// WorkOS user ID
		authId: v.string(),
		// User info
		email: v.string(),
		name: v.optional(v.string()),
		profileImageUrl: v.optional(v.string()),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_authId", ["authId"])
		.index("by_email", ["email"]),
});
