"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	Package,
	ArrowLeft,
	RefreshCw,
	Check,
	AlertCircle,
	CheckCircle2,
	XCircle,
} from "lucide-react";
import { formatNaira } from "@/src/lib/utils";
import type { Product } from "@/src/types/store";

export default function AdminProductsPage(): React.JSX.Element {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
	const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
	const [togglingStockId, setTogglingStockId] = useState<string | null>(null);

	const loadProducts = useCallback(async (): Promise<void> => {
		try {
			const res = await fetch("/api/products", {
				cache: "no-store",
			});
			if (!res.ok) {
				throw new Error("Failed to load products");
			}
			const data = (await res.json()) as Product[];
			setProducts(data);

			// Prepopulate price inputs
			const initialPrices: Record<string, string> = {};
			data.forEach((p) => {
				initialPrices[p.id] = String(p.price);
			});
			setPriceInputs(initialPrices);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Error fetching products";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		let isMounted = true;
		fetch("/api/products", { cache: "no-store" })
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to load products");
				}
				return res.json();
			})
			.then((data: unknown) => {
				if (isMounted && Array.isArray(data)) {
					const productsData = data as Product[];
					setProducts(productsData);
					const initialPrices: Record<string, string> = {};
					productsData.forEach((p) => {
						initialPrices[p.id] = String(p.price);
					});
					setPriceInputs(initialPrices);
					setLoading(false);
				}
			})
			.catch((err: unknown) => {
				if (isMounted) {
					const msg = err instanceof Error ? err.message : "Error fetching products";
					setError(msg);
					setLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const handleRefresh = (): void => {
		setLoading(true);
		setError(null);
		void loadProducts();
	};

	const handlePriceInputChange = (productId: string, value: string): void => {
		setPriceInputs((prev) => ({
			...prev,
			[productId]: value,
		}));
	};

	const handleSavePrice = async (productId: string): Promise<void> => {
		const rawValue = priceInputs[productId];
		const newPrice = Number(rawValue);

		if (isNaN(newPrice) || newPrice <= 0) {
			setError("Please enter a valid price in Naira");
			return;
		}

		setSavingPriceId(productId);
		try {
			const res = await fetch("/api/products", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: productId,
					price: newPrice,
				}),
			});

			if (!res.ok) {
				throw new Error("Failed to update product price");
			}

			const updated = (await res.json()) as Product;
			setProducts((prev) =>
				prev.map((p) => (p.id === productId ? updated : p))
			);
		} catch (err: unknown) {
			console.error("[handleSavePrice] Error:", err);
			setError(err instanceof Error ? err.message : "Error saving price");
		} finally {
			setSavingPriceId(null);
		}
	};

	const handleToggleStock = async (product: Product): Promise<void> => {
		const isCurrentlyInStock =
			product.stockStatus === "In Stock" && product.inStock !== false;
		const nextStatus = isCurrentlyInStock ? "Out of Stock" : "In Stock";
		const nextInStock = !isCurrentlyInStock;

		setTogglingStockId(product.id);
		try {
			const res = await fetch("/api/products", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: product.id,
					stockStatus: nextStatus,
					inStock: nextInStock,
				}),
			});

			if (!res.ok) {
				throw new Error("Failed to toggle stock status");
			}

			const updated = (await res.json()) as Product;
			setProducts((prev) =>
				prev.map((p) => (p.id === product.id ? updated : p))
			);
		} catch (err: unknown) {
			console.error("[handleToggleStock] Error:", err);
			setError(err instanceof Error ? err.message : "Error updating stock");
		} finally {
			setTogglingStockId(null);
		}
	};

	const inStockCount = products.filter(
		(p) => p.stockStatus === "In Stock" && p.inStock !== false
	).length;
	const outOfStockCount = products.length - inStockCount;
	const avgPrice =
		products.length > 0
			? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
			: 0;

	return (
		<div className="min-h-screen bg-surface py-10 sm:py-14">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Top Navigation & Breadcrumbs */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-delicate pb-6">
					<div>
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							<Link href="/admin" className="hover:text-primary transition-colors">
								Admin Portal
							</Link>
							<span>/</span>
							<span className="text-secondary-dark">Products Management</span>
						</div>
						<h1 className="mt-2 font-serif text-3xl font-medium text-primary sm:text-4xl">
							Botanical Catalog & Inventory
						</h1>
						<p className="mt-1 text-xs text-on-surface-variant">
							Manage luxury formulation prices in Naira (₦) and toggle live stock availability across the storefront.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={handleRefresh}
							disabled={loading}
							className="inline-flex items-center gap-2 rounded-full border border-border-delicate bg-surface-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-surface-container-low disabled:opacity-50"
						>
							<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
							<span>Refresh</span>
						</button>
						<Link
							href="/admin"
							className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-primary/90"
						>
							<ArrowLeft className="h-3.5 w-3.5" />
							<span>Admin Hub</span>
						</Link>
					</div>
				</div>

				{/* Header Metrics Strip */}
				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-2xl border border-border-delicate bg-surface-card p-5 shadow-sm">
						<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							Total Formulations
						</span>
						<div className="mt-2 flex items-baseline gap-2">
							<span className="font-serif text-2xl font-bold text-primary">
								{products.length}
							</span>
							<span className="text-xs text-on-surface-variant">SKUs</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-5 shadow-sm">
						<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							Active In Stock
						</span>
						<div className="mt-2 flex items-baseline gap-2">
							<span className="font-serif text-2xl font-bold text-secondary-dark">
								{inStockCount}
							</span>
							<span className="text-xs text-on-surface-variant">available</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-5 shadow-sm">
						<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							Out of Stock
						</span>
						<div className="mt-2 flex items-baseline gap-2">
							<span className="font-serif text-2xl font-bold text-error">
								{outOfStockCount}
							</span>
							<span className="text-xs text-on-surface-variant">exhausted</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-5 shadow-sm">
						<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							Average Price
						</span>
						<div className="mt-2 flex items-baseline gap-2">
							<span className="font-serif text-2xl font-bold text-primary">
								{formatNaira(avgPrice)}
							</span>
						</div>
					</div>
				</div>

				{/* Error Notification */}
				{error && (
					<div className="mt-6 flex items-center gap-2 rounded-xl border border-error/30 bg-error-container p-4 text-xs font-medium text-on-error-container">
						<AlertCircle className="h-4 w-4" />
						<span>{error}</span>
					</div>
				)}

				{/* Products Catalog Table */}
				<div className="mt-8 overflow-hidden rounded-2xl border border-border-delicate bg-surface-card shadow-sm">
					{loading && products.length === 0 ? (
						<div className="p-12 text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							<p className="font-serif text-base text-primary">Loading Catalog...</p>
							<p className="mt-1 text-xs text-on-surface-variant">Reading formulation inventory</p>
						</div>
					) : products.length === 0 ? (
						<div className="p-12 text-center">
							<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-low text-primary/40">
								<Package className="h-7 w-7" />
							</div>
							<h3 className="font-serif text-lg font-medium text-primary">No Products Found</h3>
						</div>
					) : (
						<div className="overflow-x-auto">
							{/* Header Strip */}
							<div className="grid grid-cols-12 border-b border-border-delicate bg-surface-container-low/40 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant min-w-[750px]">
								<div className="col-span-1">Thumbnail</div>
								<div className="col-span-4">Formulation Name</div>
								<div className="col-span-2">Category</div>
								<div className="col-span-1">Price</div>
								<div className="col-span-2">Edit Price</div>
								<div className="col-span-1">Stock</div>
								<div className="col-span-1 text-right">Toggle</div>
							</div>

							<table data-testid="products-table" className="w-full text-left border-collapse min-w-[750px]">
								<tbody className="divide-y divide-border-delicate text-xs text-primary">
									{products.map((product) => {
										const isStockActive =
											product.stockStatus === "In Stock" &&
											product.inStock !== false;
										const imageSrc =
											product.images?.[0] ||
											"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80";

										return (
											<tr
												key={product.id}
												data-testid="product-row"
												className="hover:bg-surface-container-low/30 transition-colors"
											>
												{/* Thumbnail */}
												<td className="w-[8%] px-5 py-4">
													<div className="relative h-14 w-14 overflow-hidden rounded-xl border border-border-delicate bg-surface-container-low">
														<Image
															src={imageSrc}
															alt={product.name}
															fill
															sizes="56px"
															className="object-cover"
														/>
													</div>
												</td>

												{/* Formulation Name */}
												<td className="w-[34%] px-5 py-4">
													<h3 className="font-serif text-sm font-semibold text-primary">
														{product.name}
													</h3>
												</td>

												{/* Category */}
												<td className="w-[16%] px-5 py-4">
													<span className="rounded-full bg-surface-container-low px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-dark">
														{product.category}
													</span>
												</td>

												{/* Current Price */}
												<td className="w-[10%] px-5 py-4">
													<span className="font-bold text-sm text-primary">
														{formatNaira(product.price)}
													</span>
												</td>

												{/* Inline Price Editor */}
												<td className="w-[16%] px-5 py-4">
													<div className="flex items-center gap-1.5">
														<input
															type="number"
															name="price"
															placeholder="45500"
															value={priceInputs[product.id] ?? String(product.price)}
															onChange={(e) =>
																handlePriceInputChange(product.id, e.target.value)
															}
															className="w-28 rounded-lg border border-border-delicate bg-surface-card px-2.5 py-1.5 text-xs text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
														/>
														<button
															type="button"
															onClick={() => void handleSavePrice(product.id)}
															disabled={savingPriceId === product.id}
															aria-label={`Save price for ${product.name}`}
															className="inline-flex items-center gap-1 rounded-lg border border-border-delicate bg-surface-container-low px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container hover:text-primary active:scale-95 disabled:opacity-50"
														>
															<Check className="h-3 w-3" />
															<span>
																{savingPriceId === product.id ? "..." : "Save"}
															</span>
														</button>
													</div>
												</td>

												{/* Stock Status Badge */}
												<td className="w-[8%] px-5 py-4 whitespace-nowrap">
													{isStockActive ? (
														<span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed/50 px-2.5 py-1 text-[11px] font-bold text-on-secondary-fixed">
															<CheckCircle2 className="h-3 w-3 text-secondary-dark" />
															<span>In Stock</span>
														</span>
													) : (
														<span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2.5 py-1 text-[11px] font-bold text-on-error-container">
															<XCircle className="h-3 w-3 text-error" />
															<span>Out of Stock</span>
														</span>
													)}
												</td>

												{/* Stock Toggle Switch */}
												<td className="w-[8%] px-5 py-4 text-right whitespace-nowrap">
													<button
														type="button"
														role="switch"
														aria-checked={isStockActive}
														onClick={() => void handleToggleStock(product)}
														disabled={togglingStockId === product.id}
														className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${
															isStockActive
																? "border-secondary-fixed-dim bg-surface-container-low text-primary hover:border-error hover:text-error"
																: "border-border-delicate bg-primary text-white hover:bg-primary/90"
														}`}
													>
														<span className="text-[11px]">
															{togglingStockId === product.id
																? "Updating..."
																: isStockActive
																? "Mark Out of Stock"
																: "Mark In Stock"}
														</span>
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
