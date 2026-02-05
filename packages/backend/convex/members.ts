import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser, requireOrgCapability } from "./lib/authz";
import { ORG_CAPABILITIES } from "./lib/capabilities";
import { getAppConfig, isFeatureEnabled, isOrgEnabled } from "./lib/config";
import { sendOrganizationInviteEmail } from "./lib/email";
import { APP_ERROR_CODES, AppError, toPublicError } from "./lib/errors";

/**
 * List members of an organization
 */
export const list = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				return [];
			}

			await requireOrgCapability(ctx, ORG_CAPABILITIES.ORG_READ, {
				organizationId: args.organizationId,
			});

			const memberships = await ctx.db
				.query("organizationMembers")
				.withIndex("by_organization", (q) =>
					q.eq("organizationId", args.organizationId),
				)
				.collect();

			const members = await Promise.all(
				memberships.map(async (membership) => {
					const user = await ctx.db.get(membership.userId);
					if (!user) {
						return null;
					}

					return {
						...membership,
						user: {
							id: user._id,
							email: user.email,
							name: user.name,
							profileImageUrl: user.profileImageUrl,
						},
					};
				}),
			);

			return members.filter((member) => member !== null);
		} catch (error) {
			if (
				error instanceof AppError &&
				(error.code === APP_ERROR_CODES.UNAUTHORIZED ||
					error.code === APP_ERROR_CODES.ORG_FORBIDDEN ||
					error.code === APP_ERROR_CODES.ORG_DISABLED ||
					error.code === APP_ERROR_CODES.ORG_NOT_FOUND)
			) {
				return [];
			}
			toPublicError(error);
		}
	},
});

/**
 * Get current user's membership in an organization
 */
export const getMembership = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				return null;
			}

			const user = await requireCurrentUser(ctx);
			return await ctx.db
				.query("organizationMembers")
				.withIndex("by_org_and_user", (q) =>
					q.eq("organizationId", args.organizationId).eq("userId", user._id),
				)
				.unique();
		} catch (error) {
			if (
				error instanceof AppError &&
				error.code === APP_ERROR_CODES.UNAUTHORIZED
			) {
				return null;
			}
			toPublicError(error);
		}
	},
});

/**
 * Update a member's role (admin+ only)
 */
export const updateRole = mutation({
	args: {
		memberId: v.id("organizationMembers"),
		role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
	},
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				throw new AppError(
					APP_ERROR_CODES.ORG_DISABLED,
					"Member role management is unavailable while org mode is disabled.",
				);
			}

			const user = await requireCurrentUser(ctx);
			const targetMembership = await ctx.db.get(args.memberId);
			if (!targetMembership) {
				throw new AppError(
					APP_ERROR_CODES.VALIDATION_ERROR,
					"Membership not found",
				);
			}

			const currentMembership = await ctx.db
				.query("organizationMembers")
				.withIndex("by_org_and_user", (q) =>
					q
						.eq("organizationId", targetMembership.organizationId)
						.eq("userId", user._id),
				)
				.unique();

			if (
				!currentMembership ||
				currentMembership.status !== "active" ||
				!["owner", "admin"].includes(currentMembership.role)
			) {
				throw new AppError(
					APP_ERROR_CODES.ORG_FORBIDDEN,
					"Admin access required",
				);
			}

			await requireOrgCapability(ctx, ORG_CAPABILITIES.ORG_MEMBERS_MANAGE, {
				organizationId: targetMembership.organizationId,
			});

			if (
				targetMembership.role === "owner" &&
				currentMembership.role !== "owner"
			) {
				throw new AppError(
					APP_ERROR_CODES.ORG_FORBIDDEN,
					"Only owners can modify owner roles",
				);
			}

			if (
				targetMembership.userId === user._id &&
				targetMembership.role === "owner" &&
				args.role !== "owner"
			) {
				const owners = await ctx.db
					.query("organizationMembers")
					.withIndex("by_organization", (q) =>
						q.eq("organizationId", targetMembership.organizationId),
					)
					.filter((q) =>
						q.and(
							q.eq(q.field("role"), "owner"),
							q.eq(q.field("status"), "active"),
						),
					)
					.collect();

				if (owners.length <= 1) {
					throw new AppError(
						APP_ERROR_CODES.VALIDATION_ERROR,
						"Cannot demote the only owner",
					);
				}
			}

			await ctx.db.patch(args.memberId, {
				role: args.role,
				updatedAt: Date.now(),
			});

			return args.memberId;
		} catch (error) {
			toPublicError(error);
		}
	},
});

/**
 * Remove a member from the organization
 */
export const remove = mutation({
	args: { memberId: v.id("organizationMembers") },
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				throw new AppError(
					APP_ERROR_CODES.ORG_DISABLED,
					"Member removal is unavailable while org mode is disabled.",
				);
			}

			const user = await requireCurrentUser(ctx);
			const targetMembership = await ctx.db.get(args.memberId);
			if (!targetMembership) {
				throw new AppError(
					APP_ERROR_CODES.VALIDATION_ERROR,
					"Membership not found",
				);
			}

			const currentMembership = await ctx.db
				.query("organizationMembers")
				.withIndex("by_org_and_user", (q) =>
					q
						.eq("organizationId", targetMembership.organizationId)
						.eq("userId", user._id),
				)
				.unique();

			const isSelf = targetMembership.userId === user._id;
			const isAdmin =
				currentMembership &&
				currentMembership.status === "active" &&
				["owner", "admin"].includes(currentMembership.role);

			if (!isSelf && !isAdmin) {
				throw new AppError(APP_ERROR_CODES.ORG_FORBIDDEN, "Unauthorized");
			}

			if (!isSelf) {
				await requireOrgCapability(ctx, ORG_CAPABILITIES.ORG_MEMBERS_MANAGE, {
					organizationId: targetMembership.organizationId,
				});
			}

			if (targetMembership.role === "owner") {
				const owners = await ctx.db
					.query("organizationMembers")
					.withIndex("by_organization", (q) =>
						q.eq("organizationId", targetMembership.organizationId),
					)
					.filter((q) =>
						q.and(
							q.eq(q.field("role"), "owner"),
							q.eq(q.field("status"), "active"),
						),
					)
					.collect();

				if (owners.length <= 1) {
					throw new AppError(
						APP_ERROR_CODES.VALIDATION_ERROR,
						"Cannot remove the only owner",
					);
				}
			}

			await ctx.db.patch(args.memberId, {
				status: "inactive",
				updatedAt: Date.now(),
			});

			const memberUser = await ctx.db.get(targetMembership.userId);
			if (
				memberUser?.defaultOrganizationId === targetMembership.organizationId
			) {
				const fallbackMemberships = await ctx.db
					.query("organizationMembers")
					.withIndex("by_user", (q) => q.eq("userId", targetMembership.userId))
					.collect();

				const activeFallbackMemberships = fallbackMemberships
					.filter((membership) => membership.status === "active")
					.sort((a, b) => a.createdAt - b.createdAt);

				let replacementDefault: Id<"organizations"> | undefined;
				for (const membership of activeFallbackMemberships) {
					const organization = await ctx.db.get(membership.organizationId);
					if (organization) {
						replacementDefault = organization._id;
						break;
					}
				}

				await ctx.db.patch(targetMembership.userId, {
					defaultOrganizationId: replacementDefault,
					updatedAt: Date.now(),
				});
			}

			return args.memberId;
		} catch (error) {
			toPublicError(error);
		}
	},
});

/**
 * Create an invitation
 */
export const invite = mutation({
	args: {
		organizationId: v.id("organizations"),
		email: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
	},
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				throw new AppError(
					APP_ERROR_CODES.ORG_DISABLED,
					"Invitations are unavailable while org mode is disabled.",
				);
			}

			await requireOrgCapability(ctx, ORG_CAPABILITIES.ORG_MEMBERS_MANAGE, {
				organizationId: args.organizationId,
			});

			const inviter = await requireCurrentUser(ctx);

			const existingUser = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", args.email))
				.unique();

			if (existingUser) {
				const existingMembership = await ctx.db
					.query("organizationMembers")
					.withIndex("by_org_and_user", (q) =>
						q
							.eq("organizationId", args.organizationId)
							.eq("userId", existingUser._id),
					)
					.unique();

				if (existingMembership && existingMembership.status === "active") {
					throw new AppError(
						APP_ERROR_CODES.VALIDATION_ERROR,
						"User is already a member",
					);
				}
			}

			const existingInvitation = await ctx.db
				.query("organizationInvitations")
				.withIndex("by_email", (q) => q.eq("email", args.email))
				.filter((q) =>
					q.and(
						q.eq(q.field("organizationId"), args.organizationId),
						q.eq(q.field("status"), "pending"),
					),
				)
				.first();

			if (existingInvitation) {
				throw new AppError(
					APP_ERROR_CODES.VALIDATION_ERROR,
					"Invitation already sent to this email",
				);
			}

			const token = crypto.randomUUID();
			const now = Date.now();
			const expiresAt = now + 7 * 24 * 60 * 60 * 1000;

			const invitationId = await ctx.db.insert("organizationInvitations", {
				organizationId: args.organizationId,
				email: args.email,
				role: args.role,
				invitedBy: inviter._id,
				token,
				expiresAt,
				status: "pending",
				createdAt: now,
			});

			let emailSent = false;
			if (isFeatureEnabled(config, "inviteEmails")) {
				const organization = await ctx.db.get(args.organizationId);
				if (organization) {
					const baseUrl =
						process.env.SITE_URL?.trim() ||
						process.env.CONVEX_SITE_URL?.trim() ||
						"http://localhost:3001";
					const inviteLink = `${baseUrl.replace(/\/$/, "")}/invite/${token}`;
					const emailResult = await sendOrganizationInviteEmail(ctx, {
						toEmail: args.email,
						organizationName: organization.name,
						inviteLink,
						inviterName: inviter.name || inviter.email,
					});
					emailSent = emailResult.sent;
				}
			}

			return { invitationId, token, emailSent };
		} catch (error) {
			toPublicError(error);
		}
	},
});

/**
 * Accept an invitation by token
 */
export const acceptInvite = mutation({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				throw new AppError(
					APP_ERROR_CODES.ORG_DISABLED,
					"Invitations are unavailable while org mode is disabled.",
				);
			}

			const user = await requireCurrentUser(ctx);

			const invitation = await ctx.db
				.query("organizationInvitations")
				.withIndex("by_token", (q) => q.eq("token", args.token))
				.unique();

			if (!invitation) {
				throw new AppError(
					APP_ERROR_CODES.VALIDATION_ERROR,
					"Invitation not found",
				);
			}

			if (invitation.status !== "pending") {
				throw new AppError(
					APP_ERROR_CODES.VALIDATION_ERROR,
					"Invitation is no longer valid",
				);
			}

			if (invitation.expiresAt < Date.now()) {
				await ctx.db.patch(invitation._id, { status: "expired" });
				throw new AppError(
					APP_ERROR_CODES.VALIDATION_ERROR,
					"Invitation has expired",
				);
			}

			if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
				throw new AppError(
					APP_ERROR_CODES.VALIDATION_ERROR,
					"Invitation is for a different email address",
				);
			}

			const now = Date.now();

			const existingMembership = await ctx.db
				.query("organizationMembers")
				.withIndex("by_org_and_user", (q) =>
					q
						.eq("organizationId", invitation.organizationId)
						.eq("userId", user._id),
				)
				.unique();

			if (existingMembership) {
				if (existingMembership.status === "inactive") {
					await ctx.db.patch(existingMembership._id, {
						status: "active",
						role: invitation.role,
						joinedAt: now,
						updatedAt: now,
					});
				}
			} else {
				await ctx.db.insert("organizationMembers", {
					organizationId: invitation.organizationId,
					userId: user._id,
					role: invitation.role,
					status: "active",
					joinedAt: now,
					createdAt: now,
					updatedAt: now,
				});
			}

			await ctx.db.patch(invitation._id, { status: "accepted" });

			let hasValidDefault = false;
			if (user.defaultOrganizationId) {
				const defaultOrganizationId = user.defaultOrganizationId;
				const defaultMembership = await ctx.db
					.query("organizationMembers")
					.withIndex("by_org_and_user", (q) =>
						q
							.eq("organizationId", defaultOrganizationId)
							.eq("userId", user._id),
					)
					.unique();
				const defaultOrganization = await ctx.db.get(defaultOrganizationId);
				hasValidDefault =
					defaultMembership?.status === "active" &&
					defaultOrganization !== null;
			}

			if (!hasValidDefault) {
				await ctx.db.patch(user._id, {
					defaultOrganizationId: invitation.organizationId,
					updatedAt: now,
				});
			}

			return invitation.organizationId;
		} catch (error) {
			toPublicError(error);
		}
	},
});

/**
 * List pending invitations for an organization
 */
export const listInvitations = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				return [];
			}

			await requireOrgCapability(ctx, ORG_CAPABILITIES.ORG_MEMBERS_MANAGE, {
				organizationId: args.organizationId,
			});

			const invitations = await ctx.db
				.query("organizationInvitations")
				.withIndex("by_organization", (q) =>
					q.eq("organizationId", args.organizationId),
				)
				.filter((q) => q.eq(q.field("status"), "pending"))
				.collect();

			return await Promise.all(
				invitations.map(async (invitation) => {
					const inviter = await ctx.db.get(invitation.invitedBy);
					return {
						...invitation,
						invitedByUser: inviter
							? {
									name: inviter.name,
									email: inviter.email,
								}
							: null,
					};
				}),
			);
		} catch (error) {
			if (
				error instanceof AppError &&
				(error.code === APP_ERROR_CODES.UNAUTHORIZED ||
					error.code === APP_ERROR_CODES.ORG_FORBIDDEN ||
					error.code === APP_ERROR_CODES.ORG_DISABLED)
			) {
				return [];
			}
			toPublicError(error);
		}
	},
});

/**
 * Cancel a pending invitation
 */
export const cancelInvitation = mutation({
	args: { invitationId: v.id("organizationInvitations") },
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				throw new AppError(
					APP_ERROR_CODES.ORG_DISABLED,
					"Invitation management is unavailable while org mode is disabled.",
				);
			}

			const invitation = await ctx.db.get(args.invitationId);
			if (!invitation) {
				throw new AppError(
					APP_ERROR_CODES.VALIDATION_ERROR,
					"Invitation not found",
				);
			}

			await requireOrgCapability(ctx, ORG_CAPABILITIES.ORG_MEMBERS_MANAGE, {
				organizationId: invitation.organizationId,
			});

			await ctx.db.delete(args.invitationId);
			return args.invitationId;
		} catch (error) {
			toPublicError(error);
		}
	},
});
