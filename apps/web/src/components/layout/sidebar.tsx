import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";

import { OrganizationSwitcher } from "@/components/organization";
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
import { Separator } from "@/components/ui/separator";
import { useOrgMode } from "@/hooks/use-org-mode";
import { cn } from "@/lib/utils";

const navigation = [
	{
		name: "Dashboard",
		href: "/app",
		icon: (
			<svg
				className="h-5 w-5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
				/>
			</svg>
		),
	},
];

const settingsNavigation = [
	{
		name: "Profile",
		href: "/app/settings/profile",
		icon: (
			<svg
				className="h-5 w-5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
				/>
			</svg>
		),
	},
	{
		name: "Organization",
		href: "/app/settings/organization",
		icon: (
			<svg
				className="h-5 w-5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
				/>
			</svg>
		),
	},
	{
		name: "Members",
		href: "/app/settings/members",
		icon: (
			<svg
				className="h-5 w-5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
				/>
			</svg>
		),
	},
];

export function Sidebar() {
	const { user, signOut } = useAuth();
	const location = useLocation();
	const { isOrgEnabled } = useOrgMode();

	const visibleSettingsNavigation = isOrgEnabled
		? settingsNavigation
		: settingsNavigation.filter(
				(item) =>
					item.href !== "/app/settings/organization" &&
					item.href !== "/app/settings/members",
			);

	const isActive = (href: string) => {
		if (href === "/app") {
			return location.pathname === "/app";
		}
		return location.pathname.startsWith(href);
	};

	return (
		<aside className="flex h-screen w-64 flex-col border-zinc-800 border-r bg-sidebar">
			{/* Organization Switcher */}
			{isOrgEnabled && (
				<div className="border-zinc-800 border-b p-3">
					<OrganizationSwitcher />
				</div>
			)}

			{/* Navigation */}
			<nav className="flex-1 space-y-1 overflow-y-auto p-3">
				<div className="space-y-1">
					{navigation.map((item) => (
						<Link
							key={item.name}
							to={item.href}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
								isActive(item.href)
									? "bg-zinc-800 text-white"
									: "text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
							)}
						>
							{item.icon}
							{item.name}
						</Link>
					))}
				</div>

				<Separator className="my-4" />

				<div className="space-y-1">
					<p className="mb-2 px-3 font-medium text-xs text-zinc-500">
						Settings
					</p>
					{visibleSettingsNavigation.map((item) => (
						<Link
							key={item.name}
							to={item.href}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
								isActive(item.href)
									? "bg-zinc-800 text-white"
									: "text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
							)}
						>
							{item.icon}
							{item.name}
						</Link>
					))}
				</div>
			</nav>

			{/* User Menu */}
			<div className="border-zinc-800 border-t p-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="flex h-auto w-full items-center justify-start gap-3 px-3 py-2 hover:bg-zinc-800"
						>
							<Avatar className="h-8 w-8">
								{user?.profilePictureUrl ? (
									<AvatarImage
										src={user.profilePictureUrl}
										alt={user.firstName || user.email || "User"}
									/>
								) : null}
								<AvatarFallback className="bg-zinc-700 text-xs">
									{user?.firstName?.[0] ||
										user?.email?.[0]?.toUpperCase() ||
										"?"}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-1 flex-col items-start">
								<span className="font-medium text-sm text-white">
									{user?.firstName
										? `${user.firstName} ${user.lastName || ""}`
										: "User"}
								</span>
								<span className="truncate text-xs text-zinc-500">
									{user?.email}
								</span>
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-56"
						align="end"
						side="top"
						sideOffset={8}
					>
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col space-y-1">
								<p className="font-medium text-sm leading-none">
									{user?.firstName
										? `${user.firstName} ${user.lastName || ""}`
										: "User"}
								</p>
								<p className="text-muted-foreground text-xs leading-none">
									{user?.email}
								</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link to="/app/settings/profile">
								<svg
									className="mr-2 h-4 w-4"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
									/>
								</svg>
								Profile Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
							onClick={() => signOut({ returnTo: window.location.origin })}
						>
							<svg
								className="mr-2 h-4 w-4"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
								/>
							</svg>
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</aside>
	);
}
