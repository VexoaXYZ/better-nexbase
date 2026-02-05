import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppLayout } from "@/components/layout";

export const Route = createFileRoute("/app/_layout")({
	component: AppLayoutRoute,
});

function AppLayoutRoute() {
	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
}
