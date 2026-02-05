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
		// Default organization for user
		defaultOrganizationId: v.optional(v.id("organizations")),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_authId", ["authId"])
		.index("by_email", ["email"]),

	// Organizations table
	organizations: defineTable({
		workosOrgId: v.string(),
		name: v.string(),
		slug: v.string(),
		logoUrl: v.optional(v.string()),
		status: v.optional(v.union(v.literal("active"), v.literal("disabled"))),
		createdAt: v.number(),
		updatedAt: v.number(),
		createdBy: v.id("users"),
	})
		.index("by_workosOrgId", ["workosOrgId"])
		.index("by_slug", ["slug"]),

	// Application-level runtime config (singleton document with key="default")
	appConfigs: defineTable({
		key: v.string(),
		configVersion: v.number(),
		org: v.object({
			enabled: v.boolean(),
			features: v.object({
				rbacStrict: v.boolean(),
				billingEnforcement: v.boolean(),
				inviteEmails: v.boolean(),
				hardLocking: v.boolean(),
				workosMirrorWrites: v.boolean(),
			}),
		}),
		updatedAt: v.number(),
		updatedBy: v.optional(v.id("users")),
	}).index("by_key", ["key"]),

	// Organization memberships
	organizationMembers: defineTable({
		organizationId: v.id("organizations"),
		userId: v.id("users"),
		role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
		status: v.union(
			v.literal("pending"),
			v.literal("active"),
			v.literal("inactive"),
		),
		joinedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_organization", ["organizationId"])
		.index("by_user", ["userId"])
		.index("by_org_and_user", ["organizationId", "userId"]),

	// Organization invitations
	organizationInvitations: defineTable({
		organizationId: v.id("organizations"),
		email: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")), // Can't invite as owner
		invitedBy: v.id("users"),
		token: v.string(),
		expiresAt: v.number(),
		status: v.union(
			v.literal("pending"),
			v.literal("accepted"),
			v.literal("expired"),
		),
		createdAt: v.number(),
	})
		.index("by_organization", ["organizationId"])
		.index("by_token", ["token"])
		.index("by_email", ["email"]),
});
