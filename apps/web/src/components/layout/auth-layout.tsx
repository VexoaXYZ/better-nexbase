import type * as React from "react";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="relative flex min-h-screen items-center justify-center p-4">
			{/* Background effects */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				<div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-white/[0.02] blur-3xl" />
				<div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-white/[0.02] blur-3xl" />
			</div>

			{/* Content */}
			<div className="relative w-full max-w-md">{children}</div>

			{/* Footer */}
			<div className="fixed right-0 bottom-4 left-0 text-center">
				<p className="text-xs text-zinc-500">
					Powered by <span className="font-medium text-zinc-400">Nexbase</span>
				</p>
			</div>
		</div>
	);
}
