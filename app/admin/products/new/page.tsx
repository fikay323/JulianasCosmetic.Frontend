"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useProductDraft } from "@/src/hooks/useProductDraft";
import { MultiProductImageUploader } from "@/src/components/admin/MultiProductImageUploader";
import { ProductPreviewView } from "@/src/components/admin/ProductPreviewView";
import { useToast } from "@/src/context/ToastContext";
import type { ProductCategory } from "@/src/types/store";

const CATEGORIES: ProductCategory[] = [
	"Serums",
	"Moisturisers",
	"Suncare",
	"Cleansers",
	"Treatments",
];

export default function NewProductPage(): React.JSX.Element {
	const router = useRouter();
	const { toast } = useToast();

	const {
		draft,
		isHydrated,
		isDirty,
		updateField,
		setVisuals,
		clearDraft,
		toCreateProductDto,
	} = useProductDraft();

	const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
	const [isPublishing, setIsPublishing] = useState<boolean>(false);
	const [hasPendingImagePreviews, setHasPendingImagePreviews] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Navigation Guard state
	const [showExitConfirmDialog, setShowExitConfirmDialog] = useState<boolean>(false);
	const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);

	// Browser beforeunload guard
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
			if (isDirty && !isPublishing) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isDirty, isPublishing]);

	const handleRequestNavigation = (href: string, e?: React.MouseEvent): void => {
		if (isDirty && !isPublishing) {
			e?.preventDefault();
			setPendingNavigationHref(href);
			setShowExitConfirmDialog(true);
		} else {
			router.push(href);
		}
	};

	const handleConfirmDiscardAndLeave = (): void => {
		clearDraft();
		setShowExitConfirmDialog(false);
		if (pendingNavigationHref) {
			router.push(pendingNavigationHref);
		} else {
			router.push("/admin/products");
		}
	};

	const handlePublish = useCallback(async (): Promise<void> => {
		if (!draft.name.trim()) {
			setError("Formulation Name is required before publishing.");
			toast.error("Please enter a product name.", "Missing Formulation Name");
			return;
		}

		const priceNum = Number(draft.price);
		if (isNaN(priceNum) || priceNum <= 0) {
			setError("A valid retail price in Naira (₦) is required.");
			toast.error("Please enter a valid price.", "Invalid Price");
			return;
		}

		if (hasPendingImagePreviews) {
			toast.info("Please confirm or discard your pending image uploads first.", "Pending Uploads");
			return;
		}

		setIsPublishing(true);
		setError(null);

		try {
			const dto = toCreateProductDto();

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

			// Clear draft upon successful creation
			clearDraft();
			toast.success(
				`Formulation "${data.name || draft.name}" was successfully published to boutique catalog.`,
				"Formulation Published"
			);

			router.push("/admin/products");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Error creating product";
			setError(msg);
			toast.error(msg, "Publishing Failed");
		} finally {
			setIsPublishing(false);
		}
	}, [draft, hasPendingImagePreviews, toCreateProductDto, clearDraft, toast, router]);

	if (!isHydrated) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center bg-surface">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
							<span className="text-secondary-dark">Craft Formulation</span>
						</div>

						<h1 className="mt-2 font-serif text-3xl font-medium text-primary sm:text-4xl">
							Craft Imported Formulation
						</h1>
						<p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
							Create a luxury Parisian formulation, upload high-res visuals directly to Cloudinary, configure clinical bio-actives, and preview before publishing.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
						{/* Autosave Status Pill */}
						{draft.lastSavedAt && (
							<div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border-delicate/80 bg-surface-container-low px-3 py-1.5 text-[11px] text-on-surface-variant">
								<CheckCircle2 className="h-3 w-3 text-secondary-dark" />
								<span>Draft autosaved</span>
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

						{isDirty && (
							<button
								type="button"
								onClick={() => setShowExitConfirmDialog(true)}
								className="inline-flex items-center gap-1 rounded-full border border-border-delicate bg-surface-card px-3.5 py-2 text-xs font-semibold text-on-surface-variant hover:border-error/30 hover:bg-error-container hover:text-error transition-colors"
								title="Discard draft and reset form"
							>
								<Trash2 className="h-3.5 w-3.5" />
								<span className="hidden sm:inline">Discard Draft</span>
							</button>
						)}

						<button
							type="button"
							onClick={() => void handlePublish()}
							disabled={isPublishing}
							data-testid="publish-formulation-btn"
							className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-95"
						>
							<Sparkles className="h-3.5 w-3.5 text-secondary" />
							<span>{isPublishing ? "Publishing..." : "Publish Formulation"}</span>
						</button>
					</div>
				</div>

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
							className="hover:opacity-75"
						>
							&times;
						</button>
					</div>
				)}

				{/* MODE A: Live Storefront PDP Preview */}
				{isPreviewMode ? (
					<ProductPreviewView
						draft={draft}
						onClosePreview={() => setIsPreviewMode(false)}
						onPublish={() => void handlePublish()}
						isPublishing={isPublishing}
					/>
				) : (
					/* MODE B: Full Luxury Editorial Editor Form */
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void handlePublish();
						}}
						className="space-y-8"
					>
						{/* SECTION 1: Formulation Identity & Hierarchy */}
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
										Define the client-facing nomenclature, category classification, and boutique sizing.
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
										value={draft.name}
										onChange={(e) => updateField("name", e.target.value)}
										className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-4 py-3 text-sm text-primary placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
									/>
									<span className="mt-1 block text-[10px] text-on-surface-variant font-mono">
										Cloudinary Folder: julianas-cosmetics/products/{draft.slug}
									</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block font-semibold uppercase tracking-wider text-primary">
											Category *
										</label>
										<select
											value={draft.category}
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
											value={draft.size}
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
											value={draft.tagline}
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
											value={draft.nafdacRegNo}
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
										placeholder="An ultra-concentrated Parisian botanical elixir infusing multi-peptides, pure French botanical seed oils, and 3% niacinamide to illuminate skin while reinforcing cellular lipid barriers..."
										value={draft.description}
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
										value={draft.price}
										onChange={(e) => updateField("price", e.target.value)}
										className="mt-1.5 w-full rounded-lg border border-border-delicate bg-surface px-4 py-3 text-base font-bold text-primary focus:border-primary focus:outline-none"
									/>
								</div>

								<div className="flex flex-col justify-center rounded-2xl border border-border-delicate bg-surface p-4">
									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={draft.inStock}
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
											checked={draft.featured}
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
										Images upload directly to Cloudinary subfolder: <code>julianas-cosmetics/products/{draft.slug}</code>. The first visual is the primary boutique cover.
									</p>
								</div>
							</div>

							<MultiProductImageUploader
								slug={draft.slug}
								visuals={draft.visuals}
								onVisualsChange={setVisuals}
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
										value={draft.phLevel}
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
										value={draft.texture}
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
										value={draft.skinType}
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
									value={draft.keyActives}
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
										value={draft.bioActives}
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
										value={draft.inci}
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
										value={draft.ritual}
										onChange={(e) => updateField("ritual", e.target.value)}
										className="mt-1.5 w-full resize-y rounded-lg border border-border-delicate bg-surface px-4 py-2.5 text-xs text-primary focus:border-primary focus:outline-none"
									/>
								</div>
							</div>
						</div>

						{/* Bottom Publish Bar */}
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
								disabled={isPublishing}
								className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-95"
							>
								<Sparkles className="h-3.5 w-3.5 text-secondary" />
								<span>{isPublishing ? "Publishing Formulation..." : "Publish Formulation"}</span>
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
									Discard Unfinished Draft?
								</h3>
								<p className="text-xs text-on-surface-variant">
									You have unsaved changes in this formulation draft.
								</p>
							</div>
						</div>

						<p className="text-xs text-on-surface-variant leading-relaxed">
							If you navigate away now, your progress will be discarded from local storage. Are you sure you want to leave?
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
								Discard Draft &amp; Leave
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
