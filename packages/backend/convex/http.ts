import { registerRoutes as registerStripeRoutes } from "@convex-dev/stripe";
import { httpRouter } from "convex/server";
import { components } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authKit } from "./auth";
import { resend } from "./lib/email";

const http = httpRouter();

// Register WorkOS AuthKit webhook routes
authKit.registerRoutes(http);
registerStripeRoutes(http, (components as any).stripe, {
	webhookPath: "/stripe/webhook",
});

http.route({
	path: "/resend-webhook",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		return await resend.handleResendEventWebhook(ctx, req);
	}),
});

export default http;
