import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";

interface RequireAuthProps {
	children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
	const { isLoading, user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !user) {
			navigate({ to: "/auth/sign-in" });
		}
	}, [isLoading, user, navigate]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
					<p className="text-muted-foreground text-sm">Loading...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return <>{children}</>;
}
