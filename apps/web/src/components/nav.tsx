import { Link } from "@tanstack/react-router";
import * as React from "react";
import { cn } from "@/lib/utils";
import { AuthButton } from "./auth-button";

const navLinks = [
	{ href: "#features", label: "Features" },
	{ href: "#pricing", label: "Pricing" },
	{ href: "#docs", label: "Docs" },
];

function Nav() {
	const [isOpen, setIsOpen] = React.useState(false);
	const [scrolled, setScrolled] = React.useState(false);

	React.useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			<nav className="fixed top-0 right-0 left-0 z-50 flex justify-center px-4 pt-4">
				<div
					className={cn(
						"flex items-center gap-1 rounded-full border border-white/[0.08] px-2 py-1.5 backdrop-blur-xl transition-all duration-500",
						scrolled
							? "bg-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
							: "bg-white/[0.03]",
					)}
				>
					{/* Logo */}
					<Link
						to="/"
						className="flex items-center gap-2 rounded-full px-3 py-1.5"
					>
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
							<span className="font-bold text-xs text-zinc-900">N</span>
						</div>
						<span className="font-semibold text-sm text-white">Nexbase</span>
					</Link>

					{/* Desktop links */}
					<div className="hidden items-center md:flex">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="rounded-full px-3.5 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
							>
								{link.label}
							</a>
						))}
					</div>

					{/* Desktop auth */}
					<div className="hidden items-center pl-2 md:flex">
						<AuthButton />
					</div>

					{/* Mobile menu button */}
					<button
						type="button"
						className="rounded-full p-2 text-zinc-400 hover:text-white md:hidden"
						onClick={() => setIsOpen(!isOpen)}
						aria-label="Toggle menu"
					>
						{isOpen ? (
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						) : (
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						)}
					</button>
				</div>
			</nav>

			{/* Mobile overlay */}
			<div
				className={cn(
					"fixed inset-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-xl transition-all duration-300 md:hidden",
					isOpen
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0",
				)}
			>
				<div className="flex h-full flex-col px-6 pt-24 pb-8">
					<div className="flex flex-col gap-1">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={() => setIsOpen(false)}
								className="rounded-xl px-4 py-3 text-lg text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
							>
								{link.label}
							</a>
						))}
					</div>
					<div className="mt-auto">
						<AuthButton size="lg" className="w-full" />
					</div>
				</div>
			</div>
		</>
	);
}

export { Nav };
