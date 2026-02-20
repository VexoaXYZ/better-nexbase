import { api } from "@backend/convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useOrgMode } from "@/hooks/use-org-mode";

interface RequireOrganizationProps {
	children: React.ReactNode;
}

export function RequireOrganization({ children }: RequireOrganizationProps) {
	const navigate = useNavigate();
	const { isLoading: isOrgModeLoading, isOrgEnabled } = useOrgMode();
	const ensureOrg = useMutation(api.organizations.ensureForCurrentUser);
	const organizations = useQuery(
		api.organizations.listForUser,
		isOrgEnabled ? {} : "skip",
	);
	const hasAttemptedProvision = useRef(false);
	const [isEnsuringOrg, setIsEnsuringOrg] = useState(false);

	const hasOrganizationId = (
		value: unknown,
	): value is { organizationId: string } => {
		return (
			typeof value === "object" &&
			value !== null &&
			"organizationId" in value &&
			typeof (value as { organizationId?: unknown }).organizationId === "string"
		);
	};

	useEffect(() => {
		if (isOrgModeLoading || !isOrgEnabled || organizations === undefined) {
			return;
		}

		if (organizations.length > 0) {
			return;
		}

		if (hasAttemptedProvision.current) {
			return;
		}

		hasAttemptedProvision.current = true;
		let cancelled = false;

		const ensure = async () => {
			setIsEnsuringOrg(true);
			try {
				const result = await ensureOrg({ forceProvision: true });
				if (!hasOrganizationId(result) && !cancelled) {
					navigate({ to: "/onboarding/organization" });
				}
			} catch (error) {
				console.error("Failed to auto-provision organization:", error);
				if (!cancelled) {
					navigate({ to: "/onboarding/organization" });
				}
			} finally {
				if (!cancelled) {
					setIsEnsuringOrg(false);
				}
			}
		};

		void ensure();

		return () => {
			cancelled = true;
		};
	}, [
		isOrgModeLoading,
		isOrgEnabled,
		organizations,
		ensureOrg,
		navigate,
		hasOrganizationId,
	]);

	if (
		isOrgModeLoading ||
		isEnsuringOrg ||
		(isOrgEnabled && organizations === undefined)
	) {
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
