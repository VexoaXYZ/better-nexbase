import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useBilling } from "@/hooks/use-billing";

export const Route = createFileRoute("/app/_layout/demo-paid")({
	component: DemoPaidPage,
});

function DemoPaidPage() {
	const { isPro, isLoading } = useBilling();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
			</div>
		);
	}

	if (!isPro) {
		return (
			<div className="mx-auto max-w-lg py-12">
				<Card className="border-zinc-700">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
							<svg
								className="h-8 w-8 text-zinc-400"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
								/>
							</svg>
						</div>
						<CardTitle className="text-xl">
							This Area is for Cool Kids Only
						</CardTitle>
						<CardDescription className="text-base">
							You&apos;re still rocking the free tier — not that there&apos;s
							anything wrong with that. But the real party is behind this door.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button asChild>
							<Link to="/app/settings/billing">Upgrade to Pro</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-lg py-12">
			<Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
						<svg
							className="h-8 w-8 text-indigo-400"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
							/>
						</svg>
					</div>
					<CardTitle className="text-xl">
						Welcome to the Cool Kids Club
					</CardTitle>
					<CardDescription className="text-base">
						You&apos;re a Pro now — not a noobie! You&apos;ve unlocked the
						premium experience. Enjoy the exclusive vibes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4 text-center">
						<div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4">
							<p className="font-medium text-indigo-300 text-sm">
								Pro Member Badge
							</p>
							<p className="mt-1 text-xs text-zinc-400">
								This badge proves you have impeccable taste (and a credit card).
							</p>
						</div>
						<p className="text-sm text-zinc-500">
							More pro-only features coming soon. For now, just enjoy the
							prestige.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
