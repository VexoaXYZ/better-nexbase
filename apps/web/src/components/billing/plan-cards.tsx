import { CheckoutDialog, useCustomer } from "autumn-js/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
	"Up to 3 team members",
	"Basic analytics dashboard",
	"Community support",
	"1 GB storage",
];

const PRO_FEATURES = [
	"Unlimited team members",
	"Advanced analytics & reports",
	"Priority email support",
	"100 GB storage",
	"Custom integrations",
	"Audit logs & compliance",
];

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			className={cn("h-4 w-4 shrink-0", className)}
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M4.5 12.75l6 6 9-13.5"
			/>
		</svg>
	);
}

interface CurrentPlanBannerProps {
	isPro: boolean;
	planName: string;
	orgName: string;
	isLoaded: boolean;
}

export function CurrentPlanBanner({
	isPro,
	planName,
	orgName,
	isLoaded,
}: CurrentPlanBannerProps) {
	const { checkout } = useCustomer();

	return (
		<div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
			{isPro && (
				<div
					className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full opacity-20 blur-3xl"
					style={{
						background:
							"radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)",
					}}
				/>
			)}
			<div className="relative flex items-center justify-between p-6">
				<div className="flex items-center gap-4">
					<div
						className={cn(
							"flex h-12 w-12 items-center justify-center rounded-xl",
							isPro
								? "bg-indigo-500/15 text-indigo-400"
								: "bg-zinc-800 text-zinc-400",
						)}
					>
						{isPro ? (
							<svg
								className="h-6 w-6"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
								/>
							</svg>
						) : (
							<svg
								className="h-6 w-6"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
								/>
							</svg>
						)}
					</div>
					<div>
						<div className="flex items-center gap-2.5">
							<p className="font-semibold text-lg text-white">
								{planName} Plan
							</p>
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
									isPro
										? "bg-indigo-500/15 text-indigo-400"
										: "bg-zinc-800 text-zinc-400",
								)}
							>
								{isPro ? "Active" : "Current"}
							</span>
						</div>
						<p className="mt-0.5 text-sm text-zinc-500">
							{orgName}
							{isPro
								? " — enjoying all premium features"
								: " — upgrade anytime to unlock more"}
						</p>
					</div>
				</div>
				{isLoaded ? (
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							checkout({
								productId: "pro",
								dialog: CheckoutDialog,
							})
						}
						className={cn(
							isPro &&
								"border-indigo-500/30 text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10",
						)}
					>
						{isPro ? "Manage Plan" : "Upgrade"}
					</Button>
				) : (
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
				)}
			</div>
		</div>
	);
}

interface PlanCardsProps {
	isPro: boolean;
}

export function PlanCards({ isPro }: PlanCardsProps) {
	const { checkout } = useCustomer();

	return (
		<div>
			<div className="mb-5">
				<h3 className="font-semibold text-lg text-white">Choose your plan</h3>
				<p className="mt-1 text-sm text-zinc-500">
					Simple pricing with no hidden fees. Cancel or change plans anytime.
				</p>
			</div>

			<div className="grid gap-5 lg:grid-cols-2">
				{/* Free Plan */}
				<div
					className={cn(
						"relative rounded-xl border p-6 transition-all duration-300",
						!isPro
							? "border-zinc-700 bg-zinc-900/80"
							: "border-zinc-800 bg-zinc-900/40",
					)}
				>
					<div className="mb-6">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-base text-white">Free</h4>
							{!isPro && (
								<span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 font-medium text-xs text-zinc-400">
									Current plan
								</span>
							)}
						</div>
						<p className="mt-1 text-sm text-zinc-500">
							For individuals and small teams getting started.
						</p>
					</div>

					<div className="mb-6">
						<div className="flex items-baseline gap-1">
							<span className="font-bold text-3xl text-white tracking-tight">
								$0
							</span>
							<span className="text-sm text-zinc-500">/month</span>
						</div>
					</div>

					<div className="mb-6 space-y-3">
						{FREE_FEATURES.map((feature) => (
							<div key={feature} className="flex items-start gap-2.5">
								<CheckIcon className="mt-0.5 text-zinc-600" />
								<span className="text-sm text-zinc-400">{feature}</span>
							</div>
						))}
					</div>

					<Button variant="outline" className="w-full" disabled={!isPro}>
						{!isPro ? "Current Plan" : "Downgrade"}
					</Button>
				</div>

				{/* Pro Plan */}
				<div className="relative">
					<div
						className="pointer-events-none absolute -inset-0.5 rounded-xl opacity-50 blur-sm"
						style={{
							background:
								"linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2), rgba(99,102,241,0.1))",
						}}
					/>
					<div
						className={cn(
							"relative rounded-xl border p-6 transition-all duration-300",
							isPro
								? "border-indigo-500/30 bg-zinc-900"
								: "border-indigo-500/20 bg-zinc-900",
						)}
					>
						<div className="absolute -top-3 left-6">
							<span className="inline-flex items-center rounded-full bg-indigo-500 px-3 py-1 font-semibold text-white text-xs shadow-indigo-500/25 shadow-lg">
								Recommended
							</span>
						</div>

						<div className="mt-1 mb-6">
							<div className="flex items-center justify-between">
								<h4 className="font-semibold text-base text-white">Pro</h4>
								{isPro && (
									<span className="inline-flex items-center rounded-full bg-indigo-500/15 px-2.5 py-0.5 font-medium text-indigo-400 text-xs">
										Current plan
									</span>
								)}
							</div>
							<p className="mt-1 text-sm text-zinc-500">
								For growing teams that need advanced features.
							</p>
						</div>

						<div className="mb-6">
							<div className="flex items-baseline gap-1">
								<span className="font-bold text-3xl text-white tracking-tight">
									$29
								</span>
								<span className="text-sm text-zinc-500">/month</span>
							</div>
						</div>

						<div className="mb-6 space-y-3">
							{PRO_FEATURES.map((feature) => (
								<div key={feature} className="flex items-start gap-2.5">
									<CheckIcon className="mt-0.5 text-indigo-400" />
									<span className="text-sm text-zinc-300">{feature}</span>
								</div>
							))}
						</div>

						{isPro ? (
							<Button
								className="w-full border-indigo-500/30 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25"
								disabled
							>
								Current Plan
							</Button>
						) : (
							<Button
								className="w-full bg-indigo-500 text-white hover:bg-indigo-600"
								onClick={() =>
									checkout({
										productId: "pro",
										dialog: CheckoutDialog,
									})
								}
							>
								Upgrade to Pro
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
