import { api } from "@backend/convex/_generated/api";
import { useQuery } from "convex/react";

export function useOrgMode() {
	const appConfig = useQuery(api.appConfig.get);
	const isLoading = appConfig === undefined;
	const isOrgEnabled = appConfig?.org.enabled ?? true;

	return {
		appConfig,
		isLoading,
		isOrgEnabled,
	};
}
