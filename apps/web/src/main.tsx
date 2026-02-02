import { env } from "@better-nexbase/env/web";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import ReactDOM from "react-dom/client";

import { routeTree } from "./routeTree.gen";

const convex = new ConvexReactClient(env.VITE_CONVEX_URL);

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	context: {},
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return <ConvexProvider client={convex}>{children}</ConvexProvider>;
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
