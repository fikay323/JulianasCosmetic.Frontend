"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ProductCategory, CreateProductDto, UploadedVisual } from "@/src/types/store";

export const PRODUCT_DRAFT_STORAGE_KEY = "jc_admin_product_draft";

export interface ProductDraftState {
	name: string;
	slug: string;
	tagline: string;
	price: string;
	category: ProductCategory;
	size: string;
	stockStatus: "In Stock" | "Out of Stock";
	inStock: boolean;
	featured: boolean;
	nafdacRegNo: string;
	description: string;
	keyActives: string;
	phLevel: string;
	texture: string;
	skinType: string;
	bioActives: string;
	inci: string;
	ritual: string;
	visuals: UploadedVisual[];
	lastSavedAt: number | null;
}

export function generateInitialDraftSlug(): string {
	const rand = Math.random().toString(36).substring(2, 8);
	return `formulation-${rand}`;
}

export const INITIAL_DRAFT_STATE: ProductDraftState = {
	name: "",
	slug: "",
	tagline: "",
	price: "",
	category: "Serums",
	size: "",
	stockStatus: "In Stock",
	inStock: true,
	featured: false,
	nafdacRegNo: "",
	description: "",
	keyActives: "",
	phLevel: "",
	texture: "",
	skinType: "",
	bioActives: "",
	inci: "",
	ritual: "",
	visuals: [],
	lastSavedAt: null,
};

export function useProductDraft() {
	const [draft, setDraft] = useState<ProductDraftState>(() => {
		if (typeof window === "undefined") {
			return { ...INITIAL_DRAFT_STATE, slug: generateInitialDraftSlug() };
		}
		try {
			const saved = localStorage.getItem(PRODUCT_DRAFT_STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved) as Partial<ProductDraftState>;
				return {
					...INITIAL_DRAFT_STATE,
					...parsed,
					slug: parsed.slug || generateInitialDraftSlug(),
					visuals: Array.isArray(parsed.visuals) ? parsed.visuals : [],
				};
			}
		} catch {
			// Fallback to fresh initial draft on storage parse error
		}
		return { ...INITIAL_DRAFT_STATE, slug: generateInitialDraftSlug() };
	});

	const [isHydrated, setIsHydrated] = useState<boolean>(false);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Mark client hydrated
	useEffect(() => {
		queueMicrotask(() => {
			setIsHydrated(true);
		});
	}, []);

	// Calculate whether form has user-entered changes
	const isDirty = Boolean(
		draft.name.trim() ||
		draft.price.trim() ||
		draft.description.trim() ||
		draft.visuals.length > 0 ||
		draft.tagline.trim() ||
		draft.size.trim() ||
		draft.nafdacRegNo.trim() ||
		draft.keyActives.trim() ||
		draft.phLevel.trim() ||
		draft.texture.trim() ||
		draft.skinType.trim() ||
		draft.bioActives.trim() ||
		draft.inci.trim() ||
		draft.ritual.trim()
	);

	// Debounced localStorage sync (300ms) for high performance typing
	useEffect(() => {
		if (!isHydrated) return;

		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(() => {
			if (typeof window !== "undefined") {
				if (isDirty) {
					const toSave: ProductDraftState = {
						...draft,
						lastSavedAt: Date.now(),
					};
					localStorage.setItem(PRODUCT_DRAFT_STORAGE_KEY, JSON.stringify(toSave));
				} else {
					localStorage.removeItem(PRODUCT_DRAFT_STORAGE_KEY);
				}
			}
		}, 300);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [draft, isDirty, isHydrated]);

	const updateField = useCallback(
		<K extends keyof ProductDraftState>(field: K, value: ProductDraftState[K]): void => {
			setDraft((prev) => {
				const updated = { ...prev, [field]: value };
				// If user edits name and slug was auto-generated, derive meaningful slug while keeping unique suffix
				if (field === "name" && typeof value === "string" && value.trim()) {
					const slugStem = value
						.trim()
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, "-")
						.replace(/(^-|-$)/g, "");
					const currentSuffix = prev.slug.split("-").pop() || Math.random().toString(36).substring(2, 6);
					updated.slug = `${slugStem}-${currentSuffix}`;
				}
				return updated;
			});
		},
		[]
	);

	const setVisuals = useCallback((visuals: UploadedVisual[]): void => {
		setDraft((prev) => ({ ...prev, visuals }));
	}, []);

	const addVisual = useCallback((visual: UploadedVisual): void => {
		setDraft((prev) => ({ ...prev, visuals: [...prev.visuals, visual] }));
	}, []);

	const removeVisual = useCallback((visualId: string): void => {
		setDraft((prev) => ({
			...prev,
			visuals: prev.visuals.filter((v) => v.id !== visualId),
		}));
	}, []);

	const reorderVisual = useCallback((fromIndex: number, toIndex: number): void => {
		setDraft((prev) => {
			if (
				fromIndex < 0 ||
				fromIndex >= prev.visuals.length ||
				toIndex < 0 ||
				toIndex >= prev.visuals.length ||
				fromIndex === toIndex
			) {
				return prev;
			}
			const reordered = [...prev.visuals];
			const [movedItem] = reordered.splice(fromIndex, 1);
			reordered.splice(toIndex, 0, movedItem);
			return { ...prev, visuals: reordered };
		});
	}, []);

	const clearDraft = useCallback((): void => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}
		if (typeof window !== "undefined") {
			localStorage.removeItem(PRODUCT_DRAFT_STORAGE_KEY);
		}
		setDraft({ ...INITIAL_DRAFT_STATE, slug: generateInitialDraftSlug() });
	}, []);

	const toCreateProductDto = useCallback((): CreateProductDto => {
		const parsedPrice = Number(draft.price) || 0;
		const imageUrls = draft.visuals.map((v) => v.url);
		const keyActivesList = draft.keyActives
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		return {
			name: draft.name.trim(),
			slug: draft.slug.trim(),
			tagline: draft.tagline.trim(),
			price: parsedPrice,
			category: draft.category,
			size: draft.size.trim(),
			stockStatus: draft.inStock ? "In Stock" : "Out of Stock",
			inStock: draft.inStock,
			featured: draft.featured,
			images: imageUrls.length > 0 ? imageUrls : undefined,
			description: draft.description.trim(),
			nafdacRegNo: draft.nafdacRegNo.trim(),
			keyActives: keyActivesList.length > 0 ? keyActivesList : undefined,
			phLevel: draft.phLevel.trim(),
			texture: draft.texture.trim(),
			skinType: draft.skinType.trim(),
			bioActives: draft.bioActives.trim(),
			inci: draft.inci.trim(),
			ritual: draft.ritual.trim(),
			nafdac: draft.nafdacRegNo.trim(),
			formulation: {
				phLevel: draft.phLevel.trim(),
				texture: draft.texture.trim(),
				skinType: draft.skinType.trim(),
				keyActives: keyActivesList,
			},
			accordions: {
				bioActives: draft.bioActives.trim(),
				inci: draft.inci.trim(),
				ritual: draft.ritual.trim(),
				nafdac: draft.nafdacRegNo.trim(),
			},
		};
	}, [draft]);

	return {
		draft,
		isHydrated,
		isDirty,
		updateField,
		setVisuals,
		addVisual,
		removeVisual,
		reorderVisual,
		clearDraft,
		toCreateProductDto,
	};
}
