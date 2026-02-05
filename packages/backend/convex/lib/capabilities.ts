export type MembershipRole = "owner" | "admin" | "member";

export const ORG_CAPABILITIES = {
	ORG_READ: "org:read",
	ORG_SETTINGS_MANAGE: "org:settings.manage",
	ORG_MEMBERS_MANAGE: "org:members.manage",
	ORG_BILLING_MANAGE: "org:billing.manage",
	ORG_CONFIG_MANAGE: "org:config.manage",
} as const;

export type OrgCapability =
	(typeof ORG_CAPABILITIES)[keyof typeof ORG_CAPABILITIES];

const roleCapabilityMap: Record<MembershipRole, readonly OrgCapability[]> = {
	owner: [
		ORG_CAPABILITIES.ORG_READ,
		ORG_CAPABILITIES.ORG_SETTINGS_MANAGE,
		ORG_CAPABILITIES.ORG_MEMBERS_MANAGE,
		ORG_CAPABILITIES.ORG_BILLING_MANAGE,
		ORG_CAPABILITIES.ORG_CONFIG_MANAGE,
	],
	admin: [
		ORG_CAPABILITIES.ORG_READ,
		ORG_CAPABILITIES.ORG_SETTINGS_MANAGE,
		ORG_CAPABILITIES.ORG_MEMBERS_MANAGE,
	],
	member: [ORG_CAPABILITIES.ORG_READ],
};

export function getCapabilitiesForRole(
	role: MembershipRole,
): readonly OrgCapability[] {
	return roleCapabilityMap[role];
}

export function hasCapability(
	role: MembershipRole,
	capability: OrgCapability,
): boolean {
	return roleCapabilityMap[role].includes(capability);
}
