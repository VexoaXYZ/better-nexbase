import { api } from "@backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/app/_layout/")({
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = useAuth();
	const organizations = useQuery(api.organizations.listForUser);
	const currentOrg =
		organizations?.find((org) => org?.isDefault) ?? organizations?.[0];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="font-bold text-2xl text-white">
					Welcome back
					{user?.firstName ? `, ${user.firstName}` : ""}
				</h1>
				<p className="text-muted-foreground">
					Here&apos;s what&apos;s happening with{" "}
					{currentOrg?.name || "your organization"} today.
				</p>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm text-zinc-400">
							Total Users
						</CardTitle>
						<svg
							className="h-4 w-4 text-zinc-500"
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
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-white">1</div>
						<p className="text-muted-foreground text-xs">Active team members</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm text-zinc-400">
							Projects
						</CardTitle>
						<svg
							className="h-4 w-4 text-zinc-500"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
							/>
						</svg>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-white">0</div>
						<p className="text-muted-foreground text-xs">Active projects</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm text-zinc-400">
							Storage Used
						</CardTitle>
						<svg
							className="h-4 w-4 text-zinc-500"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
							/>
						</svg>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-white">0 MB</div>
						<p className="text-muted-foreground text-xs">Of 5 GB available</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm text-zinc-400">
							API Calls
						</CardTitle>
						<svg
							className="h-4 w-4 text-zinc-500"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
							/>
						</svg>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-white">0</div>
						<p className="text-muted-foreground text-xs">This month</p>
					</CardContent>
				</Card>
			</div>

			{/* Getting Started */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Getting Started</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start gap-4">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
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
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div>
							<p className="font-medium text-sm text-white">
								Create your organization
							</p>
							<p className="text-muted-foreground text-sm">
								You&apos;ve successfully set up your organization.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-4">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-500">
							<span className="font-medium text-sm">2</span>
						</div>
						<div>
							<p className="font-medium text-sm text-white">Invite your team</p>
							<p className="text-muted-foreground text-sm">
								Add team members to collaborate on projects.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-4">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-500">
							<span className="font-medium text-sm">3</span>
						</div>
						<div>
							<p className="font-medium text-sm text-white">
								Create your first project
							</p>
							<p className="text-muted-foreground text-sm">
								Start building something amazing.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
