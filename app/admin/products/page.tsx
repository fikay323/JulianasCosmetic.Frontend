"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	Package,
	RefreshCw,
	Check,
	AlertCircle,
	CheckCircle2,
	XCircle,
	Star,
	Plus,
	Trash2,
	X,
	Edit3,
} from "lucide-react";
import { formatNaira } from "@/src/lib/utils";
import { useToast } from "@/src/context/ToastContext";
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader";
import type { Product } from "@/src/types/store";

export default function AdminProductsPage(): React.JSX.Element {
	const { toast } = useToast();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
	const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
	const [togglingStockId, setTogglingStockId] = useState<string | null>(null);
	const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [brokenImageIds, setBrokenImageIds] = useState<Record<string, boolean>>({});

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
			const msg = err instanceof Error ? err.message : "Error fetching products from backend";
			setError(msg);
			toast.error(msg, "Backend Catalog Error");
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		queueMicrotask(() => {
			void loadProducts();
		});
	}, [loadProducts]);

	const handleRefresh = (): void => {
		setLoading(true);
		setError(null);
		setSuccessMsg(null);
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
		setError(null);
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
			setSuccessMsg(`Updated price for "${updated.name}" to ${formatNaira(updated.price)}`);
		} catch (err: unknown) {
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
		setError(null);
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
			setSuccessMsg(`"${updated.name}" marked as ${nextStatus}`);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Error updating stock");
		} finally {
			setTogglingStockId(null);
		}
	};

	const handleToggleFeatured = async (product: Product): Promise<void> => {
		const nextFeatured = !product.featured;
		setTogglingFeaturedId(product.id);
		setError(null);
		try {
			const res = await fetch("/api/products", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: product.id,
					featured: nextFeatured,
				}),
			});

			if (!res.ok) {
				throw new Error("Failed to update featured status");
			}

			const updated = (await res.json()) as Product;
			setProducts((prev) =>
				prev.map((p) => (p.id === product.id ? updated : p))
			);
			setSuccessMsg(
				nextFeatured
					? `"${updated.name}" is now featured on the homepage.`
					: `"${updated.name}" removed from homepage featured list.`
			);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Error toggling featured status");
		} finally {
			setTogglingFeaturedId(null);
		}
	};

	const handleDeleteProduct = async (product: Product): Promise<void> => {
		const confirmDelete = window.confirm(
			`Are you sure you want to permanently delete "${product.name}"?`
		);
		if (!confirmDelete) return;

		setDeletingId(product.id);
		setError(null);
		try {
			const res = await fetch(`/api/products?id=${encodeURIComponent(product.id)}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				throw new Error("Failed to delete product");
			}

			setProducts((prev) => prev.filter((p) => p.id !== product.id));
			setSuccessMsg(`Deleted "${product.name}" from catalog.`);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Error deleting product");
		} finally {
			setDeletingId(null);
		}
	};

	const inStockCount = products.filter(
		(p) => p.stockStatus === "In Stock" && p.inStock !== false
	).length;
	const featuredCount = products.filter((p) => p.featured).length;
	const avgPrice =
		products.length > 0
			? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
			: 0;

	return (
		<div className="min-h-screen bg-surface py-8 sm:py-14">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Top Central Reusable Header */}
				<AdminPageHeader
					breadcrumbs={[
						{ label: "Admin Portal", href: "/admin" },
						{ label: "Products Management", active: true },
					]}
					title="Botanical Catalog & Inventory"
					description="Add imported Parisian formulations, adjust prices in ₦, toggle stock availability, and select featured bestsellers."
					actions={
						<>
							<button
								type="button"
								onClick={handleRefresh}
								disabled={loading}
								className="inline-flex items-center gap-2 rounded-full border border-border-delicate bg-surface-card px-4 py-2.5 text-xs font-semibold text-primary shadow-sm hover:bg-surface-container-low transition-colors cursor-pointer"
							>
								<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
								<span>Refresh</span>
							</button>

							<Link
								href="/admin/products/new"
								className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md hover:bg-primary-dark transition-all active:scale-95"
							>
								<Plus className="h-4 w-4" />
								<span>Add Formulation</span>
							</Link>
						</>
					}
				/>

				{/* Inventory Metrics Strip */}
				<div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
					<div className="rounded-2xl border border-border-delicate bg-surface-card p-4 sm:p-5 shadow-sm">
						<span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							Total Catalog
						</span>
						<div className="mt-2 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
							<span className="font-serif text-xl sm:text-2xl font-bold text-primary">
								{products.length}
							</span>
							<span className="text-[11px] sm:text-xs text-on-surface-variant">formulations</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-4 sm:p-5 shadow-sm">
						<span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							In Stock
						</span>
						<div className="mt-2 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
							<span className="font-serif text-xl sm:text-2xl font-bold text-secondary-dark">
								{inStockCount}
							</span>
							<span className="text-[11px] sm:text-xs text-on-surface-variant">available</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-4 sm:p-5 shadow-sm">
						<span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							Featured on Home
						</span>
						<div className="mt-2 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
							<span className="font-serif text-xl sm:text-2xl font-bold text-primary">
								{featuredCount}
							</span>
							<span className="text-[11px] sm:text-xs text-on-surface-variant">active</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-4 sm:p-5 shadow-sm">
						<span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							Average Price
						</span>
						<div className="mt-2 flex items-baseline gap-2">
							<span className="font-serif text-xl sm:text-2xl font-bold text-primary">
								{formatNaira(avgPrice)}
							</span>
						</div>
					</div>
				</div>

				{/* Status Alerts */}
				{error && (
					<div className="mt-6 flex items-center justify-between rounded-xl border border-error/30 bg-error-container p-4 text-xs font-medium text-on-error-container">
						<div className="flex items-center gap-2">
							<AlertCircle className="h-4 w-4 flex-shrink-0" />
							<span>{error}</span>
						</div>
						<button type="button" onClick={() => setError(null)} className="text-on-error-container hover:opacity-75">
							<X className="h-4 w-4" />
						</button>
					</div>
				)}

				{successMsg && (
					<div className="mt-6 flex items-center justify-between rounded-xl border border-secondary-fixed/50 bg-secondary-fixed/20 p-4 text-xs font-medium text-on-secondary-fixed">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-secondary-dark" />
							<span>{successMsg}</span>
						</div>
						<button type="button" onClick={() => setSuccessMsg(null)} className="hover:opacity-75">
							<X className="h-4 w-4" />
						</button>
					</div>
				)}

				{/* Products Catalog Table (Responsive Card List on Mobile, Full Table on Desktop) */}
				<div className="mt-6 sm:mt-8 overflow-hidden rounded-2xl border border-border-delicate bg-surface-card shadow-sm">
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
							<Link
								href="/admin/products/new"
								className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white"
							>
								<Plus className="h-4 w-4" />
								<span>Add First Product</span>
							</Link>
						</div>
					) : (
						<div className="lg:overflow-x-auto">
							<table
								data-testid="products-table"
								className="block lg:table w-full text-left border-collapse"
							>
								<thead className="hidden lg:table-header-group border-b border-border-delicate bg-surface-container-low/50 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
									<tr className="lg:table-row">
										<th className="py-4 pl-6 pr-3 whitespace-nowrap">Thumbnail</th>
										<th className="px-4 py-4 whitespace-nowrap">Formulation Name</th>
										<th className="px-4 py-4 whitespace-nowrap">Category</th>
										<th className="px-4 py-4 whitespace-nowrap">Featured on Home</th>
										<th className="px-4 py-4 whitespace-nowrap">Price</th>
										<th className="px-4 py-4 whitespace-nowrap">Edit Price</th>
										<th className="px-4 py-4 whitespace-nowrap">Stock</th>
										<th className="py-4 pl-4 pr-6 text-right whitespace-nowrap">Actions</th>
									</tr>
								</thead>
								<tbody className="block lg:table-row-group divide-y divide-border-delicate text-xs text-primary">
									{products.map((product) => {
										const isStockActive =
											product.stockStatus === "In Stock" &&
											product.inStock !== false;
										const fallbackImage =
											"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80";
										const imageSrc = brokenImageIds[product.id]
											? fallbackImage
											: product.images?.[0] || fallbackImage;

										return (
											<tr
												key={product.id}
												data-testid="product-row"
												className="grid grid-cols-[64px_1fr_auto] gap-x-3.5 gap-y-3 p-4 sm:p-5 lg:table-row lg:p-0 hover:bg-surface-container-low/30 transition-colors"
											>
												{/* 1. Thumbnail */}
												<td className="col-start-1 row-start-1 row-span-2 lg:table-cell lg:py-4 lg:pl-6 lg:pr-3 lg:align-middle">
													<div className="relative h-16 w-16 lg:h-14 lg:w-14 overflow-hidden rounded-xl border border-border-delicate bg-surface-container-low shadow-2xs">
														<Image
															src={imageSrc}
															alt={product.name}
															fill
															sizes="64px"
															className="object-cover"
															onError={() =>
																setBrokenImageIds((prev) => ({
																	...prev,
																	[product.id]: true,
																}))
															}
														/>
													</div>
												</td>

												{/* 2. Formulation Name */}
												<td className="col-start-2 col-span-2 row-start-1 self-end lg:table-cell lg:min-w-[200px] lg:px-4 lg:py-4 lg:align-middle">
													<h3 className="font-serif text-base lg:text-sm font-semibold text-primary leading-snug">
														{product.name}
													</h3>
												</td>

												{/* 3. Category */}
												<td className="col-start-2 row-start-2 self-start lg:table-cell lg:px-4 lg:py-4 lg:align-middle">
													<span className="inline-block rounded-full bg-surface-container-low px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-dark">
														{product.category}
													</span>
												</td>

												{/* 4. Featured on Home Toggle */}
												<td className="col-start-1 col-span-3 row-start-4 flex items-center justify-between rounded-xl bg-surface-container-low/40 px-3 py-2 lg:table-cell lg:rounded-none lg:bg-transparent lg:px-4 lg:py-4 lg:align-middle">
													<span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant lg:hidden">
														Homepage Spotlight
													</span>
													<button
														type="button"
														onClick={() => void handleToggleFeatured(product)}
														disabled={togglingFeaturedId === product.id}
														className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${
															product.featured
																? "bg-secondary-fixed text-on-secondary-fixed border border-secondary"
																: "bg-surface-container-low text-on-surface-variant border border-border-delicate hover:text-primary"
														}`}
													>
														<Star
															className={`h-3.5 w-3.5 ${
																product.featured
																	? "fill-secondary-dark text-secondary-dark"
																	: "text-on-surface-variant"
															}`}
														/>
														<span>
															{togglingFeaturedId === product.id
																? "Saving..."
																: product.featured
																	? "Featured"
																	: "Not Featured"}
														</span>
													</button>
												</td>

												{/* 5. Current Price */}
												<td className="col-start-1 col-span-1 row-start-3 self-center pt-1 lg:table-cell lg:px-4 lg:py-4 lg:pt-4 lg:align-middle whitespace-nowrap">
													<span className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant lg:hidden">
														Price
													</span>
													<span className="font-bold text-sm text-primary">
														{formatNaira(product.price)}
													</span>
												</td>

												{/* 6. Inline Price Editor */}
												<td className="col-start-2 col-span-2 row-start-3 self-center justify-self-end pt-1 lg:table-cell lg:px-4 lg:py-4 lg:pt-4 lg:align-middle">
													<div className="flex items-center gap-1.5">
														<input
															type="number"
															name="price"
															placeholder="45500"
															value={priceInputs[product.id] ?? String(product.price)}
															onChange={(e) =>
																handlePriceInputChange(product.id, e.target.value)
															}
															className="w-24 sm:w-28 lg:w-24 rounded-lg border border-border-delicate bg-surface-card px-2.5 py-1.5 text-xs text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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

												{/* 7. Stock Status Badge */}
												<td className="col-start-3 row-start-2 self-start justify-self-end whitespace-nowrap lg:table-cell lg:px-4 lg:py-4 lg:align-middle">
													{isStockActive ? (
														<span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed/50 px-2.5 py-0.5 text-[10px] font-bold text-on-secondary-fixed">
															<CheckCircle2 className="h-3 w-3 text-secondary-dark" />
															<span>In Stock</span>
														</span>
													) : (
														<span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2.5 py-0.5 text-[10px] font-bold text-on-error-container">
															<XCircle className="h-3 w-3 text-error" />
															<span>Out of Stock</span>
														</span>
													)}
												</td>

												{/* 8. Actions: Edit, Stock Toggle, Delete */}
												<td className="col-start-1 col-span-3 row-start-5 border-t border-border-delicate/60 pt-3 lg:table-cell lg:border-0 lg:py-4 lg:pl-4 lg:pr-6 lg:text-right lg:align-middle whitespace-nowrap">
													<div className="flex items-center justify-between gap-2 lg:justify-end lg:gap-1.5">
														<Link
															href={`/admin/products/${product.id}/edit`}
															title={`Edit ${product.name}`}
															aria-label={`Edit ${product.name}`}
															className="inline-flex flex-1 lg:flex-initial items-center justify-center gap-1.5 rounded-lg border border-border-delicate bg-surface-container-low px-3 py-2 lg:px-2.5 lg:py-1 text-xs lg:text-[11px] font-medium text-primary hover:border-secondary hover:text-secondary-dark transition-all active:scale-95"
														>
															<Edit3 className="h-3.5 w-3.5 lg:h-3 lg:w-3" />
															<span>Edit</span>
														</Link>

														<button
															type="button"
															role="switch"
															aria-checked={isStockActive}
															onClick={() => void handleToggleStock(product)}
															disabled={togglingStockId === product.id}
															className={`inline-flex flex-1 lg:flex-initial items-center justify-center rounded-lg border px-3 py-2 lg:px-2.5 lg:py-1 text-xs lg:text-[11px] font-medium transition-all active:scale-95 disabled:opacity-50 ${
																isStockActive
																	? "border-border-delicate bg-surface-container-low text-primary hover:border-error hover:text-error"
																	: "border-primary bg-primary text-white hover:bg-primary/90"
															}`}
														>
															<span>
																{togglingStockId === product.id
																	? "..."
																	: isStockActive
																		? "Mark Out of Stock"
																		: "Mark In Stock"}
															</span>
														</button>

														<button
															type="button"
															onClick={() => void handleDeleteProduct(product)}
															disabled={deletingId === product.id}
															title={`Delete ${product.name}`}
															className="inline-flex items-center justify-center rounded-lg border border-transparent p-2 lg:p-1.5 text-on-surface-variant hover:border-error/20 hover:bg-error-container hover:text-error transition-colors"
														>
															<Trash2 className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
														</button>
													</div>
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
