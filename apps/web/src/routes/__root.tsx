import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

// biome-ignore lint/complexity/noBannedTypes: TanStack Router requires this empty type for context extension
export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Nexbase - Modern SaaS Boilerplate",
			},
			{
				name: "description",
				content:
					"The modern SaaS boilerplate for building production-ready applications with React, Convex, and TypeScript.",
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

// Routes that should NOT show the landing page Nav/Footer
const noLandingLayoutRoutes = [
	"/auth",
	"/app",
	"/onboarding",
	"/invite",
	"/callback",
];

function BackgroundEffects() {
	return null;
}

function RootComponent() {
	const location = useLocation();
	const showLandingLayout = !noLandingLayoutRoutes.some((route) =>
		location.pathname.startsWith(route),
	);

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				forcedTheme="dark"
				disableTransitionOnChange
			>
				{showLandingLayout ? (
					<div className="relative flex min-h-screen flex-col">
						<BackgroundEffects />
						<Nav />
						<main className="flex-1">
							<Outlet />
						</main>
						<Footer />
					</div>
				) : (
					<Outlet />
				)}
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
