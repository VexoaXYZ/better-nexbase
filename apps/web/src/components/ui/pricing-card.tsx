import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";

interface PricingFeature {
	text: string;
	included: boolean;
}

interface PricingCardProps {
	name: string;
	description: string;
	price: string;
	period?: string;
	features: PricingFeature[];
	cta: string;
	featured?: boolean;
	badge?: string;
	className?: string;
}

function PricingCard({
	name,
	description,
	price,
	period = "/month",
	features,
	cta,
	featured = false,
	badge,
	className,
}: PricingCardProps) {
	return (
		<div
			className={cn(
				"relative flex flex-col rounded-2xl border p-6 transition-all duration-300 lg:p-8",
				featured
					? "card-featured z-10 scale-105 border-0"
					: "border-border bg-card hover:border-zinc-700",
				className,
			)}
		>
			{badge && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2">
					<Badge variant="default" className="bg-white text-zinc-900">
						{badge}
					</Badge>
				</div>
			)}

			<div className="mb-6">
				<h3 className="mb-2 font-semibold text-lg text-white">{name}</h3>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>

			<div className="mb-6">
				<div className="flex items-baseline gap-1">
					<span className="font-bold text-4xl text-white">{price}</span>
					{price !== "Custom" && (
						<span className="text-muted-foreground">{period}</span>
					)}
				</div>
			</div>

			<ul className="mb-8 flex-1 space-y-3">
				{features.map((feature) => (
					<li key={feature.text} className="flex items-start gap-3">
						{feature.included ? (
							<svg
								className="mt-0.5 h-5 w-5 shrink-0 text-white"
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
						) : (
							<svg
								className="mt-0.5 h-5 w-5 shrink-0 text-zinc-600"
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
						)}
						<span
							className={cn(
								"text-sm",
								feature.included ? "text-zinc-300" : "text-zinc-600",
							)}
						>
							{feature.text}
						</span>
					</li>
				))}
			</ul>

			<Button
				variant={featured ? "default" : "secondary"}
				size="lg"
				className="w-full"
			>
				{cta}
			</Button>
		</div>
	);
}

export { PricingCard };
export type { PricingCardProps, PricingFeature };
