import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoleBadgeProps extends Omit<BadgeProps, "variant"> {
	role: "owner" | "admin" | "member" | string;
}

const roleConfig: Record<
	string,
	{ label: string; variant: BadgeProps["variant"] }
> = {
	owner: { label: "Owner", variant: "default" },
	admin: { label: "Admin", variant: "secondary" },
	member: { label: "Member", variant: "outline" },
};

export function RoleBadge({ role, className, ...props }: RoleBadgeProps) {
	const config = roleConfig[role] || {
		label: role,
		variant: "outline" as const,
	};

	return (
		<Badge
			variant={config.variant}
			className={cn("capitalize", className)}
			{...props}
		>
			{config.label}
		</Badge>
	);
}
