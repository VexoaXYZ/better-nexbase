import { StripeSubscriptions } from "@convex-dev/stripe";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { type ActionCtx, action, query } from "./_generated/server";
import { requireOrgCapability } from "./lib/authz";
import { ORG_CAPABILITIES } from "./lib/capabilities";

const stripeComponent: any = (components as any).stripe;
const stripeClient = new StripeSubscriptions(stripeComponent, {});

function getAppBaseUrl(): string {
	return (
		process.env.SITE_URL?.trim() ||
		process.env.CONVEX_SITE_URL?.trim() ||
		"http://localhost:3001"
	).replace(/\/$/, "");
}

async function assertBillingManager(
	ctx: ActionCtx,
	organizationId: Id<"organizations">,
) {
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

async function getOrCreateOrgCustomerId(
	ctx: ActionCtx,
	orgId: string,
	orgName: string,
): Promise<string> {
	const existingSubscription = await ctx.runQuery(
		stripeComponent.public.getSubscriptionByOrgId,
		{ orgId },
	);
	if (existingSubscription?.stripeCustomerId) {
		return existingSubscription.stripeCustomerId;
	}

	const payments = await ctx.runQuery(
		stripeComponent.public.listPaymentsByOrgId,
		{
			orgId,
		},
	);
	const paymentCustomerId = (payments || []).find(
		(payment: any) => typeof payment?.stripeCustomerId === "string",
	)?.stripeCustomerId;
	if (paymentCustomerId) {
		return paymentCustomerId;
	}

	const createdCustomer = await stripeClient.createCustomer(ctx, {
		name: orgName,
		metadata: { orgId },
		idempotencyKey: `org_${orgId}`,
	});
	return createdCustomer.customerId;
}

/**
 * Create a Stripe Checkout session for an organization's subscription.
 */
export const createSubscriptionCheckout = action({
	args: {
		organizationId: v.id("organizations"),
		priceId: v.string(),
		quantity: v.optional(v.number()),
		successUrl: v.optional(v.string()),
		cancelUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const organization = await assertBillingManager(ctx, args.organizationId);
		const orgId = String(args.organizationId);
		const customerId = await getOrCreateOrgCustomerId(
			ctx,
			orgId,
			organization.name,
		);

		const baseUrl = getAppBaseUrl();
		const successUrl =
			args.successUrl ||
			`${baseUrl}/app/settings/organization?billing=success&org=${orgId}`;
		const cancelUrl =
			args.cancelUrl ||
			`${baseUrl}/app/settings/organization?billing=cancelled&org=${orgId}`;

		return await stripeClient.createCheckoutSession(ctx, {
			priceId: args.priceId,
			customerId,
			mode: "subscription",
			quantity: args.quantity ?? 1,
			successUrl,
			cancelUrl,
			subscriptionMetadata: { orgId },
		});
	},
});

/**
 * Create a Stripe Customer Portal session for the organization.
 */
export const createCustomerPortalSession = action({
	args: {
		organizationId: v.id("organizations"),
		returnUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const organization = await assertBillingManager(ctx, args.organizationId);
		const orgId = String(args.organizationId);
		const customerId = await getOrCreateOrgCustomerId(
			ctx,
			orgId,
			organization.name,
		);
		const returnUrl =
			args.returnUrl ||
			`${getAppBaseUrl()}/app/settings/organization?billing=portal_return`;

		return await stripeClient.createCustomerPortalSession(ctx, {
			customerId,
			returnUrl,
		});
	},
});

/**
 * Read org billing state synced by Stripe webhooks.
 */
export const getOrganizationBilling = query({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, args) => {
		await requireOrgCapability(ctx, ORG_CAPABILITIES.ORG_READ, {
			organizationId: args.organizationId,
		});

		const orgId = String(args.organizationId);
		const subscription = await ctx.runQuery(
			stripeComponent.public.getSubscriptionByOrgId,
			{ orgId },
		);
		const invoices = await ctx.runQuery(
			stripeComponent.public.listInvoicesByOrgId,
			{
				orgId,
			},
		);
		const payments = await ctx.runQuery(
			stripeComponent.public.listPaymentsByOrgId,
			{
				orgId,
			},
		);

		return {
			subscription,
			invoices,
			payments,
		};
	},
});
