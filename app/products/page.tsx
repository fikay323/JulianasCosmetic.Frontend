import React from "react";
import type { Metadata } from "next";
import defaultProducts from "@/src/data/products.json";
import { readJsonFile } from "@/src/lib/storage";
import type { Product } from "@/src/types/store";
import { ProductListingClient } from "@/src/components/storefront/ProductListingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "The Formulations Archive | Juliana's Cosmetics",
	description:
		"Discover clean botanical skincare formulations engineered specifically for melanin-rich skin. Dermatologically tested and NAFDAC approved.",
};

export default async function ProductsPage(): Promise<React.JSX.Element> {
	const products = await readJsonFile<Product[]>(
		"src/data/products.json",
		defaultProducts as Product[]
	);

	return <ProductListingClient initialProducts={products} />;
}
