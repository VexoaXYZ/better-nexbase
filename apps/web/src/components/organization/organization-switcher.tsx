import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface OrganizationSwitcherProps {
	className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
	const navigate = useNavigate();
	const organizations = useQuery(api.organizations.listForUser);
	const setDefaultOrg = useMutation(api.organizations.setDefaultOrganization);
	const [isOpen, setIsOpen] = useState(false);

	const currentOrg =
		organizations?.find((org) => org?.isDefault) ?? organizations?.[0];

	const handleSwitchOrg = async (orgId: Id<"organizations">) => {
		await setDefaultOrg({ organizationId: orgId });
		setIsOpen(false);
		// Navigate to app to ensure clean state with new organization context
		navigate({ to: "/app" });
	};

	const handleCreateOrg = () => {
		setIsOpen(false);
		navigate({ to: "/onboarding/organization" });
	};

	if (!organizations || organizations.length === 0) {
		return null;
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className={cn(
						"flex h-auto w-full items-center justify-between gap-3 px-3 py-2 hover:bg-zinc-800",
						className,
					)}
				>
					<div className="flex items-center gap-3">
						<Avatar className="h-8 w-8">
							{currentOrg?.logoUrl ? (
								<AvatarImage src={currentOrg.logoUrl} alt={currentOrg.name} />
							) : null}
							<AvatarFallback className="bg-zinc-700 text-xs">
								{currentOrg?.name?.slice(0, 2).toUpperCase() || "??"}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col items-start">
							<span className="font-medium text-sm text-white">
								{currentOrg?.name || "Select Organization"}
							</span>
							{currentOrg?.slug && (
								<span className="text-xs text-zinc-500">{currentOrg.slug}</span>
							)}
						</div>
					</div>
					<svg
						className="h-4 w-4 text-zinc-500"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M8 9l4-4 4 4m0 6l-4 4-4-4"
						/>
					</svg>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[280px]"
				align="start"
				side="bottom"
				sideOffset={4}
			>
				<DropdownMenuLabel className="text-xs text-zinc-400">
					Organizations
				</DropdownMenuLabel>
				{organizations.map(
					(org) =>
						org && (
							<DropdownMenuItem
								key={org._id}
								className="flex items-center gap-3 px-2 py-2"
								onClick={() => handleSwitchOrg(org._id)}
							>
								<Avatar className="h-8 w-8">
									{org.logoUrl ? (
										<AvatarImage src={org.logoUrl} alt={org.name} />
									) : null}
									<AvatarFallback className="bg-zinc-700 text-xs">
										{org.name.slice(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-1 flex-col">
									<span className="font-medium text-sm">{org.name}</span>
									<span className="text-xs text-zinc-500">{org.slug}</span>
								</div>
								{org.isDefault && (
									<svg
										className="h-4 w-4 text-emerald-500"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								)}
							</DropdownMenuItem>
						),
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="flex items-center gap-3 px-2 py-2"
					onClick={handleCreateOrg}
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 border-dashed">
						<svg
							className="h-4 w-4 text-zinc-500"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4v16m8-8H4"
							/>
						</svg>
					</div>
					<span className="text-sm text-zinc-400">Create organization</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
