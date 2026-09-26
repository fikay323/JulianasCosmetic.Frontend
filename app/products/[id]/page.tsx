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

	return {
		title: `${product.name} | Juliana's Cosmetics`,
		description: product.description,
		openGraph: {
			title: product.name,
			description: product.description,
			images: product.images?.[0] ? [product.images[0]] : [],
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
