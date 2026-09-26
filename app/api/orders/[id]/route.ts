import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/src/lib/storage";
import type { Order, OrderStatus } from "@/src/types/store";

export const dynamic = "force-dynamic";

const ORDERS_FILE_PATH = "src/data/orders.json";

interface UpdateOrderPayload {
	agreedDeliveryFee?: number | null;
	status?: OrderStatus;
	notes?: string;
}

export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	try {
		const { id } = await context.params;
		const decodedId = decodeURIComponent(id).replace(/^#/, "");
		const orders = await readJsonFile<Order[]>(ORDERS_FILE_PATH, []);
		const order = orders.find(
			(o) =>
				o.id === id ||
				o.id === decodedId ||
				o.orderNumber === id ||
				o.orderNumber === decodedId ||
				o.orderNumber.replace(/^#/, "") === decodedId
		);

		if (!order) {
			return NextResponse.json(
				{ error: `Order with identifier '${id}' not found` },
				{ status: 404 }
			);
		}

		return NextResponse.json(order, { status: 200 });
	} catch (error: unknown) {
		console.error("[GET /api/orders/[id]] Error:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve order" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	try {
		const { id } = await context.params;
		const decodedId = decodeURIComponent(id).replace(/^#/, "");

		let body: UpdateOrderPayload = {};
		try {
			const text = await request.text();
			if (text && text.trim().length > 0) {
				body = JSON.parse(text) as UpdateOrderPayload;
			}
		} catch (parseErr: unknown) {
			console.warn("[PATCH /api/orders/[id]] Could not parse JSON body:", parseErr);
			body = {};
		}

		const orders = await readJsonFile<Order[]>(ORDERS_FILE_PATH, []);

		const orderIndex = orders.findIndex(
			(o) =>
				o.id === id ||
				o.id === decodedId ||
				o.orderNumber === id ||
				o.orderNumber === decodedId ||
				o.orderNumber.replace(/^#/, "") === decodedId
		);

		if (orderIndex === -1) {
			return NextResponse.json(
				{ error: `Order with identifier '${id}' not found` },
				{ status: 404 }
			);
		}

		const existing = orders[orderIndex];
		const updatedOrder: Order = { ...existing };

		if (body.agreedDeliveryFee !== undefined) {
			const feeNumber = body.agreedDeliveryFee === null ? null : Number(body.agreedDeliveryFee);
			updatedOrder.agreedDeliveryFee = feeNumber;
			updatedOrder.total = existing.subtotal + (feeNumber ?? 0);
		}

		if (body.status !== undefined) {
			updatedOrder.status = body.status;
		}

		if (body.notes !== undefined) {
			updatedOrder.notes = body.notes;
		}

		updatedOrder.updatedAt = new Date().toISOString();

		orders[orderIndex] = updatedOrder;
		await writeJsonFile(ORDERS_FILE_PATH, orders);

		return NextResponse.json(updatedOrder, { status: 200 });
	} catch (error: unknown) {
		console.error("[PATCH /api/orders/[id]] Error:", error);
		return NextResponse.json(
			{ error: "Failed to update order" },
			{ status: 500 }
		);
	}
}
