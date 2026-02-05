import { api } from "@backend/convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useOrgMode } from "@/hooks/use-org-mode";

export const Route = createFileRoute("/callback")({
	component: CallbackPage,
});

function CallbackPage() {
	const { isLoading, user } = useAuth();
	const navigate = useNavigate();
	const hasUpserted = useRef(false);
	const hasPreProvisionedOrg = useRef(false);
	const hasEnsuredInOrgMode = useRef(false);
	const [upsertComplete, setUpsertComplete] = useState(false);
	const { isLoading: isOrgModeLoading, isOrgEnabled } = useOrgMode();

	const upsertUser = useMutation(api.users.upsertUser);
	const ensureOrg = useMutation(api.organizations.ensureForCurrentUser);
	const organizations = useQuery(
		api.organizations.listForUser,
		upsertComplete && isOrgEnabled ? {} : "skip",
	);

	// Upsert user on first load
	useEffect(() => {
		const doUpsert = async () => {
			if (!isLoading && user && !hasUpserted.current) {
				hasUpserted.current = true;
				try {
					await upsertUser({
						authId: user.id,
						email: user.email || "",
						name: user.firstName
							? `${user.firstName} ${user.lastName || ""}`.trim()
							: undefined,
						profileImageUrl: user.profilePictureUrl || undefined,
					});
					setUpsertComplete(true);
				} catch (err) {
					console.error("Failed to upsert user:", err);
					// Still mark as complete to avoid infinite loading
					setUpsertComplete(true);
				}
			}
		};
		doUpsert();
	}, [isLoading, user, upsertUser]);

	// Navigate based on organization status
	useEffect(() => {
		if (isLoading || isOrgModeLoading || !user || !upsertComplete) {
			return;
		}

		const resolveNextRoute = async () => {
			if (!isOrgEnabled) {
				// Pre-provision a personal workspace while org mode is off so toggling on is seamless.
				if (!hasPreProvisionedOrg.current) {
					hasPreProvisionedOrg.current = true;
					try {
						await ensureOrg({ forceProvision: true });
					} catch (err) {
						console.error("Failed to auto-provision organization:", err);
					}
				}
				navigate({ to: "/app" });
				return;
			}

			if (organizations === undefined) {
				return;
			}

			if (organizations.length > 0) {
				navigate({ to: "/app" });
				return;
			}

			if (hasEnsuredInOrgMode.current) {
				return;
			}

			hasEnsuredInOrgMode.current = true;
			try {
				await ensureOrg({ forceProvision: true });
				navigate({ to: "/app" });
			} catch (err) {
				console.error("Failed to auto-provision organization:", err);
				navigate({ to: "/onboarding/organization" });
			}
		};

		void resolveNextRoute();
	}, [
		isLoading,
		isOrgModeLoading,
		isOrgEnabled,
		user,
		upsertComplete,
		organizations,
		ensureOrg,
		navigate,
	]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
				<p className="text-muted-foreground">Completing sign in...</p>
			</div>
		</div>
	);
}
