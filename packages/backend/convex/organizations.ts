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

const ORG_NAME_MIN_LENGTH = 2;
const ORG_NAME_MAX_LENGTH = 100;
const ORG_SLUG_MIN_LENGTH = 3;
const ORG_SLUG_MAX_LENGTH = 40;
const ORG_RESERVED_SLUGS = new Set([
	"app",
	"api",
	"auth",
	"callback",
	"create",
	"invite",
	"members",
	"new",
	"onboarding",
	"organization",
	"settings",
]);

function toSlug(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, ORG_SLUG_MAX_LENGTH);
}

function normalizeOrganizationName(value: string): string {
	return value.trim().replace(/\s+/g, " ").slice(0, ORG_NAME_MAX_LENGTH);
}

function validateOrganizationNameOrThrow(name: string) {
	if (name.length < ORG_NAME_MIN_LENGTH) {
		throw new AppError(
			APP_ERROR_CODES.VALIDATION_ERROR,
			`Organization name must be at least ${ORG_NAME_MIN_LENGTH} characters.`,
		);
	}
}

function validateSlugOrThrow(slug: string) {
	if (slug.length < ORG_SLUG_MIN_LENGTH || slug.length > ORG_SLUG_MAX_LENGTH) {
		throw new AppError(
			APP_ERROR_CODES.VALIDATION_ERROR,
			`Organization slug must be ${ORG_SLUG_MIN_LENGTH}-${ORG_SLUG_MAX_LENGTH} characters.`,
		);
	}

	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		throw new AppError(
			APP_ERROR_CODES.VALIDATION_ERROR,
			"Organization slug must contain only lowercase letters, numbers, and hyphens.",
		);
	}

	if (ORG_RESERVED_SLUGS.has(slug)) {
		throw new AppError(
			APP_ERROR_CODES.VALIDATION_ERROR,
			"This organization slug is reserved.",
		);
	}
}

function slugCandidate(baseSlug: string, attempt: number): string {
	if (attempt === 0) {
		return baseSlug;
	}

	const suffix = `-${attempt + 1}`;
	const prefixMax = Math.max(1, ORG_SLUG_MAX_LENGTH - suffix.length);
	return `${baseSlug.slice(0, prefixMax)}${suffix}`;
}

function normalizeOrCreateWorkosOrgId(value?: string): string {
	const normalized = value?.trim();
	return normalized ? normalized : buildWorkosOrgPlaceholder();
}

function buildWorkspaceName(user: Doc<"users">): string {
	const trimmedName = user.name?.trim();
	if (trimmedName) {
		// Use first name only to keep it short (e.g. "Tyrese's Workspace")
		const firstName = trimmedName.split(/\s+/)[0];
		return `${firstName}'s Workspace`;
	}

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
	organizationIds: Id<"organizations">[],
): Id<"organizations"> | null {
	if (organizationIds.length === 0) {
		return null;
	}

	if (
		user.defaultOrganizationId &&
		organizationIds.includes(user.defaultOrganizationId)
	) {
		return user.defaultOrganizationId;
	}

	return organizationIds[0] ?? null;
}

async function generateUniqueOrganizationSlug(
	ctx: MutationCtx,
	baseSlug: string,
	options?: {
		excludeOrganizationId?: Id<"organizations">;
	},
): Promise<string> {
	const normalizedBase = toSlug(baseSlug) || "workspace";
	validateSlugOrThrow(normalizedBase);

	for (let attempt = 0; attempt < 50; attempt += 1) {
		const candidate = slugCandidate(normalizedBase, attempt);

		const existing = await ctx.db
			.query("organizations")
			.withIndex("by_slug", (q) => q.eq("slug", candidate))
			.unique();

		if (!existing || existing._id === options?.excludeOrganizationId) {
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
	const activeOrgIds: Id<"organizations">[] = [];
	for (const membership of activeMemberships) {
		const organization = await ctx.db.get(membership.organizationId);
		if (organization) {
			activeOrgIds.push(membership.organizationId);
		}
	}

	const effectiveDefault = resolveEffectiveDefaultOrganizationId(
		user,
		activeOrgIds,
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
	const workspaceName = normalizeOrganizationName(buildWorkspaceName(user));
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
			const name = normalizeOrganizationName(args.name);
			validateOrganizationNameOrThrow(name);

			const requestedSlug = toSlug(args.slug);
			validateSlugOrThrow(requestedSlug);

			const now = Date.now();
			const slug = await generateUniqueOrganizationSlug(ctx, requestedSlug);
			const workosOrgId = normalizeOrCreateWorkosOrgId(args.workosOrgId);

			const orgId = await ctx.db.insert("organizations", {
				workosOrgId,
				name,
				slug,
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

			const activeMemberships = await getActiveMembershipsForUser(
				ctx,
				user._id,
			);
			const activeOrgIds: Id<"organizations">[] = [];
			for (const membership of activeMemberships) {
				const organization = await ctx.db.get(membership.organizationId);
				if (organization) {
					activeOrgIds.push(organization._id);
				}
			}
			const effectiveDefault = resolveEffectiveDefaultOrganizationId(
				user,
				activeOrgIds,
			);

			const nextDefault = effectiveDefault ?? orgId;
			if (user.defaultOrganizationId !== nextDefault) {
				await ctx.db.patch(user._id, {
					defaultOrganizationId: nextDefault,
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

			const normalizedSlug = toSlug(args.slug);
			try {
				validateSlugOrThrow(normalizedSlug);
			} catch {
				return null;
			}

			const organization = await ctx.db
				.query("organizations")
				.withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
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
				const nextSlug = toSlug(args.slug);
				validateSlugOrThrow(nextSlug);
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

			if (args.name !== undefined) {
				const nextName = normalizeOrganizationName(args.name);
				validateOrganizationNameOrThrow(nextName);
				updates.name = nextName;
			}
			if (args.slug !== undefined) updates.slug = toSlug(args.slug);
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

			const organizations = await Promise.all(
				activeMemberships.map(async (membership) => {
					const organization = await ctx.db.get(membership.organizationId);
					return organization
						? {
								...organization,
								membership,
							}
						: null;
				}),
			);

			const visibleOrganizations = organizations.filter(
				(
					organization,
				): organization is NonNullable<(typeof organizations)[number]> =>
					organization !== null,
			);
			const effectiveDefault = resolveEffectiveDefaultOrganizationId(
				user,
				visibleOrganizations.map((organization) => organization._id),
			);

			return visibleOrganizations.map((organization) => ({
				...organization,
				isDefault: organization._id === effectiveDefault,
			}));
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
		const normalizedSlug = toSlug(args.slug);
		try {
			validateSlugOrThrow(normalizedSlug);
		} catch {
			return false;
		}

		const existingOrg = await ctx.db
			.query("organizations")
			.withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
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
