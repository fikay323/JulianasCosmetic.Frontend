"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Sparkles,
	Eye,
	Trash2,
	AlertCircle,
	CheckCircle2,
	Layers,
	FileText,
	DollarSign,
	ShieldCheck,
	Sparkle,
	ArrowLeft,
} from "lucide-react";
import { useProductDraft } from "@/src/hooks/useProductDraft";
import { MultiProductImageUploader } from "@/src/components/admin/MultiProductImageUploader";
import { ProductPreviewView } from "@/src/components/admin/ProductPreviewView";
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader";
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

export interface ProductStudioFormProps {
	mode: "create" | "edit";
	productId?: string;
}

interface FormStateData {
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
	lastSavedAt?: number | null;
}

export function ProductStudioForm({
	mode,
	productId,
}: ProductStudioFormProps): React.JSX.Element {
	const router = useRouter();
	const { toast } = useToast();

	// Create Mode Hook
	const draftHook = useProductDraft();

	// Edit Mode State
	const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(mode === "edit");
	const [editFetchError, setEditFetchError] = useState<string | null>(null);
	const [initialEditState, setInitialEditState] = useState<FormStateData | null>(null);
	const [editFormData, setEditFormData] = useState<FormStateData>({
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

	// Shared View & Submission States
	const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [hasPendingImagePreviews, setHasPendingImagePreviews] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Navigation Guard state
	const [showExitConfirmDialog, setShowExitConfirmDialog] = useState<boolean>(false);
	const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);

	// Fetch existing product for Edit Mode
	useEffect(() => {
		if (mode !== "edit" || !productId) return;

		let isMounted = true;
		async function loadProduct(): Promise<void> {
			setIsLoadingEdit(true);
			setEditFetchError(null);

			try {
				const res = await fetch(`/api/products/${encodeURIComponent(productId!)}`, {
					cache: "no-store",
				});

				if (!res.ok) {
					throw new Error(
						res.status === 404
							? `Product "${productId}" was not found in catalog.`
							: `Failed to load product (status ${res.status})`
					);
				}

				const product = (await res.json()) as Product;
				if (!isMounted) return;

				const loadedVisuals: UploadedVisual[] = (product.images || []).map(
					(url, idx) => {
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

				const state: FormStateData = {
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

				setEditFormData(state);
				setInitialEditState(state);
			} catch (err: unknown) {
				if (!isMounted) return;
				const msg = err instanceof Error ? err.message : "Error loading formulation";
				setEditFetchError(msg);
				toast.error(msg, "Error Loading Product");
			} finally {
				if (isMounted) {
					setIsLoadingEdit(false);
				}
			}
		}

		void loadProduct();
		return () => {
			isMounted = false;
		};
	}, [mode, productId, toast]);

	// Unified form values
	const values: FormStateData = useMemo(() => {
		return mode === "create" ? {
			name: draftHook.draft.name,
			slug: draftHook.draft.slug,
			category: draftHook.draft.category,
			price: draftHook.draft.price,
			size: draftHook.draft.size,
			tagline: draftHook.draft.tagline,
			description: draftHook.draft.description,
			nafdacRegNo: draftHook.draft.nafdacRegNo,
			keyActives: draftHook.draft.keyActives,
			phLevel: draftHook.draft.phLevel,
			texture: draftHook.draft.texture,
			skinType: draftHook.draft.skinType,
			bioActives: draftHook.draft.bioActives,
			inci: draftHook.draft.inci,
			ritual: draftHook.draft.ritual,
			inStock: draftHook.draft.inStock,
			featured: draftHook.draft.featured,
			visuals: draftHook.draft.visuals,
			lastSavedAt: draftHook.draft.lastSavedAt,
		} : editFormData;
	}, [mode, draftHook.draft, editFormData]);

	// Unified dirty calculation
	const isDirty: boolean = mode === "create"
		? draftHook.isDirty
		: Boolean(
			initialEditState &&
			(editFormData.name !== initialEditState.name ||
				editFormData.category !== initialEditState.category ||
				editFormData.price !== initialEditState.price ||
				editFormData.size !== initialEditState.size ||
				editFormData.tagline !== initialEditState.tagline ||
				editFormData.description !== initialEditState.description ||
				editFormData.nafdacRegNo !== initialEditState.nafdacRegNo ||
				editFormData.keyActives !== initialEditState.keyActives ||
				editFormData.phLevel !== initialEditState.phLevel ||
				editFormData.texture !== initialEditState.texture ||
				editFormData.skinType !== initialEditState.skinType ||
				editFormData.bioActives !== initialEditState.bioActives ||
				editFormData.inci !== initialEditState.inci ||
				editFormData.ritual !== initialEditState.ritual ||
				editFormData.inStock !== initialEditState.inStock ||
				editFormData.featured !== initialEditState.featured ||
				editFormData.visuals.length !== initialEditState.visuals.length ||
				editFormData.visuals.some((v, i) => v.url !== initialEditState.visuals[i]?.url))
		);

	// Unified field updater
	const updateField = <K extends keyof FormStateData>(
		field: K,
		value: FormStateData[K]
	): void => {
		if (mode === "create") {
			draftHook.updateField(
				field as keyof ProductDraftState,
				value as ProductDraftState[keyof ProductDraftState]
			);
		} else {
			setEditFormData((prev) => ({
				...prev,
				[field]: value,
			}));
		}
	};

	const setVisuals = (visuals: UploadedVisual[]): void => {
		if (mode === "create") {
			draftHook.setVisuals(visuals);
		} else {
			setEditFormData((prev) => ({
				...prev,
				visuals,
			}));
		}
	};

	// Browser beforeunload guard
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
			if (isDirty && !isSubmitting) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isDirty, isSubmitting]);

	const handleRequestNavigation = (href: string, e?: React.MouseEvent): void => {
		if (isDirty && !isSubmitting) {
			e?.preventDefault();
			setPendingNavigationHref(href);
			setShowExitConfirmDialog(true);
		} else {
			router.push(href);
		}
	};

	const handleConfirmDiscardAndLeave = (): void => {
		if (mode === "create") {
			draftHook.clearDraft();
		}
		setShowExitConfirmDialog(false);
		if (pendingNavigationHref) {
			router.push(pendingNavigationHref);
		} else {
			router.push("/admin/products");
		}
	};

	// Save or Publish Submission
	const handleSubmit = useCallback(async (): Promise<void> => {
		if (!values.name.trim()) {
			setError("Formulation Name is required.");
			toast.error("Please enter a formulation name.", "Missing Formulation Name");
			return;
		}

		const priceNum = Number(values.price);
		if (isNaN(priceNum) || priceNum <= 0) {
			setError("A valid retail price in Naira (₦) is required.");
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

		setIsSubmitting(true);
		setError(null);

		try {
			if (mode === "create") {
				const dto = draftHook.toCreateProductDto();
				const res = await fetch("/api/products", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(dto),
				});

				const data = (await res.json().catch(() => ({}))) as {
					id?: string;
					name?: string;
					error?: string;
				};

				if (!res.ok || !data.id) {
					throw new Error(data.error || `Backend returned status ${res.status}`);
				}

				draftHook.clearDraft();
				toast.success(
					`Formulation "${data.name || values.name}" was successfully published to boutique catalog.`,
					"Formulation Published"
				);
			} else {
				const activesList = values.keyActives
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean);

				const payload: UpdateProductDto = {
					id: productId,
					name: values.name.trim(),
					category: values.category,
					price: priceNum,
					size: values.size.trim(),
					tagline: values.tagline.trim(),
					description: values.description.trim(),
					images: values.visuals.map((v) => v.url),
					featured: values.featured,
					stockStatus: values.inStock ? "In Stock" : "Out of Stock",
					inStock: values.inStock,
					nafdacRegNo: values.nafdacRegNo.trim(),
					formulation: {
						phLevel: values.phLevel.trim(),
						texture: values.texture.trim(),
						skinType: values.skinType.trim(),
						keyActives: activesList,
					},
					accordions: {
						bioActives: values.bioActives.trim(),
						inci: values.inci.trim(),
						ritual: values.ritual.trim(),
						nafdac: values.nafdacRegNo.trim(),
					},
				};

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
					`Formulation "${data.name || values.name}" updated successfully.`,
					"Formulation Updated"
				);
			}

			router.push("/admin/products");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Error processing request";
			setError(msg);
			toast.error(msg, mode === "create" ? "Publishing Failed" : "Save Failed");
		} finally {
			setIsSubmitting(false);
		}
	}, [values, hasPendingImagePreviews, mode, productId, draftHook, toast, router]);

	// Draft state for Live Preview
	const previewDraft: ProductDraftState = {
		name: values.name,
		slug: values.slug || productId || "",
		tagline: values.tagline,
		price: values.price,
		category: values.category,
		size: values.size,
		stockStatus: values.inStock ? "In Stock" : "Out of Stock",
		inStock: values.inStock,
		featured: values.featured,
		nafdacRegNo: values.nafdacRegNo,
		description: values.description,
		keyActives: values.keyActives,
		phLevel: values.phLevel,
		texture: values.texture,
		skinType: values.skinType,
		bioActives: values.bioActives,
		inci: values.inci,
		ritual: values.ritual,
		visuals: values.visuals,
		lastSavedAt: values.lastSavedAt ?? null,
	};

	// Loading state for Edit Mode
	if (mode === "edit" && isLoadingEdit) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center bg-surface gap-3">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				<span className="text-xs font-medium text-on-surface-variant">
					Loading formulation studio...
				</span>
			</div>
		);
	}

	// Fetch Error state for Edit Mode
	if (mode === "edit" && (editFetchError || !initialEditState)) {
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
						{editFetchError || "We could not find the formulation you are trying to edit."}
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

	// Hydration state for Create Mode
	if (mode === "create" && !draftHook.isHydrated) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center bg-surface">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	const breadcrumbs = [
		{
			label: "Admin Portal",
			onClick: (e: React.MouseEvent) => handleRequestNavigation("/admin", e),
		},
		{
			label: "Catalog",
			onClick: (e: React.MouseEvent) => handleRequestNavigation("/admin/products", e),
		},
		{
			label: mode === "create" ? "Craft Formulation" : "Edit Formulation",
			active: true,
		},
	];

	return (
		<div className="min-h-screen bg-surface py-8 sm:py-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
				{/* Top Central Reusable Header */}
				<AdminPageHeader
					breadcrumbs={breadcrumbs}
					title={
						mode === "create"
							? "Craft Imported Formulation"
							: `Edit ${values.name || "Formulation"}`
					}
					description={
						mode === "create"
							? "Create a luxury Parisian formulation, upload high-res visuals directly to Cloudinary, configure clinical bio-actives, and preview before publishing."
							: "Modify boutique formulation details, rearrange gallery visuals, adjust clinical parameters, and preview before saving."
					}
					actions={
						<>
							{/* Autosave / Synced Pill */}
							{mode === "create" && values.lastSavedAt && (
								<div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border-delicate/80 bg-surface-container-low px-3 py-1.5 text-[11px] text-on-surface-variant">
									<CheckCircle2 className="h-3 w-3 text-secondary-dark" />
									<span>Draft autosaved</span>
								</div>
							)}
							{mode === "edit" && !isDirty && (
								<div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border-delicate/80 bg-surface-container-low px-3 py-1.5 text-[11px] text-on-surface-variant">
									<CheckCircle2 className="h-3 w-3 text-secondary-dark" />
									<span>Synced with catalog</span>
								</div>
							)}

							{/* Preview Mode Toggle */}
							<button
								type="button"
								onClick={() => setIsPreviewMode((prev) => !prev)}
								className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
									isPreviewMode
										? "border-secondary bg-secondary-fixed text-on-secondary-fixed shadow-xs"
										: "border-border-delicate bg-surface-card text-primary hover:bg-surface-container-low"
								}`}
							>
								<Eye className="h-3.5 w-3.5" />
								<span>{isPreviewMode ? "Editor Form" : "Preview Storefront"}</span>
							</button>

							{/* Discard Draft / Cancel */}
							{mode === "create" && isDirty && (
								<button
									type="button"
									onClick={() => setShowExitConfirmDialog(true)}
									className="inline-flex items-center gap-1 rounded-full border border-border-delicate bg-surface-card px-3.5 py-2 text-xs font-semibold text-on-surface-variant hover:border-error/30 hover:bg-error-container hover:text-error transition-colors cursor-pointer"
									title="Discard draft and reset form"
								>
									<Trash2 className="h-3.5 w-3.5" />
									<span className="hidden sm:inline">Discard Draft</span>
								</button>
							)}
							{mode === "edit" && (
								<button
									type="button"
									onClick={(e) => handleRequestNavigation("/admin/products", e)}
									className="rounded-full border border-border-delicate px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
								>
									Cancel
								</button>
							)}

							{/* Top Submit Button */}
							<button
								type="button"
								onClick={() => void handleSubmit()}
								disabled={isSubmitting}
								data-testid={mode === "create" ? "publish-formulation-btn" : "save-formulation-btn"}
								className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
							>
								<Sparkles className="h-3.5 w-3.5 text-secondary" />
								<span>
									{isSubmitting
										? mode === "create" ? "Publishing..." : "Saving Changes..."
										: mode === "create" ? "Publish Formulation" : "Save Changes"}
								</span>
							</button>
						</>
					}
				/>

				{/* Error Alert */}
				{error && (
					<div className="flex items-center justify-between rounded-2xl border border-error/30 bg-error-container p-4 text-xs font-medium text-on-error-container">
						<div className="flex items-center gap-2">
							<AlertCircle className="h-4 w-4 flex-shrink-0" />
							<span>{error}</span>
						</div>
						<button
							type="button"
							onClick={() => setError(null)}
							className="hover:opacity-75 cursor-pointer"
						>
							&times;
						</button>
					</div>
				)}

				{/* MODE A: Live Storefront PDP Preview */}
				{isPreviewMode ? (
					<ProductPreviewView
						draft={previewDraft}
						onClosePreview={() => setIsPreviewMode(false)}
						onPublish={() => void handleSubmit()}
						isPublishing={isSubmitting}
						publishLabel={mode === "create" ? "Publish Formulation" : "Save Changes"}
						publishingLabel={mode === "create" ? "Publishing..." : "Saving Changes..."}
					/>
				) : (
					/* MODE B: Full Luxury Editorial Form */
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void handleSubmit();
						}}
						className="space-y-8"
					>
						{/* SECTION 1: Formulation Identity & Classification */}
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-md space-y-6">
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
										value={values.name}
										onChange={(e) => updateField("name", e.target.value)}
										className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-4 py-3 text-sm text-primary placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
									/>
									{values.slug && (
										<span className="mt-1 block text-[10px] text-on-surface-variant font-mono">
											Cloudinary Folder: julianas-cosmetics/products/{values.slug}
										</span>
									)}
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block font-semibold uppercase tracking-wider text-primary">
											Category *
										</label>
										<select
											value={values.category}
											onChange={(e) =>
												updateField("category", e.target.value as ProductCategory)
											}
											className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none cursor-pointer"
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
											value={values.size}
											onChange={(e) => updateField("size", e.target.value)}
											className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
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
											value={values.tagline}
											onChange={(e) => updateField("tagline", e.target.value)}
											className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
										/>
									</div>

									<div>
										<label className="block font-semibold uppercase tracking-wider text-primary">
											NAFDAC Registration No.
										</label>
										<input
											type="text"
											placeholder="NAFDAC Reg. No. 04-9218"
											value={values.nafdacRegNo}
											onChange={(e) => updateField("nafdacRegNo", e.target.value)}
											className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
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
										value={values.description}
										onChange={(e) => updateField("description", e.target.value)}
										className="mt-1.5 min-h-[120px] w-full resize-y rounded-DEFAULT border border-border-delicate bg-surface px-4 py-3 text-sm leading-relaxed text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>
						</div>

						{/* SECTION 2: Pricing, Stock & Discovery */}
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-md space-y-6">
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
										value={values.price}
										onChange={(e) => updateField("price", e.target.value)}
										className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-4 py-3 text-base font-bold text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div className="flex flex-col justify-center rounded-2xl border border-border-delicate bg-surface p-4">
									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={values.inStock}
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
											checked={values.featured}
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
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-md space-y-6">
							<div className="flex items-center gap-2.5 border-b border-border-delicate pb-4">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-primary">
									<Layers className="h-4 w-4" />
								</div>
								<div>
									<h2 className="font-serif text-lg font-medium text-primary">
										3. Formulation Visual Gallery &amp; Cloudinary CDN
									</h2>
									<p className="text-[11px] text-on-surface-variant">
										Images stored in Cloudinary folder: <code>julianas-cosmetics/products/{values.slug || productId || "new-product"}</code>. The first visual is the primary boutique cover.
									</p>
								</div>
							</div>

							<MultiProductImageUploader
								slug={values.slug || productId || "new-product"}
								visuals={values.visuals}
								onVisualsChange={setVisuals}
								onPendingPreviewChange={setHasPendingImagePreviews}
							/>
						</div>

						{/* SECTION 4: Clinical Specifications */}
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-md space-y-6">
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
										value={values.phLevel}
										onChange={(e) => updateField("phLevel", e.target.value)}
										className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Texture
									</label>
									<input
										type="text"
										placeholder="Silky, fast-absorbing micro-glaze"
										value={values.texture}
										onChange={(e) => updateField("texture", e.target.value)}
										className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Skin Type Optimization
									</label>
									<input
										type="text"
										placeholder="All Fitzpatrick skin phototypes (I - VI)"
										value={values.skinType}
										onChange={(e) => updateField("skinType", e.target.value)}
										className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
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
									value={values.keyActives}
									onChange={(e) => updateField("keyActives", e.target.value)}
									className="mt-1.5 w-full rounded-DEFAULT border border-border-delicate bg-surface px-3 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
								/>
							</div>
						</div>

						{/* SECTION 5: Radix UI Accordions Disclosures */}
						<div className="rounded-3xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-md space-y-6">
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
										value={values.bioActives}
										onChange={(e) => updateField("bioActives", e.target.value)}
										className="mt-1.5 w-full resize-y rounded-DEFAULT border border-border-delicate bg-surface px-4 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Full INCI Ingredients Transparency
									</label>
									<textarea
										rows={3}
										value={values.inci}
										onChange={(e) => updateField("inci", e.target.value)}
										className="mt-1.5 w-full resize-y rounded-DEFAULT border border-border-delicate bg-surface px-4 py-2.5 font-mono text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div>
									<label className="block font-semibold uppercase tracking-wider text-primary">
										Daily Ritual &amp; Application Guide
									</label>
									<textarea
										rows={3}
										value={values.ritual}
										onChange={(e) => updateField("ritual", e.target.value)}
										className="mt-1.5 w-full resize-y rounded-DEFAULT border border-border-delicate bg-surface px-4 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>
						</div>

						{/* Bottom Save/Publish Bar */}
						<div className="flex items-center justify-end gap-3 pt-4 border-t border-border-delicate">
							<button
								type="button"
								onClick={(e) => handleRequestNavigation("/admin/products", e)}
								className="rounded-full border border-border-delicate px-5 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
							>
								Cancel
							</button>

							<button
								type="submit"
								disabled={isSubmitting}
								className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
							>
								<Sparkles className="h-3.5 w-3.5 text-secondary" />
								<span>
									{isSubmitting
										? mode === "create" ? "Publishing Formulation..." : "Saving Changes..."
										: mode === "create" ? "Publish Formulation" : "Save Changes"}
								</span>
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
									{mode === "create" ? "Discard Unfinished Draft?" : "Discard Unsaved Edits?"}
								</h3>
								<p className="text-xs text-on-surface-variant">
									You have unsaved changes in this formulation.
								</p>
							</div>
						</div>

						<p className="text-xs text-on-surface-variant leading-relaxed">
							{mode === "create"
								? "If you navigate away now, your progress will be discarded from local storage. Are you sure you want to leave?"
								: "If you navigate away now, your edits will not be saved to the boutique catalog. Are you sure you want to leave?"}
						</p>

						<div className="flex items-center justify-end gap-3 pt-3 border-t border-border-delicate">
							<button
								type="button"
								onClick={() => setShowExitConfirmDialog(false)}
								className="rounded-full border border-border-delicate px-4 py-2 text-xs font-semibold text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
							>
								Stay and Keep Editing
							</button>

							<button
								type="button"
								onClick={handleConfirmDiscardAndLeave}
								className="rounded-full bg-error px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-error/90 transition-colors shadow-xs cursor-pointer"
							>
								{mode === "create" ? "Discard Draft & Leave" : "Discard Changes & Leave"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
