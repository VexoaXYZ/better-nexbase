import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/container";
import {
	Section,
	SectionDescription,
	SectionHeader,
	SectionTitle,
} from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PricingCard } from "@/components/ui/pricing-card";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<>
			<HeroSection />
			<StatsSection />
			<FeaturesSection />
			<PricingSection />
			<CTASection />
		</>
	);
}

function HeroSection() {
	return (
		<Section size="lg" className="pt-32 lg:pt-40">
			<Container>
				<div className="mx-auto max-w-4xl text-center">
					<Badge className="mb-6" variant="secondary">
						Now in Public Beta
					</Badge>

					<h1 className="mb-6 text-balance font-bold text-4xl text-white tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
						Build your SaaS
						<br />
						<span className="text-gradient">in record time</span>
					</h1>

					<p className="mx-auto mb-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
						The modern full-stack boilerplate with React, Convex, and
						TypeScript. Authentication, payments, and real-time data out of the
						box.
					</p>

					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button size="lg" className="text-base">
							Get Started Free
							<svg
								className="ml-1 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 8l4 4m0 0l-4 4m4-4H3"
								/>
							</svg>
						</Button>
						<Button variant="secondary" size="lg" className="text-base">
							View Documentation
						</Button>
					</div>

					{/* Tech stack badges */}
					<div className="mt-12 flex flex-wrap justify-center gap-3">
						{["React 19", "TypeScript", "Convex", "Tailwind CSS", "Vite"].map(
							(tech) => (
								<span
									key={tech}
									className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-500"
								>
									{tech}
								</span>
							),
						)}
					</div>
				</div>

				{/* Hero visual */}
				<div className="relative mt-16 lg:mt-24">
					<div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent" />
					<div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-sm">
						<div className="flex items-center gap-2 border-zinc-800 border-b px-4 py-3">
							<div className="flex gap-1.5">
								<div className="h-3 w-3 rounded-full bg-zinc-700" />
								<div className="h-3 w-3 rounded-full bg-zinc-700" />
								<div className="h-3 w-3 rounded-full bg-zinc-700" />
							</div>
							<span className="ml-2 text-xs text-zinc-500">dashboard.tsx</span>
						</div>
						<div className="p-6 font-mono text-sm">
							<pre className="text-zinc-400">
								<code>
									<span className="text-zinc-600">{"// "}</span>
									<span className="text-zinc-500">
										Real-time data with Convex
									</span>
									{"\n"}
									<span className="text-purple-400">const</span>{" "}
									<span className="text-blue-400">data</span>{" "}
									<span className="text-zinc-500">=</span>{" "}
									<span className="text-yellow-400">useQuery</span>
									<span className="text-zinc-500">(</span>
									<span className="text-emerald-400">api.users.list</span>
									<span className="text-zinc-500">);</span>
									{"\n\n"}
									<span className="text-purple-400">return</span>{" "}
									<span className="text-zinc-500">(</span>
									{"\n"}
									{"  "}
									<span className="text-zinc-500">{"<"}</span>
									<span className="text-blue-400">Dashboard</span>
									<span className="text-zinc-500">{">"}</span>
									{"\n"}
									{"    "}
									<span className="text-zinc-500">{"<"}</span>
									<span className="text-blue-400">MetricsGrid</span>{" "}
									<span className="text-purple-400">data</span>
									<span className="text-zinc-500">
										={"{"}data{"}"}
									</span>{" "}
									<span className="text-zinc-500">{"/>"}</span>
									{"\n"}
									{"    "}
									<span className="text-zinc-500">{"<"}</span>
									<span className="text-blue-400">RealtimeChart</span>{" "}
									<span className="text-zinc-500">{"/>"}</span>
									{"\n"}
									{"  "}
									<span className="text-zinc-500">{"</"}</span>
									<span className="text-blue-400">Dashboard</span>
									<span className="text-zinc-500">{">"}</span>
									{"\n"}
									<span className="text-zinc-500">);</span>
								</code>
							</pre>
						</div>
					</div>
				</div>
			</Container>
		</Section>
	);
}

const stats = [
	{ value: "10k+", label: "Developers" },
	{ value: "99.9%", label: "Uptime" },
	{ value: "50ms", label: "Avg Response" },
	{ value: "24/7", label: "Support" },
];

function StatsSection() {
	return (
		<Section size="sm">
			<Container>
				<div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
					{stats.map((stat) => (
						<div key={stat.label} className="text-center">
							<div className="mb-1 font-bold text-3xl text-white sm:text-4xl">
								{stat.value}
							</div>
							<div className="text-muted-foreground text-sm">{stat.label}</div>
						</div>
					))}
				</div>
			</Container>
		</Section>
	);
}

const features = [
	{
		icon: (
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
					strokeWidth={1.5}
					d="M13 10V3L4 14h7v7l9-11h-7z"
				/>
			</svg>
		),
		title: "Lightning Fast",
		description:
			"Built on Vite and React 19 for instant hot reloading and optimized production builds. Ship features faster than ever.",
	},
	{
		icon: (
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
					strokeWidth={1.5}
					d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
				/>
			</svg>
		),
		title: "Real-time Database",
		description:
			"Convex provides automatic real-time sync, ACID transactions, and TypeScript-first APIs. No more stale data.",
	},
	{
		icon: (
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
					strokeWidth={1.5}
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
		),
		title: "Auth Built-in",
		description:
			"Pre-configured authentication with social logins, magic links, and session management. Secure by default.",
	},
	{
		icon: (
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
					strokeWidth={1.5}
					d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
				/>
			</svg>
		),
		title: "Payments Ready",
		description:
			"Stripe integration for subscriptions, one-time payments, and usage-based billing. Start monetizing immediately.",
	},
	{
		icon: (
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
					strokeWidth={1.5}
					d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
				/>
			</svg>
		),
		title: "Beautiful UI",
		description:
			"Tailwind CSS with shadcn/ui components. Dark mode, responsive design, and accessibility baked in.",
	},
	{
		icon: (
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
					strokeWidth={1.5}
					d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
				/>
			</svg>
		),
		title: "Type-safe",
		description:
			"End-to-end TypeScript with strict mode. Catch bugs at compile time, not in production.",
	},
];

function FeaturesSection() {
	return (
		<Section id="features">
			<Container>
				<SectionHeader>
					<Badge className="mb-4" variant="secondary">
						Features
					</Badge>
					<SectionTitle>Everything you need to ship</SectionTitle>
					<SectionDescription className="mx-auto">
						Stop reinventing the wheel. Focus on what makes your product unique
						while we handle the infrastructure.
					</SectionDescription>
				</SectionHeader>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<Card key={feature.title} variant="default" hover className="p-6">
							<CardContent className="p-0">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-white">
									{feature.icon}
								</div>
								<h3 className="mb-2 font-semibold text-lg text-white">
									{feature.title}
								</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{feature.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</Container>
		</Section>
	);
}

const pricingPlans = [
	{
		name: "Starter",
		description: "Perfect for side projects and experiments.",
		price: "$0",
		period: "/month",
		features: [
			{ text: "Up to 1,000 monthly active users", included: true },
			{ text: "Basic analytics dashboard", included: true },
			{ text: "Community support", included: true },
			{ text: "Custom domain", included: false },
			{ text: "Advanced analytics", included: false },
			{ text: "Priority support", included: false },
		],
		cta: "Start Building",
	},
	{
		name: "Pro",
		description: "For growing startups and teams.",
		price: "$49",
		period: "/month",
		features: [
			{ text: "Up to 10,000 monthly active users", included: true },
			{ text: "Advanced analytics dashboard", included: true },
			{ text: "Priority email support", included: true },
			{ text: "Custom domain", included: true },
			{ text: "Team collaboration", included: true },
			{ text: "API access", included: false },
		],
		cta: "Start Free Trial",
		featured: true,
		badge: "Most Popular",
	},
	{
		name: "Enterprise",
		description: "For large-scale applications.",
		price: "Custom",
		features: [
			{ text: "Unlimited monthly active users", included: true },
			{ text: "Custom analytics & reporting", included: true },
			{ text: "24/7 dedicated support", included: true },
			{ text: "Custom domain & branding", included: true },
			{ text: "SSO & advanced security", included: true },
			{ text: "Custom integrations", included: true },
		],
		cta: "Contact Sales",
	},
];

function PricingSection() {
	return (
		<Section id="pricing">
			<Container>
				<SectionHeader>
					<Badge className="mb-4" variant="secondary">
						Pricing
					</Badge>
					<SectionTitle>Simple, transparent pricing</SectionTitle>
					<SectionDescription className="mx-auto">
						Start free and scale as you grow. No hidden fees, no surprises.
					</SectionDescription>
				</SectionHeader>

				<div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-3 lg:gap-4">
					{pricingPlans.map((plan) => (
						<PricingCard key={plan.name} {...plan} />
					))}
				</div>
			</Container>
		</Section>
	);
}

function CTASection() {
	return (
		<Section size="lg">
			<Container size="sm">
				<div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center sm:p-12 lg:p-16">
					{/* Glow effect */}
					<div
						className="absolute inset-0 opacity-50"
						style={{
							background:
								"radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
						}}
					/>

					<div className="relative">
						<h2 className="mb-4 text-balance font-bold text-3xl text-white sm:text-4xl lg:text-5xl">
							Ready to build something amazing?
						</h2>
						<p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">
							Join thousands of developers who are shipping faster with Nexbase.
							Get started in minutes.
						</p>
						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Button size="lg" className="text-base">
								Get Started Free
								<svg
									className="ml-1 h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</Button>
							<Button variant="secondary" size="lg" className="text-base">
								Schedule a Demo
							</Button>
						</div>
					</div>
				</div>
			</Container>
		</Section>
	);
}
