import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/src/lib/backend";
import type { OrderStatus } from "@/src/types/store";

export const dynamic = "force-dynamic";

interface UpdateOrderPayload {
	agreedDeliveryFee?: number | null;
	status?: OrderStatus;
	notes?: string;
}

export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const { id } = await context.params;
	const baseUrl = getBackendApiUrl();
	const endpoint = `${baseUrl}/api/orders/${encodeURIComponent(id)}`;

	try {
		const res = await fetch(endpoint, {
			cache: "no-store",
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
		console.error(`[GET /api/orders/[id]] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Failed to retrieve order.`,
			},
			{ status: 502 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const { id } = await context.params;
	const baseUrl = getBackendApiUrl();
	const endpoint = `${baseUrl}/api/orders/${encodeURIComponent(id)}`;

	try {
		let body: UpdateOrderPayload = {};
		try {
			const text = await request.text();
			if (text && text.trim().length > 0) {
				body = JSON.parse(text) as UpdateOrderPayload;
			}
		} catch (parseErr: unknown) {
			console.warn("[PATCH /api/orders/[id]] JSON parse warning:", parseErr);
			body = {};
		}

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
		console.error(`[PATCH /api/orders/[id]] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Failed to update order.`,
			},
			{ status: 502 }
		);
	}
}
