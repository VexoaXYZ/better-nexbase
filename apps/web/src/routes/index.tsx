import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

// ─── Scroll animation hook ──────────────────────────────────────

function useInView(threshold = 0.1) {
	const ref = React.useRef<HTMLDivElement>(null);
	const [inView, setInView] = React.useState(false);

	React.useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [threshold]);

	return { ref, inView };
}

function FadeIn({
	children,
	delay = 0,
	className,
}: {
	children: React.ReactNode;
	delay?: number;
	className?: string;
}) {
	const { ref, inView } = useInView();
	return (
		<div
			ref={ref}
			className={cn(
				"transition-all duration-700 ease-out",
				inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
				className,
			)}
			style={{ transitionDelay: `${delay}ms` }}
		>
			{children}
		</div>
	);
}

// ─── Page ───────────────────────────────────────────────────────

function HomeComponent() {
	return (
		<>
			<HeroSection />
			<FeaturesSection />
			<TestimonialsSection />
			<PricingSection />
			<CTASection />
		</>
	);
}

// ─── Hero ───────────────────────────────────────────────────────

const chartBars = [
	{ id: "jan", h: 40 },
	{ id: "feb", h: 65 },
	{ id: "mar", h: 45 },
	{ id: "apr", h: 75 },
	{ id: "may", h: 55 },
	{ id: "jun", h: 85 },
	{ id: "jul", h: 70 },
	{ id: "aug", h: 60 },
	{ id: "sep", h: 90 },
	{ id: "oct", h: 50 },
	{ id: "nov", h: 80 },
	{ id: "dec", h: 95 },
];

const heroTechStack = [
	"React 19",
	"TypeScript",
	"Convex",
	"Stripe",
	"Tailwind v4",
];

function DashboardCard() {
	return (
		<div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141417]">
			{/* Window bar with tabs */}
			<div className="flex items-center gap-2 border-white/[0.06] border-b px-4 py-3">
				<div className="flex gap-1.5">
					<div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
					<div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
					<div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
				</div>
				<div className="ml-3 flex gap-0.5 rounded-lg bg-white/[0.04] p-0.5">
					<div className="rounded-md bg-white/[0.08] px-2.5 py-1 font-medium text-[10px] text-zinc-300">
						Overview
					</div>
					<div className="rounded-md px-2.5 py-1 text-[10px] text-zinc-600">
						Analytics
					</div>
					<div className="rounded-md px-2.5 py-1 text-[10px] text-zinc-600">
						Users
					</div>
				</div>
			</div>

			{/* Stats row */}
			<div className="grid grid-cols-3 gap-3 p-4">
				<div className="rounded-lg bg-white/[0.03] p-3">
					<div className="text-[11px] text-zinc-600">Users</div>
					<div className="mt-1 font-semibold text-sm text-white">2,847</div>
					<div className="mt-1 font-medium text-[10px] text-emerald-400">
						+12.5%
					</div>
				</div>
				<div className="rounded-lg bg-white/[0.03] p-3">
					<div className="text-[11px] text-zinc-600">Revenue</div>
					<div className="mt-1 font-semibold text-sm text-white">$12.4k</div>
					<div className="mt-1 font-medium text-[10px] text-emerald-400">
						+24.3%
					</div>
				</div>
				<div className="rounded-lg bg-white/[0.03] p-3">
					<div className="text-[11px] text-zinc-600">Uptime</div>
					<div className="mt-1 font-semibold text-sm text-white">99.9%</div>
					<div className="mt-1 text-[10px] text-zinc-600">Last 30d</div>
				</div>
			</div>

			{/* Chart */}
			<div className="px-4 pb-3">
				<div className="rounded-lg bg-white/[0.03] p-3">
					<div className="mb-3 flex items-center justify-between">
						<span className="text-[11px] text-zinc-600">Revenue</span>
						<span className="font-medium text-[11px] text-emerald-400">
							+24%
						</span>
					</div>
					<div className="flex h-[72px] items-end gap-1">
						{chartBars.map((bar) => (
							<div
								key={bar.id}
								className="flex-1 rounded-t-sm bg-gradient-to-t from-white/[0.08] to-white/20"
								style={{ height: `${bar.h}%` }}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Mini user row */}
			<div className="flex items-center justify-between border-white/[0.06] border-t px-4 py-2.5">
				<div className="flex items-center gap-2">
					<div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 font-medium text-[8px] text-blue-400">
						JD
					</div>
					<span className="text-[11px] text-zinc-500">john@company.com</span>
				</div>
				<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[9px] text-emerald-400">
					Active
				</span>
			</div>
		</div>
	);
}

function HeroSection() {
	return (
		<Section size="lg" className="overflow-x-clip pt-32 lg:pt-40">
			<Container size="lg">
				<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
					{/* Text side */}
					<div>
						{/* Badge */}
						<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
							<span className="text-sm text-zinc-400">
								Introducing Nexbase 2.0
							</span>
						</div>

						{/* Headline */}
						<h1 className="text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
							<span className="font-light text-zinc-500">Your next SaaS,</span>
							<br />
							<span className="font-serif text-white italic">
								already built.
							</span>
						</h1>

						{/* Subheadline */}
						<p className="mt-6 max-w-lg text-lg text-zinc-500 leading-relaxed">
							Auth, payments, real-time data, and beautiful UI. All wired up
							with{" "}
							<span className="font-medium text-zinc-300">
								React, Convex, and TypeScript
							</span>
							. Just add your idea.
						</p>

						{/* CTAs */}
						<div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
							<Button size="lg" className="rounded-full" asChild>
								<Link to="/auth/sign-up">
									Start Building
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
								</Link>
							</Button>
							<Button
								size="lg"
								variant="ghost"
								className="rounded-full text-zinc-400"
								asChild
							>
								<a href="https://github.com">
									<svg
										className="mr-2 h-5 w-5"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
									</svg>
									<span className="sr-only">View on </span>
									GitHub
								</a>
							</Button>
						</div>

						{/* Tech stack badges */}
						<div className="mt-10 flex flex-wrap gap-2">
							{heroTechStack.map((tech) => (
								<span
									key={tech}
									className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-500"
								>
									{tech}
								</span>
							))}
						</div>
					</div>

					{/* Visual side — desktop composition with staggered entrance */}
					<div
						className="relative hidden lg:block"
						style={{ minHeight: "540px" }}
					>
						{/* Main dashboard — perspective tilt + entrance animation */}
						<div
							className="relative z-10 mx-auto max-w-[460px]"
							style={{
								transform: "perspective(1200px) rotateY(-5deg) rotateX(2deg)",
							}}
						>
							<div className="animate-hero-enter [animation-delay:0.2s]">
								<DashboardCard />
							</div>
						</div>

						{/* Floating: Terminal — slides in from left */}
						<div className="absolute top-2 -left-10 z-20 animate-hero-float-left [animation-delay:0.6s]">
							<div className="w-[220px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#141417]">
								<div className="flex items-center gap-1.5 border-white/[0.06] border-b px-3 py-2">
									<div className="h-2 w-2 rounded-full bg-zinc-700" />
									<div className="h-2 w-2 rounded-full bg-zinc-700" />
									<div className="h-2 w-2 rounded-full bg-zinc-700" />
									<span className="ml-1 text-[10px] text-zinc-600">
										Terminal
									</span>
								</div>
								<div className="p-3 font-mono text-[11px] leading-relaxed">
									<div className="text-zinc-500">
										$ <span className="text-zinc-300">bunx create-nexbase</span>
									</div>
									<div className="mt-2 text-emerald-400/80">
										&#10003; Project created
									</div>
									<div className="text-emerald-400/80">
										&#10003; Dependencies installed
									</div>
									<div className="text-emerald-400/80">
										&#10003; Database configured
									</div>
									<div className="mt-2 text-zinc-400">
										&#8594; Ready in <span className="text-white">12s</span>
									</div>
								</div>
							</div>
						</div>

						{/* Floating: Payment — slides in from right */}
						<div className="absolute -right-6 bottom-12 z-20 animate-hero-float-right [animation-delay:1.0s]">
							<div className="w-[200px] rounded-xl border border-white/[0.08] bg-[#141417] p-4">
								<div className="mb-2 flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
										<svg
											className="h-3 w-3 text-emerald-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2.5}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
									<span className="font-medium text-white text-xs">
										Payment confirmed
									</span>
								</div>
								<div className="font-bold text-2xl text-white tracking-tight">
									$49.00
								</div>
								<div className="text-[11px] text-zinc-600">
									Pro Plan &middot; Monthly
								</div>
							</div>
						</div>

						{/* Floating: Notification — slides down */}
						<div className="absolute -top-2 right-4 z-30 animate-hero-slide-down [animation-delay:1.4s]">
							<div className="rounded-lg border border-white/[0.08] bg-[#141417] px-4 py-2.5">
								<div className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-blue-400" />
									<span className="text-xs text-zinc-300">
										New user signed up
									</span>
									<span className="text-[10px] text-zinc-700">2s ago</span>
								</div>
							</div>
						</div>
					</div>

					{/* Mobile visual */}
					<div className="lg:hidden">
						<DashboardCard />
					</div>
				</div>
			</Container>
		</Section>
	);
}

// ─── Features ───────────────────────────────────────────────────

function FeaturesSection() {
	return (
		<Section id="features">
			<Container>
				<FadeIn>
					<div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
						<h2 className="font-bold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
							Everything included
						</h2>
						<p className="mt-4 text-lg text-zinc-500">
							Stop rebuilding infrastructure. Start shipping your product.
						</p>
					</div>
				</FadeIn>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{/* Real-time — wide card */}
					<FadeIn className="md:col-span-2 lg:col-span-2">
						<FeatureCardRealtime />
					</FadeIn>

					{/* Auth */}
					<FadeIn delay={100}>
						<FeatureCardAuth />
					</FadeIn>

					{/* Payments */}
					<FadeIn>
						<FeatureCardPayments />
					</FadeIn>

					{/* Type Safety */}
					<FadeIn delay={100}>
						<FeatureCardTypes />
					</FadeIn>

					{/* Beautiful UI */}
					<FadeIn delay={200}>
						<FeatureCardUI />
					</FadeIn>
				</div>
			</Container>
		</Section>
	);
}

const realtimeBars = [
	{ id: "r1", h: 35 },
	{ id: "r2", h: 58 },
	{ id: "r3", h: 42 },
	{ id: "r4", h: 70 },
	{ id: "r5", h: 52 },
	{ id: "r6", h: 88 },
	{ id: "r7", h: 65 },
	{ id: "r8", h: 45 },
	{ id: "r9", h: 78 },
	{ id: "r10", h: 92 },
	{ id: "r11", h: 60 },
	{ id: "r12", h: 84 },
	{ id: "r13", h: 48 },
	{ id: "r14", h: 72 },
	{ id: "r15", h: 95 },
	{ id: "r16", h: 55 },
];

function FeatureCardRealtime() {
	return (
		<div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8">
			{/* Visual: bar chart with live badge */}
			<div className="relative mb-6 rounded-xl bg-white/[0.03] p-4">
				<div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
					<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
					<span className="font-medium text-[11px] text-emerald-400">Live</span>
				</div>
				<div className="mb-2 text-[11px] text-zinc-600">Events per second</div>
				<div className="flex h-[100px] items-end gap-1 pt-4">
					{realtimeBars.map((bar) => (
						<div
							key={bar.id}
							className="flex-1 rounded-t-sm bg-gradient-to-t from-white/[0.06] to-white/[0.18] transition-all duration-500"
							style={{ height: `${bar.h}%` }}
						/>
					))}
				</div>
			</div>
			<h3 className="font-semibold text-lg text-white">Real-time Everything</h3>
			<p className="mt-2 text-sm text-zinc-500 leading-relaxed">
				Convex handles real-time sync, ACID transactions, and TypeScript-first
				APIs. Your data updates everywhere, instantly.
			</p>
		</div>
	);
}

const avatarInitials = ["SC", "MR", "AP", "JD"];

function FeatureCardAuth() {
	return (
		<div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8">
			{/* Visual: avatar stack + providers */}
			<div className="mb-6 rounded-xl bg-white/[0.03] p-4">
				<div className="mb-3 flex -space-x-2">
					{avatarInitials.map((initials) => (
						<div
							key={initials}
							className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0c0c0e] bg-zinc-800 font-medium text-xs text-zinc-300"
						>
							{initials}
						</div>
					))}
					<div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0c0c0e] bg-zinc-700 font-medium text-xs text-zinc-400">
						+8
					</div>
				</div>
				<div className="flex gap-2">
					<div className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[11px] text-zinc-400">
						Google
					</div>
					<div className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[11px] text-zinc-400">
						GitHub
					</div>
					<div className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[11px] text-zinc-400">
						SSO
					</div>
				</div>
			</div>
			<h3 className="font-semibold text-lg text-white">Auth in Minutes</h3>
			<p className="mt-2 text-sm text-zinc-500 leading-relaxed">
				Social logins, magic links, SSO, and session management. Pre-configured
				and secure by default.
			</p>
		</div>
	);
}

function FeatureCardPayments() {
	return (
		<div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8">
			{/* Visual: payment UI mockup */}
			<div className="mb-6 rounded-xl bg-white/[0.03] p-4">
				<div className="mb-3 flex items-center justify-between">
					<span className="font-medium text-sm text-white">$2,847.00</span>
					<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[11px] text-emerald-400">
						Paid
					</span>
				</div>
				<div className="space-y-2">
					<div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
						<div className="h-2 w-3/4 rounded-full bg-white/20" />
					</div>
					<div className="flex justify-between text-[11px] text-zinc-600">
						<span>Stripe + Webhooks</span>
						<span>75% MRR Growth</span>
					</div>
				</div>
			</div>
			<h3 className="font-semibold text-lg text-white">Stripe Payments</h3>
			<p className="mt-2 text-sm text-zinc-500 leading-relaxed">
				Subscriptions, one-time payments, and usage billing. Webhooks and
				customer portal included.
			</p>
		</div>
	);
}

function FeatureCardTypes() {
	return (
		<div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8">
			{/* Visual: code snippet */}
			<div className="mb-6 overflow-hidden rounded-xl bg-white/[0.03] p-4 font-mono text-xs leading-relaxed">
				<div className="text-zinc-600">{"// "}End-to-end type safety</div>
				<div>
					<span className="text-purple-400">const</span>{" "}
					<span className="text-blue-400">user</span>{" "}
					<span className="text-zinc-500">=</span>{" "}
					<span className="text-yellow-400">useQuery</span>
					<span className="text-zinc-500">(</span>
				</div>
				<div className="pl-4">
					<span className="text-emerald-400">api.users.get</span>
					<span className="text-zinc-500">,</span>
				</div>
				<div className="pl-4">
					<span className="text-zinc-500">{"{ "}</span>
					<span className="text-orange-400">id</span>
					<span className="text-zinc-500">{" }"}</span>
				</div>
				<div>
					<span className="text-zinc-500">);</span>
				</div>
				<div className="mt-2 text-zinc-600">{"// "}user is fully typed ✓</div>
			</div>
			<h3 className="font-semibold text-lg text-white">Type-safe Stack</h3>
			<p className="mt-2 text-sm text-zinc-500 leading-relaxed">
				TypeScript everywhere — from database to UI. Catch bugs at compile time,
				not in production.
			</p>
		</div>
	);
}

function FeatureCardUI() {
	return (
		<div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8">
			{/* Visual: mini component showcase */}
			<div className="mb-6 rounded-xl bg-white/[0.03] p-4">
				<div className="flex flex-wrap gap-2">
					<div className="rounded-full bg-white px-3 py-1 font-medium text-xs text-zinc-900">
						Primary
					</div>
					<div className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
						Outline
					</div>
					<div className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
						Active
					</div>
					<div className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
						Ghost
					</div>
				</div>
				<div className="mt-3 flex items-center gap-3">
					<div className="relative h-5 w-9 rounded-full bg-white/20">
						<div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-white" />
					</div>
					<span className="text-[11px] text-zinc-500">Dark mode included</span>
				</div>
			</div>
			<h3 className="font-semibold text-lg text-white">Beautiful by Default</h3>
			<p className="mt-2 text-sm text-zinc-500 leading-relaxed">
				Tailwind CSS v4 with shadcn/ui. Responsive, accessible, and dark mode
				ready out of the box.
			</p>
		</div>
	);
}

// ─── Testimonials ───────────────────────────────────────────────

const stars = ["s1", "s2", "s3", "s4", "s5"];

const testimonials = [
	{
		name: "Sarah Chen",
		role: "CTO, Streamline",
		initials: "SC",
		before: "We went from ",
		highlight: "idea to production in 2 weeks",
		after: ". Nexbase handled everything we'd normally spend months building.",
	},
	{
		name: "Marcus Rivera",
		role: "Founder, Trellis",
		initials: "MR",
		before: "The real-time features alone ",
		highlight: "saved us 3 months",
		after: ". Auth and payments just work out of the box.",
	},
	{
		name: "Anya Patel",
		role: "Lead Developer, Codex",
		initials: "AP",
		before: "",
		highlight: "Best developer experience",
		after: " I've seen. TypeScript everywhere, zero configuration headaches.",
	},
];

function TestimonialsSection() {
	return (
		<Section>
			<Container>
				<FadeIn>
					<div className="mx-auto mb-12 max-w-2xl text-center">
						<h2 className="font-bold text-3xl text-white tracking-tight sm:text-4xl">
							Loved by developers
						</h2>
						<p className="mt-4 text-lg text-zinc-500">
							Hear from teams who shipped faster with Nexbase.
						</p>
					</div>
				</FadeIn>

				<div className="grid gap-6 md:grid-cols-3">
					{testimonials.map((t) => (
						<FadeIn key={t.name}>
							<div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
								{/* Stars */}
								<div className="mb-4 flex gap-0.5">
									{stars.map((starId) => (
										<svg
											key={`${t.name}-${starId}`}
											className="h-4 w-4 text-amber-400"
											fill="currentColor"
											viewBox="0 0 20 20"
											aria-hidden="true"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>

								{/* Quote with highlight */}
								<p className="text-sm text-zinc-400 leading-relaxed">
									&ldquo;{t.before}
									<span className="font-medium text-white">{t.highlight}</span>
									{t.after}&rdquo;
								</p>

								{/* Author */}
								<div className="mt-5 flex items-center gap-3">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 font-medium text-xs text-zinc-400">
										{t.initials}
									</div>
									<div>
										<div className="font-medium text-sm text-white">
											{t.name}
										</div>
										<div className="text-xs text-zinc-600">{t.role}</div>
									</div>
								</div>
							</div>
						</FadeIn>
					))}
				</div>
			</Container>
		</Section>
	);
}

// ─── Pricing ────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			className={cn("h-4 w-4 shrink-0", className)}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 13l4 4L19 7"
			/>
		</svg>
	);
}

const starterFeatures = [
	"Up to 1,000 monthly users",
	"Community support",
	"Basic analytics",
	"All core features",
];

const proFeatures = [
	"Up to 10,000 monthly users",
	"Priority support",
	"Advanced analytics",
	"Team collaboration",
	"Custom domain",
];

const enterpriseFeatures = [
	"Unlimited users",
	"24/7 dedicated support",
	"SSO & advanced security",
	"Custom integrations",
	"SLA guarantee",
];

function PricingSection() {
	return (
		<Section id="pricing">
			<Container>
				<FadeIn>
					<div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
						<h2 className="font-bold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
							Start free. Scale infinitely.
						</h2>
						<p className="mt-4 text-lg text-zinc-500">
							No hidden fees. Upgrade when you&apos;re ready.
						</p>
					</div>
				</FadeIn>

				<div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-3">
					{/* Starter */}
					<FadeIn>
						<div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
							<h3 className="font-semibold text-lg text-white">Starter</h3>
							<p className="mt-1 text-sm text-zinc-500">For side projects</p>
							<div className="mt-6">
								<span className="font-bold text-4xl text-white tracking-tight">
									$0
								</span>
								<span className="text-sm text-zinc-600"> /forever</span>
							</div>
							<ul className="mt-8 space-y-3">
								{starterFeatures.map((feature) => (
									<li
										key={feature}
										className="flex items-center gap-2 text-sm text-zinc-400"
									>
										<CheckIcon className="text-zinc-600" />
										{feature}
									</li>
								))}
							</ul>
							<Button
								variant="secondary"
								className="mt-8 w-full rounded-full"
								asChild
							>
								<Link to="/auth/sign-up">Start Building</Link>
							</Button>
						</div>
					</FadeIn>

					{/* Pro — featured */}
					<FadeIn delay={100}>
						<div className="relative rounded-2xl border border-white/[0.15] bg-white/[0.04] p-8 shadow-[0_0_40px_rgba(255,255,255,0.03)]">
							<div className="absolute -top-3 right-1/2 translate-x-1/2 rounded-full bg-white px-4 py-1 font-semibold text-xs text-zinc-900">
								Most Popular
							</div>
							<h3 className="font-semibold text-lg text-white">Pro</h3>
							<p className="mt-1 text-sm text-zinc-500">For growing startups</p>
							<div className="mt-6">
								<span className="font-bold text-4xl text-white tracking-tight">
									$49
								</span>
								<span className="text-sm text-zinc-600"> /month</span>
							</div>
							<ul className="mt-8 space-y-3">
								{proFeatures.map((feature) => (
									<li
										key={feature}
										className="flex items-center gap-2 text-sm text-zinc-300"
									>
										<CheckIcon className="text-white/40" />
										{feature}
									</li>
								))}
							</ul>
							<Button className="mt-8 w-full rounded-full" asChild>
								<Link to="/auth/sign-up">Start Free Trial</Link>
							</Button>
						</div>
					</FadeIn>

					{/* Enterprise */}
					<FadeIn delay={200}>
						<div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
							<h3 className="font-semibold text-lg text-white">Enterprise</h3>
							<p className="mt-1 text-sm text-zinc-500">For teams at scale</p>
							<div className="mt-6">
								<span className="font-bold text-4xl text-white tracking-tight">
									Custom
								</span>
							</div>
							<ul className="mt-8 space-y-3">
								{enterpriseFeatures.map((feature) => (
									<li
										key={feature}
										className="flex items-center gap-2 text-sm text-zinc-400"
									>
										<CheckIcon className="text-zinc-600" />
										{feature}
									</li>
								))}
							</ul>
							<Button
								variant="secondary"
								className="mt-8 w-full rounded-full"
								asChild
							>
								<a href="mailto:sales@nexbase.dev">Contact Sales</a>
							</Button>
						</div>
					</FadeIn>
				</div>
			</Container>
		</Section>
	);
}

// ─── CTA ────────────────────────────────────────────────────────

function CTASection() {
	return (
		<Section size="lg">
			<Container size="sm">
				<FadeIn>
					<div className="text-center">
						<h2 className="font-serif text-6xl text-white italic tracking-tight sm:text-7xl lg:text-8xl">
							Ready to ship?
						</h2>
						<p className="mx-auto mt-6 max-w-lg text-lg text-zinc-500">
							Join thousands of developers building faster with Nexbase.
						</p>
						<div className="mt-10">
							<Button
								size="xl"
								className="rounded-full px-10 text-base"
								asChild
							>
								<Link to="/auth/sign-up">
									Start Building Free
									<svg
										className="ml-2 h-4 w-4"
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
								</Link>
							</Button>
						</div>
					</div>
				</FadeIn>
			</Container>
		</Section>
	);
}
