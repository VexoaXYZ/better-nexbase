import { api } from "@backend/convex/_generated/api";
import { env } from "@better-nexbase/env/web";
import { ConvexProviderWithAuthKit } from "@convex-dev/workos";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react";
import { AutumnProvider } from "autumn-js/react";
import { ConvexReactClient, useConvex } from "convex/react";
import ReactDOM from "react-dom/client";

import { routeTree } from "./routeTree.gen";

const convex = new ConvexReactClient(env.VITE_CONVEX_URL);

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	context: {},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function AutumnWrapper({ children }: { children: React.ReactNode }) {
	const convexClient = useConvex();
	return (
		<AutumnProvider convex={convexClient} convexApi={api.autumn}>
			{children}
		</AutumnProvider>
	);
}

function App() {
	return (
		<AuthKitProvider
			clientId={env.VITE_WORKOS_CLIENT_ID}
			redirectUri={env.VITE_WORKOS_REDIRECT_URI}
		>
			<ConvexProviderWithAuthKit client={convex} useAuth={useAuth}>
				<AutumnWrapper>
					<RouterProvider router={router} />
				</AutumnWrapper>
			</ConvexProviderWithAuthKit>
		</AuthKitProvider>
	);
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<App />);
}
