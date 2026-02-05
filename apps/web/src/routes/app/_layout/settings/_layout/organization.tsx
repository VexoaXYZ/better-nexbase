import { api } from "@backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useOrgMode } from "@/hooks/use-org-mode";

export const Route = createFileRoute(
	"/app/_layout/settings/_layout/organization",
)({
	component: OrganizationSettingsPage,
});

function OrganizationSettingsPage() {
	const { isLoading: isOrgModeLoading, isOrgEnabled } = useOrgMode();
	const organizations = useQuery(
		api.organizations.listForUser,
		isOrgEnabled ? {} : "skip",
	);
	const currentOrg = organizations?.find((org) => org?.isDefault);

	const updateOrg = useMutation(api.organizations.update);
	const slugAvailable = useQuery(
		api.organizations.checkSlugAvailable,
		currentOrg?.slug ? { slug: currentOrg.slug } : "skip",
	);

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	// Initialize form values when org loads
	useEffect(() => {
		if (currentOrg) {
			setName(currentOrg.name);
			setSlug(currentOrg.slug);
		}
	}, [currentOrg]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentOrg) return;

		setIsSaving(true);
		setMessage(null);

		try {
			await updateOrg({
				organizationId: currentOrg._id,
				name,
				slug,
			});
			setMessage({
				type: "success",
				text: "Organization settings updated successfully",
			});
		} catch (err) {
			setMessage({
				type: "error",
				text:
					err instanceof Error
						? err.message
						: "Failed to update organization settings",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const canEdit =
		currentOrg?.membership &&
		["owner", "admin"].includes(currentOrg.membership.role);

	if (isOrgModeLoading || (isOrgEnabled && organizations === undefined)) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
			</div>
		);
	}

	if (!isOrgEnabled) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Organization Settings Unavailable</CardTitle>
					<CardDescription>
						Organization mode is currently disabled. Re-enable org mode to edit
						workspace settings.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (!currentOrg) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>No Organization Selected</CardTitle>
					<CardDescription>
						Create or join an organization to manage organization settings.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild>
						<Link to="/onboarding/organization">Create Organization</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Organization Info */}
			<Card>
				<CardHeader>
					<CardTitle>Organization Settings</CardTitle>
					<CardDescription>
						Manage your organization&apos;s details and branding.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSave} className="space-y-6">
						{/* Logo */}
						<div className="flex items-center gap-4">
							<Avatar className="h-20 w-20">
								{currentOrg.logoUrl ? (
									<AvatarImage src={currentOrg.logoUrl} alt={currentOrg.name} />
								) : null}
								<AvatarFallback className="bg-zinc-700 text-lg">
									{currentOrg.name.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium text-sm text-white">
									Organization Logo
								</p>
								<p className="text-muted-foreground text-xs">
									Upload a logo to represent your organization.
								</p>
								{canEdit && (
									<Button
										variant="secondary"
										size="sm"
										className="mt-2"
										type="button"
										disabled
									>
										Upload Logo
									</Button>
								)}
							</div>
						</div>

						<Separator />

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="orgName">Organization Name</Label>
								<Input
									id="orgName"
									type="text"
									placeholder="Acme Inc."
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={!canEdit}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="slug">URL Slug</Label>
								<div className="flex items-center gap-2">
									<span className="text-sm text-zinc-500">
										app.nexbase.com/
									</span>
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
										disabled={!canEdit}
										required
										className="flex-1"
									/>
								</div>
								{slug !== currentOrg.slug && slug.length >= 3 && (
									<p
										className={`text-xs ${slugAvailable ? "text-emerald-400" : "text-red-400"}`}
									>
										{slugAvailable
											? "This slug is available"
											: "This slug is already taken"}
									</p>
								)}
							</div>
						</div>

						{!canEdit && (
							<div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-400 text-sm">
								You need admin or owner access to edit organization settings.
							</div>
						)}

						{message && (
							<div
								className={`rounded-lg border p-3 text-sm ${
									message.type === "success"
										? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
										: "border-red-500/20 bg-red-500/10 text-red-400"
								}`}
							>
								{message.text}
							</div>
						)}

						{canEdit && (
							<div className="flex justify-end">
								<Button type="submit" disabled={isSaving}>
									{isSaving ? (
										<>
											<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</div>
						)}
					</form>
				</CardContent>
			</Card>

			{/* Organization ID */}
			<Card>
				<CardHeader>
					<CardTitle>Organization ID</CardTitle>
					<CardDescription>
						Unique identifier for your organization.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<p className="font-medium text-sm text-zinc-400">Internal ID</p>
							<p className="mt-1 font-mono text-sm text-white">
								{currentOrg._id}
							</p>
						</div>
						<div>
							<p className="font-medium text-sm text-zinc-400">
								WorkOS Organization ID
							</p>
							<p className="mt-1 font-mono text-sm text-white">
								{currentOrg.workosOrgId}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Danger Zone */}
			{currentOrg.membership?.role === "owner" && (
				<Card className="border-red-500/20">
					<CardHeader>
						<CardTitle className="text-red-400">Danger Zone</CardTitle>
						<CardDescription>
							Irreversible and destructive actions.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
							<div>
								<p className="font-medium text-sm text-white">
									Delete Organization
								</p>
								<p className="text-muted-foreground text-sm">
									Permanently delete this organization and all its data.
								</p>
							</div>
							<Button variant="destructive" disabled>
								Delete Organization
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
