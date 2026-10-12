import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/src/lib/backend";
import type { CustomerInfo, Product } from "@/src/types/store";

export const dynamic = "force-dynamic";

interface RequestItemPayload {
	productId?: string;
	product?: Product;
	quantity?: number;
	selectedSize?: string;
	size?: string;
}

interface CreateOrderRequestBody {
	customer?: CustomerInfo;
	items?: RequestItemPayload[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams } = new URL(request.url);
	const status = searchParams.get("status");
	const baseUrl = getBackendApiUrl();

	const query = status ? `?status=${encodeURIComponent(status)}` : "";
	const endpoint = `${baseUrl}/api/orders${query}`;

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
						`Backend returned HTTP ${res.status}: Failed to retrieve orders`,
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
		console.error(`[GET /api/orders] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Please ensure backend is running.`,
			},
			{ status: 502 }
		);
	}
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	const baseUrl = getBackendApiUrl();
	const endpoint = `${baseUrl}/api/orders`;

	try {
		const body = (await request.json()) as CreateOrderRequestBody;
		const { customer, items } = body;

		if (!customer) {
			return NextResponse.json(
				{ error: "Customer information is required" },
				{ status: 400 }
			);
		}

		const fullName = (customer.fullName || "").trim();
		const phone = (customer.phone || "").trim();
		const state = (customer.state || "").trim();
		const cityLga = (customer.cityLga || "").trim();
		const address = (customer.address || customer.streetAddress || "").trim();

		if (!fullName || !phone || !state || !cityLga || !address) {
			return NextResponse.json(
				{ error: "Full name, phone, state, city/LGA, and address are required" },
				{ status: 400 }
			);
		}

		const sanitizedDigits = phone.replace(/[^0-9]/g, "");
		const isValidNigerianPhone =
			(sanitizedDigits.startsWith("234") && sanitizedDigits.length === 13) ||
			(sanitizedDigits.startsWith("0") && sanitizedDigits.length === 11);

		if (!isValidNigerianPhone && sanitizedDigits.length < 10) {
			return NextResponse.json(
				{ error: "Please enter a valid Nigerian phone number" },
				{ status: 400 }
			);
		}

		if (!items || !Array.isArray(items) || items.length === 0) {
			return NextResponse.json(
				{ error: "Cart items cannot be empty" },
				{ status: 400 }
			);
		}

		const normalizedItems = items.map((item) => ({
			productId: item.productId || item.product?.id || "",
			quantity: Math.max(1, item.quantity ?? 1),
			size: item.selectedSize || item.size || "Standard",
		}));

		const backendPayload = {
			customer: {
				fullName,
				phone,
				state,
				cityLga,
				address,
				streetAddress: address,
				courierNotes: customer.courierNotes?.trim() || "",
				email: customer.email?.trim() || "",
			},
			items: normalizedItems,
		};

		const res = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(backendPayload),
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
		console.error(`[POST /api/orders] Error forwarding to ${endpoint}:`, msg);
		return NextResponse.json(
			{
				error: `Backend service unreachable: ${msg}. Failed to persist order.`,
			},
			{ status: 502 }
		);
	}
}
