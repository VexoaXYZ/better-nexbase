import { api } from "@backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCustomer } from "autumn-js/react";
import { useQuery } from "convex/react";
import { CurrentPlanBanner, PlanCards } from "@/components/billing/plan-cards";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useOrgMode } from "@/hooks/use-org-mode";

export const Route = createFileRoute("/app/_layout/settings/_layout/billing")({
	component: BillingSettingsPage,
});

function BillingSettingsPage() {
	const { isLoading: isOrgModeLoading, isOrgEnabled } = useOrgMode();
	const organizations = useQuery(
		api.organizations.listForUser,
		isOrgEnabled ? {} : "skip",
	);
	const currentOrg =
		organizations?.find((org) => org?.isDefault) ?? organizations?.[0];
	const { customer, check } = useCustomer();

	const isPro = check({ productId: "pro" }).data?.allowed === true;

	if (isOrgModeLoading || (isOrgEnabled && organizations === undefined)) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
			</div>
		);
	}

	if (!isOrgEnabled) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Billing Unavailable</CardTitle>
					<CardDescription>
						Organization mode is currently disabled. Re-enable org mode to
						manage billing.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (!currentOrg) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>No Organization Selected</CardTitle>
					<CardDescription>
						Create or join an organization to manage billing.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild>
						<Link to="/onboarding/organization">Create Organization</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	const isOwner = currentOrg.membership?.role === "owner";

	if (!isOwner) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Billing</CardTitle>
					<CardDescription>
						Only organization owners can manage billing settings.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const currentPlanName =
		customer?.products && customer.products.length > 0
			? customer.products.map((p) => p.name ?? p.id).join(", ")
			: "Free";

	return (
		<div className="space-y-8">
			<CurrentPlanBanner
				isPro={isPro}
				planName={currentPlanName}
				orgName={currentOrg.name}
				isLoaded={customer !== undefined && customer !== null}
			/>

			<PlanCards isPro={isPro} />

			{/* FAQ / Fine print */}
			<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
				<p className="font-medium text-sm text-zinc-400">
					Need a custom plan for your team?{" "}
					<a
						href="mailto:support@nexbase.com"
						className="text-white underline-offset-4 transition-colors hover:underline"
					>
						Contact us
					</a>
				</p>
				<p className="mt-1.5 text-xs text-zinc-600">
					All plans include SSL, 99.9% uptime SLA, and GDPR compliance. Prices
					shown in USD.
				</p>
			</div>
		</div>
	);
}
