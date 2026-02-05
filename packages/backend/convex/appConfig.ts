import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireGlobalConfigOwner } from "./lib/authz";
import {
	type AppConfigOverlay,
	applyConfigOverlay,
	getAppConfig,
	upsertAppConfig,
} from "./lib/config";
import { toPublicError } from "./lib/errors";

const orgFeaturesPatchValidator = v.object({
	rbacStrict: v.optional(v.boolean()),
	billingEnforcement: v.optional(v.boolean()),
	inviteEmails: v.optional(v.boolean()),
	hardLocking: v.optional(v.boolean()),
	workosMirrorWrites: v.optional(v.boolean()),
});

const appConfigPatchArgsValidator = {
	org: v.optional(
		v.object({
			enabled: v.optional(v.boolean()),
			features: v.optional(orgFeaturesPatchValidator),
		}),
	),
};

/**
 * Read effective app configuration (env defaults + DB overrides).
 */
export const get = query({
	args: {},
	handler: async (ctx) => {
		return getAppConfig(ctx);
	},
});

/**
 * Owner-safe config update.
 */
export const update = mutation({
	args: appConfigPatchArgsValidator,
	handler: async (ctx, args) => {
		try {
			const owner = await requireGlobalConfigOwner(ctx);
			const current = await getAppConfig(ctx);

			const overlay: AppConfigOverlay = {
				org: args.org
					? {
							enabled: args.org.enabled,
							features: args.org.features
								? {
										rbacStrict: args.org.features.rbacStrict,
										billingEnforcement: args.org.features.billingEnforcement,
										inviteEmails: args.org.features.inviteEmails,
										hardLocking: args.org.features.hardLocking,
										workosMirrorWrites: args.org.features.workosMirrorWrites,
									}
								: undefined,
						}
					: undefined,
			};

			const next = applyConfigOverlay(current, overlay);
			await upsertAppConfig(ctx, next, owner._id);
			return next;
		} catch (error) {
			toPublicError(error);
		}
	},
});

/**
 * Convenience mutation to toggle global org mode.
 */
export const setOrgEnabled = mutation({
	args: {
		enabled: v.boolean(),
	},
	handler: async (ctx, args) => {
		try {
			const owner = await requireGlobalConfigOwner(ctx);
			const current = await getAppConfig(ctx);
			const next = applyConfigOverlay(current, {
				org: {
					enabled: args.enabled,
				},
			});

			await upsertAppConfig(ctx, next, owner._id);
			return next;
		} catch (error) {
			toPublicError(error);
		}
	},
});

/**
 * Internal config update for trusted workflows.
 */
export const updateInternal = internalMutation({
	args: appConfigPatchArgsValidator,
	handler: async (ctx, args) => {
		const current = await getAppConfig(ctx);
		const overlay: AppConfigOverlay = {
			org: args.org
				? {
						enabled: args.org.enabled,
						features: args.org.features
							? {
									rbacStrict: args.org.features.rbacStrict,
									billingEnforcement: args.org.features.billingEnforcement,
									inviteEmails: args.org.features.inviteEmails,
									hardLocking: args.org.features.hardLocking,
									workosMirrorWrites: args.org.features.workosMirrorWrites,
								}
							: undefined,
					}
				: undefined,
		};

		const next = applyConfigOverlay(current, overlay);
		await upsertAppConfig(ctx, next);
		return next;
	},
});
