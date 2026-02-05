import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useEffect, useState } from "react";

import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/auth/sign-in")({
	component: SignInPage,
});

function SignInPage() {
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

	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		try {
			await signIn({ loginHint: email });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to sign in");
			setIsSubmitting(false);
		}
	};

	const handleSignIn = async () => {
		setError(null);
		try {
			await signIn();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to sign in");
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
								d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
							/>
						</svg>
					</div>
					<h1 className="font-bold text-2xl text-white">Welcome back</h1>
					<p className="text-muted-foreground text-sm">
						Sign in to your account to continue
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Quick sign in button */}
					<Button className="w-full" onClick={handleSignIn}>
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
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							/>
						</svg>
						Sign In
					</Button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<Separator className="w-full" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-zinc-900 px-2 text-zinc-500">
								Or continue with email
							</span>
						</div>
					</div>

					{/* Email form */}
					<form onSubmit={handleEmailSignIn} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								autoComplete="email"
							/>
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
									Signing in...
								</>
							) : (
								"Continue with Email"
							)}
						</Button>
					</form>

					<div className="text-center">
						<Link
							to="/auth/sso"
							className="text-sm text-zinc-400 transition-colors hover:text-white"
						>
							Sign in with SSO
						</Link>
					</div>

					<Separator />

					<p className="text-center text-sm text-zinc-400">
						Don&apos;t have an account?{" "}
						<Link
							to="/auth/sign-up"
							className="font-medium text-white transition-colors hover:text-zinc-300"
						>
							Sign up
						</Link>
					</p>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
