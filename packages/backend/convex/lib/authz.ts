import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { MembershipRole, OrgCapability } from "./capabilities";
import { getCapabilitiesForRole, hasCapability } from "./capabilities";
import {
	type AppConfig,
	getAppConfig,
	isFeatureEnabled,
	isOrgEnabled,
} from "./config";
import { APP_ERROR_CODES, AppError } from "./errors";

type AuthzCtx = Pick<QueryCtx | MutationCtx, "auth" | "db">;

export type OrgContextOrganizationId =
	| Id<"organizations">
	| "__default__"
	| null;

export interface OrgContext {
	organizationId: OrgContextOrganizationId;
	membershipRole: MembershipRole;
	orgStatus: "active" | "disabled";
	capabilities: readonly OrgCapability[];
	entitlements: {
		planKey: string;
		features: Record<string, boolean>;
		limits: Record<string, number | null>;
	};
	source: "real" | "shim";
}

export interface OrgAccessContext {
	user: Doc<"users">;
	orgContext: OrgContext;
	config: AppConfig;
}

export interface OrgDisabledNoopResult {
	applied: false;
	reason: "org_disabled";
	operation: string;
}

const defaultEntitlements = {
	planKey: "free",
	features: {},
	limits: {},
};

function createShimContext(): OrgContext {
	return {
		organizationId: "__default__",
		membershipRole: "owner",
		orgStatus: "disabled",
		capabilities: getCapabilitiesForRole("owner"),
		entitlements: defaultEntitlements,
		source: "shim",
	};
}

async function getAuthenticatedUser(
	ctx: AuthzCtx,
): Promise<Doc<"users"> | null> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return null;
	}

	const user = await ctx.db
		.query("users")
		.withIndex("by_authId", (q) => q.eq("authId", identity.subject))
		.unique();

	return user;
}

async function resolveDefaultOrganizationId(
	ctx: AuthzCtx,
	user: Doc<"users">,
): Promise<Id<"organizations"> | null> {
	if (user.defaultOrganizationId) {
		const defaultOrganizationId = user.defaultOrganizationId;
		const defaultMembership = await ctx.db
			.query("organizationMembers")
			.withIndex("by_org_and_user", (q) =>
				q.eq("organizationId", defaultOrganizationId).eq("userId", user._id),
			)
			.unique();

		if (defaultMembership?.status === "active") {
			const organization = await ctx.db.get(defaultOrganizationId);
			if (organization) {
				return defaultOrganizationId;
			}
		}
	}

	const memberships = await ctx.db
		.query("organizationMembers")
		.withIndex("by_user", (q) => q.eq("userId", user._id))
		.collect();

	const activeMemberships = memberships
		.filter((membership) => membership.status === "active")
		.sort((a, b) => a.createdAt - b.createdAt);

	for (const membership of activeMemberships) {
		const organization = await ctx.db.get(membership.organizationId);
		if (organization) {
			return membership.organizationId;
		}
	}

	return null;
}

export async function requireCurrentUser(ctx: AuthzCtx): Promise<Doc<"users">> {
	const user = await getAuthenticatedUser(ctx);
	if (!user) {
		throw new AppError(
			APP_ERROR_CODES.UNAUTHORIZED,
			"Authentication is required.",
		);
	}
	return user;
}

export async function resolveOrgContext(
	ctx: AuthzCtx,
	options?: {
		organizationId?: Id<"organizations">;
	},
): Promise<OrgAccessContext> {
	const config = await getAppConfig(ctx);
	const user = await requireCurrentUser(ctx);

	if (!isOrgEnabled(config)) {
		return {
			user,
			orgContext: createShimContext(),
			config,
		};
	}

	const organizationId =
		options?.organizationId ?? (await resolveDefaultOrganizationId(ctx, user));

	if (!organizationId) {
		throw new AppError(
			APP_ERROR_CODES.ORG_NOT_FOUND,
			"No organization context is available for this user.",
		);
	}

	const membership = await ctx.db
		.query("organizationMembers")
		.withIndex("by_org_and_user", (q) =>
			q.eq("organizationId", organizationId).eq("userId", user._id),
		)
		.unique();

	if (!membership || membership.status !== "active") {
		throw new AppError(
			APP_ERROR_CODES.ORG_FORBIDDEN,
			"You do not have access to this organization.",
		);
	}

	const organization = await ctx.db.get(organizationId);
	if (!organization) {
		throw new AppError(
			APP_ERROR_CODES.ORG_NOT_FOUND,
			"Organization not found.",
		);
	}

	const role = membership.role;
	const orgStatus = organization.status ?? "active";

	const orgContext: OrgContext = {
		organizationId,
		membershipRole: role,
		orgStatus,
		capabilities: getCapabilitiesForRole(role),
		entitlements: defaultEntitlements,
		source: "real",
	};

	return {
		user,
		orgContext,
		config,
	};
}

export async function requireOrgCapability(
	ctx: AuthzCtx,
	capability: OrgCapability,
	options?: {
		organizationId?: Id<"organizations">;
	},
): Promise<OrgAccessContext> {
	const access = await resolveOrgContext(ctx, options);

	if (access.orgContext.source === "shim") {
		throw new AppError(
			APP_ERROR_CODES.ORG_DISABLED,
			"Organization features are disabled by runtime configuration.",
		);
	}

	if (
		access.orgContext.orgStatus === "disabled" &&
		capability !== "org:billing.manage"
	) {
		throw new AppError(
			APP_ERROR_CODES.ORG_DISABLED,
			"This organization is currently disabled.",
		);
	}

	const shouldEnforceRbac = isFeatureEnabled(access.config, "rbacStrict");
	if (
		shouldEnforceRbac &&
		!hasCapability(access.orgContext.membershipRole, capability)
	) {
		throw new AppError(
			APP_ERROR_CODES.ORG_FORBIDDEN,
			`Missing capability: ${capability}`,
		);
	}

	return access;
}

export async function requireGlobalConfigOwner(
	ctx: AuthzCtx,
): Promise<Doc<"users">> {
	const user = await requireCurrentUser(ctx);

	const memberships = await ctx.db
		.query("organizationMembers")
		.withIndex("by_user", (q) => q.eq("userId", user._id))
		.collect();

	const isOwner = memberships.some((membership) => {
		return membership.status === "active" && membership.role === "owner";
	});

	if (!isOwner) {
		throw new AppError(
			APP_ERROR_CODES.ORG_CONFIG_FORBIDDEN,
			"Only organization owners can modify app configuration.",
		);
	}

	return user;
}

export function orgDisabledNoop(operation: string): OrgDisabledNoopResult {
	return {
		applied: false,
		reason: "org_disabled",
		operation,
	};
}
