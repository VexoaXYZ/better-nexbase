import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full px-3 py-1 font-medium text-xs transition-colors",
	{
		variants: {
			variant: {
				default: "border border-white/10 bg-white/10 text-white",
				secondary: "border border-zinc-700 bg-zinc-800 text-zinc-300",
				success:
					"border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
				warning: "border border-amber-500/20 bg-amber-500/10 text-amber-400",
				destructive: "border border-red-500/20 bg-red-500/10 text-red-400",
				outline: "border border-zinc-700 text-zinc-300",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
