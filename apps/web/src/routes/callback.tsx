import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";

export const Route = createFileRoute("/callback")({
	component: CallbackPage,
});

function CallbackPage() {
	const { isLoading, user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && user) {
			// Redirect to home after successful authentication
			navigate({ to: "/" });
		}
	}, [isLoading, user, navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
				<p className="text-muted-foreground">Completing sign in...</p>
			</div>
		</div>
	);
}
