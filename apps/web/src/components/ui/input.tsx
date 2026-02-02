import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-white transition-colors duration-200 placeholder:text-zinc-500",
					"focus:border-zinc-600 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-white/10",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"file:border-0 file:bg-transparent file:font-medium file:text-sm",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
