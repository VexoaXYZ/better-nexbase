import type * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: "default" | "sm" | "lg" | "full";
}

function Container({
	className,
	size = "default",
	children,
	...props
}: ContainerProps) {
	return (
		<div
			className={cn(
				"mx-auto w-full px-4 sm:px-6 lg:px-8",
				{
					"max-w-5xl": size === "sm",
					"max-w-6xl": size === "default",
					"max-w-7xl": size === "lg",
					"max-w-none": size === "full",
				},
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export { Container };
