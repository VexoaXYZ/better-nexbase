import { AuthKit } from "@convex-dev/workos-authkit";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

export const authKit = new AuthKit<DataModel>(components.workOSAuthKit);

// Re-export for use in queries/mutations
export const getAuthUser = authKit.getAuthUser.bind(authKit);
