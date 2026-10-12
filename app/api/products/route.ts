import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/src/lib/storage";
import defaultProducts from "@/src/data/products.json";
import type { Product, CreateProductDto, UpdateProductDto } from "@/src/types/store";

export const dynamic = "force-dynamic";

const PRODUCTS_FILE_PATH = "src/data/products.json";

export async function GET(): Promise<NextResponse> {
	try {
		const products = await readJsonFile<Product[]>(
			PRODUCTS_FILE_PATH,
			defaultProducts as Product[]
		);
		return NextResponse.json(products, {
			status: 200,
			headers: {
				"Cache-Control": "no-store, max-age=0",
			},
		});
	} catch (error: unknown) {
		console.error("[GET /api/products] Error fetching products:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve products" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const body = (await request.json()) as CreateProductDto;

		if (!body.name || !body.name.trim()) {
			return NextResponse.json(
				{ error: "Product name is required" },
				{ status: 400 }
			);
		}

		if (body.price === undefined || body.price < 0) {
			return NextResponse.json(
				{ error: "Valid price is required" },
				{ status: 400 }
			);
		}

		const products = await readJsonFile<Product[]>(
			PRODUCTS_FILE_PATH,
			defaultProducts as Product[]
		);

		const baseSlug = body.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

		let uniqueId = baseSlug;
		let counter = 1;
		while (products.some((p) => p.id === uniqueId)) {
			uniqueId = `${baseSlug}-${counter}`;
			counter++;
		}

		const newProduct: Product = {
			id: uniqueId,
			slug: uniqueId,
			name: body.name.trim(),
			tagline: body.tagline?.trim() || "Cellular Radiance & French Botanical Protection",
			price: Number(body.price),
			category: body.category || "Serums",
			stockStatus: body.stockStatus || "In Stock",
			inStock: body.inStock !== false && body.stockStatus !== "Out of Stock",
			featured: Boolean(body.featured),
			size: body.size?.trim() || "50 ml / 1.7 fl. oz.",
			rating: 5.0,
			reviewCount: 0,
			nafdacRegNo: body.nafdacRegNo?.trim() || "NAFDAC Reg. No. 04-9988",
			images:
				body.images && body.images.length > 0
					? body.images
					: [
							"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
					  ],
			description:
				body.description?.trim() ||
				"An ultra-refined Parisian botanical formulation imported directly from France to protect and nurture melanin-rich skin barriers.",
			formulation: {
				phLevel: body.formulation?.phLevel || "5.2 - 5.5",
				texture: body.formulation?.texture || "Silky fast-absorbing emulsion",
				skinType: body.formulation?.skinType || "All skin phototypes (I - VI)",
				keyActives:
					body.formulation?.keyActives && body.formulation.keyActives.length > 0
						? body.formulation.keyActives
						: ["French Botanical Extracts", "Panthenol (Vitamin B5)"],
			},
			accordions: {
				bioActives:
					body.accordions?.bioActives ||
					"Formulated in Paris with pure dermatological-grade French botanical actives to restore epidermal radiance.",
				inci:
					body.accordions?.inci ||
					"Aqua, Glycerin, Botanical Squalane, Niacinamide, Camellia Oleifera Seed Oil, Sodium Hyaluronate, Tocopherol, Phenoxyethanol.",
				ritual:
					body.accordions?.ritual ||
					"Apply 2-3 drops or a dime-sized amount to cleansed face and neck morning and evening.",
				nafdac:
					body.accordions?.nafdac ||
					"Verified and tested in adherence to strict cGMP cosmetic guidelines and NAFDAC safety regulations.",
			},
		};

		products.unshift(newProduct);
		await writeJsonFile(PRODUCTS_FILE_PATH, products);

		return NextResponse.json(newProduct, { status: 201 });
	} catch (error: unknown) {
		console.error("[POST /api/products] Error creating product:", error);
		return NextResponse.json(
			{ error: "Failed to create product" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
	try {
		let body: UpdateProductDto = {};
		try {
			const text = await request.text();
			if (text && text.trim().length > 0) {
				body = JSON.parse(text) as UpdateProductDto;
			}
		} catch (parseErr: unknown) {
			console.warn("[PATCH /api/products] Could not parse JSON body:", parseErr);
			body = {};
		}

		const { id, price, stockStatus, inStock, featured } = body;

		if (!id) {
			return NextResponse.json(
				{ error: "Product id is required" },
				{ status: 400 }
			);
		}

		const products = await readJsonFile<Product[]>(
			PRODUCTS_FILE_PATH,
			defaultProducts as Product[]
		);

		const productIndex = products.findIndex(
			(p) => p.id === id || p.slug === id || p.name.toLowerCase() === id.toLowerCase()
		);
		if (productIndex === -1) {
			return NextResponse.json(
				{ error: `Product with id '${id}' not found` },
				{ status: 404 }
			);
		}

		const existing = products[productIndex];
		const updatedProduct: Product = { ...existing };

		if (price !== undefined) {
			updatedProduct.price = Number(price);
		}

		if (stockStatus !== undefined) {
			updatedProduct.stockStatus = stockStatus;
			updatedProduct.inStock = stockStatus === "In Stock";
		} else if (inStock !== undefined) {
			updatedProduct.inStock = inStock;
			updatedProduct.stockStatus = inStock ? "In Stock" : "Out of Stock";
		}

		if (featured !== undefined) {
			updatedProduct.featured = Boolean(featured);
		}

		products[productIndex] = updatedProduct;
		await writeJsonFile(PRODUCTS_FILE_PATH, products);

		return NextResponse.json(updatedProduct, { status: 200 });
	} catch (error: unknown) {
		console.error("[PATCH /api/products] Error updating product:", error);
		return NextResponse.json(
			{ error: "Failed to update product" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Product id is required" },
				{ status: 400 }
			);
		}

		const products = await readJsonFile<Product[]>(
			PRODUCTS_FILE_PATH,
			defaultProducts as Product[]
		);

		const filtered = products.filter(
			(p) => p.id !== id && p.slug !== id
		);

		if (filtered.length === products.length) {
			return NextResponse.json(
				{ error: `Product with id '${id}' not found` },
				{ status: 404 }
			);
		}

		await writeJsonFile(PRODUCTS_FILE_PATH, filtered);
		return NextResponse.json({ success: true, id }, { status: 200 });
	} catch (error: unknown) {
		console.error("[DELETE /api/products] Error deleting product:", error);
		return NextResponse.json(
			{ error: "Failed to delete product" },
			{ status: 500 }
		);
	}
}
