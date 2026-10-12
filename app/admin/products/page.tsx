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
	Sparkles,
	Edit3,
} from "lucide-react";
import { formatNaira } from "@/src/lib/utils";
import { useToast } from "@/src/context/ToastContext";
import type { Product, ProductCategory, CreateProductDto, UpdateProductDto } from "@/src/types/store";

const CATEGORIES: ProductCategory[] = [
	"Serums",
	"Moisturisers",
	"Suncare",
	"Cleansers",
	"Treatments",
];

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

	// Modal State for adding a product
	const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
	const [isSubmittingNew, setIsSubmittingNew] = useState<boolean>(false);
	const [newProductForm, setNewProductForm] = useState<{
		name: string;
		category: ProductCategory;
		price: string;
		size: string;
		tagline: string;
		description: string;
		imageUrl: string;
		keyActives: string;
		featured: boolean;
		inStock: boolean;
	}>({
		name: "",
		category: "Serums",
		price: "",
		size: "50 ml / 1.7 fl. oz.",
		tagline: "Cellular Radiance & French Botanical Protection",
		description: "An ultra-concentrated Parisian botanical elixir imported directly from France to protect and nurture melanin-rich skin barriers.",
		imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
		keyActives: "French Plant Squalane, Niacinamide, Botanical Peptides",
		featured: false,
		inStock: true,
	});

	// Modal State for editing an existing product
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
	const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);
	const [editProductForm, setEditProductForm] = useState<{
		id: string;
		name: string;
		category: ProductCategory;
		price: string;
		size: string;
		tagline: string;
		description: string;
		imageUrl: string;
		keyActives: string;
		nafdacRegNo: string;
		ritual: string;
		inci: string;
		featured: boolean;
		inStock: boolean;
	}>({
		id: "",
		name: "",
		category: "Serums",
		price: "",
		size: "",
		tagline: "",
		description: "",
		imageUrl: "",
		keyActives: "",
		nafdacRegNo: "",
		ritual: "",
		inci: "",
		featured: false,
		inStock: true,
	});

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

	const handleCreateProduct = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!newProductForm.name.trim()) {
			setError("Formulation name is required.");
			return;
		}

		const priceNum = Number(newProductForm.price);
		if (isNaN(priceNum) || priceNum <= 0) {
			setError("Please enter a valid retail price in Naira.");
			return;
		}

		setIsSubmittingNew(true);
		setError(null);

		const activesList = newProductForm.keyActives
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		const payload: CreateProductDto = {
			name: newProductForm.name.trim(),
			category: newProductForm.category,
			price: priceNum,
			size: newProductForm.size.trim(),
			tagline: newProductForm.tagline.trim(),
			description: newProductForm.description.trim(),
			images: [newProductForm.imageUrl.trim()],
			featured: newProductForm.featured,
			stockStatus: newProductForm.inStock ? "In Stock" : "Out of Stock",
			inStock: newProductForm.inStock,
			formulation: {
				keyActives: activesList.length > 0 ? activesList : ["French Botanical Extract"],
			},
		};

		try {
			const res = await fetch("/api/products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const errData = (await res.json().catch(() => ({}))) as { error?: string };
				throw new Error(errData.error || "Failed to create formulation");
			}

			const created = (await res.json()) as Product;
			setProducts((prev) => [created, ...prev]);
			setPriceInputs((prev) => ({ ...prev, [created.id]: String(created.price) }));
			setIsAddModalOpen(false);
			setSuccessMsg(`Successfully added formulation "${created.name}" to catalog!`);

			// Reset form
			setNewProductForm({
				name: "",
				category: "Serums",
				price: "",
				size: "50 ml / 1.7 fl. oz.",
				tagline: "Cellular Radiance & French Botanical Protection",
				description: "An ultra-concentrated Parisian botanical elixir imported directly from France to protect and nurture melanin-rich skin barriers.",
				imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
				keyActives: "French Plant Squalane, Niacinamide, Botanical Peptides",
				featured: false,
				inStock: true,
			});
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Error creating product");
		} finally {
			setIsSubmittingNew(false);
		}
	};

	const handleOpenEditModal = (product: Product): void => {
		setEditProductForm({
			id: product.id,
			name: product.name,
			category: product.category,
			price: String(product.price),
			size: product.size || "",
			tagline: product.tagline || "",
			description: product.description || "",
			imageUrl: product.images?.[0] || "",
			keyActives: product.formulation?.keyActives?.join(", ") || "",
			nafdacRegNo: product.nafdacRegNo || "",
			ritual: product.accordions?.ritual || "",
			inci: product.accordions?.inci || "",
			featured: Boolean(product.featured),
			inStock: product.stockStatus === "In Stock" && product.inStock !== false,
		});
		setIsEditModalOpen(true);
	};

	const handleSaveEdit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!editProductForm.name.trim()) {
			setError("Formulation name is required.");
			return;
		}

		const priceNum = Number(editProductForm.price);
		if (isNaN(priceNum) || priceNum <= 0) {
			setError("Please enter a valid retail price in Naira.");
			return;
		}

		setIsSubmittingEdit(true);
		setError(null);

		const activesList = editProductForm.keyActives
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		const payload: UpdateProductDto = {
			id: editProductForm.id,
			name: editProductForm.name.trim(),
			category: editProductForm.category,
			price: priceNum,
			size: editProductForm.size.trim(),
			tagline: editProductForm.tagline.trim(),
			description: editProductForm.description.trim(),
			images: editProductForm.imageUrl.trim() ? [editProductForm.imageUrl.trim()] : undefined,
			featured: editProductForm.featured,
			stockStatus: editProductForm.inStock ? "In Stock" : "Out of Stock",
			inStock: editProductForm.inStock,
			nafdacRegNo: editProductForm.nafdacRegNo.trim(),
			formulation: {
				keyActives: activesList,
			},
			accordions: {
				ritual: editProductForm.ritual.trim(),
				inci: editProductForm.inci.trim(),
			},
		};

		try {
			const res = await fetch("/api/products", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const errData = (await res.json().catch(() => ({}))) as { error?: string };
				throw new Error(errData.error || "Failed to update formulation");
			}

			const updated = (await res.json()) as Product;
			setProducts((prev) =>
				prev.map((p) => (p.id === updated.id ? updated : p))
			);
			setPriceInputs((prev) => ({
				...prev,
				[updated.id]: String(updated.price),
			}));
			setIsEditModalOpen(false);
			setSuccessMsg(`Successfully updated "${updated.name}"!`);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Error updating formulation");
		} finally {
			setIsSubmittingEdit(false);
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
		<div className="min-h-screen bg-surface py-10 sm:py-14">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Top Header & Actions */}
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
							Add imported Parisian formulations, adjust prices in ₦, toggle stock availability, and select featured bestsellers.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={handleRefresh}
							disabled={loading}
							className="inline-flex items-center gap-2 rounded-full border border-border-delicate bg-surface-card px-4 py-2.5 text-xs font-semibold text-primary shadow-sm hover:bg-surface-container-low transition-colors"
						>
							<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
							<span>Refresh</span>
						</button>

						<button
							type="button"
							onClick={() => setIsAddModalOpen(true)}
							className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md hover:bg-primary-dark transition-all active:scale-95"
						>
							<Plus className="h-4 w-4" />
							<span>Add Formulation</span>
						</button>
					</div>
				</div>

				{/* Inventory Metrics Strip */}
				<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div className="rounded-2xl border border-border-delicate bg-surface-card p-5 shadow-sm">
						<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							Total Catalog
						</span>
						<div className="mt-2 flex items-baseline gap-2">
							<span className="font-serif text-2xl font-bold text-primary">
								{products.length}
							</span>
							<span className="text-xs text-on-surface-variant">formulations</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-5 shadow-sm">
						<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							In Stock
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
							Featured on Home
						</span>
						<div className="mt-2 flex items-baseline gap-2">
							<span className="font-serif text-2xl font-bold text-primary">
								{featuredCount}
							</span>
							<span className="text-xs text-on-surface-variant">active</span>
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
							<button
								type="button"
								onClick={() => setIsAddModalOpen(true)}
								className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white"
							>
								<Plus className="h-4 w-4" />
								<span>Add First Product</span>
							</button>
						</div>
					) : (
						<div className="overflow-x-auto">
							{/* Header Strip */}
							<div className="grid grid-cols-12 border-b border-border-delicate bg-surface-container-low/40 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant min-w-[950px]">
								<div className="col-span-1">Thumbnail</div>
								<div className="col-span-3">Formulation Name</div>
								<div className="col-span-1">Category</div>
								<div className="col-span-2">Featured on Home</div>
								<div className="col-span-1">Price</div>
								<div className="col-span-2">Edit Price</div>
								<div className="col-span-1">Stock</div>
								<div className="col-span-1 text-right">Actions</div>
							</div>

							<table data-testid="products-table" className="w-full text-left border-collapse min-w-[950px]">
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
												<td className="w-[24%] px-5 py-4">
													<h3 className="font-serif text-sm font-semibold text-primary">
														{product.name}
													</h3>
												</td>

												{/* Category */}
												<td className="w-[12%] px-5 py-4">
													<span className="rounded-full bg-surface-container-low px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-dark">
														{product.category}
													</span>
												</td>

												{/* Featured on Home Toggle */}
												<td className="w-[16%] px-5 py-4">
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

												{/* Current Price */}
												<td className="w-[10%] px-5 py-4">
													<span className="font-bold text-sm text-primary">
														{formatNaira(product.price)}
													</span>
												</td>

												{/* Inline Price Editor */}
												<td className="w-[14%] px-5 py-4">
													<div className="flex items-center gap-1.5">
														<input
															type="number"
															name="price"
															placeholder="45500"
															value={priceInputs[product.id] ?? String(product.price)}
															onChange={(e) =>
																handlePriceInputChange(product.id, e.target.value)
															}
															className="w-20 rounded-lg border border-border-delicate bg-surface-card px-2 py-1.5 text-xs text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
														/>
														<button
															type="button"
															onClick={() => void handleSavePrice(product.id)}
															disabled={savingPriceId === product.id}
															aria-label={`Save price for ${product.name}`}
															className="inline-flex items-center gap-1 rounded-lg border border-border-delicate bg-surface-container-low px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container hover:text-primary active:scale-95 disabled:opacity-50"
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
														<span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed/50 px-2 py-0.5 text-[10px] font-bold text-on-secondary-fixed">
															<CheckCircle2 className="h-3 w-3 text-secondary-dark" />
															<span>In Stock</span>
														</span>
													) : (
														<span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2 py-0.5 text-[10px] font-bold text-on-error-container">
															<XCircle className="h-3 w-3 text-error" />
															<span>Out of Stock</span>
														</span>
													)}
												</td>

												{/* Actions: Edit, Stock Toggle, Delete */}
												<td className="w-[12%] px-5 py-4 text-right whitespace-nowrap">
													<div className="flex items-center justify-end gap-1.5">
														<button
															type="button"
															onClick={() => handleOpenEditModal(product)}
															title={`Edit ${product.name}`}
															aria-label={`Edit ${product.name}`}
															className="inline-flex items-center gap-1 rounded-lg border border-border-delicate bg-surface-container-low px-2 py-1 text-[11px] font-medium text-primary hover:border-secondary hover:text-secondary-dark transition-all active:scale-95"
														>
															<Edit3 className="h-3 w-3" />
															<span>Edit</span>
														</button>

														<button
															type="button"
															role="switch"
															aria-checked={isStockActive}
															onClick={() => void handleToggleStock(product)}
															disabled={togglingStockId === product.id}
															className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95 disabled:opacity-50 ${
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
															className="inline-flex items-center rounded-lg p-1 text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
														>
															<Trash2 className="h-3.5 w-3.5" />
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

			{/* Modal: Add New Formulation */}
			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 overflow-y-auto">
					<div className="w-full max-w-xl rounded-2xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-2xl">
						<div className="flex items-center justify-between border-b border-border-delicate pb-4">
							<div className="flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-secondary-dark" />
								<h2 className="font-serif text-xl font-medium text-primary">
									Add Imported Formulation
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setIsAddModalOpen(false)}
								className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-low"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleCreateProduct} className="mt-6 space-y-4 text-xs">
							<div>
								<label className="block font-semibold uppercase tracking-wider text-primary">
									Product Name *
								</label>
								<input
									type="text"
									required
									placeholder="e.g. Parisian Botanical Barrier Oil"
									value={newProductForm.name}
									onChange={(e) =>
										setNewProductForm({ ...newProductForm, name: e.target.value })
									}
									className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Category *
									</label>
									<select
										value={newProductForm.category}
										onChange={(e) =>
											setNewProductForm({
												...newProductForm,
												category: e.target.value as ProductCategory,
											})
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									>
										{CATEGORIES.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Price in Naira (₦) *
									</label>
									<input
										type="number"
										required
										min="1000"
										step="500"
										placeholder="32000"
										value={newProductForm.price}
										onChange={(e) =>
											setNewProductForm({ ...newProductForm, price: e.target.value })
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Volume / Size
									</label>
									<input
										type="text"
										placeholder="30 ml / 1.0 fl. oz."
										value={newProductForm.size}
										onChange={(e) =>
											setNewProductForm({ ...newProductForm, size: e.target.value })
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Tagline
									</label>
									<input
										type="text"
										placeholder="Cellular Radiance Elixir"
										value={newProductForm.tagline}
										onChange={(e) =>
											setNewProductForm({ ...newProductForm, tagline: e.target.value })
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>

							<div>
								<label className="block font-semibold uppercase tracking-wider text-primary">
									Image URL (High-Res)
								</label>
								<input
									type="url"
									placeholder="https://images.unsplash.com/..."
									value={newProductForm.imageUrl}
									onChange={(e) =>
										setNewProductForm({ ...newProductForm, imageUrl: e.target.value })
									}
									className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
								/>
							</div>

							<div>
								<label className="block font-semibold uppercase tracking-wider text-primary">
									Key Bio-Actives (Comma separated)
								</label>
								<input
									type="text"
									placeholder="French Camellia Seed Oil, 3% Niacinamide, Peptides"
									value={newProductForm.keyActives}
									onChange={(e) =>
										setNewProductForm({
											...newProductForm,
											keyActives: e.target.value,
										})
									}
									className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
								/>
							</div>

							<div>
								<label className="block font-semibold uppercase tracking-wider text-primary">
									Description
								</label>
								<textarea
									rows={5}
									value={newProductForm.description}
									onChange={(e) =>
										setNewProductForm({
											...newProductForm,
											description: e.target.value,
										})
									}
									className="mt-1.5 min-h-[120px] w-full resize-y rounded-xl border border-border-delicate bg-surface px-4 py-3 text-sm leading-relaxed text-primary focus:border-primary focus:outline-none"
								/>
							</div>

							<div className="flex items-center gap-6 pt-2">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={newProductForm.featured}
										onChange={(e) =>
											setNewProductForm({
												...newProductForm,
												featured: e.target.checked,
											})
										}
										className="h-4 w-4 rounded border-border-delicate text-primary focus:ring-primary"
									/>
									<span className="font-medium text-primary">Feature on Homepage</span>
								</label>

								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={newProductForm.inStock}
										onChange={(e) =>
											setNewProductForm({
												...newProductForm,
												inStock: e.target.checked,
											})
										}
										className="h-4 w-4 rounded border-border-delicate text-primary focus:ring-primary"
									/>
									<span className="font-medium text-primary">Immediate Stock Available</span>
								</label>
							</div>

							<div className="flex items-center justify-end gap-3 pt-4 border-t border-border-delicate">
								<button
									type="button"
									onClick={() => setIsAddModalOpen(false)}
									className="rounded-full border border-border-delicate px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmittingNew}
									className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
								>
									<span>{isSubmittingNew ? "Saving..." : "Create Formulation"}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal: Edit Formulation Details */}
			{isEditModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 overflow-y-auto">
					<div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-2xl">
						<div className="flex items-center justify-between border-b border-border-delicate pb-4">
							<div className="flex items-center gap-2">
								<Edit3 className="h-5 w-5 text-secondary-dark" />
								<div>
									<h2 className="font-serif text-xl font-medium text-primary">
										Edit Formulation Properties
									</h2>
									<p className="text-[11px] text-on-surface-variant">
										Modify description, bio-actives, pricing, and editorial specifications for {editProductForm.name}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setIsEditModalOpen(false)}
								className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-low"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleSaveEdit} className="mt-6 space-y-5 text-xs">
							<div>
								<label className="block font-semibold uppercase tracking-wider text-primary">
									Product Name *
								</label>
								<input
									type="text"
									required
									value={editProductForm.name}
									onChange={(e) =>
										setEditProductForm({ ...editProductForm, name: e.target.value })
									}
									className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Category *
									</label>
									<select
										value={editProductForm.category}
										onChange={(e) =>
											setEditProductForm({
												...editProductForm,
												category: e.target.value as ProductCategory,
											})
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									>
										{CATEGORIES.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Price in Naira (₦) *
									</label>
									<input
										type="number"
										required
										min="1000"
										step="500"
										value={editProductForm.price}
										onChange={(e) =>
											setEditProductForm({ ...editProductForm, price: e.target.value })
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Volume / Size
									</label>
									<input
										type="text"
										value={editProductForm.size}
										onChange={(e) =>
											setEditProductForm({ ...editProductForm, size: e.target.value })
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Tagline
									</label>
									<input
										type="text"
										value={editProductForm.tagline}
										onChange={(e) =>
											setEditProductForm({ ...editProductForm, tagline: e.target.value })
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>

							<div>
								<label className="block font-semibold uppercase tracking-wider text-primary">
									Description *
								</label>
								<textarea
									rows={6}
									required
									value={editProductForm.description}
									onChange={(e) =>
										setEditProductForm({
											...editProductForm,
											description: e.target.value,
										})
									}
									className="mt-1.5 min-h-[150px] w-full resize-y rounded-xl border border-border-delicate bg-surface px-4 py-3 text-sm leading-relaxed text-primary focus:border-primary focus:outline-none"
								/>
							</div>

							<div>
								<label className="block font-semibold uppercase tracking-wider text-primary">
									Image URL (High-Res)
								</label>
								<input
									type="url"
									value={editProductForm.imageUrl}
									onChange={(e) =>
										setEditProductForm({ ...editProductForm, imageUrl: e.target.value })
									}
									className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Key Bio-Actives (Comma separated)
									</label>
									<input
										type="text"
										value={editProductForm.keyActives}
										onChange={(e) =>
											setEditProductForm({
												...editProductForm,
												keyActives: e.target.value,
											})
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										NAFDAC Registration No.
									</label>
									<input
										type="text"
										value={editProductForm.nafdacRegNo}
										onChange={(e) =>
											setEditProductForm({
												...editProductForm,
												nafdacRegNo: e.target.value,
											})
										}
										className="mt-1 w-full rounded-xl border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>

							<div>
								<label className="block font-semibold uppercase tracking-wider text-primary">
									Application Ritual (Accordion)
								</label>
								<textarea
									rows={4}
									value={editProductForm.ritual}
									onChange={(e) =>
										setEditProductForm({
											...editProductForm,
											ritual: e.target.value,
										})
									}
									className="mt-1.5 min-h-[115px] w-full resize-y rounded-xl border border-border-delicate bg-surface px-4 py-3 text-sm leading-relaxed text-primary focus:border-primary focus:outline-none"
								/>
							</div>

							<div>
								<label className="block font-semibold uppercase tracking-wider text-primary">
									INCI Full Ingredients List (Accordion)
								</label>
								<textarea
									rows={4}
									value={editProductForm.inci}
									onChange={(e) =>
										setEditProductForm({
											...editProductForm,
											inci: e.target.value,
										})
									}
									className="mt-1.5 min-h-[115px] w-full resize-y rounded-xl border border-border-delicate bg-surface px-4 py-3 text-sm leading-relaxed text-primary focus:border-primary focus:outline-none"
								/>
							</div>

							<div className="flex items-center gap-6 pt-2">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={editProductForm.featured}
										onChange={(e) =>
											setEditProductForm({
												...editProductForm,
												featured: e.target.checked,
											})
										}
										className="h-4 w-4 rounded border-border-delicate text-primary focus:ring-primary"
									/>
									<span className="font-medium text-primary">Feature on Homepage</span>
								</label>

								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={editProductForm.inStock}
										onChange={(e) =>
											setEditProductForm({
												...editProductForm,
												inStock: e.target.checked,
											})
										}
										className="h-4 w-4 rounded border-border-delicate text-primary focus:ring-primary"
									/>
									<span className="font-medium text-primary">Immediate Stock Available</span>
								</label>
							</div>

							<div className="flex items-center justify-end gap-3 pt-4 border-t border-border-delicate">
								<button
									type="button"
									onClick={() => setIsEditModalOpen(false)}
									className="rounded-full border border-border-delicate px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmittingEdit}
									className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
								>
									<span>{isSubmittingEdit ? "Saving..." : "Save Changes"}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
