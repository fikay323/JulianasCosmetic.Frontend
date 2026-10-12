import React from "react";
import type { Product } from "@/src/types/store";
import { fetchBackendProducts } from "@/src/lib/backend";
import { HeroSplit } from "@/src/components/storefront/HeroSplit";
import { TrustPillars } from "@/src/components/storefront/TrustPillars";
import { FeaturedBotanicalGrid } from "@/src/components/storefront/FeaturedBotanicalGrid";
import { RoutineConsultation } from "@/src/components/storefront/RoutineConsultation";

export const dynamic = "force-dynamic";

export default async function HomePage(): Promise<React.JSX.Element> {
	let products: Product[] = [];
	let error: string | null = null;

	try {
		products = await fetchBackendProducts();
	} catch (err: unknown) {
		error =
			err instanceof Error
				? err.message
				: "Unable to connect to backend service to load catalog.";
	}

	return (
		<div className="flex flex-col min-h-screen">
			{/* Editorial Hero Split (60/40) */}
			<HeroSplit />

			{/* 4 NAFDAC Trust Pillars */}
			<TrustPillars />

			{/* Featured Botanical Formulations Grid */}
			<FeaturedBotanicalGrid products={products} initialError={error} />

			{/* Personalized Routine Consultation */}
			<RoutineConsultation />
		</div>
	);
}
