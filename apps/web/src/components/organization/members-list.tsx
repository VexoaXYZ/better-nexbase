import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { RoleBadge } from "./role-badge";

interface MembersListProps {
	organizationId: Id<"organizations">;
}

export function MembersList({ organizationId }: MembersListProps) {
	const members = useQuery(api.members.list, { organizationId });
	const currentMembership = useQuery(api.members.getMembership, {
		organizationId,
	});
	const updateRole = useMutation(api.members.updateRole);
	const removeMember = useMutation(api.members.remove);

	const [isUpdating, setIsUpdating] = useState<string | null>(null);

	const canManageMembers =
		currentMembership &&
		currentMembership.status === "active" &&
		["owner", "admin"].includes(currentMembership.role);

	const handleRoleChange = async (
		memberId: Id<"organizationMembers">,
		newRole: "owner" | "admin" | "member",
	) => {
		setIsUpdating(memberId);
		try {
			await updateRole({ memberId, role: newRole });
		} catch (error) {
			console.error("Failed to update role:", error);
		} finally {
			setIsUpdating(null);
		}
	};

	const handleRemoveMember = async (memberId: Id<"organizationMembers">) => {
		if (
			!confirm(
				"Are you sure you want to remove this member from the organization?",
			)
		) {
			return;
		}
		setIsUpdating(memberId);
		try {
			await removeMember({ memberId });
		} catch (error) {
			console.error("Failed to remove member:", error);
		} finally {
			setIsUpdating(null);
		}
	};

	if (!members) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
			</div>
		);
	}

	if (members.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-zinc-500">No members found</p>
			</div>
		);
	}

	return (
		<div className="divide-y divide-zinc-800">
			{members.map(
				(member) =>
					member && (
						<div
							key={member._id}
							className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
						>
							<Avatar className="h-10 w-10">
								{member.user.profileImageUrl ? (
									<AvatarImage
										src={member.user.profileImageUrl}
										alt={member.user.name || member.user.email}
									/>
								) : null}
								<AvatarFallback className="bg-zinc-700">
									{member.user.name?.[0] || member.user.email[0].toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-sm text-white">
									{member.user.name || "Unnamed User"}
								</p>
								<p className="truncate text-xs text-zinc-500">
									{member.user.email}
								</p>
							</div>
							<div className="flex items-center gap-2">
								{canManageMembers &&
								member.role !== "owner" &&
								member._id !== currentMembership?._id ? (
									<Select
										value={member.role}
										onValueChange={(value) =>
											handleRoleChange(
												member._id,
												value as "owner" | "admin" | "member",
											)
										}
										disabled={isUpdating === member._id}
									>
										<SelectTrigger className="w-[110px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="member">Member</SelectItem>
										</SelectContent>
									</Select>
								) : (
									<RoleBadge role={member.role} />
								)}

								{canManageMembers && member._id !== currentMembership?._id && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												disabled={isUpdating === member._id}
											>
												<svg
													className="h-4 w-4"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
													/>
												</svg>
												<span className="sr-only">Member actions</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
												onClick={() => handleRemoveMember(member._id)}
											>
												<svg
													className="mr-2 h-4 w-4"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
												Remove member
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						</div>
					),
			)}
		</div>
	);
}
