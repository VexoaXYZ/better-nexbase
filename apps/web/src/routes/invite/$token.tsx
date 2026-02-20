import { api } from "@backend/convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
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
		"idle" | "accepting" | "accepted" | "declining" | "declined" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);

	const invite = useQuery(api.members.getInviteByToken, { token });
	const acceptInvite = useMutation(api.members.acceptInvite);
	const declineInvite = useMutation(api.members.declineInvite);

	const handleAccept = async () => {
		setStatus("accepting");
		try {
			await acceptInvite({ token });
			setStatus("accepted");
			setTimeout(() => {
				navigate({ to: "/app" });
			}, 2000);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to accept invitation",
			);
			setStatus("error");
		}
	};

	const handleDecline = async () => {
		setStatus("declining");
		try {
			await declineInvite({ token });
			setStatus("declined");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to decline invitation",
			);
			setStatus("error");
		}
	};

	// Loading state while auth or invite data loads
	if (isLoading || invite === undefined) {
		return (
			<AuthLayout>
				<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
					<CardContent className="py-12">
						<div className="flex flex-col items-center gap-4">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
							<p className="text-muted-foreground">Loading invitation...</p>
						</div>
					</CardContent>
				</Card>
			</AuthLayout>
		);
	}

	// Invitation not found
	if (invite === null) {
		return (
			<AuthLayout>
				<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
					<CardHeader className="space-y-1 text-center">
						<StatusIcon variant="error" />
						<h1 className="font-bold text-2xl text-white">
							Invitation Not Found
						</h1>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-center text-muted-foreground">
							This invitation link is invalid or has been removed.
						</p>
						<Button
							variant="secondary"
							className="w-full"
							onClick={() => navigate({ to: "/" })}
						>
							Go to Home
						</Button>
					</CardContent>
				</Card>
			</AuthLayout>
		);
	}

	// Determine the display state
	const isExpired = invite.expiresAt < Date.now();
	const isPending = invite.status === "pending" && !isExpired;
	const emailMismatch =
		user && invite.email.toLowerCase() !== user.email.toLowerCase();

	return (
		<AuthLayout>
			<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
				<CardHeader className="space-y-1 text-center">
					<StatusIcon
						variant={
							status === "accepted"
								? "success"
								: status === "declined"
									? "info"
									: status === "error" ||
											!isPending ||
											invite.status !== "pending"
										? "error"
										: "invite"
						}
					/>
					<h1 className="font-bold text-2xl text-white">
						{status === "accepted"
							? "Welcome to the team!"
							: status === "declined"
								? "Invitation Declined"
								: status === "error"
									? "Invitation Error"
									: !isPending && invite.status === "accepted"
										? "Already Accepted"
										: !isPending && invite.status === "declined"
											? "Already Declined"
											: isExpired || invite.status === "expired"
												? "Invitation Expired"
												: "Organization Invitation"}
					</h1>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Invite details (always shown when we have data) */}
					{isPending && status === "idle" && (
						<div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
							<div className="flex flex-col items-center gap-2 text-center">
								{invite.organizationLogoUrl ? (
									<img
										src={invite.organizationLogoUrl}
										alt={invite.organizationName}
										className="h-12 w-12 rounded-lg"
									/>
								) : (
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 font-semibold text-lg text-zinc-400">
										{invite.organizationName.slice(0, 2).toUpperCase()}
									</div>
								)}
								<div>
									<p className="font-semibold text-white">
										{invite.organizationName}
									</p>
									<p className="text-muted-foreground text-sm">
										Invited by {invite.inviterName} as{" "}
										<span className="text-zinc-300 capitalize">
											{invite.role}
										</span>
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Not signed in */}
					{!user && isPending && (
						<>
							<p className="text-center text-muted-foreground">
								Sign in or create an account to respond to this invitation.
							</p>
							<Button className="w-full" onClick={() => signIn()}>
								Sign in to Continue
							</Button>
						</>
					)}

					{/* Signed in, email mismatch */}
					{user && isPending && emailMismatch && status === "idle" && (
						<div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center text-amber-400 text-sm">
							This invite was sent to{" "}
							<span className="font-medium">{invite.email}</span>, but
							you&apos;re signed in as{" "}
							<span className="font-medium">{user.email}</span>.
						</div>
					)}

					{/* Signed in, email matches, pending — show accept/decline */}
					{user && isPending && !emailMismatch && status === "idle" && (
						<div className="flex gap-3">
							<Button
								variant="outline"
								className="flex-1"
								onClick={handleDecline}
							>
								Decline
							</Button>
							<Button className="flex-1" onClick={handleAccept}>
								Accept
							</Button>
						</div>
					)}

					{/* Accepting/declining spinner */}
					{(status === "accepting" || status === "declining") && (
						<div className="flex flex-col items-center gap-4 py-4">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
							<p className="text-muted-foreground">
								{status === "accepting"
									? "Accepting invitation..."
									: "Declining invitation..."}
							</p>
						</div>
					)}

					{/* Accepted */}
					{status === "accepted" && (
						<>
							<p className="text-center text-muted-foreground">
								You&apos;ve successfully joined the organization. Redirecting to
								the dashboard...
							</p>
							<div className="flex justify-center">
								<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
							</div>
						</>
					)}

					{/* Declined */}
					{status === "declined" && (
						<>
							<p className="text-center text-muted-foreground">
								You&apos;ve declined the invitation to {invite.organizationName}
								.
							</p>
							<Button
								variant="secondary"
								className="w-full"
								onClick={() => navigate({ to: "/" })}
							>
								Go to Home
							</Button>
						</>
					)}

					{/* Already accepted/declined/expired (from server data) */}
					{status === "idle" && !isPending && (
						<>
							<p className="text-center text-muted-foreground">
								{invite.status === "accepted"
									? "This invitation has already been accepted."
									: invite.status === "declined"
										? "This invitation has already been declined."
										: "This invitation has expired and is no longer valid."}
							</p>
							<Button
								variant="secondary"
								className="w-full"
								onClick={() => navigate({ to: "/" })}
							>
								Go to Home
							</Button>
						</>
					)}

					{/* Error */}
					{status === "error" && (
						<>
							<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400 text-sm">
								{error}
							</div>
							<Button
								variant="secondary"
								className="w-full"
								onClick={() => navigate({ to: "/" })}
							>
								Go to Home
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</AuthLayout>
	);
}

function StatusIcon({
	variant,
}: {
	variant: "success" | "error" | "info" | "invite";
}) {
	return (
		<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800">
			{variant === "success" ? (
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
			) : variant === "error" ? (
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
			) : variant === "info" ? (
				<svg
					className="h-6 w-6 text-zinc-400"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
	);
}
