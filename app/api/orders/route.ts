import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/src/lib/storage";
import { buildWhatsAppUrl } from "@/src/lib/utils";
import defaultProducts from "@/src/data/products.json";
import type { Order, CartItem, CustomerInfo, OrderItem, Product } from "@/src/types/store";

export const dynamic = "force-dynamic";

const ORDERS_FILE_PATH = "src/data/orders.json";
const PRODUCTS_FILE_PATH = "src/data/products.json";
const STORE_CONCIERGE_PHONE = process.env.NEXT_PUBLIC_CONCIERGE_PHONE || "2348000000000";

interface RequestItemPayload {
	productId?: string;
	product?: Product;
	quantity?: number;
	selectedSize?: string;
}

interface CreateOrderRequestBody {
	customer?: CustomerInfo;
	items?: RequestItemPayload[];
}

export async function GET(): Promise<NextResponse> {
	try {
		const orders = await readJsonFile<Order[]>(ORDERS_FILE_PATH, []);
		return NextResponse.json(orders, { status: 200 });
	} catch (error: unknown) {
		console.error("[GET /api/orders] Error fetching orders:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve orders" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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

		// Nigerian phone format validation (+234 or 080/081/090/070 etc)
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

		// Read existing products to guarantee price authenticity
		const catalogProducts = await readJsonFile<Product[]>(
			PRODUCTS_FILE_PATH,
			defaultProducts as Product[]
		);

		const normalizedCartItems: CartItem[] = [];
		const orderItems: OrderItem[] = [];
		let computedSubtotal = 0;

		for (const reqItem of items) {
			const reqProductId = reqItem.product?.id || reqItem.productId;
			const quantity = Math.max(1, reqItem.quantity ?? 1);

			const product = catalogProducts.find((p) => p.id === reqProductId) || reqItem.product;

			if (!product) {
				continue;
			}

			const lineTotal = product.price * quantity;
			computedSubtotal += lineTotal;

			normalizedCartItems.push({
				product,
				quantity,
				selectedSize: reqItem.selectedSize || product.size,
			});

			orderItems.push({
				productId: product.id,
				productName: product.name,
				price: product.price,
				quantity,
				productImage: product.images?.[0],
				size: reqItem.selectedSize || product.size,
				totalPrice: lineTotal,
			});
		}

		if (orderItems.length === 0) {
			return NextResponse.json(
				{ error: "Valid product items are required" },
				{ status: 400 }
			);
		}

		const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
		const orderNumber = `JC-ORD-${Date.now().toString().slice(-6)}`;
		const timestamp = new Date().toISOString();

		const whatsappUrl = buildWhatsAppUrl(
			STORE_CONCIERGE_PHONE,
			{
				fullName,
				phone,
				state,
				cityLga,
				address,
				streetAddress: address,
				courierNotes: customer.courierNotes || "",
			},
			normalizedCartItems,
			computedSubtotal,
			orderNumber
		);

		const newOrder: Order = {
			id: orderId,
			orderNumber,
			customer: {
				fullName,
				phone,
				state,
				cityLga,
				address,
				streetAddress: address,
				courierNotes: customer.courierNotes || "",
			},
			items: orderItems,
			subtotal: computedSubtotal,
			agreedDeliveryFee: null,
			total: computedSubtotal,
			status: "Awaiting Delivery Agreement",
			whatsappMessageUrl: whatsappUrl,
			whatsappUrl,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		// Read existing orders and persist atomically
		const existingOrders = await readJsonFile<Order[]>(ORDERS_FILE_PATH, []);
		const updatedOrders = [newOrder, ...existingOrders];
		await writeJsonFile(ORDERS_FILE_PATH, updatedOrders);

		return NextResponse.json(newOrder, { status: 201 });
	} catch (error: unknown) {
		console.error("[POST /api/orders] Error creating order:", error);
		return NextResponse.json(
			{ error: "Failed to persist order" },
			{ status: 500 }
		);
	}
}
