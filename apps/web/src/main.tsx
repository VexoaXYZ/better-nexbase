import { env } from "@better-nexbase/env/web";
import { ConvexProviderWithAuthKit } from "@convex-dev/workos";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react";
import { ConvexReactClient } from "convex/react";
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

function App() {
	return (
		<AuthKitProvider
			clientId={env.VITE_WORKOS_CLIENT_ID}
			redirectUri={env.VITE_WORKOS_REDIRECT_URI}
		>
			<ConvexProviderWithAuthKit client={convex} useAuth={useAuth}>
				<RouterProvider router={router} />
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
