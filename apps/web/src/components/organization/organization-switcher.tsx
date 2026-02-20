import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface OrganizationSwitcherProps {
	className?: string;
}

function OrgAvatar({
	name,
	logoUrl,
	size = "sm",
}: {
	name: string;
	logoUrl?: string | null;
	size?: "sm" | "md";
}) {
	const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
	const text = size === "sm" ? "text-[10px]" : "text-xs";

	if (logoUrl) {
		return (
			<img
				src={logoUrl}
				alt={name}
				className={cn(dim, "shrink-0 rounded-lg object-cover")}
			/>
		);
	}

	return (
		<div
			className={cn(
				dim,
				text,
				"flex shrink-0 select-none items-center justify-center rounded-lg bg-white/[0.07] font-semibold text-zinc-400",
			)}
		>
			{name.slice(0, 2).toUpperCase()}
		</div>
	);
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
	const navigate = useNavigate();
	const organizations = useQuery(api.organizations.listForUser);
	const pendingInvitations = useQuery(
		api.members.listPendingInvitationsForUser,
	);
	const setDefaultOrg = useMutation(api.organizations.setDefaultOrganization);
	const [isOpen, setIsOpen] = useState(false);

	const currentOrg =
		organizations?.find((org) => org?.isDefault) ?? organizations?.[0];

	const hasPendingInvites = pendingInvitations && pendingInvitations.length > 0;

	const handleSwitchOrg = async (orgId: Id<"organizations">) => {
		await setDefaultOrg({ organizationId: orgId });
		setIsOpen(false);
		navigate({ to: "/app" });
	};

	const handleCreateOrg = () => {
		setIsOpen(false);
		navigate({ to: "/onboarding/organization", search: { new: true } });
	};

	const handleInviteClick = (token: string) => {
		setIsOpen(false);
		navigate({ to: "/invite/$token", params: { token } });
	};

	if (!organizations || organizations.length === 0) {
		return null;
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						"group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150",
						"hover:bg-white/[0.04] focus-visible:bg-white/[0.04]",
						"outline-none focus-visible:ring-1 focus-visible:ring-white/10",
						isOpen && "bg-white/[0.04]",
						className,
					)}
				>
					<div className="relative">
						<OrgAvatar
							name={currentOrg?.name ?? ""}
							logoUrl={currentOrg?.logoUrl}
						/>
						{hasPendingInvites && (
							<span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
							</span>
						)}
					</div>
					<span className="min-w-0 flex-1 truncate font-medium text-[13px] text-zinc-200">
						{currentOrg?.name || "Select Organization"}
					</span>
					<svg
						className={cn(
							"h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform duration-200",
							isOpen && "rotate-180",
						)}
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M19.5 8.25l-7.5 7.5-7.5-7.5"
						/>
					</svg>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px]"
				align="start"
				side="bottom"
				sideOffset={6}
			>
				{/* Organization list */}
				<div className="px-1 py-1">
					{organizations.map(
						(org) =>
							org && (
								<DropdownMenuItem
									key={org._id}
									className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
									onClick={() => handleSwitchOrg(org._id)}
								>
									<OrgAvatar name={org.name} logoUrl={org.logoUrl} size="md" />
									<span className="min-w-0 flex-1 truncate font-medium text-[13px]">
										{org.name}
									</span>
									{org.isDefault && (
										<svg
											className="h-3.5 w-3.5 shrink-0 text-zinc-500"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.5"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M4.5 12.75l6 6 9-13.5"
											/>
										</svg>
									)}
								</DropdownMenuItem>
							),
					)}
				</div>

				{/* Pending invitations */}
				{hasPendingInvites && (
					<>
						<DropdownMenuSeparator />
						<div className="px-1 py-1">
							<p className="px-2 pb-1 font-medium text-[11px] text-zinc-500 uppercase tracking-wide">
								Invitations
							</p>
							{pendingInvitations.map((invitation) => (
								<DropdownMenuItem
									key={invitation.token}
									className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
									onClick={() => handleInviteClick(invitation.token)}
								>
									<OrgAvatar
										name={invitation.organizationName}
										logoUrl={invitation.organizationLogoUrl}
										size="md"
									/>
									<div className="flex min-w-0 flex-1 flex-col">
										<span className="truncate font-medium text-[13px]">
											{invitation.organizationName}
										</span>
										<span className="text-[11px] text-zinc-500 capitalize">
											{invitation.role}
										</span>
									</div>
									<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
								</DropdownMenuItem>
							))}
						</div>
					</>
				)}

				{/* Create org */}
				<DropdownMenuSeparator />
				<div className="px-1 py-1">
					<DropdownMenuItem
						className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-zinc-500"
						onClick={handleCreateOrg}
					>
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700/80 border-dashed">
							<svg
								className="h-3.5 w-3.5"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 4.5v15m7.5-7.5h-15"
								/>
							</svg>
						</div>
						<span className="font-medium text-[13px]">New organization</span>
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
