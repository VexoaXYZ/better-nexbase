import { Link } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useConvexAuth } from "convex/react";
import { Button } from "./ui/button";

interface AuthButtonProps {
	size?: "default" | "sm" | "lg";
	variant?: "default" | "secondary" | "ghost";
	className?: string;
}

export function AuthButton({
	size = "sm",
	variant = "default",
	className,
}: AuthButtonProps) {
	const { isLoading: convexLoading, isAuthenticated } = useConvexAuth();
	const { user, signOut, isLoading: authLoading } = useAuth();

	const isLoading = convexLoading || authLoading;

	if (isLoading) {
		return (
			<Button size={size} variant="ghost" disabled className={className}>
				<span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
			</Button>
		);
	}

	if (isAuthenticated && user) {
		return (
			<div className="flex items-center gap-3">
				{user.profilePictureUrl && (
					<img
						src={user.profilePictureUrl}
						alt={user.firstName ?? "User"}
						className="h-8 w-8 rounded-full border border-zinc-700"
					/>
				)}
				<Button size={size} variant={variant} asChild className={className}>
					<Link to="/app">Dashboard</Link>
				</Button>
				<Button
					size={size}
					variant="ghost"
					onClick={() => signOut()}
					className={className}
				>
					Sign out
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Button size={size} variant="ghost" asChild className={className}>
				<Link to="/auth/sign-in">Sign in</Link>
			</Button>
			<Button size={size} variant={variant} asChild className={className}>
				<Link to="/auth/sign-up">Get Started</Link>
			</Button>
		</div>
	);
}

/**
 * Shows content only when user is authenticated
 */
export function AuthenticatedOnly({ children }: { children: React.ReactNode }) {
	const { isAuthenticated } = useConvexAuth();

	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}

/**
 * Shows content only when user is NOT authenticated
 */
export function UnauthenticatedOnly({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();

	if (isLoading || isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}
