import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/src/lib/backend";
import type { CreateProductDto, UpdateProductDto } from "@/src/types/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams } = new URL(request.url);
	const category = searchParams.get("category");
	const baseUrl = getBackendApiUrl();

	const query =
		category && category !== "All"
			? `?category=${encodeURIComponent(category)}`
			: "";
	const endpoint = `${baseUrl}/api/products${query}`;

	try {
		const res = await fetch(endpoint, {
			cache: "no-store",
			headers: {
				Accept: "application/json",
			},
		});

		if (!res.ok) {
			const errData = (await res.json().catch(() => ({}))) as { error?: string };
			return NextResponse.json(
				{
					error:
						errData.error ||
						`Backend returned HTTP ${res.status}: Failed to retrieve products`,
				},
				{ status: res.status }
			);
		}

		const data: unknown = await res.json();
		return NextResponse.json(data, {
			status: 200,
			headers: {
				"Cache-Control": "no-store, max-age=0",
			},
		});
	} catch (error: unknown) {
		const msg =
			error instanceof Error ? error.message : "Network error contacting backend";
		console.error(`[GET /api/products] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Please ensure the backend is running.`,
			},
			{ status: 502 }
		);
	}
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	const baseUrl = getBackendApiUrl();
	const endpoint = `${baseUrl}/api/products`;

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

		const res = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(body),
		});

		const data: unknown = await res.json().catch(() => ({}));

		if (!res.ok) {
			return NextResponse.json(
				data || { error: `Backend returned ${res.status}` },
				{ status: res.status }
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error: unknown) {
		const msg =
			error instanceof Error ? error.message : "Network error contacting backend";
		console.error(`[POST /api/products] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Failed to create formulation.`,
			},
			{ status: 502 }
		);
	}
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
	const baseUrl = getBackendApiUrl();

	try {
		let body: UpdateProductDto = {};
		try {
			const text = await request.text();
			if (text && text.trim().length > 0) {
				body = JSON.parse(text) as UpdateProductDto;
			}
		} catch (parseErr: unknown) {
			console.warn("[PATCH /api/products] JSON parse warning:", parseErr);
			body = {};
		}

		const { id } = body;

		if (!id) {
			return NextResponse.json(
				{ error: "Product id is required" },
				{ status: 400 }
			);
		}

		const endpoint = `${baseUrl}/api/products/${encodeURIComponent(id)}`;

		const res = await fetch(endpoint, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(body),
		});

		const data: unknown = await res.json().catch(() => ({}));

		if (!res.ok) {
			return NextResponse.json(
				data || { error: `Backend returned ${res.status}` },
				{ status: res.status }
			);
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error: unknown) {
		const msg =
			error instanceof Error ? error.message : "Network error contacting backend";
		console.error("[PATCH /api/products] Error forwarding to backend:", msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Failed to update formulation.`,
			},
			{ status: 502 }
		);
	}
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");
	const baseUrl = getBackendApiUrl();

	if (!id) {
		return NextResponse.json(
			{ error: "Product id is required" },
			{ status: 400 }
		);
	}

	const endpoint = `${baseUrl}/api/products/${encodeURIComponent(id)}`;

	try {
		const res = await fetch(endpoint, {
			method: "DELETE",
			headers: {
				Accept: "application/json",
			},
		});

		const data: unknown = await res.json().catch(() => ({}));

		if (!res.ok) {
			return NextResponse.json(
				data || { error: `Backend returned ${res.status}` },
				{ status: res.status }
			);
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error: unknown) {
		const msg =
			error instanceof Error ? error.message : "Network error contacting backend";
		console.error(`[DELETE /api/products] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Failed to delete product.`,
			},
			{ status: 502 }
		);
	}
}
