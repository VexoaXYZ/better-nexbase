import { api } from "@backend/convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { useOrgMode } from "@/hooks/use-org-mode";

interface RequireOrganizationProps {
	children: React.ReactNode;
}

export function RequireOrganization({ children }: RequireOrganizationProps) {
	const navigate = useNavigate();
	const { isLoading: isOrgModeLoading, isOrgEnabled } = useOrgMode();
	const organizations = useQuery(
		api.organizations.listForUser,
		isOrgEnabled ? {} : "skip",
	);

	useEffect(() => {
		if (
			!isOrgModeLoading &&
			isOrgEnabled &&
			organizations !== undefined &&
			organizations.length === 0
		) {
			navigate({ to: "/onboarding/organization" });
		}
	}, [isOrgEnabled, isOrgModeLoading, organizations, navigate]);

	if (isOrgModeLoading || (isOrgEnabled && organizations === undefined)) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
					<p className="text-muted-foreground text-sm">
						Loading organization...
					</p>
				</div>
			</div>
		);
	}

	if (!isOrgEnabled) {
		return <>{children}</>;
	}

	if (!organizations || organizations.length === 0) {
		return null;
	}

	return <>{children}</>;
}
