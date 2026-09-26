"use client";

import React, { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import type { Product, ProductCategory } from "@/src/types/store";
import { ProductCard } from "./ProductCard";

export interface ProductListingClientProps {
	initialProducts: Product[];
}

const CATEGORIES: Array<"All" | ProductCategory> = [
	"All",
	"Serums",
	"Moisturisers",
	"Suncare",
	"Cleansers",
	"Treatments",
];

type SortOption = "Featured" | "Price: Low to High" | "Price: High to Low" | "Newest";

export function ProductListingClient({
	initialProducts,
}: ProductListingClientProps): React.JSX.Element {
	const [products, setProducts] = useState<Product[]>(initialProducts);
	const [selectedCategory, setSelectedCategory] = useState<"All" | ProductCategory>("All");
	const [sortBy, setSortBy] = useState<SortOption>("Featured");

	// Sync with /api/products if available (for runtime updates)
	useEffect(() => {
		let isMounted = true;
		fetch("/api/products")
			.then((res) => (res.ok ? res.json() : null))
			.then((data: unknown) => {
				if (isMounted && Array.isArray(data) && data.length > 0) {
					setProducts(data as Product[]);
				}
			})
			.catch(() => {
				/* ignore if API route not yet active */
			});

		return () => {
			isMounted = false;
		};
	}, []);

	// Filter & Sort Logic
	const filteredAndSortedProducts = useMemo(() => {
		let list = [...products];

		// Category Filter
		if (selectedCategory !== "All") {
			list = list.filter((p) => p.category === selectedCategory);
		}

		// Sort
		switch (sortBy) {
			case "Price: Low to High":
				list.sort((a, b) => a.price - b.price);
				break;
			case "Price: High to Low":
				list.sort((a, b) => b.price - a.price);
				break;
			case "Newest":
				// Sort by id or default order
				list.reverse();
				break;
			case "Featured":
			default:
				list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
				break;
		}

		// Prioritize in-stock products before out-of-stock products
		list.sort((a, b) => {
			const aOut = a.stockStatus === "Out of Stock" || a.inStock === false;
			const bOut = b.stockStatus === "Out of Stock" || b.inStock === false;
			if (aOut && !bOut) return 1;
			if (!aOut && bOut) return -1;
			return 0;
		});

		return list;
	}, [products, selectedCategory, sortBy]);

	return (
		<div className="min-h-screen bg-surface py-12 sm:py-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Editorial Header */}
				<div className="max-w-2xl space-y-3">
					<div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-dark">
						<Sparkles className="h-3.5 w-3.5 text-secondary" />
						<span>Clean Botanical Formulations</span>
					</div>
					<h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-primary">
						The Formulations Archive
					</h1>
					<p className="text-sm sm:text-base font-light text-on-surface-variant">
						Showing {filteredAndSortedProducts.length} Clean Botanical Formulations • Formulated for Melanin-Rich Skin
					</p>
				</div>

				{/* Filter & Sort Controls */}
				<div className="mt-10 flex flex-col gap-6 border-b border-border-delicate pb-8 sm:flex-row sm:items-center sm:justify-between">
					{/* Category Filter Pills */}
					<div className="flex flex-wrap items-center gap-2">
						{CATEGORIES.map((category) => {
							const isActive = selectedCategory === category;
							return (
								<button
									key={category}
									type="button"
									onClick={() => setSelectedCategory(category)}
									className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
										isActive
											? "bg-primary text-white shadow-sm"
											: "bg-surface-container-low text-primary/80 hover:bg-surface-container hover:text-primary"
									}`}
								>
									{category}
								</button>
							);
						})}
					</div>

					{/* Sorting Select */}
					<div className="flex items-center gap-2">
						<SlidersHorizontal className="h-4 w-4 text-on-surface-variant" />
						<label htmlFor="sort-select" className="text-xs font-semibold text-primary uppercase tracking-wider">
							Sort:
						</label>
						<select
							id="sort-select"
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as SortOption)}
							className="rounded-full border border-border-delicate bg-white px-4 py-2 text-xs font-medium text-primary shadow-sm focus:border-primary focus:outline-none"
						>
							<option value="Featured">Featured Editorial</option>
							<option value="Price: Low to High">Price: Low to High</option>
							<option value="Price: High to Low">Price: High to Low</option>
							<option value="Newest">Newest Harvest</option>
						</select>
					</div>
				</div>

				{/* Catalog Product Grid */}
				{filteredAndSortedProducts.length === 0 ? (
					<div className="py-20 text-center">
						<p className="font-serif text-lg text-primary">No formulations found</p>
						<p className="mt-1 text-sm text-on-surface-variant">
							Try selecting another category pill or clearing filters.
						</p>
						<button
							type="button"
							onClick={() => setSelectedCategory("All")}
							className="mt-4 inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
						>
							Reset Filters
						</button>
					</div>
				) : (
					<div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{filteredAndSortedProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
