import React from "react";
import { ShieldCheck, Sparkles, Leaf, CheckCircle2 } from "lucide-react";

interface PillarItem {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	subtitle: string;
	description: string;
}

export function TrustPillars(): React.JSX.Element {
	const pillars: PillarItem[] = [
		{
			icon: ShieldCheck,
			title: "NAFDAC Certified Clean",
			subtitle: "Regulatory Standard",
			description:
				"Registered and certified under strict NAFDAC cosmetic safety and cGMP clinical efficacy regulations in Nigeria.",
		},
		{
			icon: Sparkles,
			title: "Melanin-Rich Formulations",
			subtitle: "Tailored Dermatology",
			description:
				"Formulated specifically for melanin-dense skin barriers to address post-inflammatory hyperpigmentation with zero white cast.",
		},
		{
			icon: Leaf,
			title: "African Native Botanicals",
			subtitle: "Ethical Harvest",
			description:
				"Cold-pressed wild Kalahari melon seed, Nigerian baobab oil, Nilotica shea, and hibiscus sustainably wild-harvested.",
		},
		{
			icon: CheckCircle2,
			title: "100% Clean Bio-Actives",
			subtitle: "Uncompromising Integrity",
			description:
				"Formulated without sulfates, parabens, phthalates, synthetic bleaches, or micro-plastics. 100% cruelty-free.",
		},
	];

	return (
		<section className="border-y border-border-delicate bg-surface-card py-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<span className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-dark">
						Clinical Integrity &amp; Sourcing
					</span>
					<h2 className="mt-2 font-serif text-2xl sm:text-3xl font-normal text-primary">
						The Juliana&apos;s Standards of Clean Botanical Care
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{pillars.map((pillar) => {
						const IconComponent = pillar.icon;
						return (
							<div
								key={pillar.title}
								className="flex flex-col rounded-2xl border border-border-delicate bg-surface p-6 transition-all duration-300 hover:border-secondary/40 hover:shadow-card-float"
							>
								<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
									<IconComponent className="h-6 w-6 text-secondary-dark" />
								</div>
								<span className="text-[10px] font-bold uppercase tracking-wider text-secondary-dark">
									{pillar.subtitle}
								</span>
								<h3 className="mt-1 font-serif text-lg font-medium text-primary">
									{pillar.title}
								</h3>
								<p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
									{pillar.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
