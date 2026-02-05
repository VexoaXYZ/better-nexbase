import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useEffect, useState } from "react";

import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/sso")({
	component: SSOPage,
});

function SSOPage() {
	const { isLoading, user, signIn } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && user) {
			navigate({ to: "/" });
		}
	}, [isLoading, user, navigate]);

	const handleSSOSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			// Extract domain from email
			const domain = email.split("@")[1];
			if (!domain) {
				setError("Please enter a valid work email");
				setIsSubmitting(false);
				return;
			}

			// Use the connection selector with the email hint
			await signIn({
				loginHint: email,
			});
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to initiate SSO. Please try again.",
			);
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<AuthLayout>
				<div className="flex items-center justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800">
						<svg
							className="h-6 w-6 text-white"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<h1 className="font-bold text-2xl text-white">Enterprise SSO</h1>
					<p className="text-muted-foreground text-sm">
						Sign in with your corporate identity provider
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<form onSubmit={handleSSOSignIn} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Work Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								autoComplete="email"
							/>
							<p className="text-xs text-zinc-500">
								Enter your work email to be redirected to your company&apos;s
								identity provider
							</p>
						</div>

						{error && (
							<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400 text-sm">
								{error}
							</div>
						)}

						<Button
							type="submit"
							className="w-full"
							disabled={isSubmitting || !email}
						>
							{isSubmitting ? (
								<>
									<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
									Connecting...
								</>
							) : (
								<>
									<svg
										className="mr-2 h-4 w-4"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
									Continue with SSO
								</>
							)}
						</Button>
					</form>

					<div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
						<h3 className="mb-2 font-medium text-sm text-white">
							Supported Providers
						</h3>
						<div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
							<div className="flex items-center gap-1.5">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								Okta
							</div>
							<div className="flex items-center gap-1.5">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								Azure AD
							</div>
							<div className="flex items-center gap-1.5">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								Google Workspace
							</div>
							<div className="flex items-center gap-1.5">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								OneLogin
							</div>
						</div>
					</div>

					<div className="text-center">
						<Link
							to="/auth/sign-in"
							className="text-sm text-zinc-400 transition-colors hover:text-white"
						>
							Back to sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
