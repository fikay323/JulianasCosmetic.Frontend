"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { SlidersHorizontal, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import type { Product, ProductCategory } from "@/src/types/store";
import { useToast } from "@/src/context/ToastContext";
import { ProductCard } from "./ProductCard";

export interface ProductListingClientProps {
	initialProducts: Product[];
	initialError?: string | null;
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
	initialError,
}: ProductListingClientProps): React.JSX.Element {
	const [products, setProducts] = useState<Product[]>(initialProducts);
	const [error, setError] = useState<string | null>(initialError ?? null);
	const [isRetrying, setIsRetrying] = useState<boolean>(false);
	const [selectedCategory, setSelectedCategory] = useState<"All" | ProductCategory>("All");
	const [sortBy, setSortBy] = useState<SortOption>("Featured");
	const { toast } = useToast();

	const loadProducts = useCallback(async (): Promise<void> => {
		setIsRetrying(true);
		try {
			const res = await fetch("/api/products", { cache: "no-store" });
			if (!res.ok) {
				const errData = (await res.json().catch(() => ({}))) as { error?: string };
				throw new Error(errData.error || `HTTP ${res.status}: Failed to fetch products`);
			}
			const data = (await res.json()) as Product[];
			setProducts(data);
			setError(null);
			if (error) {
				toast.success("Successfully loaded formulations from backend", "Connected");
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Failed to load formulations from backend";
			setError(msg);
			toast.error(msg, "Backend Connection Failed");
		} finally {
			setIsRetrying(false);
		}
	}, [error, toast]);

	// Initial error toast
	useEffect(() => {
		if (initialError) {
			toast.error(initialError, "Backend Connection Failed");
		}
	}, [initialError, toast]);

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
						Dermatologist-grade botanical skincare imported directly from France.
						Engineered to protect cellular lipid barriers and illuminate melanin-rich skin.
					</p>
				</div>

				{/* Error State Banner if backend fails */}
				{error && products.length === 0 ? (
					<div className="mt-12 rounded-2xl border border-error/30 bg-[#281316] p-8 text-center text-[#FFE8EA] shadow-xl">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/20 text-[#FF6E7F]">
							<AlertCircle className="h-7 w-7" />
						</div>
						<h3 className="mt-4 font-serif text-xl font-medium text-white">
							Unable to Load Catalog from Backend
						</h3>
						<p className="mt-2 text-xs text-[#FFE8EA]/80 max-w-lg mx-auto">
							{error}
						</p>
						<button
							type="button"
							onClick={() => void loadProducts()}
							disabled={isRetrying}
							className="mt-6 inline-flex items-center gap-2 rounded-full border border-error/40 bg-surface px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-surface-card transition-all disabled:opacity-50"
						>
							<RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
							<span>{isRetrying ? "Connecting..." : "Retry Backend Connection"}</span>
						</button>
					</div>
				) : (
					<>
						{/* Filter & Sorting Controls */}
						<div className="mt-10 flex flex-col gap-6 border-y border-border-delicate py-6 sm:flex-row sm:items-center sm:justify-between">
							{/* Category Pills */}
							<div className="flex flex-wrap items-center gap-2">
								{CATEGORIES.map((cat) => (
									<button
										key={cat}
										type="button"
										onClick={() => setSelectedCategory(cat)}
										className={`rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-all ${
											selectedCategory === cat
												? "bg-primary text-white shadow-sm"
												: "bg-surface-card text-on-surface-variant border border-border-delicate hover:text-primary hover:border-border"
										}`}
									>
										{cat}
									</button>
								))}
							</div>

							{/* Sort Selector */}
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2 text-xs text-on-surface-variant">
									<SlidersHorizontal className="h-3.5 w-3.5" />
									<span className="uppercase tracking-wider font-semibold text-[10px]">Sort by</span>
								</div>
								<select
									id="sort-select"
									aria-label="Sort by"
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as SortOption)}
									className="rounded-full border border-border-delicate bg-surface-card px-4 py-2 text-xs font-medium text-primary focus:border-secondary focus:outline-none transition-colors"
								>
									<option value="Featured">Featured First</option>
									<option value="Price: Low to High">Price: Low to High</option>
									<option value="Price: High to Low">Price: High to Low</option>
									<option value="Newest">Newest Additions</option>
								</select>
							</div>
						</div>

						{/* Results Count */}
						<div className="mt-6 flex items-center justify-between text-xs text-on-surface-variant">
							<span>
								Showing <strong className="text-primary">{filteredAndSortedProducts.length}</strong> formulations
							</span>
							{selectedCategory !== "All" && (
								<button
									type="button"
									onClick={() => setSelectedCategory("All")}
									className="text-secondary-dark hover:underline"
								>
									Reset filter
								</button>
							)}
						</div>

						{/* Products Grid */}
						{filteredAndSortedProducts.length === 0 ? (
							<div className="mt-16 text-center py-20 rounded-2xl border border-dashed border-border-delicate">
								<p className="font-serif text-lg text-primary">No formulations found</p>
								<p className="mt-1 text-xs text-on-surface-variant">
									No active items currently match the &ldquo;{selectedCategory}&rdquo; category.
								</p>
								<button
									type="button"
									onClick={() => setSelectedCategory("All")}
									className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white"
								>
									View All Formulations
								</button>
							</div>
						) : (
							<div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
								{filteredAndSortedProducts.map((product) => (
									<ProductCard key={product.id} product={product} />
								))}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
