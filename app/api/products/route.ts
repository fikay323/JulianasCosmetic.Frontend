import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/src/lib/storage";
import defaultProducts from "@/src/data/products.json";
import type { Product } from "@/src/types/store";

export const dynamic = "force-dynamic";

const PRODUCTS_FILE_PATH = "src/data/products.json";

interface PatchProductRequestBody {
	id?: string;
	price?: number;
	stockStatus?: "In Stock" | "Out of Stock";
	inStock?: boolean;
}

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

export async function PATCH(request: NextRequest): Promise<NextResponse> {
	try {
		let body: PatchProductRequestBody = {};
		try {
			const text = await request.text();
			if (text && text.trim().length > 0) {
				body = JSON.parse(text) as PatchProductRequestBody;
			}
		} catch (parseErr: unknown) {
			console.warn("[PATCH /api/products] Could not parse JSON body:", parseErr);
			body = {};
		}

		const { id, price, stockStatus, inStock } = body;

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
