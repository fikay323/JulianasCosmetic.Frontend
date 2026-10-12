import type { Product, Order } from "@/src/types/store";

/**
 * Returns the base URL for the backend ASP.NET Core Web API.
 * Configurable via BACKEND_API_URL or NEXT_PUBLIC_BACKEND_API_URL.
 * Defaults to local development port http://localhost:5279.
 */
export function getBackendApiUrl(): string {
	const url =
		process.env.BACKEND_API_URL ||
		process.env.NEXT_PUBLIC_BACKEND_API_URL ||
		"http://localhost:5279";
	return url.replace(/\/$/, "");
}

/**
 * Fetches all products from the backend API.
 * Throws an explicit error if the backend cannot be reached.
 * Strictly NO fallback to mock data.
 */
export async function fetchBackendProducts(category?: string): Promise<Product[]> {
	const baseUrl = getBackendApiUrl();
	const query =
		category && category !== "All"
			? `?category=${encodeURIComponent(category)}`
			: "";
	const endpoint = `${baseUrl}/api/products${query}`;

	try {
		const res = await fetch(endpoint, {
			cache: "no-store",
		});

		if (!res.ok) {
			const errBody = (await res.json().catch(() => ({}))) as { error?: string };
			throw new Error(
				errBody.error ||
					`Backend returned error ${res.status}: Failed to fetch products`
			);
		}

		const data = (await res.json()) as Product[];
		return data;
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Network error contacting backend";
		console.error(`[backend.ts] Error fetching products from ${endpoint}:`, message);
		throw new Error(
			`Backend service unavailable: ${message}. Unable to fetch formulations.`
		);
	}
}

/**
 * Fetches a single product by ID or Slug from the backend API.
 * Strictly NO fallback to mock data.
 */
export async function fetchBackendProduct(idOrSlug: string): Promise<Product | null> {
	const baseUrl = getBackendApiUrl();
	const endpoint = `${baseUrl}/api/products/${encodeURIComponent(idOrSlug)}`;

	try {
		const res = await fetch(endpoint, {
			cache: "no-store",
		});

		if (res.status === 404) {
			return null;
		}

		if (!res.ok) {
			const errBody = (await res.json().catch(() => ({}))) as { error?: string };
			throw new Error(
				errBody.error ||
					`Backend returned error ${res.status}: Failed to fetch product '${idOrSlug}'`
			);
		}

		return (await res.json()) as Product;
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Network error contacting backend";
		console.error(`[backend.ts] Error fetching product from ${endpoint}:`, message);
		throw new Error(
			`Backend service unavailable: ${message}. Unable to fetch product.`
		);
	}
}

/**
 * Fetches all orders from the backend API.
 * Strictly NO fallback to mock data.
 */
export async function fetchBackendOrders(status?: string): Promise<Order[]> {
	const baseUrl = getBackendApiUrl();
	const query = status ? `?status=${encodeURIComponent(status)}` : "";
	const endpoint = `${baseUrl}/api/orders${query}`;

	try {
		const res = await fetch(endpoint, {
			cache: "no-store",
		});

		if (!res.ok) {
			const errBody = (await res.json().catch(() => ({}))) as { error?: string };
			throw new Error(
				errBody.error ||
					`Backend returned error ${res.status}: Failed to fetch orders`
			);
		}

		return (await res.json()) as Order[];
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Network error contacting backend";
		console.error(`[backend.ts] Error fetching orders from ${endpoint}:`, message);
		throw new Error(
			`Backend service unavailable: ${message}. Unable to fetch orders.`
		);
	}
}

/**
 * Fetches a single order by ID from the backend API.
 * Strictly NO fallback to mock data.
 */
export async function fetchBackendOrder(id: string): Promise<Order | null> {
	const baseUrl = getBackendApiUrl();
	const endpoint = `${baseUrl}/api/orders/${encodeURIComponent(id)}`;

	try {
		const res = await fetch(endpoint, {
			cache: "no-store",
		});

		if (res.status === 404) {
			return null;
		}

		if (!res.ok) {
			const errBody = (await res.json().catch(() => ({}))) as { error?: string };
			throw new Error(
				errBody.error ||
					`Backend returned error ${res.status}: Failed to fetch order '${id}'`
			);
		}

		return (await res.json()) as Order;
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Network error contacting backend";
		console.error(`[backend.ts] Error fetching order from ${endpoint}:`, message);
		throw new Error(
			`Backend service unavailable: ${message}. Unable to fetch order.`
		);
	}
}
