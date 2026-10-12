"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import type { Product } from "@/src/types/store";
import { useToast } from "@/src/context/ToastContext";
import { ProductCard } from "./ProductCard";

export interface FeaturedBotanicalGridProps {
	products: Product[];
	initialError?: string | null;
}

export function FeaturedBotanicalGrid({
	products: initialProducts,
	initialError,
}: FeaturedBotanicalGridProps): React.JSX.Element {
	const [products, setProducts] = useState<Product[]>(initialProducts);
	const [error, setError] = useState<string | null>(initialError ?? null);
	const [isRetrying, setIsRetrying] = useState<boolean>(false);
	const { toast } = useToast();

	useEffect(() => {
		if (initialError) {
			toast.error(initialError, "Backend Connection Failed");
		}
	}, [initialError, toast]);

	const handleRetry = async (): Promise<void> => {
		setIsRetrying(true);
		setError(null);
		try {
			const res = await fetch("/api/products", { cache: "no-store" });
			if (!res.ok) {
				const errData = (await res.json().catch(() => ({}))) as { error?: string };
				throw new Error(errData.error || `HTTP ${res.status}: Failed to fetch products`);
			}
			const data = (await res.json()) as Product[];
			setProducts(data);
			toast.success("Successfully loaded formulations from backend", "Connected");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Failed to connect to backend";
			setError(msg);
			toast.error(msg, "Backend Connection Failed");
		} finally {
			setIsRetrying(false);
		}
	};

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

				{error && products.length === 0 ? (
					<div className="rounded-2xl border border-error/30 bg-[#281316] p-8 text-center text-[#FFE8EA] shadow-lg">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/20 text-[#FF6E7F]">
							<AlertCircle className="h-6 w-6" />
						</div>
						<h3 className="mt-4 font-serif text-lg font-medium text-white">
							Unable to Load Catalog from Backend
						</h3>
						<p className="mt-1 text-xs text-[#FFE8EA]/80 max-w-md mx-auto">
							{error}
						</p>
						<button
							type="button"
							onClick={() => void handleRetry()}
							disabled={isRetrying}
							className="mt-6 inline-flex items-center gap-2 rounded-full border border-error/40 bg-surface px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-surface-card transition-all disabled:opacity-50"
						>
							<RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
							<span>{isRetrying ? "Connecting..." : "Retry Backend Connection"}</span>
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{displayProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
