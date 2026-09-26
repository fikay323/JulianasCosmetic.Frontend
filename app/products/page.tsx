import React from "react";
import type { Metadata } from "next";
import defaultProducts from "@/src/data/products.json";
import { readJsonFile } from "@/src/lib/storage";
import type { Product } from "@/src/types/store";
import { ProductListingClient } from "@/src/components/storefront/ProductListingClient";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://julianas-cosmetic-frontend.vercel.app";

export const metadata: Metadata = {
	title: "The Formulations Archive | Juliana's Cosmetics",
	description:
		"Discover clean botanical skincare formulations engineered specifically for melanin-rich skin. Dermatologically tested and NAFDAC approved.",
	openGraph: {
		type: "website",
		url: `${siteUrl}/products`,
		title: "The Formulations Archive | Juliana's Cosmetics",
		description:
			"Discover clean botanical skincare formulations engineered specifically for melanin-rich skin. Dermatologically tested and NAFDAC approved.",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Juliana's Cosmetics Formulations Archive",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "The Formulations Archive | Juliana's Cosmetics",
		description:
			"Discover clean botanical skincare formulations engineered specifically for melanin-rich skin. Dermatologically tested and NAFDAC approved.",
		images: ["/og-image.jpg"],
	},
};

export default async function ProductsPage(): Promise<React.JSX.Element> {
	const products = await readJsonFile<Product[]>(
		"src/data/products.json",
		defaultProducts as Product[]
	);

	return <ProductListingClient initialProducts={products} />;
}
