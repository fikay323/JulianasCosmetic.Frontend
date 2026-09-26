import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/src/types/store";
import { ProductCard } from "./ProductCard";

export interface FeaturedBotanicalGridProps {
	products: Product[];
}

export function FeaturedBotanicalGrid({
	products,
}: FeaturedBotanicalGridProps): React.JSX.Element {
	// Show featured products or first 4
	const featured = products.filter((p) => p.featured);
	const displayProducts = featured.length >= 3 ? featured : products.slice(0, 4);

	return (
		<section className="py-20 bg-surface">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
					<div>
						<span className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-dark">
							The Botanical Apothecary
						</span>
						<h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-primary">
							Featured Clean Formulations
						</h2>
					</div>
					<Link
						href="/products"
						className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:text-secondary-dark transition-colors"
					>
						<span>View Full Archive</span>
						<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Link>
				</div>

				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{displayProducts.map((product) => (
						<ProductCard key={product.id} product={product} />
					))}
				</div>
			</div>
		</section>
	);
}
