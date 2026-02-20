import { Link } from "@tanstack/react-router";
import { Container } from "./container";

const footerLinks = {
	product: {
		title: "Product",
		links: [
			{ label: "Features", href: "#features" },
			{ label: "Pricing", href: "#pricing" },
			{ label: "Changelog", href: "#" },
		],
	},
	resources: {
		title: "Resources",
		links: [
			{ label: "Documentation", href: "#" },
			{ label: "API Reference", href: "#" },
			{ label: "Guides", href: "#" },
		],
	},
	legal: {
		title: "Legal",
		links: [
			{ label: "Privacy", href: "#" },
			{ label: "Terms", href: "#" },
		],
	},
};

function Footer() {
	return (
		<footer className="border-white/[0.06] border-t bg-[#0a0a0c]">
			<Container className="py-12">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
					{/* Brand */}
					<div className="col-span-2 md:col-span-1">
						<Link to="/" className="flex items-center gap-2">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
								<span className="font-bold text-xs text-zinc-900">N</span>
							</div>
							<span className="font-semibold text-sm text-white">Nexbase</span>
						</Link>
						<p className="mt-3 text-sm text-zinc-600 leading-relaxed">
							The modern SaaS boilerplate for shipping production-ready
							applications.
						</p>
					</div>

					{/* Link columns */}
					{Object.entries(footerLinks).map(([key, section]) => (
						<div key={key}>
							<h3 className="mb-3 font-semibold text-xs text-zinc-500 uppercase tracking-wider">
								{section.title}
							</h3>
							<ul className="space-y-2">
								{section.links.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="text-sm text-zinc-600 transition-colors hover:text-zinc-300"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Bottom */}
				<div className="mt-10 flex flex-col items-center justify-between gap-4 border-white/[0.06] border-t pt-6 sm:flex-row">
					<p className="text-xs text-zinc-600">
						&copy; {new Date().getFullYear()} Nexbase. All rights reserved.
					</p>
					<div className="flex items-center gap-4">
						<a
							href="https://twitter.com"
							className="text-zinc-600 transition-colors hover:text-zinc-400"
						>
							<span className="sr-only">Twitter</span>
							<svg
								className="h-4 w-4"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						</a>
						<a
							href="https://github.com"
							className="text-zinc-600 transition-colors hover:text-zinc-400"
						>
							<span className="sr-only">GitHub</span>
							<svg
								className="h-4 w-4"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
							</svg>
						</a>
					</div>
				</div>
			</Container>
		</footer>
	);
}

export { Footer };
