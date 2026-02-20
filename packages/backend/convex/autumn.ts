import { Autumn } from "@useautumn/convex";
import { api, components } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";

export const autumn = new Autumn(components.autumn, {
	secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
	identify: async (ctx: ActionCtx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		// Look up the user's default org for org-scoped billing
		const user = await ctx.runQuery(api.users.getCurrentUser, {});

		const email = identity.email || undefined;
		const name = identity.name || undefined;

		if (user?.defaultOrganizationId) {
			const org = await ctx.runQuery(api.organizations.get, {
				organizationId: user.defaultOrganizationId,
			});
			if (org) {
				return {
					customerId: `org_${user.defaultOrganizationId}`,
					customerData: {
						name: org.name,
						email,
					},
				};
			}
		}

		// Fallback to user-level billing
		return {
			customerId: identity.subject,
			customerData: {
				name,
				email,
			},
		};
	},
});

/**
 * These exports are required for Autumn's react hooks and components.
 * They generate Convex actions that AutumnProvider calls from the frontend.
 */
export const {
	track,
	cancel,
	query,
	attach,
	check,
	checkout,
	usage,
	setupPayment,
	createCustomer,
	listProducts,
	billingPortal,
	createReferralCode,
	redeemReferralCode,
	createEntity,
	getEntity,
} = autumn.api();
