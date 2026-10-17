import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/src/lib/backend";
import type { UpdateProductDto } from "@/src/types/store";

export const dynamic = "force-dynamic";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(
	_request: NextRequest,
	{ params }: RouteParams
): Promise<NextResponse> {
	const { id } = await params;
	const baseUrl = getBackendApiUrl();
	const endpoint = `${baseUrl}/api/products/${encodeURIComponent(id)}`;

	try {
		const res = await fetch(endpoint, {
			cache: "no-store",
			headers: {
				Accept: "application/json",
			},
		});

		if (res.status === 404) {
			return NextResponse.json(
				{ error: `Product '${id}' not found.` },
				{ status: 404 }
			);
		}

		if (!res.ok) {
			const errData = (await res.json().catch(() => ({}))) as { error?: string };
			return NextResponse.json(
				{
					error:
						errData.error ||
						`Backend returned HTTP ${res.status}: Failed to retrieve product`,
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
		console.error(`[GET /api/products/${id}] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Please ensure the backend is running.`,
			},
			{ status: 502 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: RouteParams
): Promise<NextResponse> {
	const { id } = await params;
	const baseUrl = getBackendApiUrl();
	const endpoint = `${baseUrl}/api/products/${encodeURIComponent(id)}`;

	try {
		const body = (await request.json()) as UpdateProductDto;

		const res = await fetch(endpoint, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ ...body, id }),
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
		console.error(`[PATCH /api/products/${id}] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Failed to update formulation.`,
			},
			{ status: 502 }
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: RouteParams
): Promise<NextResponse> {
	const { id } = await params;
	const baseUrl = getBackendApiUrl();
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
		console.error(`[DELETE /api/products/${id}] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Failed to delete product.`,
			},
			{ status: 502 }
		);
	}
}
