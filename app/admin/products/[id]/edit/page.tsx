"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Sparkles,
	Eye,
	AlertCircle,
	CheckCircle2,
	Layers,
	FileText,
	DollarSign,
	ShieldCheck,
	Sparkle,
	ArrowLeft,
} from "lucide-react";
import { MultiProductImageUploader } from "@/src/components/admin/MultiProductImageUploader";
import { ProductPreviewView } from "@/src/components/admin/ProductPreviewView";
import { useToast } from "@/src/context/ToastContext";
import type {
	Product,
	ProductCategory,
	UpdateProductDto,
	UploadedVisual,
} from "@/src/types/store";
import type { ProductDraftState } from "@/src/hooks/useProductDraft";

const CATEGORIES: ProductCategory[] = [
	"Serums",
	"Moisturisers",
	"Suncare",
	"Cleansers",
	"Treatments",
];

interface EditFormState {
	name: string;
	slug: string;
	category: ProductCategory;
	price: string;
	size: string;
	tagline: string;
	description: string;
	nafdacRegNo: string;
	keyActives: string;
	phLevel: string;
	texture: string;
	skinType: string;
	bioActives: string;
	inci: string;
	ritual: string;
	inStock: boolean;
	featured: boolean;
	visuals: UploadedVisual[];
}

interface EditProductPageProps {
	params: Promise<{ id: string }>;
}

export default function EditProductPage({
	params,
}: EditProductPageProps): React.JSX.Element {
	const resolvedParams = use(params);
	const productId = resolvedParams.id;

	const router = useRouter();
	const { toast } = useToast();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [hasPendingImagePreviews, setHasPendingImagePreviews] = useState<boolean>(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	// Navigation Guard state
	const [showExitConfirmDialog, setShowExitConfirmDialog] = useState<boolean>(false);
	const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);

	const [initialState, setInitialState] = useState<EditFormState | null>(null);
	const [formData, setFormData] = useState<EditFormState>({
		name: "",
		slug: "",
		category: "Serums",
		price: "",
		size: "",
		tagline: "",
		description: "",
		nafdacRegNo: "",
		keyActives: "",
		phLevel: "",
		texture: "",
		skinType: "",
		bioActives: "",
		inci: "",
		ritual: "",
		inStock: true,
		featured: false,
		visuals: [],
	});

	// Load existing product on mount
	useEffect(() => {
		let isMounted = true;

		async function loadProduct(): Promise<void> {
			setIsLoading(true);
			setFetchError(null);

			try {
				const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
					cache: "no-store",
				});

				if (!res.ok) {
					throw new Error(
						res.status === 404
							? `Product "${productId}" was not found.`
							: `Failed to load product (status ${res.status})`
					);
				}

				const product = (await res.json()) as Product;

				if (!isMounted) return;

				// Convert existing product image URLs into UploadedVisual format
				const loadedVisuals: UploadedVisual[] = (product.images || []).map(
					(url, idx) => {
						// Extract public ID from Cloudinary URL if possible, otherwise generate a stable ID
						const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z]+)?$/);
						const publicId = match ? match[1] : `existing-${idx}`;
						return {
							id: `visual-${idx}-${publicId}`,
							url,
							publicId,
							fileName: `visual-${idx + 1}.jpg`,
						};
					}
				);

				const state: EditFormState = {
					name: product.name || "",
					slug: product.slug || "",
					category: product.category || "Serums",
					price: String(product.price || ""),
					size: product.size || "",
					tagline: product.tagline || "",
					description: product.description || "",
					nafdacRegNo: product.nafdacRegNo || "",
					keyActives: product.formulation?.keyActives?.join(", ") || "",
					phLevel: product.formulation?.phLevel || "",
					texture: product.formulation?.texture || "",
					skinType: product.formulation?.skinType || "",
					bioActives: product.accordions?.bioActives || "",
					inci: product.accordions?.inci || "",
					ritual: product.accordions?.ritual || "",
					inStock: product.inStock !== false && product.stockStatus !== "Out of Stock",
					featured: Boolean(product.featured),
					visuals: loadedVisuals,
				};

				setFormData(state);
				setInitialState(state);
			} catch (err: unknown) {
				if (!isMounted) return;
				const msg = err instanceof Error ? err.message : "Error loading formulation";
				setFetchError(msg);
				toast.error(msg, "Error Loading Product");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadProduct();

		return () => {
			isMounted = false;
		};
	}, [productId, toast]);

	// Dirty state check
	const isDirty = Boolean(
		initialState &&
		(formData.name !== initialState.name ||
			formData.category !== initialState.category ||
			formData.price !== initialState.price ||
			formData.size !== initialState.size ||
			formData.tagline !== initialState.tagline ||
			formData.description !== initialState.description ||
			formData.nafdacRegNo !== initialState.nafdacRegNo ||
			formData.keyActives !== initialState.keyActives ||
			formData.phLevel !== initialState.phLevel ||
			formData.texture !== initialState.texture ||
			formData.skinType !== initialState.skinType ||
			formData.bioActives !== initialState.bioActives ||
			formData.inci !== initialState.inci ||
			formData.ritual !== initialState.ritual ||
			formData.inStock !== initialState.inStock ||
			formData.featured !== initialState.featured ||
			formData.visuals.length !== initialState.visuals.length ||
			formData.visuals.some((v, i) => v.url !== initialState.visuals[i]?.url))
	);

	// Browser beforeunload guard
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
			if (isDirty && !isSaving) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isDirty, isSaving]);

	const handleRequestNavigation = (href: string, e?: React.MouseEvent): void => {
		if (isDirty && !isSaving) {
			e?.preventDefault();
			setPendingNavigationHref(href);
			setShowExitConfirmDialog(true);
		} else {
			router.push(href);
		}
	};

	const handleConfirmDiscardAndLeave = (): void => {
		setShowExitConfirmDialog(false);
		if (pendingNavigationHref) {
			router.push(pendingNavigationHref);
		} else {
			router.push("/admin/products");
		}
	};

	const updateField = <K extends keyof EditFormState>(
		field: K,
		value: EditFormState[K]
	): void => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = useCallback(async (): Promise<void> => {
		if (!formData.name.trim()) {
			setSaveError("Formulation Name is required.");
			toast.error("Please enter a formulation name.", "Missing Formulation Name");
			return;
		}

		const priceNum = Number(formData.price);
		if (isNaN(priceNum) || priceNum <= 0) {
			setSaveError("A valid retail price in Naira (₦) is required.");
			toast.error("Please enter a valid price.", "Invalid Price");
			return;
		}

		if (hasPendingImagePreviews) {
			toast.info(
				"Please confirm or discard your pending image uploads first.",
				"Pending Uploads"
			);
			return;
		}

		setIsSaving(true);
		setSaveError(null);

		const activesList = formData.keyActives
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		const imageUrls = formData.visuals.map((v) => v.url);

		const payload: UpdateProductDto = {
			id: productId,
			name: formData.name.trim(),
			category: formData.category,
			price: priceNum,
			size: formData.size.trim(),
			tagline: formData.tagline.trim(),
			description: formData.description.trim(),
			images: imageUrls,
			featured: formData.featured,
			stockStatus: formData.inStock ? "In Stock" : "Out of Stock",
			inStock: formData.inStock,
			nafdacRegNo: formData.nafdacRegNo.trim(),
			formulation: {
				phLevel: formData.phLevel.trim(),
				texture: formData.texture.trim(),
				skinType: formData.skinType.trim(),
				keyActives: activesList,
			},
			accordions: {
				bioActives: formData.bioActives.trim(),
				inci: formData.inci.trim(),
				ritual: formData.ritual.trim(),
				nafdac: formData.nafdacRegNo.trim(),
			},
		};

		try {
			const res = await fetch("/api/products", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = (await res.json().catch(() => ({}))) as {
				id?: string;
				name?: string;
				error?: string;
			};

			if (!res.ok) {
				throw new Error(data.error || `Backend returned status ${res.status}`);
			}

			toast.success(
				`Formulation "${data.name || formData.name}" updated successfully.`,
				"Formulation Updated"
			);

			router.push("/admin/products");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Error updating product";
			setSaveError(msg);
			toast.error(msg, "Save Failed");
		} finally {
			setIsSaving(false);
		}
	}, [formData, hasPendingImagePreviews, productId, toast, router]);

	// Convert EditFormState into ProductDraftState format for ProductPreviewView
	const draftForPreview: ProductDraftState = {
		name: formData.name,
		slug: formData.slug || productId,
		tagline: formData.tagline,
		price: formData.price,
		category: formData.category,
		size: formData.size,
		stockStatus: formData.inStock ? "In Stock" : "Out of Stock",
		inStock: formData.inStock,
		featured: formData.featured,
		nafdacRegNo: formData.nafdacRegNo,
		description: formData.description,
		keyActives: formData.keyActives,
		phLevel: formData.phLevel,
		texture: formData.texture,
		skinType: formData.skinType,
		bioActives: formData.bioActives,
		inci: formData.inci,
		ritual: formData.ritual,
		visuals: formData.visuals,
		lastSavedAt: null,
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center bg-surface gap-3">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				<span className="text-xs font-medium text-on-surface-variant">
					Loading formulation studio...
				</span>
			</div>
		);
	}

	if (fetchError || !initialState) {
		return (
			<div className="min-h-screen bg-surface py-12">
				<div className="mx-auto max-w-xl px-4 text-center space-y-4">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-container text-error">
						<AlertCircle className="h-7 w-7" />
					</div>
					<h2 className="font-serif text-2xl font-medium text-primary">
						Formulation Not Found
					</h2>
					<p className="text-xs text-on-surface-variant leading-relaxed">
						{fetchError || "We could not find the formulation you are trying to edit."}
					</p>
					<div className="pt-2">
						<Link
							href="/admin/products"
							className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-primary-dark transition-all"
						>
							<ArrowLeft className="h-4 w-4" />
							<span>Return to Catalog</span>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-surface py-8 sm:py-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
				{/* Top Executive Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-delicate pb-6">
					<div>
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							<button
								type="button"
								onClick={(e) => handleRequestNavigation("/admin", e)}
								className="hover:text-primary transition-colors"
							>
								Admin Portal
							</button>
							<span>/</span>
							<button
								type="button"
								onClick={(e) => handleRequestNavigation("/admin/products", e)}
								className="hover:text-primary transition-colors"
							>
								Catalog
							</button>
							<span>/</span>
							<span className="text-secondary-dark">Edit Formulation</span>
						</div>

						<h1 className="mt-2 font-serif text-3xl font-medium text-primary sm:text-4xl">
							Edit {formData.name || "Formulation"}
						</h1>
						<p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
							Modify boutique formulation details, rearrange gallery visuals, adjust clinical parameters, and preview before saving.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
						{/* Clean Status Pill */}
						{!isDirty && (
							<div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border-delicate/80 bg-surface-container-low px-3 py-1.5 text-[11px] text-on-surface-variant">
								<CheckCircle2 className="h-3 w-3 text-secondary-dark" />
								<span>Synced with catalog</span>
							</div>
						)}

						<button
							type="button"
							onClick={() => setIsPreviewMode((prev) => !prev)}
							className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
								isPreviewMode
									? "border-secondary bg-secondary-fixed text-on-secondary-fixed shadow-xs"
									: "border-border-delicate bg-surface-card text-primary hover:bg-surface-container-low"
							}`}
						>
							<Eye className="h-3.5 w-3.5" />
							<span>{isPreviewMode ? "Editor Form" : "Preview Storefront"}</span>
						</button>

						<button
							type="button"
							onClick={(e) => handleRequestNavigation("/admin/products", e)}
							className="rounded-full border border-border-delicate px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
						>
							Cancel
						</button>

						<button
							type="button"
							onClick={() => void handleSave()}
							disabled={isSaving}
							data-testid="save-formulation-btn"
							className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-95"
						>
							<Sparkles className="h-3.5 w-3.5 text-secondary" />
							<span>{isSaving ? "Saving..." : "Save Changes"}</span>
						</button>
					</div>
				</div>

				{/* Save Error Alert */}
				{saveError && (
					<div className="flex items-center justify-between rounded-2xl border border-error/30 bg-error-container p-4 text-xs font-medium text-on-error-container">
						<div className="flex items-center gap-2">
							<AlertCircle className="h-4 w-4 flex-shrink-0" />
							<span>{saveError}</span>
						</div>
						<button
							type="button"
							onClick={() => setSaveError(null)}
							className="hover:opacity-75"
						>
							&times;
						</button>
					</div>
				)}

				{/* MODE A: Live Storefront PDP Preview */}
				{isPreviewMode ? (
					<ProductPreviewView
						draft={draftForPreview}
						onClosePreview={() => setIsPreviewMode(false)}
						onPublish={() => void handleSave()}
						isPublishing={isSaving}
						publishLabel="Save Changes"
						publishingLabel="Saving..."
					/>
				) : (
					/* MODE B: Full Luxury Editorial Editor Form */
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void handleSave();
						}}
						className="space-y-8"
					>
						{/* SECTION 1: Formulation Identity & Classification */}
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-xs space-y-6">
							<div className="flex items-center gap-2.5 border-b border-border-delicate pb-4">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-primary">
									<FileText className="h-4 w-4" />
								</div>
								<div>
									<h2 className="font-serif text-lg font-medium text-primary">
										1. Formulation Identity &amp; Classification
									</h2>
									<p className="text-[11px] text-on-surface-variant">
										Define client-facing nomenclature, category classification, and boutique sizing.
									</p>
								</div>
							</div>

							<div className="space-y-4 text-xs">
								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Product Name *
									</label>
									<input
										type="text"
										required
										placeholder="e.g. Luminous Peptide Glaze Serum"
										value={formData.name}
										onChange={(e) => updateField("name", e.target.value)}
										className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-4 py-3 text-sm text-primary placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
									/>
									{formData.slug && (
										<span className="mt-1 block text-[10px] text-on-surface-variant font-mono">
											Cloudinary Folder: julianas-cosmetics/products/{formData.slug}
										</span>
									)}
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block font-semibold uppercase tracking-wider text-primary">
											Category *
										</label>
										<select
											value={formData.category}
											onChange={(e) =>
												updateField("category", e.target.value as ProductCategory)
											}
											className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
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
											Volume / Size
										</label>
										<input
											type="text"
											placeholder="30 ml / 1.0 fl. oz."
											value={formData.size}
											onChange={(e) => updateField("size", e.target.value)}
											className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block font-semibold uppercase tracking-wider text-primary">
											Tagline
										</label>
										<input
											type="text"
											placeholder="Cellular Radiance & Multi-Peptide Barrier Glaze"
											value={formData.tagline}
											onChange={(e) => updateField("tagline", e.target.value)}
											className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
										/>
									</div>

									<div>
										<label className="block font-semibold uppercase tracking-wider text-primary">
											NAFDAC Registration No.
										</label>
										<input
											type="text"
											placeholder="NAFDAC Reg. No. 04-9218"
											value={formData.nafdacRegNo}
											onChange={(e) => updateField("nafdacRegNo", e.target.value)}
											className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
										/>
									</div>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Formulation Narrative / Overview Description *
									</label>
									<textarea
										rows={5}
										required
										placeholder="An ultra-concentrated Parisian botanical elixir..."
										value={formData.description}
										onChange={(e) => updateField("description", e.target.value)}
										className="mt-1.5 min-h-[120px] w-full resize-y rounded-lg border border-border-delicate bg-surface px-4 py-3 text-sm leading-relaxed text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>
						</div>

						{/* SECTION 2: Pricing, Stock & Discovery */}
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-xs space-y-6">
							<div className="flex items-center gap-2.5 border-b border-border-delicate pb-4">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-primary">
									<DollarSign className="h-4 w-4" />
								</div>
								<div>
									<h2 className="font-serif text-lg font-medium text-primary">
										2. Pricing &amp; Stock Availability
									</h2>
									<p className="text-[11px] text-on-surface-variant">
										Set retail pricing in Nigerian Naira (₦) and toggle store visibility.
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Retail Price in Naira (₦) *
									</label>
									<input
										type="number"
										required
										min="1000"
										step="500"
										placeholder="38500"
										value={formData.price}
										onChange={(e) => updateField("price", e.target.value)}
										className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-4 py-3 text-base font-bold text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div className="flex flex-col justify-center rounded-2xl border border-border-delicate bg-surface p-4">
									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={formData.inStock}
											onChange={(e) => updateField("inStock", e.target.checked)}
											className="h-4 w-4 rounded border-border-delicate text-primary focus:ring-primary"
										/>
										<div>
											<span className="block font-semibold text-primary text-xs">
												Immediate Stock Available
											</span>
											<span className="text-[10px] text-on-surface-variant">
												Ready for concierge orders
											</span>
										</div>
									</label>
								</div>

								<div className="flex flex-col justify-center rounded-2xl border border-border-delicate bg-surface p-4">
									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={formData.featured}
											onChange={(e) => updateField("featured", e.target.checked)}
											className="h-4 w-4 rounded border-border-delicate text-primary focus:ring-primary"
										/>
										<div>
											<span className="block font-semibold text-primary text-xs">
												Homepage Spotlight
											</span>
											<span className="text-[10px] text-on-surface-variant">
												Showcase in editorial curated grid
											</span>
										</div>
									</label>
								</div>
							</div>
						</div>

						{/* SECTION 3: Visual Formulation Gallery */}
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-xs space-y-6">
							<div className="flex items-center gap-2.5 border-b border-border-delicate pb-4">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-primary">
									<Layers className="h-4 w-4" />
								</div>
								<div>
									<h2 className="font-serif text-lg font-medium text-primary">
										3. Formulation Visual Gallery &amp; Cloudinary CDN
									</h2>
									<p className="text-[11px] text-on-surface-variant">
										Images stored in Cloudinary folder: <code>julianas-cosmetics/products/{formData.slug || productId}</code>. The first visual is the primary boutique cover.
									</p>
								</div>
							</div>

							<MultiProductImageUploader
								slug={formData.slug || productId}
								visuals={formData.visuals}
								onVisualsChange={(visuals) => updateField("visuals", visuals)}
								onPendingPreviewChange={setHasPendingImagePreviews}
							/>
						</div>

						{/* SECTION 4: Clinical Specifications */}
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-xs space-y-6">
							<div className="flex items-center gap-2.5 border-b border-border-delicate pb-4">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-primary">
									<ShieldCheck className="h-4 w-4" />
								</div>
								<div>
									<h2 className="font-serif text-lg font-medium text-primary">
										4. Clinical Specifications
									</h2>
									<p className="text-[11px] text-on-surface-variant">
										Dermatological parameters displayed in the PDP clinical spec grid.
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										pH Level
									</label>
									<input
										type="text"
										placeholder="5.2 - 5.5"
										value={formData.phLevel}
										onChange={(e) => updateField("phLevel", e.target.value)}
										className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Texture
									</label>
									<input
										type="text"
										placeholder="Silky, fast-absorbing micro-glaze"
										value={formData.texture}
										onChange={(e) => updateField("texture", e.target.value)}
										className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Skin Type Optimization
									</label>
									<input
										type="text"
										placeholder="All Fitzpatrick skin phototypes (I - VI)"
										value={formData.skinType}
										onChange={(e) => updateField("skinType", e.target.value)}
										className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>

							<div className="text-xs">
								<label className="block font-semibold uppercase tracking-wider text-primary">
									Key Bio-Actives (Comma separated)
								</label>
								<input
									type="text"
									placeholder="5% Multi-Peptide Matrix, 3% Niacinamide, French Camellia Seed Oil"
									value={formData.keyActives}
									onChange={(e) => updateField("keyActives", e.target.value)}
									className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
								/>
							</div>
						</div>

						{/* SECTION 5: Radix UI Accordions Disclosures */}
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-xs space-y-6">
							<div className="flex items-center gap-2.5 border-b border-border-delicate pb-4">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-primary">
									<Sparkle className="h-4 w-4 text-secondary-dark" />
								</div>
								<div>
									<h2 className="font-serif text-lg font-medium text-primary">
										5. Formulation Transparency &amp; Protocols (Accordions)
									</h2>
									<p className="text-[11px] text-on-surface-variant">
										Editorial accordions presented on the boutique Product Detail Page.
									</p>
								</div>
							</div>

							<div className="space-y-4 text-xs">
								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Bio-Actives &amp; Clinical Chemistry
									</label>
									<textarea
										rows={3}
										value={formData.bioActives}
										onChange={(e) => updateField("bioActives", e.target.value)}
										className="mt-1.5 w-full resize-y rounded-lg border border-border-delicate bg-surface px-4 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Full INCI Ingredients Transparency
									</label>
									<textarea
										rows={3}
										value={formData.inci}
										onChange={(e) => updateField("inci", e.target.value)}
										className="mt-1.5 w-full resize-y rounded-lg border border-border-delicate bg-surface px-4 py-2.5 font-mono text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Daily Ritual &amp; Application Guide
									</label>
									<textarea
										rows={3}
										value={formData.ritual}
										onChange={(e) => updateField("ritual", e.target.value)}
										className="mt-1.5 w-full resize-y rounded-lg border border-border-delicate bg-surface px-4 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>
						</div>

						{/* Bottom Save Bar */}
						<div className="flex items-center justify-end gap-3 pt-4 border-t border-border-delicate">
							<button
								type="button"
								onClick={(e) => handleRequestNavigation("/admin/products", e)}
								className="rounded-full border border-border-delicate px-5 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
							>
								Cancel
							</button>

							<button
								type="submit"
								disabled={isSaving}
								className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-95"
							>
								<Sparkles className="h-3.5 w-3.5 text-secondary" />
								<span>{isSaving ? "Saving Changes..." : "Save Changes"}</span>
							</button>
						</div>
					</form>
				)}
			</div>

			{/* Exit Confirmation Dialog Modal */}
			{showExitConfirmDialog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-in fade-in">
					<div className="w-full max-w-md rounded-2xl border border-border-delicate bg-surface-card p-6 shadow-2xl space-y-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-container text-error">
								<AlertCircle className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-serif text-lg font-medium text-primary">
									Discard Unsaved Edits?
								</h3>
								<p className="text-xs text-on-surface-variant">
									You have unsaved changes in this formulation.
								</p>
							</div>
						</div>

						<p className="text-xs text-on-surface-variant leading-relaxed">
							If you navigate away now, your edits will not be saved to the boutique catalog. Are you sure you want to leave?
						</p>

						<div className="flex items-center justify-end gap-3 pt-3 border-t border-border-delicate">
							<button
								type="button"
								onClick={() => setShowExitConfirmDialog(false)}
								className="rounded-full border border-border-delicate px-4 py-2 text-xs font-semibold text-primary hover:bg-surface-container-low transition-colors"
							>
								Stay and Keep Editing
							</button>

							<button
								type="button"
								onClick={handleConfirmDiscardAndLeave}
								className="rounded-full bg-error px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-error/90 transition-colors shadow-xs"
							>
								Discard Changes &amp; Leave
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
