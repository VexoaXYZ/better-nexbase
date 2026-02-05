import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useEffect, useState } from "react";

import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/auth/sign-up")({
	component: SignUpPage,
});

function SignUpPage() {
	const { isLoading, user, signUp } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && user) {
			navigate({ to: "/" });
		}
	}, [isLoading, user, navigate]);

	const handleEmailSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		try {
			await signUp({ loginHint: email });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create account");
			setIsSubmitting(false);
		}
	};

	const handleSignUp = async () => {
		setError(null);
		try {
			await signUp();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create account");
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
								d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
							/>
						</svg>
					</div>
					<h1 className="font-bold text-2xl text-white">Create an account</h1>
					<p className="text-muted-foreground text-sm">
						Get started with your free account today
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Quick sign up button */}
					<Button className="w-full" onClick={handleSignUp}>
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
								d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
							/>
						</svg>
						Create Account
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
					<form onSubmit={handleEmailSignUp} className="space-y-4">
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
							variant="secondary"
							className="w-full"
							disabled={isSubmitting || !email}
						>
							{isSubmitting ? (
								<>
									<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
									Creating account...
								</>
							) : (
								"Continue with Email"
							)}
						</Button>
					</form>

					<p className="text-center text-xs text-zinc-500">
						By creating an account, you agree to our{" "}
						<Link to="/" className="text-zinc-400 hover:text-white">
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link to="/" className="text-zinc-400 hover:text-white">
							Privacy Policy
						</Link>
					</p>

					<Separator />

					<p className="text-center text-sm text-zinc-400">
						Already have an account?{" "}
						<Link
							to="/auth/sign-in"
							className="font-medium text-white transition-colors hover:text-zinc-300"
						>
							Sign in
						</Link>
					</p>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
