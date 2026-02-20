import { api } from "@backend/convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useOrgMode } from "@/hooks/use-org-mode";

interface OrgOnboardingSearch {
	new?: boolean;
}

export const Route = createFileRoute("/onboarding/organization")({
	component: OrganizationOnboardingPage,
	validateSearch: (search: Record<string, unknown>): OrgOnboardingSearch => ({
		new: search.new === true || search.new === "true" ? true : undefined,
	}),
});

function OrganizationOnboardingPage() {
	const { isLoading: authLoading, user, signOut } = useAuth();
	const navigate = useNavigate();
	const { isLoading: isOrgModeLoading, isOrgEnabled } = useOrgMode();

	const { new: isNewOrg } = Route.useSearch();

	const [orgName, setOrgName] = useState("");
	const [slug, setSlug] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const userOrgs = useQuery(
		api.organizations.listForUser,
		isOrgEnabled ? {} : "skip",
	);
	const createOrg = useMutation(api.organizations.create);
	const slugAvailable = useQuery(
		api.organizations.checkSlugAvailable,
		isOrgEnabled && slug.length >= 3 ? { slug } : "skip",
	);

	// Generate slug from org name
	useEffect(() => {
		const generatedSlug = orgName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "")
			.slice(0, 40);
		setSlug(generatedSlug);
	}, [orgName]);

	// Redirect if user already has an organization
	useEffect(() => {
		if (!authLoading && !user) {
			navigate({ to: "/auth/sign-in" });
		}
	}, [authLoading, user, navigate]);

	// If user already has orgs and didn't explicitly request new org, redirect to app
	useEffect(() => {
		if (isOrgEnabled && !isNewOrg && userOrgs && userOrgs.length > 0) {
			navigate({ to: "/app" });
		}
	}, [isOrgEnabled, isNewOrg, userOrgs, navigate]);

	useEffect(() => {
		if (!isOrgModeLoading && !isOrgEnabled) {
			navigate({ to: "/app" });
		}
	}, [isOrgEnabled, isOrgModeLoading, navigate]);

	const handleCreateOrg = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			// TODO: In production, create the organization in WorkOS first via a backend action/HTTP endpoint
			// that calls WorkOS API (https://workos.com/docs/reference/organization/create-organization)
			// and returns the real workosOrgId. For now, we generate a placeholder ID.
			// This should be replaced with: const { workosOrgId } = await createWorkOSOrg({ name: orgName });
			const workosOrgId = `org_local_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;

			const result = await createOrg({
				name: orgName,
				slug,
				workosOrgId,
			});

			if (
				typeof result === "object" &&
				result !== null &&
				"applied" in result &&
				result.applied === false
			) {
				navigate({ to: "/app" });
				return;
			}

			navigate({ to: "/app" });
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to create organization",
			);
			setIsSubmitting(false);
		}
	};

	if (
		authLoading ||
		isOrgModeLoading ||
		(isOrgEnabled && userOrgs === undefined)
	) {
		return (
			<AuthLayout>
				<div className="flex items-center justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
				</div>
			</AuthLayout>
		);
	}

	if (!isOrgEnabled) {
		return (
			<AuthLayout>
				<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
					<CardHeader className="space-y-1 text-center">
						<h1 className="font-bold text-2xl text-white">
							Personal Mode Active
						</h1>
						<p className="text-muted-foreground text-sm">
							Organization onboarding is disabled right now. You&apos;ll
							continue without a workspace.
						</p>
					</CardHeader>
					<CardContent>
						<Button className="w-full" onClick={() => navigate({ to: "/app" })}>
							Continue to App
						</Button>
					</CardContent>
				</Card>
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
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<h1 className="font-bold text-2xl text-white">
						Create your organization
					</h1>
					<p className="text-muted-foreground text-sm">
						Set up your workspace to get started
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* User info */}
					<div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 font-medium text-sm text-white">
							{user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-sm text-white">
								{user?.firstName
									? `${user.firstName} ${user.lastName || ""}`
									: "Welcome"}
							</p>
							<p className="truncate text-xs text-zinc-400">{user?.email}</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => signOut({ returnTo: window.location.origin })}
							className="text-zinc-400 hover:text-white"
						>
							Sign out
						</Button>
					</div>

					<Separator />

					<form onSubmit={handleCreateOrg} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="orgName">Organization Name</Label>
							<Input
								id="orgName"
								type="text"
								placeholder="Acme Inc."
								value={orgName}
								onChange={(e) => setOrgName(e.target.value)}
								required
								minLength={2}
								maxLength={100}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="slug">URL Slug</Label>
							<div className="flex items-center gap-2">
								<span className="text-sm text-zinc-500">app.nexbase.com/</span>
								<Input
									id="slug"
									type="text"
									placeholder="acme"
									value={slug}
									onChange={(e) =>
										setSlug(
											e.target.value
												.toLowerCase()
												.replace(/[^a-z0-9-]/g, "")
												.slice(0, 40),
										)
									}
									required
									minLength={3}
									maxLength={40}
									pattern="[a-z0-9-]+"
									className="flex-1"
								/>
							</div>
							{slug.length >= 3 && (
								<p
									className={`text-xs ${slugAvailable ? "text-emerald-400" : "text-red-400"}`}
								>
									{slugAvailable
										? "This slug is available"
										: "This slug is already taken"}
								</p>
							)}
						</div>

						{error && (
							<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400 text-sm">
								{error}
							</div>
						)}

						<Button
							type="submit"
							className="w-full"
							disabled={
								isSubmitting ||
								!orgName ||
								slug.length < 3 ||
								slugAvailable === false
							}
						>
							{isSubmitting ? (
								<>
									<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
									Creating...
								</>
							) : (
								"Create Organization"
							)}
						</Button>
					</form>

					<div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
						<h3 className="mb-2 font-medium text-sm text-white">
							Have an invite?
						</h3>
						<p className="text-xs text-zinc-400">
							If you were invited to join an existing organization, check your
							email for the invite link.
						</p>
					</div>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
