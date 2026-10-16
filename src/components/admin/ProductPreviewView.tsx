"use client";

import React, { useState } from "react";
import Image from "next/image";
import * as Accordion from "@radix-ui/react-accordion";
import {
	Star,
	ShoppingBag,
	Minus,
	Plus,
	ShieldCheck,
	ChevronDown,
	Clock,
	ArrowLeft,
	Sparkles,
	Eye,
} from "lucide-react";
import type { ProductDraftState } from "@/src/hooks/useProductDraft";
import { formatNaira } from "@/src/lib/utils";

export interface ProductPreviewViewProps {
	draft: ProductDraftState;
	onClosePreview: () => void;
	onPublish?: () => void;
	isPublishing?: boolean;
}

export function ProductPreviewView({
	draft,
	onClosePreview,
	onPublish,
	isPublishing,
}: ProductPreviewViewProps): React.JSX.Element {
	const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
	const [quantity, setQuantity] = useState<number>(1);
	const [isZoomed, setIsZoomed] = useState<boolean>(false);
	const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

	const fallbackCover =
		"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80";
	const images =
		draft.visuals.length > 0 ? draft.visuals.map((v) => v.url) : [fallbackCover];
	const currentImage = images[selectedImageIndex] || images[0];

	const parsedPrice = Number(draft.price) || 0;
	const isOutOfStock = !draft.inStock || draft.stockStatus === "Out of Stock";

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		setZoomPos({ x, y });
	};

	const keyActivesList = draft.keyActives
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);

	return (
		<div className="space-y-6" data-testid="product-pdp-preview">
			{/* Top Preview Status Strip */}
			<div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary bg-surface-card/95 p-4 shadow-md backdrop-blur-md">
				<div className="flex items-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-fixed text-on-secondary-fixed">
						<Eye className="h-4 w-4" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-serif text-sm font-semibold text-primary">
								Live Storefront Preview
							</span>
							<span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-on-secondary-fixed">
								Draft Mode
							</span>
						</div>
						<p className="text-[11px] text-on-surface-variant">
							Exact high-fidelity replica of how clients will experience this formulation.
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2.5">
					<button
						type="button"
						onClick={onClosePreview}
						className="inline-flex items-center gap-1.5 rounded-full border border-border-delicate bg-surface px-4 py-2 text-xs font-semibold text-primary hover:bg-surface-container-low transition-colors"
					>
						<ArrowLeft className="h-3.5 w-3.5" />
						<span>Return to Editor</span>
					</button>

					{onPublish && (
						<button
							type="button"
							onClick={onPublish}
							disabled={isPublishing}
							className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary-dark transition-all disabled:opacity-50"
						>
							<Sparkles className="h-3.5 w-3.5 text-secondary" />
							<span>{isPublishing ? "Publishing..." : "Publish Formulation"}</span>
						</button>
					)}
				</div>
			</div>

			{/* PDP Content Replica */}
			<div className="rounded-3xl border border-border-delicate bg-surface p-6 sm:p-10 shadow-xs">
				{/* Breadcrumb Navigation Replica */}
				<nav className="mb-8 flex items-center gap-2 text-xs font-medium text-on-surface-variant">
					<span className="text-secondary-dark">{draft.category}</span>
					<span>/</span>
					<span className="text-primary truncate max-w-xs font-semibold">
						{draft.name || "Untitled Formulation"}
					</span>
				</nav>

				{/* 60/40 Split: Visual Gallery (Left) vs Formulation & Purchase (Right) */}
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
					{/* Left Column: Visual Gallery & Interactive Zoom */}
					<div className="lg:col-span-6 space-y-4">
						{/* Main High-Res Image with Zoom Magnifier */}
						<div
							className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border-delicate bg-surface-card cursor-zoom-in shadow-sm"
							onMouseEnter={() => setIsZoomed(true)}
							onMouseLeave={() => setIsZoomed(false)}
							onMouseMove={handleMouseMove}
						>
							<div
								className="relative h-full w-full"
								style={{
									transform: isZoomed ? "scale(2.2)" : "scale(1)",
									transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
									transition: isZoomed ? "transform 0.05s ease-out" : "transform 0.3s ease-out",
								}}
							>
								<Image
									src={currentImage}
									alt={draft.name || "Formulation visual"}
									fill
									priority
									sizes="(max-width: 1024px) 100vw, 50vw"
									className="object-cover"
								/>
							</div>

							{/* Out of Stock Overlay */}
							{isOutOfStock && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
									<span className="rounded-full bg-error px-6 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-lg">
										Out of Stock
									</span>
								</div>
							)}

							{/* Floating Badges */}
							<div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-2">
								<span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-xs">
									{draft.nafdacRegNo || "NAFDAC Certified"}
								</span>
								<span className="rounded-full bg-secondary-fixed/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-secondary-fixed shadow-xs">
									Melanin Tested
								</span>
							</div>

							{/* Zoom Hint */}
							<div className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] font-medium text-white transition-opacity group-hover:opacity-0">
								Hover to zoom
							</div>
						</div>

						{/* Thumbnail Selector */}
						{images.length > 1 && (
							<div className="flex items-center gap-3 overflow-x-auto pb-2">
								{images.map((img, idx) => (
									<button
										key={idx}
										type="button"
										onClick={() => setSelectedImageIndex(idx)}
										className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
											selectedImageIndex === idx
												? "border-primary shadow-sm"
												: "border-border-delicate opacity-70 hover:opacity-100"
										}`}
									>
										<Image
											src={img}
											alt={`Thumbnail visual ${idx + 1}`}
											fill
											sizes="80px"
											className="object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Right Column: Formulation Details & Purchase */}
					<div className="lg:col-span-6 space-y-8">
						{/* Category & Title */}
						<div className="space-y-2">
							<span className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-dark">
								{draft.category} • Botanical Formulation
							</span>
							<h1 className="font-serif text-3xl sm:text-4xl font-normal text-primary">
								{draft.name || "Untitled Formulation"}
							</h1>
							<p className="font-serif italic text-base text-on-surface-variant">
								{draft.tagline}
							</p>

							{/* Rating Strip */}
							<div className="flex items-center gap-3 pt-2">
								<div className="flex text-secondary">
									{Array.from({ length: 5 }).map((_, i) => (
										<Star key={i} className="h-4 w-4 fill-secondary" />
									))}
								</div>
								<span className="text-xs font-semibold text-primary">5.0</span>
								<span className="text-xs text-on-surface-variant">
									(Verified boutique client formulation)
								</span>
							</div>
						</div>

						{/* Price Display */}
						<div className="flex items-baseline gap-3 border-y border-border-delicate py-4">
							<span className="text-3xl font-bold tracking-tight text-primary">
								{formatNaira(parsedPrice)}
							</span>
							{draft.size && (
								<span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
									Volume: {draft.size}
								</span>
							)}
						</div>

						{/* Description */}
						<p className="text-sm sm:text-base leading-relaxed text-on-surface-variant font-light whitespace-pre-line">
							{draft.description ||
								"An ultra-refined Parisian botanical formulation imported directly from France to protect and nurture melanin-rich skin barriers."}
						</p>

						{/* Clinical Specs Grid */}
						<div className="space-y-3">
							<h3 className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
								Clinical Formulation Specifications
							</h3>
							<div className="grid grid-cols-2 gap-3 rounded-2xl border border-border-delicate bg-surface-card p-4 shadow-xs">
								<div className="p-2 border-r border-b border-border-delicate">
									<span className="text-[10px] font-bold uppercase tracking-wider text-secondary-dark block">
										pH Level
									</span>
									<span className="text-sm font-semibold text-primary">
										{draft.phLevel || "5.2 - 5.5"}
									</span>
								</div>

								<div className="p-2 border-b border-border-delicate">
									<span className="text-[10px] font-bold uppercase tracking-wider text-secondary-dark block">
										Texture
									</span>
									<span className="text-sm font-semibold text-primary">
										{draft.texture || "Silky fast-absorbing micro-glaze"}
									</span>
								</div>

								<div className="p-2 border-r border-border-delicate">
									<span className="text-[10px] font-bold uppercase tracking-wider text-secondary-dark block">
										Skin Type
									</span>
									<span className="text-sm font-semibold text-primary">
										{draft.skinType || "All Fitzpatrick skin phototypes"}
									</span>
								</div>

								<div className="p-2">
									<span className="text-[10px] font-bold uppercase tracking-wider text-secondary-dark block">
										Bio-Actives
									</span>
									<span className="text-xs font-medium text-primary line-clamp-2">
										{keyActivesList.length > 0
											? keyActivesList.join(", ")
											: "French Plant Squalane, Botanical Peptides"}
									</span>
								</div>
							</div>
						</div>

						{/* Mock Purchase Controls */}
						<div className="space-y-4 pt-2">
							<div className="flex items-center gap-4">
								<div className="flex items-center rounded-full border border-border-delicate bg-surface-container-low px-2 py-1.5 shadow-xs">
									<button
										type="button"
										onClick={() => setQuantity((q) => Math.max(1, q - 1))}
										className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-white"
									>
										<Minus className="h-3.5 w-3.5" />
									</button>
									<span className="min-w-8 text-center text-sm font-bold text-primary">
										{quantity}
									</span>
									<button
										type="button"
										onClick={() => setQuantity((q) => q + 1)}
										className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-white"
									>
										<Plus className="h-3.5 w-3.5" />
									</button>
								</div>

								<button
									type="button"
									disabled
									className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-4 px-8 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-md opacity-90 cursor-default"
								>
									<ShoppingBag className="h-4 w-4" />
									<span>
										{isOutOfStock
											? "Out of Stock"
											: `Add to Bag — ${formatNaira(parsedPrice * quantity)}`}
									</span>
								</button>
							</div>

							<div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
								<Clock className="h-4 w-4 text-secondary-dark flex-shrink-0" />
								<span>
									<strong>Same-Day Dispatch:</strong> Order within 3 hrs for same-day dispatch in Lagos &amp; Abuja.
								</span>
							</div>
						</div>

						{/* Radix UI Accordions */}
						<div className="pt-6">
							<h3 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-primary">
								Formulation Transparency &amp; Protocols
							</h3>

							<Accordion.Root
								type="multiple"
								defaultValue={["bio-actives"]}
								className="divide-y divide-border-delicate rounded-2xl border border-border-delicate bg-surface-card shadow-xs"
							>
								<Accordion.Item value="bio-actives" className="px-6 py-2">
									<Accordion.Header>
										<Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left font-serif text-base font-medium text-primary transition-colors hover:text-secondary-dark">
											<span>Bio-Actives &amp; Clinical Chemistry</span>
											<ChevronDown className="h-4 w-4 text-on-surface-variant transition-transform duration-200 group-data-[state=open]:rotate-180" />
										</Accordion.Trigger>
									</Accordion.Header>
									<Accordion.Content className="pb-4 text-sm leading-relaxed text-on-surface-variant animate-in fade-in">
										<p>{draft.bioActives}</p>
									</Accordion.Content>
								</Accordion.Item>

								<Accordion.Item value="inci" className="px-6 py-2">
									<Accordion.Header>
										<Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left font-serif text-base font-medium text-primary transition-colors hover:text-secondary-dark">
											<span>Full INCI Transparency &amp; Ingredients</span>
											<ChevronDown className="h-4 w-4 text-on-surface-variant transition-transform duration-200 group-data-[state=open]:rotate-180" />
										</Accordion.Trigger>
									</Accordion.Header>
									<Accordion.Content className="pb-4 text-xs font-mono leading-relaxed text-on-surface-variant animate-in fade-in">
										<p>{draft.inci}</p>
									</Accordion.Content>
								</Accordion.Item>

								<Accordion.Item value="ritual" className="px-6 py-2">
									<Accordion.Header>
										<Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left font-serif text-base font-medium text-primary transition-colors hover:text-secondary-dark">
											<span>Daily Ritual &amp; Application Guide</span>
											<ChevronDown className="h-4 w-4 text-on-surface-variant transition-transform duration-200 group-data-[state=open]:rotate-180" />
										</Accordion.Trigger>
									</Accordion.Header>
									<Accordion.Content className="pb-4 text-sm leading-relaxed text-on-surface-variant animate-in fade-in">
										<p>{draft.ritual}</p>
									</Accordion.Content>
								</Accordion.Item>

								<Accordion.Item value="nafdac" className="px-6 py-2">
									<Accordion.Header>
										<Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left font-serif text-base font-medium text-primary transition-colors hover:text-secondary-dark">
											<span>NAFDAC Registration &amp; Safety Certification</span>
											<ChevronDown className="h-4 w-4 text-on-surface-variant transition-transform duration-200 group-data-[state=open]:rotate-180" />
										</Accordion.Trigger>
									</Accordion.Header>
									<Accordion.Content className="pb-4 text-sm leading-relaxed text-on-surface-variant animate-in fade-in">
										<div className="flex items-start gap-2.5">
											<ShieldCheck className="h-5 w-5 text-secondary-dark flex-shrink-0 mt-0.5" />
											<p>{draft.nafdacRegNo}</p>
										</div>
									</Accordion.Content>
								</Accordion.Item>
							</Accordion.Root>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
