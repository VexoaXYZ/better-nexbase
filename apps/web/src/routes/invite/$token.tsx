import { api } from "@backend/convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const Route = createFileRoute("/invite/$token")({
	component: InviteAcceptPage,
});

function InviteAcceptPage() {
	const { token } = Route.useParams();
	const { isLoading, user, signIn } = useAuth();
	const navigate = useNavigate();

	const [status, setStatus] = useState<
		"loading" | "accepting" | "success" | "error"
	>("loading");
	const [error, setError] = useState<string | null>(null);

	const acceptInvite = useMutation(api.members.acceptInvite);

	useEffect(() => {
		if (isLoading) return;

		if (!user) {
			// User needs to sign in first
			setStatus("loading");
			return;
		}

		// User is signed in, try to accept the invitation
		let timer: ReturnType<typeof setTimeout>;

		const accept = async () => {
			setStatus("accepting");
			try {
				await acceptInvite({ token });
				setStatus("success");
				timer = setTimeout(() => {
					navigate({ to: "/app" });
				}, 2000);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to accept invitation",
				);
				setStatus("error");
			}
		};

		accept();
		return () => clearTimeout(timer);
	}, [isLoading, user, token, acceptInvite, navigate]);

	const handleSignIn = () => {
		signIn();
	};

	return (
		<AuthLayout>
			<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800">
						{status === "success" ? (
							<svg
								className="h-6 w-6 text-emerald-500"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						) : status === "error" ? (
							<svg
								className="h-6 w-6 text-red-500"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						) : (
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
						)}
					</div>
					<h1 className="font-bold text-2xl text-white">
						{status === "success"
							? "Welcome to the team!"
							: status === "error"
								? "Invitation Error"
								: "Organization Invitation"}
					</h1>
				</CardHeader>
				<CardContent className="space-y-4">
					{status === "loading" && !user && (
						<>
							<p className="text-center text-muted-foreground">
								You&apos;ve been invited to join an organization. Sign in or
								create an account to accept the invitation.
							</p>
							<Button className="w-full" onClick={handleSignIn}>
								Sign in to Accept
							</Button>
						</>
					)}

					{(status === "loading" || status === "accepting") && user && (
						<div className="flex flex-col items-center gap-4 py-4">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
							<p className="text-muted-foreground">Accepting invitation...</p>
						</div>
					)}

					{status === "success" && (
						<>
							<p className="text-center text-muted-foreground">
								You&apos;ve successfully joined the organization. Redirecting
								you to the dashboard...
							</p>
							<div className="flex justify-center">
								<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
							</div>
						</>
					)}

					{status === "error" && (
						<>
							<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400 text-sm">
								{error}
							</div>
							<div className="flex flex-col gap-2">
								<Button
									variant="secondary"
									className="w-full"
									onClick={() => navigate({ to: "/" })}
								>
									Go to Home
								</Button>
								{!user && (
									<Button className="w-full" onClick={handleSignIn}>
										Sign in with Different Account
									</Button>
								)}
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
