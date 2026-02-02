import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "btn-shine bg-white text-zinc-900 shadow-sm hover:bg-white/90",
				secondary:
					"border border-zinc-700 bg-zinc-800 text-white hover:border-zinc-600 hover:bg-zinc-700",
				ghost: "text-white/70 hover:bg-white/[0.05] hover:text-white",
				outline:
					"border border-zinc-700 bg-transparent text-white hover:border-zinc-600 hover:bg-zinc-800",
				destructive:
					"border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20",
				link: "text-white underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-5 py-2",
				sm: "h-8 px-3 text-xs",
				lg: "h-12 px-8 text-base",
				xl: "h-14 px-10 text-lg",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
