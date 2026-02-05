import { Resend } from "@convex-dev/resend";
import { components } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";

function parseBooleanEnv(
	value: string | undefined,
	fallback: boolean,
): boolean {
	if (value === undefined) return fallback;
	if (value === "1" || value.toLowerCase() === "true") return true;
	if (value === "0" || value.toLowerCase() === "false") return false;
	return fallback;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function getFromEmail(): string | null {
	const from = process.env.RESEND_FROM_EMAIL?.trim();
	return from ? from : null;
}

export const resend = new Resend((components as any).resend, {
	testMode: parseBooleanEnv(process.env.RESEND_TEST_MODE, true),
});

export interface SendOrganizationInviteEmailArgs {
	toEmail: string;
	organizationName: string;
	inviteLink: string;
	inviterName?: string;
}

export async function sendOrganizationInviteEmail(
	ctx: MutationCtx,
	args: SendOrganizationInviteEmailArgs,
): Promise<{ sent: boolean; reason?: string }> {
	if (!process.env.RESEND_API_KEY) {
		return { sent: false, reason: "missing_resend_api_key" };
	}

	const from = getFromEmail();
	if (!from) {
		return { sent: false, reason: "missing_resend_from_email" };
	}

	try {
		const safeOrg = escapeHtml(args.organizationName);
		const safeInviter = args.inviterName
			? escapeHtml(args.inviterName)
			: "A teammate";
		const safeLink = escapeHtml(args.inviteLink);

		await resend.sendEmail(ctx, {
			from,
			to: args.toEmail,
			subject: `You're invited to join ${args.organizationName} on Nexbase`,
			html: `
				<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;line-height:1.5;color:#111827;">
					<h2 style="margin-bottom:12px;">Join ${safeOrg}</h2>
					<p>${safeInviter} invited you to join <strong>${safeOrg}</strong> on Nexbase.</p>
					<p style="margin:20px 0;">
						<a href="${safeLink}" style="background:#111827;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">
							Accept Invitation
						</a>
					</p>
					<p>If the button does not work, copy and paste this link:</p>
					<p style="word-break:break-all;"><a href="${safeLink}">${safeLink}</a></p>
					<p style="color:#6b7280;font-size:12px;">This invite link expires in 7 days.</p>
				</div>
			`.trim(),
		});
		return { sent: true };
	} catch (error) {
		console.error("Failed to send organization invite email:", error);
		return { sent: false, reason: "send_failed" };
	}
}
