import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CartItem, CustomerInfo } from "@/src/types/store";

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
	if (isNaN(amount) || amount === null || amount === undefined) {
		return "₦0";
	}
	const rounded = Math.round(amount);
	const formatted = new Intl.NumberFormat("en-NG").format(rounded);
	return `₦${formatted}`;
}

export function sanitizePhoneNumber(phone: string): string {
	const digits = phone.replace(/[^0-9]/g, "");
	if (digits.startsWith("234")) {
		return digits;
	}
	if (digits.startsWith("0")) {
		return `234${digits.slice(1)}`;
	}
	return digits;
}

export function buildWhatsAppUrl(
	phone: string,
	customer: CustomerInfo,
	items: CartItem[],
	subtotal: number,
	orderNumber?: string
): string {
	const recipientPhone = sanitizePhoneNumber(phone) || "2348000000000";

	const orderRefLine = orderNumber ? `*Order Ref:* #${orderNumber}\n*Status:* Awaiting Delivery Agreement\n\n` : "";

	const itemsList = items
		.map((item, idx) => {
			const lineTotal = item.product.price * item.quantity;
			const sizeInfo = item.selectedSize || item.product.size ? ` (${item.selectedSize || item.product.size})` : "";
			return `${idx + 1}. ${item.product.name}${sizeInfo} x ${item.quantity} - ${formatNaira(lineTotal)}`;
		})
		.join("\n");

	const deliveryAddress = customer.address || customer.streetAddress || "";
	const notesLine = customer.courierNotes ? `• Landmark / Gate Notes: ${customer.courierNotes}\n` : "";

	const message = `🌿 *JULIANA'S COSMETICS — CONCIERGE ORDER DISPATCH* 🌿\n\n` +
		`${orderRefLine}` +
		`*Customer Details:*\n` +
		`• Name: ${customer.fullName}\n` +
		`• Phone: ${customer.phone}\n` +
		`• State: ${customer.state}\n` +
		`• City / LGA: ${customer.cityLga}\n` +
		`• Delivery Address: ${deliveryAddress}\n` +
		`${notesLine}\n` +
		`*Order Items:*\n` +
		`${itemsList || "No items"}\n\n` +
		`*Financial Summary:*\n` +
		`• Items Subtotal: ${formatNaira(subtotal)}\n` +
		`• Delivery Fee: *To be calculated & agreed via WhatsApp*\n\n` +
		`Hello Juliana's Concierge team, I have submitted my order. Please provide the agreed doorstep delivery fee to my address in ${customer.cityLga}, ${customer.state} so we can finalize delivery and payment.`;

	return `https://wa.me/${recipientPhone}?text=${encodeURIComponent(message)}`;
}
