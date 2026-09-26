import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, HeartHandshake, PhoneCall } from "lucide-react";

export function Footer(): React.JSX.Element {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-border-delicate bg-primary text-on-primary">
			{/* Clean Beauty & NAFDAC Commitments Strip */}
			<div className="border-b border-white/10 bg-primary-dark/50 py-10 px-4 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
							<ShieldCheck className="h-6 w-6" />
						</div>
						<div>
							<h4 className="font-serif text-lg font-medium text-white">
								NAFDAC Certified Formulations
							</h4>
							<p className="mt-1 text-xs leading-relaxed text-on-primary-container">
								Rigorously tested and approved under Nigerian food and drug cosmetic standards for dermatological safety.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
							<Sparkles className="h-6 w-6" />
						</div>
						<div>
							<h4 className="font-serif text-lg font-medium text-white">
								Indigenous African Botanicals
							</h4>
							<p className="mt-1 text-xs leading-relaxed text-on-primary-container">
								Ethically harvested virgin Kalahari melon, Nigerian baobab, wild marula, and Nilotica shea butter.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
							<HeartHandshake className="h-6 w-6" />
						</div>
						<div>
							<h4 className="font-serif text-lg font-medium text-white">
								Melanin-Rich Optimization
							</h4>
							<p className="mt-1 text-xs leading-relaxed text-on-primary-container">
								Engineered specifically for cellular lipid barrier replenishment and hyperpigmentation defense without white cast.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Editorial Footer Content */}
			<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
					{/* Brand Column */}
					<div className="space-y-4 lg:col-span-1">
						<h3 className="font-serif text-2xl tracking-wide text-white">
							Juliana&apos;s Cosmetics
						</h3>
						<p className="text-xs leading-relaxed text-on-primary-container">
							L&apos;Élixir Editorial &amp; Aura Botanicals Apothecary. Luxury clean skincare marrying African plant wisdom with clinically proven cellular bio-actives.
						</p>
						{/* <div className="pt-2">
							<span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[11px] font-medium tracking-wider text-secondary">
								<span>Lagos • Abuja • London</span>
							</span>
						</div> */}
					</div>

					{/* Catalog Navigation */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
							The Formulations
						</h4>
						<ul className="mt-4 space-y-2.5 text-xs text-on-primary-container">
							<li>
								<Link href="/products" className="transition-colors hover:text-white">
									All Formulations
								</Link>
							</li>
							<li>
								<Link href="/products?category=Serums" className="transition-colors hover:text-white">
									Active Serums &amp; Elixirs
								</Link>
							</li>
							<li>
								<Link href="/products?category=Moisturisers" className="transition-colors hover:text-white">
									Barrier Hydration Crèmes
								</Link>
							</li>
							<li>
								<Link href="/products?category=Suncare" className="transition-colors hover:text-white">
									Botanical Sun Shields (SPF 50)
								</Link>
							</li>
							<li>
								<Link href="/products?category=Treatments" className="transition-colors hover:text-white">
									Resurfacing &amp; Barrier Oils
								</Link>
							</li>
						</ul>
					</div>

					{/* Concierge & WhatsApp */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
							Concierge Service
						</h4>
						<ul className="mt-4 space-y-2.5 text-xs text-on-primary-container">
							<li className="flex items-center gap-2">
								<PhoneCall className="h-3.5 w-3.5 text-secondary" />
								<span>WhatsApp Delivery Consultation</span>
							</li>
							<li>
								<Link href="/checkout" className="transition-colors hover:text-white">
									Doorstep Dispatch &amp; Logistics
								</Link>
							</li>
							<li>
								<Link href="/#standards" className="transition-colors hover:text-white">
									NAFDAC Regulatory Dossier
								</Link>
							</li>
							<li>
								<Link href="/admin/orders" className="transition-colors hover:text-white">
									Merchant Admin Portal
								</Link>
							</li>
						</ul>
					</div>

					{/* Clean Standard Disclosure */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
							Formulation Integrity
						</h4>
						<p className="mt-4 text-xs leading-relaxed text-on-primary-container">
							Formulated 100% free of artificial fragrances, parabens, hydroquinone, synthetic dyes, mineral oils, and phthalates. Certified cruelty-free and dermatologically validated.
						</p>
					</div>
				</div>

				{/* Bottom Legal & Copyright Bar */}
				<div className="mt-16 border-t border-white/10 pt-8 sm:flex sm:items-center sm:justify-between">
					<p className="text-[11px] tracking-wider text-on-primary-container">
						&copy; {currentYear} Juliana&apos;s Cosmetics Limited. All rights reserved. Registered with NAFDAC Nigeria.
					</p>
					<p className="mt-4 text-[11px] text-on-primary-container/80 sm:mt-0">
						Aura Botanicals Apothecary • Luxury Clean Skincare
					</p>
				</div>
			</div>
		</footer>
	);
}
