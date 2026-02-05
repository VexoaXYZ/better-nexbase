import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";

import { useOrgMode } from "@/hooks/use-org-mode";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_layout/settings/_layout")({
	component: SettingsLayoutRoute,
});

const settingsTabs = [
	{ name: "Profile", href: "/app/settings/profile" },
	{ name: "Organization", href: "/app/settings/organization" },
	{ name: "Members", href: "/app/settings/members" },
];

function SettingsLayoutRoute() {
	const location = useLocation();
	const { isOrgEnabled } = useOrgMode();

	const visibleTabs = isOrgEnabled
		? settingsTabs
		: settingsTabs.filter(
				(tab) =>
					tab.href !== "/app/settings/organization" &&
					tab.href !== "/app/settings/members",
			);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-2xl text-white">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account and organization settings.
				</p>
			</div>

			{/* Tabs */}
			<div className="border-zinc-800 border-b">
				<nav className="-mb-px flex gap-6">
					{visibleTabs.map((tab) => (
						<Link
							key={tab.href}
							to={tab.href}
							className={cn(
								"border-b-2 pb-3 font-medium text-sm transition-colors",
								location.pathname === tab.href
									? "border-white text-white"
									: "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300",
							)}
						>
							{tab.name}
						</Link>
					))}
				</nav>
			</div>

			<Outlet />
		</div>
	);
}
