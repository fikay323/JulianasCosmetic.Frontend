import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchBackendProduct } from "@/src/lib/backend";
import { ProductDetailClient } from "@/src/components/storefront/ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { id } = await params;
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://julianas-cosmetic-frontend.vercel.app";

	try {
		const product = await fetchBackendProduct(id);

		if (!product) {
			return {
				title: "Product Not Found | Juliana's Cosmetics",
			};
		}

		const productUrl = `${siteUrl}/products/${product.slug || product.id}`;
		const ogImageUrl = product.images?.[0] || `${siteUrl}/og-image.jpg`;

		return {
			title: `${product.name} | Juliana's Cosmetics`,
			description: product.description,
			openGraph: {
				type: "article",
				locale: "en_US",
				url: productUrl,
				siteName: "Juliana's Cosmetics",
				title: `${product.name} | Juliana's Cosmetics`,
				description: product.description,
				images: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
						alt: `${product.name} - Juliana's Cosmetics`,
						type: "image/jpeg",
					},
				],
			},
			twitter: {
				card: "summary_large_image",
				title: `${product.name} | Juliana's Cosmetics`,
				description: product.description,
				images: [ogImageUrl],
			},
		};
	} catch {
		return {
			title: "Product | Juliana's Cosmetics",
		};
	}
}

export default async function ProductDetailPage({
	params,
}: ProductPageProps): Promise<React.JSX.Element> {
	const { id } = await params;

	let product = null;
	try {
		product = await fetchBackendProduct(id);
	} catch (error: unknown) {
		console.error(`[ProductDetailPage] Error fetching product '${id}' from backend:`, error);
	}

	if (!product) {
		notFound();
	}

	return <ProductDetailClient product={product} />;
}
