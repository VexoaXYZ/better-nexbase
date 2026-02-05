import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import {
	orgDisabledNoop,
	requireCurrentUser,
	requireOrgCapability,
	resolveOrgContext,
} from "./lib/authz";
import { ORG_CAPABILITIES } from "./lib/capabilities";
import { getAppConfig, isOrgEnabled } from "./lib/config";
import { APP_ERROR_CODES, AppError, toPublicError } from "./lib/errors";

function toSlug(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 40);
}

function buildWorkspaceName(user: Doc<"users">): string {
	const trimmedName = user.name?.trim();
	if (trimmedName) return `${trimmedName}'s Workspace`;

	const emailPrefix = user.email.split("@")[0]?.trim();
	if (emailPrefix) {
		return `${emailPrefix.replace(/[._-]+/g, " ")} Workspace`;
	}

	return "Personal Workspace";
}

function buildWorkosOrgPlaceholder(): string {
	return `org_local_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

async function getActiveMembershipsForUser(
	ctx: MutationCtx,
	userId: Id<"users">,
) {
	const memberships = await ctx.db
		.query("organizationMembers")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.collect();

	return memberships
		.filter((membership) => membership.status === "active")
		.sort((a, b) => a.createdAt - b.createdAt);
}

function resolveEffectiveDefaultOrganizationId(
	user: Doc<"users">,
	activeMemberships: Doc<"organizationMembers">[],
): Id<"organizations"> | null {
	if (activeMemberships.length === 0) {
		return null;
	}

	if (
		user.defaultOrganizationId &&
		activeMemberships.some(
			(membership) => membership.organizationId === user.defaultOrganizationId,
		)
	) {
		return user.defaultOrganizationId;
	}

	return activeMemberships[0]?.organizationId ?? null;
}

async function generateUniqueOrganizationSlug(
	ctx: MutationCtx,
	baseSlug: string,
): Promise<string> {
	const normalizedBase = toSlug(baseSlug) || "workspace";

	for (let attempt = 0; attempt < 25; attempt += 1) {
		const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
		const candidate = `${normalizedBase}${suffix}`.slice(0, 40);

		const existing = await ctx.db
			.query("organizations")
			.withIndex("by_slug", (q) => q.eq("slug", candidate))
			.unique();

		if (!existing) {
			return candidate;
		}
	}

	return `workspace-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

async function ensureOrganizationForUser(
	ctx: MutationCtx,
	user: Doc<"users">,
): Promise<{ organizationId: Id<"organizations">; created: boolean }> {
	const activeMemberships = await getActiveMembershipsForUser(ctx, user._id);
	const effectiveDefault = resolveEffectiveDefaultOrganizationId(
		user,
		activeMemberships,
	);

	if (effectiveDefault) {
		if (user.defaultOrganizationId !== effectiveDefault) {
			await ctx.db.patch(user._id, {
				defaultOrganizationId: effectiveDefault,
				updatedAt: Date.now(),
			});
		}

		return { organizationId: effectiveDefault, created: false };
	}

	const now = Date.now();
	const workspaceName = buildWorkspaceName(user);
	const slug = await generateUniqueOrganizationSlug(ctx, workspaceName);

	const orgId = await ctx.db.insert("organizations", {
		workosOrgId: buildWorkosOrgPlaceholder(),
		name: workspaceName,
		slug,
		status: "active",
		createdAt: now,
		updatedAt: now,
		createdBy: user._id,
	});

	await ctx.db.insert("organizationMembers", {
		organizationId: orgId,
		userId: user._id,
		role: "owner",
		status: "active",
		joinedAt: now,
		createdAt: now,
		updatedAt: now,
	});

	await ctx.db.patch(user._id, {
		defaultOrganizationId: orgId,
		updatedAt: now,
	});

	return { organizationId: orgId, created: true };
}

/**
 * Create a new organization
 */
export const create = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
		workosOrgId: v.string(),
		logoUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				return orgDisabledNoop("organizations.create");
			}

			const user = await requireCurrentUser(ctx);

			const existingOrg = await ctx.db
				.query("organizations")
				.withIndex("by_slug", (q) => q.eq("slug", args.slug))
				.unique();

			if (existingOrg) {
				throw new AppError(
					APP_ERROR_CODES.VALIDATION_ERROR,
					"Organization slug already exists",
				);
			}

			const now = Date.now();

			const orgId = await ctx.db.insert("organizations", {
				workosOrgId: args.workosOrgId,
				name: args.name,
				slug: args.slug,
				logoUrl: args.logoUrl,
				status: "active",
				createdAt: now,
				updatedAt: now,
				createdBy: user._id,
			});

			await ctx.db.insert("organizationMembers", {
				organizationId: orgId,
				userId: user._id,
				role: "owner",
				status: "active",
				joinedAt: now,
				createdAt: now,
				updatedAt: now,
			});

			if (!user.defaultOrganizationId) {
				await ctx.db.patch(user._id, {
					defaultOrganizationId: orgId,
					updatedAt: now,
				});
			}

			return orgId;
		} catch (error) {
			toPublicError(error);
		}
	},
});

/**
 * Ensure the current user always has an organization context.
 * Used to auto-provision personal workspaces and heal stale defaults.
 */
export const ensureForCurrentUser = mutation({
	args: {
		forceProvision: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config) && !args.forceProvision) {
				return orgDisabledNoop("organizations.ensureForCurrentUser");
			}

			const user = await requireCurrentUser(ctx);
			return await ensureOrganizationForUser(ctx, user);
		} catch (error) {
			toPublicError(error);
		}
	},
});

/**
 * Get organization by ID (with membership check)
 */
export const get = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				return null;
			}

			const access = await requireOrgCapability(
				ctx,
				ORG_CAPABILITIES.ORG_READ,
				{
					organizationId: args.organizationId,
				},
			);

			const organization = await ctx.db.get(args.organizationId);
			return organization
				? {
						...organization,
						membership: {
							role: access.orgContext.membershipRole,
							status: "active" as const,
						},
					}
				: null;
		} catch (error) {
			if (
				error instanceof AppError &&
				(error.code === APP_ERROR_CODES.UNAUTHORIZED ||
					error.code === APP_ERROR_CODES.ORG_FORBIDDEN ||
					error.code === APP_ERROR_CODES.ORG_NOT_FOUND ||
					error.code === APP_ERROR_CODES.ORG_DISABLED)
			) {
				return null;
			}
			toPublicError(error);
		}
	},
});

/**
 * Get organization by slug
 */
export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				return null;
			}

			const organization = await ctx.db
				.query("organizations")
				.withIndex("by_slug", (q) => q.eq("slug", args.slug))
				.unique();

			if (!organization) {
				return null;
			}

			const access = await requireOrgCapability(
				ctx,
				ORG_CAPABILITIES.ORG_READ,
				{
					organizationId: organization._id,
				},
			);

			return {
				...organization,
				membership: {
					role: access.orgContext.membershipRole,
					status: "active" as const,
				},
			};
		} catch (error) {
			if (
				error instanceof AppError &&
				(error.code === APP_ERROR_CODES.UNAUTHORIZED ||
					error.code === APP_ERROR_CODES.ORG_FORBIDDEN ||
					error.code === APP_ERROR_CODES.ORG_NOT_FOUND ||
					error.code === APP_ERROR_CODES.ORG_DISABLED)
			) {
				return null;
			}
			toPublicError(error);
		}
	},
});

/**
 * Update organization details
 */
export const update = mutation({
	args: {
		organizationId: v.id("organizations"),
		name: v.optional(v.string()),
		slug: v.optional(v.string()),
		logoUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				return orgDisabledNoop("organizations.update");
			}

			await requireOrgCapability(ctx, ORG_CAPABILITIES.ORG_SETTINGS_MANAGE, {
				organizationId: args.organizationId,
			});

			if (args.slug !== undefined) {
				const nextSlug = args.slug;
				const existingOrg = await ctx.db
					.query("organizations")
					.withIndex("by_slug", (q) => q.eq("slug", nextSlug))
					.unique();

				if (existingOrg && existingOrg._id !== args.organizationId) {
					throw new AppError(
						APP_ERROR_CODES.VALIDATION_ERROR,
						"Organization slug already exists",
					);
				}
			}

			const updates: Record<string, unknown> = {
				updatedAt: Date.now(),
			};

			if (args.name !== undefined) updates.name = args.name;
			if (args.slug !== undefined) updates.slug = args.slug;
			if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl;

			await ctx.db.patch(args.organizationId, updates);
			return args.organizationId;
		} catch (error) {
			toPublicError(error);
		}
	},
});

/**
 * List all organizations the current user belongs to
 */
export const listForUser = query({
	args: {},
	handler: async (ctx) => {
		try {
			const user = await requireCurrentUser(ctx);

			const memberships = await ctx.db
				.query("organizationMembers")
				.withIndex("by_user", (q) => q.eq("userId", user._id))
				.collect();

			const activeMemberships = memberships
				.filter((membership) => membership.status === "active")
				.sort((a, b) => a.createdAt - b.createdAt);

			const effectiveDefault = resolveEffectiveDefaultOrganizationId(
				user,
				activeMemberships,
			);

			const organizations = await Promise.all(
				activeMemberships.map(async (membership) => {
					const organization = await ctx.db.get(membership.organizationId);
					return organization
						? {
								...organization,
								membership,
								isDefault: effectiveDefault === organization._id,
							}
						: null;
				}),
			);

			return organizations.filter((organization) => organization !== null);
		} catch (error) {
			if (
				error instanceof AppError &&
				error.code === APP_ERROR_CODES.UNAUTHORIZED
			) {
				return [];
			}
			toPublicError(error);
		}
	},
});

/**
 * Resolve normalized org context used by future code paths.
 */
export const getOrgContext = query({
	args: { organizationId: v.optional(v.id("organizations")) },
	handler: async (ctx, args) => {
		try {
			const access = await resolveOrgContext(ctx, {
				organizationId: args.organizationId,
			});
			return access.orgContext;
		} catch (error) {
			if (
				error instanceof AppError &&
				(error.code === APP_ERROR_CODES.UNAUTHORIZED ||
					error.code === APP_ERROR_CODES.ORG_NOT_FOUND ||
					error.code === APP_ERROR_CODES.ORG_FORBIDDEN)
			) {
				return null;
			}
			toPublicError(error);
		}
	},
});

/**
 * Check if a slug is available
 */
export const checkSlugAvailable = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		const existingOrg = await ctx.db
			.query("organizations")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();

		return !existingOrg;
	},
});

/**
 * Set default organization for user
 */
export const setDefaultOrganization = mutation({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		try {
			const config = await getAppConfig(ctx);
			if (!isOrgEnabled(config)) {
				return orgDisabledNoop("organizations.setDefaultOrganization");
			}

			const access = await requireOrgCapability(
				ctx,
				ORG_CAPABILITIES.ORG_READ,
				{
					organizationId: args.organizationId,
				},
			);

			await ctx.db.patch(access.user._id, {
				defaultOrganizationId: args.organizationId,
				updatedAt: Date.now(),
			});

			return args.organizationId;
		} catch (error) {
			toPublicError(error);
		}
	},
});
