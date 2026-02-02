import type * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
	size?: "sm" | "default" | "lg";
}

function Section({
	className,
	size = "default",
	children,
	...props
}: SectionProps) {
	return (
		<section
			className={cn(
				"relative",
				{
					"py-12 lg:py-16": size === "sm",
					"py-16 lg:py-24": size === "default",
					"py-24 lg:py-32": size === "lg",
				},
				className,
			)}
			{...props}
		>
			{children}
		</section>
	);
}

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	align?: "left" | "center";
}

function SectionHeader({
	className,
	align = "center",
	children,
	...props
}: SectionHeaderProps) {
	return (
		<div
			className={cn(
				"mb-12 lg:mb-16",
				{
					"mx-auto max-w-2xl text-center": align === "center",
				},
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

function SectionTitle({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h2
			className={cn(
				"mb-4 font-bold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl",
				className,
			)}
			{...props}
		>
			{children}
		</h2>
	);
}

function SectionDescription({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p
			className={cn("max-w-2xl text-lg text-muted-foreground", className)}
			{...props}
		>
			{children}
		</p>
	);
}

export { Section, SectionHeader, SectionTitle, SectionDescription };
