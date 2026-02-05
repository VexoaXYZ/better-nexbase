import { z } from "zod";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const APP_CONFIG_KEY = "default";
const CONFIG_CACHE_TTL_MS = 2_000;

const orgFeatureFlagsSchema = z.object({
	rbacStrict: z.boolean(),
	billingEnforcement: z.boolean(),
	inviteEmails: z.boolean(),
	hardLocking: z.boolean(),
	workosMirrorWrites: z.boolean(),
});

const appConfigSchema = z.object({
	configVersion: z.literal(1),
	org: z.object({
		enabled: z.boolean(),
		features: orgFeatureFlagsSchema,
	}),
});

const appConfigOverlaySchema = z.object({
	configVersion: z.number().optional(),
	org: z
		.object({
			enabled: z.boolean().optional(),
			features: orgFeatureFlagsSchema.partial().optional(),
		})
		.optional(),
});

export type AppConfig = z.infer<typeof appConfigSchema>;
export type AppConfigOverlay = z.infer<typeof appConfigOverlaySchema>;
export type OrgFeatureFlag = keyof AppConfig["org"]["features"];

type ConfigReaderCtx = Pick<QueryCtx | MutationCtx, "db">;

let configCache: {
	value: AppConfig;
	expiresAt: number;
} | null = null;

function parseBooleanEnv(
	value: string | undefined,
	fallback: boolean,
): boolean {
	if (value === undefined) return fallback;
	if (value === "1" || value.toLowerCase() === "true") return true;
	if (value === "0" || value.toLowerCase() === "false") return false;
	return fallback;
}

export const defaultAppConfig: AppConfig = {
	configVersion: 1,
	org: {
		enabled: parseBooleanEnv(process.env.ORG_ENABLED, true),
		features: {
			rbacStrict: parseBooleanEnv(process.env.ORG_FEATURE_RBAC_STRICT, true),
			billingEnforcement: parseBooleanEnv(
				process.env.ORG_FEATURE_BILLING_ENFORCEMENT,
				false,
			),
			inviteEmails: parseBooleanEnv(
				process.env.ORG_FEATURE_INVITE_EMAILS,
				false,
			),
			hardLocking: parseBooleanEnv(process.env.ORG_FEATURE_HARD_LOCKING, false),
			workosMirrorWrites: parseBooleanEnv(
				process.env.ORG_FEATURE_WORKOS_MIRROR_WRITES,
				false,
			),
		},
	},
};

function mergeConfig(
	base: AppConfig,
	overlay?: AppConfigOverlay | null,
): AppConfig {
	// Emergency behavior: env-level disable always wins over runtime overrides.
	const enabledFromOverlay = overlay?.org?.enabled ?? base.org.enabled;
	const orgEnabled = base.org.enabled ? enabledFromOverlay : false;

	const merged: AppConfig = {
		configVersion: base.configVersion,
		org: {
			enabled: orgEnabled,
			features: {
				rbacStrict:
					overlay?.org?.features?.rbacStrict ?? base.org.features.rbacStrict,
				billingEnforcement:
					overlay?.org?.features?.billingEnforcement ??
					base.org.features.billingEnforcement,
				inviteEmails:
					overlay?.org?.features?.inviteEmails ??
					base.org.features.inviteEmails,
				hardLocking:
					overlay?.org?.features?.hardLocking ?? base.org.features.hardLocking,
				workosMirrorWrites:
					overlay?.org?.features?.workosMirrorWrites ??
					base.org.features.workosMirrorWrites,
			},
		},
	};

	const parsed = appConfigSchema.safeParse(merged);
	return parsed.success ? parsed.data : base;
}

export async function getAppConfig(ctx: ConfigReaderCtx): Promise<AppConfig> {
	const now = Date.now();
	if (configCache && configCache.expiresAt > now) {
		return configCache.value;
	}

	const configDoc = await ctx.db
		.query("appConfigs")
		.withIndex("by_key", (q) => q.eq("key", APP_CONFIG_KEY))
		.unique();

	const overlayResult = appConfigOverlaySchema.safeParse(configDoc);
	const merged = mergeConfig(
		defaultAppConfig,
		overlayResult.success ? overlayResult.data : null,
	);

	configCache = {
		value: merged,
		expiresAt: now + CONFIG_CACHE_TTL_MS,
	};

	return merged;
}

export function isOrgEnabled(config: AppConfig): boolean {
	return config.org.enabled;
}

export function isFeatureEnabled(
	config: AppConfig,
	feature: OrgFeatureFlag,
): boolean {
	return config.org.features[feature];
}

export async function upsertAppConfig(
	ctx: MutationCtx,
	config: AppConfig,
	updatedBy?: Id<"users">,
) {
	const existing = await ctx.db
		.query("appConfigs")
		.withIndex("by_key", (q) => q.eq("key", APP_CONFIG_KEY))
		.unique();

	const now = Date.now();
	if (existing) {
		await ctx.db.patch(existing._id, {
			configVersion: config.configVersion,
			org: config.org,
			updatedAt: now,
			updatedBy,
		});
		invalidateAppConfigCache();
		return existing._id;
	}

	const inserted = await ctx.db.insert("appConfigs", {
		key: APP_CONFIG_KEY,
		configVersion: config.configVersion,
		org: config.org,
		updatedAt: now,
		updatedBy,
	});
	invalidateAppConfigCache();
	return inserted;
}

export function applyConfigOverlay(
	currentConfig: AppConfig,
	overlay: AppConfigOverlay,
): AppConfig {
	return mergeConfig(currentConfig, overlay);
}

export function invalidateAppConfigCache() {
	configCache = null;
}
