import { test, expect } from "@playwright/test";
import path from "node:path";
import { promises as fs } from "node:fs";
import { formatNaira, sanitizePhoneNumber, buildWhatsAppUrl, cn } from "@/src/lib/utils";
import { readJsonFile, writeJsonFile } from "@/src/lib/storage";
import type { CustomerInfo, CartItem, Product } from "@/src/types/store";

test.describe("M2 Domain Foundation & Storage Unit Tests", () => {
	test("formatNaira correctly formats currency with ₦ symbol and thousands separators", () => {
		expect(formatNaira(0)).toBe("₦0");
		expect(formatNaira(38500)).toBe("₦38,500");
		expect(formatNaira(28000)).toBe("₦28,000");
		expect(formatNaira(1250000)).toBe("₦1,250,000");
		// Edge cases: NaN, negative, decimals
		expect(formatNaira(NaN)).toBe("₦0");
		expect(formatNaira(35000.75)).toBe("₦35,001");
	});

	test("sanitizePhoneNumber normalizes Nigerian numbers to 234 prefix", () => {
		expect(sanitizePhoneNumber("08023456789")).toBe("2348023456789");
		expect(sanitizePhoneNumber("+2348023456789")).toBe("2348023456789");
		expect(sanitizePhoneNumber("2348023456789")).toBe("2348023456789");
		expect(sanitizePhoneNumber("+234 802-345-6789")).toBe("2348023456789");
	});

	test("buildWhatsAppUrl generates valid concierge URL containing customer, items, and delivery fee notice", () => {
		const customer: CustomerInfo = {
			fullName: "Adaobi Okonkwo",
			phone: "08023456789",
			state: "Lagos",
			cityLga: "Ikeja",
			address: "14 Adekunle Fajuyi Way",
			courierNotes: "Deliver to front gate security",
		};

		const dummyProduct: Product = {
			id: "luminous-peptide-glaze-serum",
			name: "Luminous Peptide Glaze Serum",
			tagline: "Cellular Radiance",
			price: 38500,
			category: "Serums",
			stockStatus: "In Stock",
			images: ["https://example.com/serum.jpg"],
			description: "Test description",
			size: "30 ml",
			formulation: {
				phLevel: "5.5",
				texture: "Silky glaze",
				skinType: "All",
				keyActives: ["Peptides"],
			},
			accordions: {
				bioActives: "Peptides",
				inci: "Aqua",
				ritual: "Apply AM/PM",
				nafdac: "NAFDAC Reg. No. 04-9218",
			},
		};

		const cartItems: CartItem[] = [
			{
				product: dummyProduct,
				quantity: 2,
			},
		];

		const subtotal = 77000;
		const url = buildWhatsAppUrl("08030000000", customer, cartItems, subtotal, "JC-2026-001");

		expect(url).toContain("https://wa.me/2348030000000?text=");

		const decoded = decodeURIComponent(url);
		expect(decoded).toContain("Adaobi Okonkwo");
		expect(decoded).toContain("08023456789");
		expect(decoded).toContain("Lagos");
		expect(decoded).toContain("Ikeja");
		expect(decoded).toContain("14 Adekunle Fajuyi Way");
		expect(decoded).toContain("Deliver to front gate security");
		expect(decoded).toContain("Luminous Peptide Glaze Serum (30 ml) x 2 - ₦77,000");
		expect(decoded).toContain("Items Subtotal: ₦77,000");
		expect(decoded).toContain("Delivery Fee: *To be calculated & agreed via WhatsApp*");
		expect(decoded).toContain("JC-2026-001");
	});

	test("cn utility merges Tailwind class names and eliminates conflicts", () => {
		const result = cn("p-4", "p-2", "text-primary", { "font-bold": true, "hidden": false });
		expect(result).toBe("p-2 text-primary font-bold");
	});

	test("storage helpers readJsonFile and writeJsonFile perform atomic file operations", async () => {
		const testFile = path.resolve(process.cwd(), "tests", "fixtures", `test-${Date.now()}.json`);
		const sampleData = { store: "Juliana's Cosmetics", active: true, count: 42 };

		// Fallback test
		const fallback = await readJsonFile("/non-existent-path.json", { default: true });
		expect(fallback).toEqual({ default: true });

		// Atomic write test
		await writeJsonFile(testFile, sampleData);

		// Read back test
		const readData = await readJsonFile<typeof sampleData>(testFile, { store: "", active: false, count: 0 });
		expect(readData).toEqual(sampleData);

		// Cleanup
		await fs.unlink(testFile).catch(() => {
			/* ignore cleanup */
		});
	});

	test("products.json catalog conforms to luxury botanical specifications and includes all 6 required products", async () => {
		const productsPath = path.resolve(process.cwd(), "src", "data", "products.json");
		const raw = await fs.readFile(productsPath, "utf-8");
		const products: Product[] = JSON.parse(raw);

		expect(Array.isArray(products)).toBe(true);
		expect(products.length).toBeGreaterThanOrEqual(6);

		const requiredNames = [
			"Luminous Peptide Glaze Serum",
			"Kalahari Melon Sun Shield SPF 50",
			"Baobab Gentle Purifying Cleanser",
			"Botanical Hydration Crème",
			"Marula Barrier Repair Oil",
			"Hibiscus AHA Glow Tonic",
		];

		for (const name of requiredNames) {
			const found = products.find((p) => p.name === name);
			expect(found, `Expected product "${name}" to exist in catalog`).toBeDefined();
			if (!found) continue;

			expect(found.price).toBeGreaterThan(0);
			expect(found.stockStatus).toBe("In Stock");
			expect(found.images.length).toBeGreaterThanOrEqual(1);
			expect(found.formulation.phLevel).toBeTruthy();
			expect(found.formulation.texture).toBeTruthy();
			expect(found.formulation.skinType).toBeTruthy();
			expect(found.formulation.keyActives.length).toBeGreaterThanOrEqual(2);
			expect(found.accordions.bioActives).toBeTruthy();
			expect(found.accordions.inci).toBeTruthy();
			expect(found.accordions.ritual).toBeTruthy();
			expect(found.accordions.nafdac).toContain("NAFDAC");
		}
	});

	test("orders.json is initialized as empty array", async () => {
		const ordersPath = path.resolve(process.cwd(), "src", "data", "orders.json");
		const raw = await fs.readFile(ordersPath, "utf-8");
		const orders: unknown = JSON.parse(raw);

		expect(Array.isArray(orders)).toBe(true);
		expect((orders as unknown[]).length).toBe(0);
	});
});
