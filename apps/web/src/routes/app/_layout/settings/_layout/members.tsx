import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { InviteMemberDialog, MembersList } from "@/components/organization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useOrgMode } from "@/hooks/use-org-mode";

export const Route = createFileRoute("/app/_layout/settings/_layout/members")({
	component: MembersSettingsPage,
});

function MembersSettingsPage() {
	const { isLoading: isOrgModeLoading, isOrgEnabled } = useOrgMode();
	const organizations = useQuery(
		api.organizations.listForUser,
		isOrgEnabled ? {} : "skip",
	);
	const currentOrg =
		organizations?.find((org) => org?.isDefault) ?? organizations?.[0];

	const invitations = useQuery(
		api.members.listInvitations,
		currentOrg ? { organizationId: currentOrg._id } : "skip",
	);
	const cancelInvitation = useMutation(api.members.cancelInvitation);

	const canManageMembers =
		currentOrg?.membership &&
		["owner", "admin"].includes(currentOrg.membership.role);

	const handleCancelInvitation = async (
		invitationId: Id<"organizationInvitations">,
	) => {
		if (!confirm("Are you sure you want to cancel this invitation?")) {
			return;
		}
		try {
			await cancelInvitation({ invitationId });
		} catch (error) {
			console.error("Failed to cancel invitation:", error);
		}
	};

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
					<CardTitle>Team Management Unavailable</CardTitle>
					<CardDescription>
						Organization mode is currently disabled. Enable org mode to manage
						members and invitations.
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
						Create or join an organization to manage team members.
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
			{/* Members List */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Team Members</CardTitle>
						<CardDescription>
							Manage who has access to this organization.
						</CardDescription>
					</div>
					{canManageMembers && (
						<InviteMemberDialog organizationId={currentOrg._id} />
					)}
				</CardHeader>
				<CardContent>
					<MembersList organizationId={currentOrg._id} />
				</CardContent>
			</Card>

			{/* Pending Invitations */}
			{canManageMembers && invitations && invitations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Pending Invitations</CardTitle>
						<CardDescription>
							Invitations that haven&apos;t been accepted yet.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="divide-y divide-zinc-800">
							{invitations.map((invitation) => (
								<div
									key={invitation._id}
									className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm text-white">
											{invitation.email}
										</p>
										<div className="mt-1 flex items-center gap-2">
											<Badge variant="outline" className="capitalize">
												{invitation.role}
											</Badge>
											<span className="text-xs text-zinc-500">
												Invited by{" "}
												{invitation.invitedByUser?.name ||
													invitation.invitedByUser?.email ||
													"Unknown"}
											</span>
											<span className="text-xs text-zinc-500">
												Expires{" "}
												{new Date(invitation.expiresAt).toLocaleDateString()}
											</span>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
										onClick={() => handleCancelInvitation(invitation._id)}
									>
										Cancel
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Role Descriptions */}
			<Card>
				<CardHeader>
					<CardTitle>Roles & Permissions</CardTitle>
					<CardDescription>
						Understanding what each role can do.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-start gap-4">
							<Badge variant="default" className="mt-0.5">
								Owner
							</Badge>
							<div>
								<p className="font-medium text-sm text-white">Full Access</p>
								<p className="text-muted-foreground text-sm">
									Can manage all aspects of the organization including billing,
									settings, and can delete the organization.
								</p>
							</div>
						</div>
						<div className="flex items-start gap-4">
							<Badge variant="secondary" className="mt-0.5">
								Admin
							</Badge>
							<div>
								<p className="font-medium text-sm text-white">
									Manage Members & Settings
								</p>
								<p className="text-muted-foreground text-sm">
									Can invite and remove members, change roles, and update
									organization settings.
								</p>
							</div>
						</div>
						<div className="flex items-start gap-4">
							<Badge variant="outline" className="mt-0.5">
								Member
							</Badge>
							<div>
								<p className="font-medium text-sm text-white">
									Access Resources
								</p>
								<p className="text-muted-foreground text-sm">
									Can access organization resources and projects but cannot
									manage members or settings.
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
