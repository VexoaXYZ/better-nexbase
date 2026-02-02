import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_CONVEX_URL: z.string().url(),
		VITE_WORKOS_CLIENT_ID: z.string().min(1),
		VITE_WORKOS_REDIRECT_URI: z.string().url(),
	},
	// biome-ignore lint/suspicious/noExplicitAny: Vite import.meta.env typing
	runtimeEnv: (import.meta as any).env,
	emptyStringAsUndefined: true,
});
