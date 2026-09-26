import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Sparkles } from "lucide-react";

export function HeroSplit(): React.JSX.Element {
	return (
		<section className="relative overflow-hidden bg-surface py-12 sm:py-20 lg:py-24">
			{/* Ambient background blur accents */}
			<div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-secondary-fixed/40 blur-3xl" />
			<div className="pointer-events-none absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-tertiary-fixed/30 blur-3xl" />

			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
					{/* Left Editorial Column (60% on desktop = 7 cols) */}
					<div className="lg:col-span-7 space-y-8 text-left">
						{/* Pre-header Pill */}
						<div className="inline-flex items-center gap-2 rounded-full border border-border-delicate bg-surface-card px-4 py-1.5 shadow-sm">
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
							</span>
							<span className="text-[11px] font-bold tracking-[0.14em] uppercase text-primary">
								Organic Botanical Science • Lagos &amp; Paris
							</span>
						</div>

						{/* Headline in Playfair Display */}
						<h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-primary leading-[1.12]">
							Awaken Radiant Skin with Pure African Botanicals
						</h1>

						{/* Brand narrative */}
						<p className="max-w-xl text-base sm:text-lg font-light leading-relaxed text-on-surface-variant">
							Dermatologist-formulated clean botanical elixirs, cold-pressed indigenous African seed oils, and dermatologically proven bio-actives engineered specifically for melanin-rich skin barriers.
						</p>

						{/* CTA Buttons */}
						<div className="flex flex-wrap items-center gap-4 pt-2">
							<Link
								href="/products"
								className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl active:scale-95"
							>
								<span>Shop Bestsellers</span>
								<ArrowRight className="h-4 w-4 text-secondary-fixed" />
							</Link>

							<Link
								href="/products"
								className="inline-flex items-center gap-2 rounded-full border border-border-delicate bg-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-all hover:bg-surface-container-low hover:border-outline-variant active:scale-95"
							>
								<span>Explore Formulations</span>
							</Link>
						</div>

						{/* Social Proof & Trust Badges */}
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-border-delicate pt-6">
							<div className="flex text-secondary">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star key={i} className="h-4 w-4 fill-secondary" />
								))}
							</div>
							<p className="text-xs font-medium text-on-surface-variant">
								<strong className="text-primary">Rated 4.9/5</strong> by 12,000+ conscious women across West Africa
							</p>
						</div>
					</div>

					{/* Right Visual Column (40% on desktop = 5 cols) */}
					<div className="lg:col-span-5 relative">
						<div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-border-delicate shadow-2xl">
							<Image
								src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85"
								alt="Juliana's Cosmetics Botanical Formulations"
								fill
								priority
								sizes="(max-width: 1024px) 100vw, 40vw"
								className="object-cover object-center"
							/>

							{/* Gradient Vignette */}
							<div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />

							{/* Floating Pill Tag */}
							<div className="absolute top-6 left-6 rounded-full bg-surface-card/90 backdrop-blur-md px-4 py-2 border border-border-delicate shadow-md">
								<div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
									<Sparkles className="h-3.5 w-3.5 text-secondary" />
									<span>100% Cold-Pressed Plant Actives</span>
								</div>
							</div>

							{/* Floating Hero Quick Card */}
							<div className="absolute bottom-6 inset-x-6 rounded-2xl bg-white/95 backdrop-blur-md p-4 border border-border-delicate shadow-xl">
								<div className="flex items-center justify-between">
									<div>
										<span className="text-[10px] font-semibold uppercase tracking-wider text-secondary-dark">
											NAFDAC Certified
										</span>
										<h4 className="font-serif text-sm font-semibold text-primary">
											Luminous Peptide Glaze Serum
										</h4>
										<p className="text-xs text-on-surface-variant">
											₦38,500 • 30ml
										</p>
									</div>
									<Link
										href="/products/luminous-peptide-glaze-serum"
										className="rounded-full bg-primary p-2.5 text-white transition-transform hover:scale-105"
										aria-label="View Luminous Peptide Glaze Serum"
									>
										<ArrowRight className="h-4 w-4" />
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
