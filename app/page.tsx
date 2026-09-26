import React from "react";
import defaultProducts from "@/src/data/products.json";
import { readJsonFile } from "@/src/lib/storage";
import type { Product } from "@/src/types/store";
import { HeroSplit } from "@/src/components/storefront/HeroSplit";
import { TrustPillars } from "@/src/components/storefront/TrustPillars";
import { FeaturedBotanicalGrid } from "@/src/components/storefront/FeaturedBotanicalGrid";
import { RoutineConsultation } from "@/src/components/storefront/RoutineConsultation";

export const dynamic = "force-dynamic";

export default async function HomePage(): Promise<React.JSX.Element> {
	const products = await readJsonFile<Product[]>(
		"src/data/products.json",
		defaultProducts as Product[]
	);

	return (
		<div className="flex flex-col min-h-screen">
			{/* Editorial Hero Split (60/40) */}
			<HeroSplit />

			{/* 4 NAFDAC Trust Pillars */}
			<TrustPillars />

			{/* Featured Botanical Formulations Grid */}
			<FeaturedBotanicalGrid products={products} />

			{/* Personalized Routine Consultation */}
			<RoutineConsultation />
		</div>
	);
}
