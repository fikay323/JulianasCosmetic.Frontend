import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import defaultProducts from "@/src/data/products.json";
import { readJsonFile } from "@/src/lib/storage";
import type { Product } from "@/src/types/store";
import { ProductDetailClient } from "@/src/components/storefront/ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { id } = await params;
	const products = await readJsonFile<Product[]>(
		"src/data/products.json",
		defaultProducts as Product[]
	);
	const product = products.find((p) => p.id === id || p.slug === id);

	if (!product) {
		return {
			title: "Product Not Found | Juliana's Cosmetics",
		};
	}

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://julianas-cosmetic-frontend.vercel.app";
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
}

export default async function ProductDetailPage({
	params,
}: ProductPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const products = await readJsonFile<Product[]>(
		"src/data/products.json",
		defaultProducts as Product[]
	);
	const product = products.find((p) => p.id === id || p.slug === id);

	if (!product) {
		notFound();
	}

	return <ProductDetailClient product={product} />;
}
