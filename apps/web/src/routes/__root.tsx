import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
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

function BackgroundEffects() {
	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			{/* Grid pattern */}
			<div className="absolute inset-0 bg-grid opacity-50" />

			{/* Gradient orbs */}
			<div
				className="gradient-orb -top-[200px] -left-[200px] h-[600px] w-[600px]"
				style={{
					background:
						"radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
				}}
			/>
			<div
				className="gradient-orb -top-[100px] -right-[300px] h-[800px] w-[800px]"
				style={{
					background:
						"radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
				}}
			/>
			<div
				className="gradient-orb top-[50%] -left-[100px] h-[500px] w-[500px]"
				style={{
					background:
						"radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)",
				}}
			/>

			{/* Noise overlay */}
			<div className="noise absolute inset-0" />

			{/* Vignette */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse at center, transparent 0%, rgba(12,12,14,0.3) 100%)",
				}}
			/>
		</div>
	);
}

function RootComponent() {
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				forcedTheme="dark"
				disableTransitionOnChange
			>
				<div className="relative flex min-h-screen flex-col">
					<BackgroundEffects />
					<Nav />
					<main className="flex-1">
						<Outlet />
					</main>
					<Footer />
				</div>
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
