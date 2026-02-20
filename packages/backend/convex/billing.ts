import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type ActionCtx, action } from "./_generated/server";
import { autumn } from "./autumn";

/**
 * Assert the caller is an active org owner (billing manager).
 */
async function assertBillingManager(
	ctx: ActionCtx,
	organizationId: Id<"organizations">,
) {
	const { api } = await import("./_generated/api");
	const org = await ctx.runQuery(api.organizations.get, {
		organizationId,
	});

	if (!org || !org.membership || org.membership.status !== "active") {
		throw new Error("Organization not found or access denied.");
	}

	if (org.membership.role !== "owner") {
		throw new Error("Only organization owners can manage billing.");
	}

	return org;
}

/**
 * Check if an organization has access to a feature/product via Autumn.
 */
export const checkFeature = action({
	args: {
		organizationId: v.id("organizations"),
		featureId: v.optional(v.string()),
		productId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await assertBillingManager(ctx, args.organizationId);

		const { data, error } = await autumn.check(ctx, {
			featureId: args.featureId,
			productId: args.productId,
		});

		if (error) {
			throw new Error(`Billing check failed: ${error.message}`);
		}

		return data;
	},
});

/**
 * Track usage of a metered feature for an organization via Autumn.
 */
export const trackUsage = action({
	args: {
		organizationId: v.id("organizations"),
		featureId: v.string(),
		value: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await assertBillingManager(ctx, args.organizationId);

		const { data, error } = await autumn.track(ctx, {
			featureId: args.featureId,
			value: args.value,
		});

		if (error) {
			throw new Error(`Usage tracking failed: ${error.message}`);
		}

		return data;
	},
});
