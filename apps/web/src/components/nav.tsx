import { Link } from "@tanstack/react-router";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { Button } from "./ui/button";

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
			<nav
				className={cn(
					"fixed top-0 right-0 left-0 z-50 transition-all duration-300",
					scrolled ? "py-3" : "py-4",
				)}
			>
				<Container>
					<div
						className={cn(
							"flex items-center justify-between rounded-full px-4 transition-all duration-300 sm:px-6",
							scrolled
								? "border border-zinc-800 bg-zinc-900/80 py-2 backdrop-blur-xl"
								: "bg-transparent py-0",
						)}
					>
						{/* Logo */}
						<Link to="/" className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
								<span className="font-bold text-sm text-zinc-900">N</span>
							</div>
							<span className="hidden font-semibold text-white sm:block">
								Nexbase
							</span>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden items-center gap-1 md:flex">
							{navLinks.map((link) => (
								<a
									key={link.href}
									href={link.href}
									className="rounded-full px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
								>
									{link.label}
								</a>
							))}
						</div>

						{/* Desktop CTA */}
						<div className="hidden items-center gap-3 md:flex">
							<Button variant="ghost" size="sm">
								Sign in
							</Button>
							<Button size="sm">Get Started</Button>
						</div>

						{/* Mobile Menu Button */}
						<button
							type="button"
							className="p-2 text-zinc-400 hover:text-white md:hidden"
							onClick={() => setIsOpen(!isOpen)}
							aria-label="Toggle menu"
						>
							{isOpen ? (
								<svg
									className="h-6 w-6"
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
									className="h-6 w-6"
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
				</Container>
			</nav>

			{/* Mobile Menu Overlay */}
			<div
				className={cn(
					"fixed inset-0 z-40 bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden",
					isOpen
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0",
				)}
			>
				<Container className="flex h-full flex-col pt-24 pb-8">
					<div className="flex flex-col gap-2">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={() => setIsOpen(false)}
								className="rounded-lg px-4 py-3 text-lg text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
							>
								{link.label}
							</a>
						))}
					</div>
					<div className="mt-auto flex flex-col gap-3">
						<Button variant="secondary" size="lg" className="w-full">
							Sign in
						</Button>
						<Button size="lg" className="w-full">
							Get Started
						</Button>
					</div>
				</Container>
			</div>
		</>
	);
}

export { Nav };
