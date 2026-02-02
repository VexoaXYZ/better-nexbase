import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "better-nexbase",
			},
			{
				name: "description",
				content: "better-nexbase is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				forcedTheme="dark"
				disableTransitionOnChange
			>
				<div className="h-svh">
					<Outlet />
				</div>
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
