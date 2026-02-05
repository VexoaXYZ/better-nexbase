import { RequireAuth, RequireOrganization } from "@/components/auth";
import { Sidebar } from "./sidebar";

interface AppLayoutProps {
	children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<RequireAuth>
			<RequireOrganization>
				<div className="flex h-screen bg-background">
					<Sidebar />
					<main className="flex-1 overflow-y-auto">
						<div className="p-6">{children}</div>
					</main>
				</div>
			</RequireOrganization>
		</RequireAuth>
	);
}
