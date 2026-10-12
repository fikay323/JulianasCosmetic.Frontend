import React from "react";
import type { Metadata } from "next";
import type { Product } from "@/src/types/store";
import { fetchBackendProducts } from "@/src/lib/backend";
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

	return <ProductListingClient initialProducts={products} initialError={error} />;
}
