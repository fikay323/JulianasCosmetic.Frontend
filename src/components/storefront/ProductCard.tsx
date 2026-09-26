"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star, Sparkles } from "lucide-react";
import type { Product } from "@/src/types/store";
import { useCart } from "@/src/context/CartContext";
import { formatNaira } from "@/src/lib/utils";

export interface ProductCardProps {
	product: Product;
}

export function ProductCard({ product }: ProductCardProps): React.JSX.Element {
	const { addItem } = useCart();
	const isOutOfStock = product.stockStatus === "Out of Stock" || product.inStock === false;
	const imageSrc = product.images?.[0] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80";

	const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>): void => {
		e.preventDefault();
		e.stopPropagation();
		if (!isOutOfStock) {
			addItem(product, 1);
		}
	};

	return (
		<div
			data-testid="product-card"
			className="product-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border-delicate bg-surface-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
		>
			{/* Top Image & Badges */}
			<div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-container-low">
				<Link href={`/products/${product.id}`} className="relative block h-full w-full">
					<Image
						src={imageSrc}
						alt={product.name}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						className="object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				</Link>

				{/* Stock Badge */}
				{isOutOfStock ? (
					<span className="absolute top-3 left-3 rounded-full bg-error px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
						Out of Stock
					</span>
				) : (
					<span className="absolute top-3 left-3 rounded-full bg-surface-container-high/90 backdrop-blur-md px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary shadow-sm">
						{product.category}
					</span>
				)}

				{product.featured && !isOutOfStock && (
					<span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-secondary-fixed px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-on-secondary-fixed shadow-sm">
						<Sparkles className="h-3 w-3 text-secondary-dark" />
						<span>Bestseller</span>
					</span>
				)}
			</div>

			{/* Product Meta */}
			<div className="flex flex-1 flex-col justify-between pt-4">
				<div>
					{/* Rating */}
					<div className="mb-1.5 flex items-center gap-1">
						<div className="flex text-secondary">
							{Array.from({ length: 5 }).map((_, i) => (
								<Star
									key={i}
									className="h-3.5 w-3.5 fill-secondary"
								/>
							))}
						</div>
						<span className="text-[11px] font-medium text-on-surface-variant">
							{product.rating ?? "4.9"} ({product.reviewCount ?? "80+"})
						</span>
					</div>

					{/* Title */}
					<Link href={`/products/${product.id}`}>
						<h3 className="font-serif text-lg font-medium text-primary transition-colors hover:text-secondary-dark line-clamp-1">
							{product.name}
						</h3>
					</Link>

					{/* Tagline */}
					<p className="mt-1 text-xs text-on-surface-variant line-clamp-2">
						{product.tagline}
					</p>
				</div>

				{/* Price & Add to Bag CTA */}
				<div className="mt-5 flex items-center justify-between gap-3 border-t border-border-delicate pt-3">
					<div>
						<span className="text-xs text-on-surface-variant block">Price</span>
						<span className="text-base font-bold text-primary">
							{formatNaira(product.price)}
						</span>
					</div>

					<button
						type="button"
						onClick={handleAddToCart}
						disabled={isOutOfStock}
						className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-surface-container-highest disabled:text-outline active:scale-95"
					>
						<ShoppingBag className="h-3.5 w-3.5" />
						<span>{isOutOfStock ? "Out of Stock" : "Add to Bag"}</span>
					</button>
				</div>
			</div>
		</div>
	);
}
