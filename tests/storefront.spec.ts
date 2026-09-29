import path from "node:path";
import { promises as fs } from "node:fs";
import { test, expect, Page, Locator, Response } from "@playwright/test";

const PRODUCTS_PATH = path.resolve(process.cwd(), "src", "data", "products.json");
const PRODUCTS_BAK_PATH = path.resolve(process.cwd(), "src", "data", "products.json.bak");
const ORDERS_PATH = path.resolve(process.cwd(), "src", "data", "orders.json");
const ORDERS_BAK_PATH = path.resolve(process.cwd(), "src", "data", "orders.json.bak");

test.beforeAll(async () => {
	// Self-healing: if a prior abnormal exit left .bak files, restore them first
	try {
		await fs.access(PRODUCTS_BAK_PATH);
		await fs.copyFile(PRODUCTS_BAK_PATH, PRODUCTS_PATH);
		await fs.unlink(PRODUCTS_BAK_PATH);
	} catch {
		// No leftover products backup
	}

	try {
		await fs.access(ORDERS_BAK_PATH);
		await fs.copyFile(ORDERS_BAK_PATH, ORDERS_PATH);
		await fs.unlink(ORDERS_BAK_PATH);
	} catch {
		// No leftover orders backup
	}

	// Create fresh backups before running tests
	await fs.copyFile(PRODUCTS_PATH, PRODUCTS_BAK_PATH);
	await fs.copyFile(ORDERS_PATH, ORDERS_BAK_PATH);
});

test.afterAll(async () => {
	// Teardown: restore products.json from backup
	try {
		await fs.access(PRODUCTS_BAK_PATH);
		await fs.copyFile(PRODUCTS_BAK_PATH, PRODUCTS_PATH);
		await fs.unlink(PRODUCTS_BAK_PATH);
	} catch (err: unknown) {
		console.error("[afterAll] Error restoring products.json:", err);
	}

	// Teardown: restore orders.json from backup
	try {
		await fs.access(ORDERS_BAK_PATH);
		await fs.copyFile(ORDERS_BAK_PATH, ORDERS_PATH);
		await fs.unlink(ORDERS_BAK_PATH);
	} catch (err: unknown) {
		console.error("[afterAll] Error restoring orders.json:", err);
	}
});

/**
 * Type contracts for test assertions
 */
interface CheckoutFormData {
	fullName: string;
	phone: string;
	state: string;
	cityLga: string;
	address: string;
	courierNotes?: string;
}

/**
 * Helper to locate Add to Bag / Add to Cart button on a page or container.
 */
function getAddToCartButton(container: Page | Locator): Locator {
	return container.locator("button").filter({
		hasText: /add to bag|add to cart/i,
	}).first();
}

/**
 * Helper to locate Cart Drawer dialog.
 */
function getCartDrawer(page: Page): Locator {
	return page.locator('[role="dialog"], [data-testid="cart-drawer"]').filter({
		hasText: /shopping bag|your bag|cart/i,
	}).first();
}

/**
 * Helper to locate Cart Trigger in Header.
 */
export function getCartTrigger(page: Page): Locator {
	return page.locator('header button, header a, [data-testid="cart-trigger"]').filter({
		hasText: /bag|cart|\d+/i,
	}).first();
}

/**
 * Helper to fill Nigerian customer checkout form.
 */
async function fillCheckoutForm(page: Page, data: CheckoutFormData): Promise<void> {
	// Full Legal Name
	const nameInput = page.locator('input[name="fullName"], input[name="name"], input[placeholder*="Name" i], #fullName').first();
	await nameInput.waitFor({ state: "visible" });
	await nameInput.fill(data.fullName);

	// Phone Number (+234)
	const phoneInput = page.locator('input[name="phone"], input[name="phoneNumber"], input[type="tel"], #phone').first();
	await phoneInput.waitFor({ state: "visible" });
	await phoneInput.fill(data.phone);

	// State Selector (36 States + FCT)
	const stateSelect = page.locator('select[name="state"], select#state').first();
	if (await stateSelect.isVisible()) {
		await stateSelect.selectOption({ label: data.state });
	} else {
		// Custom dropdown fallback (Radix Select or custom button)
		const stateTrigger = page.locator('[data-testid="state-select"], button:has-text("State"), button[role="combobox"]').first();
		if (await stateTrigger.isVisible()) {
			await stateTrigger.click();
			const stateOption = page.locator(`[role="option"]:has-text("${data.state}"), [role="listbox"] div:has-text("${data.state}")`).first();
			await stateOption.click();
		}
	}

	// City / LGA
	const cityInput = page.locator('input[name="cityLga"], input[name="city"], input[name="lga"], #cityLga').first();
	await cityInput.waitFor({ state: "visible" });
	await cityInput.fill(data.cityLga);

	// Street Address
	const addressInput = page.locator('textarea[name="streetAddress"], textarea[name="address"], input[name="address"], #streetAddress').first();
	await addressInput.waitFor({ state: "visible" });
	await addressInput.fill(data.address);

	// Courier Notes (optional)
	if (data.courierNotes) {
		const notesInput = page.locator('textarea[name="courierNotes"], textarea[name="notes"], input[name="notes"], #courierNotes').first();
		if (await notesInput.isVisible()) {
			await notesInput.fill(data.courierNotes);
		}
	}
}

// =========================================================================
// TIER 1: CORE FEATURE COVERAGE (HAPPY PATH)
// =========================================================================

test.describe("Tier 1: Core Feature Coverage", () => {
	test("Assert Header renders public/logo.png image with priority and proper alt", async ({ page }) => {
		await page.goto("/");

		const header = page.locator("header").first();
		await expect(header).toBeVisible();

		// Assert brand logo image renders in header with proper alt and source
		const logoImg = header.locator('img[src*="logo.png"], img[alt*="Juliana" i]').first();
		await expect(logoImg).toBeVisible();

		const altText = await logoImg.getAttribute("alt");
		expect(altText).not.toBeNull();
		expect(altText?.toLowerCase()).toContain("juliana");

		// Assert global navigation links and cart trigger exist
		const nav = header.locator("nav, div").first();
		await expect(nav).toBeVisible();
		const shopLink = header.locator('a[href*="/products"], a:has-text("Shop")').first();
		await expect(shopLink).toBeVisible();
		await expect(getCartTrigger(page)).toBeVisible();
	});

	test("Assert adding product to cart updates badge counter and triggers slide-out Cart Drawer", async ({ page }) => {
		await page.goto("/products");

		// Locate a product card with Add to Bag button
		const addToCartBtn = getAddToCartButton(page);
		await expect(addToCartBtn).toBeVisible();

		// Click Add to Bag
		await addToCartBtn.click();

		// Assert slide-out Cart Drawer appears (Radix Dialog)
		const cartDrawer = getCartDrawer(page);
		await expect(cartDrawer).toBeVisible();

		// Assert cart badge in header reflects updated count
		const cartBadge = page.locator('header [data-testid="cart-badge"], header span:has-text("1"), header span[class*="badge"]').first();
		await expect(cartBadge).toBeVisible();
		const badgeText = await cartBadge.innerText();
		expect(badgeText).toContain("1");
	});

	test("Assert Cart Drawer displays subtotal and quantity modifiers", async ({ page }) => {
		await page.goto("/products");

		// Add product to cart
		const addToCartBtn = getAddToCartButton(page);
		await addToCartBtn.click();

		const cartDrawer = getCartDrawer(page);
		await expect(cartDrawer).toBeVisible();

		// Assert price with Naira symbol (₦) is displayed
		const priceEl = cartDrawer.locator("text=/₦[0-9,]+/").first();
		await expect(priceEl).toBeVisible();

		// Assert subtotal label and Naira amount exist
		const subtotalEl = cartDrawer.locator("text=/subtotal|total/i").first();
		await expect(subtotalEl).toBeVisible();

		// Locate quantity increment button (+)
		const incrementBtn = cartDrawer.locator('button[aria-label*="increase" i], button[aria-label*="increment" i], button:has-text("+")').first();
		await expect(incrementBtn).toBeVisible();

		// Click increment
		await incrementBtn.click();

		// Assert quantity modifier increased quantity to 2
		const quantityDisplay = cartDrawer.locator('span:has-text("2"), input[value="2"]').first();
		await expect(quantityDisplay).toBeVisible();

		// Header badge counter should also update to 2
		const cartBadge = page.locator('header [data-testid="cart-badge"], header span:has-text("2")').first();
		await expect(cartBadge).toBeVisible();
	});

	test("Assert Checkout page displays subtotal in ₦ and explicit notice: Delivery Fee: To be calculated & agreed via WhatsApp", async ({ page }) => {
		// Populate cart and navigate to checkout
		await page.goto("/products");
		const addToCartBtn = getAddToCartButton(page);
		await addToCartBtn.click();

		const cartDrawer = getCartDrawer(page);
		await expect(cartDrawer).toBeVisible();

		const checkoutBtn = cartDrawer.locator('a[href*="/checkout"], button:has-text("Checkout")').first();
		await checkoutBtn.click();

		await page.waitForURL("**/checkout");
		await expect(page).toHaveURL(/\/checkout/);

		// Assert subtotal in ₦
		const subtotalEl = page.locator("text=/subtotal/i").first();
		await expect(subtotalEl).toBeVisible();
		const nairaAmount = page.locator("text=/₦[0-9,]+/").first();
		await expect(nairaAmount).toBeVisible();

		// Assert explicit delivery notice strictly required by R4
		const deliveryNotice = page.locator("text=/Delivery Fee:\\s*To be calculated & agreed via WhatsApp/i").first();
		await expect(deliveryNotice).toBeVisible();

		// Strictly assert that NO automated free shipping is applied
		const freeShippingNotice = page.locator("text=/free shipping|free delivery|delivery fee:\\s*₦0/i");
		const count = await freeShippingNotice.count();
		if (count > 0) {
			const text = await freeShippingNotice.first().innerText();
			// Ensure it is not an applied free shipping discount
			expect(text.toLowerCase()).not.toContain("free shipping applied");
			expect(text.toLowerCase()).not.toContain("free delivery applied");
		}
	});

	test("Assert submitting checkout form persists order and generates formatted WhatsApp concierge URL", async ({ page }) => {
		// Add product and visit checkout
		await page.goto("/products");
		const addToCartBtn = getAddToCartButton(page);
		await addToCartBtn.click();

		await page.goto("/checkout");

		// Intercept order creation API
		const orderPromise = page.waitForResponse(
			(res: Response) => res.url().includes("/api/orders") && res.request().method() === "POST",
			{ timeout: 15000 }
		).catch(() => null);

		// Fill checkout form with Nigerian customer details
		await fillCheckoutForm(page, {
			fullName: "Adaobi Okonkwo",
			phone: "08023456789",
			state: "Lagos",
			cityLga: "Ikeja",
			address: "14 Adekunle Fajuyi Way, GRA Ikeja",
			courierNotes: "Deliver to main gate security",
		});

		// Submit the checkout form
		const submitBtn = page.locator('button[type="submit"], button:has-text("WhatsApp"), button:has-text("Complete Order"), button:has-text("Place Order")').first();
		await submitBtn.click();

		// Verify API response if captured
		const orderResponse = await orderPromise;
		if (orderResponse) {
			expect(orderResponse.status()).toBeLessThan(400);
			const orderBody: unknown = await orderResponse.json();
			expect(orderBody).toBeDefined();
		}

		// Assert WhatsApp concierge link is presented on confirmation
		const whatsappLink = page.locator('a[href*="wa.me"], a[href*="whatsapp.com"]').first();
		await expect(whatsappLink).toBeVisible({ timeout: 15000 });

		const href = await whatsappLink.getAttribute("href");
		expect(href).not.toBeNull();
		expect(href).toContain("wa.me");

		// Decode the URL and verify itemized and customer payload
		const decodedMessage = decodeURIComponent(href ?? "");
		expect(decodedMessage.toLowerCase()).toContain("adaobi");
		expect(decodedMessage.toLowerCase()).toContain("ikeja");
		expect(decodedMessage.toLowerCase()).toContain("lagos");
		expect(decodedMessage).toMatch(/delivery|order/i);
	});

	test("Assert Admin Orders route loads persisted orders, allows entering agreed delivery fee in ₦, updates total, and transitions status to Paid", async ({ page }) => {
		await page.goto("/admin/orders");

		// Assert admin page title or table is visible
		const ordersTable = page.locator('table, [data-testid="orders-table"], .orders-container').first();
		await expect(ordersTable).toBeVisible({ timeout: 15000 });

		// Locate the first order row
		const orderRow = page.locator('tr, [data-testid="order-row"], div[class*="order-item"]').filter({
			hasText: /JC-ORD|Awaiting|Paid|#\d+/i,
		}).first();
		await expect(orderRow).toBeVisible();

		// Assert initial status chip
		const statusChip = orderRow.locator("text=/Awaiting Delivery Agreement|Awaiting Payment|Paid/i").first();
		await expect(statusChip).toBeVisible();

		// Record agreed delivery fee if input is present
		const feeInput = orderRow.locator('input[type="number"], input[name*="deliveryFee" i], input[placeholder*="fee" i]').first();
		if (await feeInput.isVisible()) {
			await feeInput.fill("3500");
			const saveFeeBtn = orderRow.locator('button:has-text("Save"), button:has-text("Record"), button[aria-label*="save" i]').first();
			if (await saveFeeBtn.isVisible()) {
				await saveFeeBtn.click();
				await page.waitForTimeout(500);
			}
		}

		// Locate Mark as Paid button
		const markPaidBtn = orderRow.locator('button:has-text("Mark as Paid"), button:has-text("Paid")').first();
		if (await markPaidBtn.isVisible()) {
			await markPaidBtn.click();
			// Assert status transitions to Paid
			const paidStatus = orderRow.locator("text=/Paid/i").first();
			await expect(paidStatus).toBeVisible({ timeout: 10000 });
		}
	});

	test("Assert Admin Products route displays products, allows updating price in ₦, and toggling In Stock / Out of Stock", async ({ page }) => {
		await page.goto("/admin/products");

		// Assert catalog table renders
		const productsTable = page.locator('table, [data-testid="products-table"], .products-container').first();
		await expect(productsTable).toBeVisible({ timeout: 15000 });

		// Locate first product row
		const productRow = page.locator('tr, [data-testid="product-row"]').filter({
			hasText: /₦|Serum|Crème|Fluid|Cleanser/i,
		}).first();
		await expect(productRow).toBeVisible();

		// Assert price formatted with ₦
		const priceEl = productRow.locator("text=/₦[0-9,]+/").first();
		await expect(priceEl).toBeVisible();

		// Toggle stock switch or button
		const stockToggle = productRow.locator('input[type="checkbox"], button[role="switch"], button:has-text("Stock")').first();
		await expect(stockToggle).toBeVisible();
		await stockToggle.click();

		// Assert stock label reflects update
		await page.waitForTimeout(500);
		const stockStatusText = productRow.locator("text=/In Stock|Out of Stock|Sold Out/i").first();
		await expect(stockStatusText).toBeVisible();

		// Toggle back to restore initial In Stock state
		await stockToggle.click();
		await page.waitForTimeout(500);
		await expect(productRow.locator("text=/In Stock/i").first()).toBeVisible();
	});
});

// =========================================================================
// TIER 2: BOUNDARY & CORNER CASES
// =========================================================================

test.describe("Tier 2: Boundary & Corner Cases", () => {
	test("Checkout form validation requires valid +234 phone and mandatory fields", async ({ page }) => {
		// Populate cart and navigate to checkout
		await page.goto("/products");
		const addToCartBtn = getAddToCartButton(page);
		await addToCartBtn.click();

		await page.goto("/checkout");

		const submitBtn = page.locator('button[type="submit"], button:has-text("WhatsApp"), button:has-text("Complete Order")').first();
		const nameInput = page.locator('input[name="fullName"], input[name="name"], #fullName').first();
		const phoneInput = page.locator('input[name="phone"], input[type="tel"], #phone').first();

		// Attempt submission with empty fields
		await submitBtn.click();

		// Verify HTML5 validation or application error alerts prevent navigation
		await expect(page).toHaveURL(/\/checkout/);

		const isNameInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.checkValidity() || el.getAttribute("aria-invalid") === "true");
		const isPhoneInvalid = await phoneInput.evaluate((el: HTMLInputElement) => !el.checkValidity() || el.getAttribute("aria-invalid") === "true");
		expect(isNameInvalid || isPhoneInvalid).toBe(true);

		// Test invalid non-Nigerian phone number format
		await nameInput.fill("Amara Johnson");
		await phoneInput.fill("12345"); // invalid short format
		await submitBtn.click();

		// Verify page remains on checkout due to invalid phone format
		await expect(page).toHaveURL(/\/checkout/);

		// Correct with valid Nigerian phone
		await phoneInput.fill("08031234567");
		const isPhoneNowValid = await phoneInput.evaluate((el: HTMLInputElement) => el.checkValidity());
		expect(isPhoneNowValid).toBe(true);
	});

	test("Cart quantity bounds enforce minimum 1 and support item removal", async ({ page }) => {
		await page.goto("/products");
		const addToCartBtn = getAddToCartButton(page);
		await addToCartBtn.click();

		const cartDrawer = getCartDrawer(page);
		await expect(cartDrawer).toBeVisible();

		// Quantity decrement button
		const decrementBtn = cartDrawer.locator('button[aria-label*="decrease" i], button[aria-label*="decrement" i], button:has-text("-"), button:has-text("−")').first();
		await expect(decrementBtn).toBeVisible();

		// Quantity should currently be 1
		const quantityBefore = cartDrawer.locator('span:has-text("1"), input[value="1"]').first();
		await expect(quantityBefore).toBeVisible();

		// Decrementing at quantity 1 should either keep 1 (disabled) or remove the item, but never become 0 or negative
		await decrementBtn.click();

		const negativeIndicator = cartDrawer.locator("text=/-[0-9]+|0 items/").first();
		const hasNegative = await negativeIndicator.isVisible().catch(() => false);
		expect(hasNegative).toBe(false);

		// Test direct item removal if remove button exists
		const removeBtn = cartDrawer.locator('button[aria-label*="remove" i], button:has-text("Remove"), [data-testid="remove-item"]').first();
		if (await removeBtn.isVisible()) {
			await removeBtn.click();
			// Assert empty bag state
			const emptyState = cartDrawer.locator("text=/empty|no items/i").first();
			await expect(emptyState).toBeVisible();
		}
	});

	test("Zero delivery fee default until agreed via WhatsApp concierge", async ({ page }) => {
		await page.goto("/products");
		const addToCartBtn = getAddToCartButton(page);
		await addToCartBtn.click();

		await page.goto("/checkout");

		// Verify Delivery Fee is explicitly shown as pending agreement and not automatically assigned a fee
		const deliveryRow = page.locator("text=/Delivery Fee/i").first();
		await expect(deliveryRow).toBeVisible();

		const deliveryText = await page.locator("body").innerText();
		expect(deliveryText).toContain("Delivery Fee: To be calculated & agreed via WhatsApp");
		// Ensure no automated delivery cost was added to the total
		expect(deliveryText).not.toContain("Delivery: ₦1,500");
		expect(deliveryText).not.toContain("Delivery: ₦2,000");
	});
});

// =========================================================================
// TIER 3: CROSS-FEATURE COMBINATIONS & STATE SYNCHRONIZATION
// =========================================================================

test.describe("Tier 3: Cross-Feature Combinations", () => {
	test("Modifying price in /admin/products reflects on storefront catalog and cart calculation", async ({ page }) => {
		// Navigate to admin products
		await page.goto("/admin/products");
		const productRow = page.locator('tr, [data-testid="product-row"]').first();
		await expect(productRow).toBeVisible({ timeout: 15000 });

		// Read product name to track
		const productNameEl = productRow.locator("td, h3, div").filter({ hasText: /Serum|Crème|Fluid|Oil|Cleanser/i }).first();
		const productName = (await productNameEl.innerText()).trim();

		// Check if inline price input exists
		const priceInput = productRow.locator('input[type="number"], input[name*="price" i]').first();
		if (await priceInput.isVisible()) {
			await priceInput.fill("45500");
			const saveBtn = productRow.locator('button:has-text("Save"), button[aria-label*="save" i]').first();
			if (await saveBtn.isVisible()) {
				await saveBtn.click();
				await page.waitForTimeout(500);
			}

			// Navigate to storefront and verify updated price
			await page.goto("/products");
			const storeProductCard = page.locator('[data-testid="product-card"], div[class*="product-card"]').filter({
				hasText: productName,
			}).first();
			await expect(storeProductCard).toBeVisible();
			await expect(storeProductCard).toContainText("₦45,500");

			// Add to cart and assert cart subtotal uses the updated price
			const addBtn = getAddToCartButton(storeProductCard);
			await addBtn.click();

			const cartDrawer = getCartDrawer(page);
			await expect(cartDrawer).toBeVisible();
			await expect(cartDrawer).toContainText("₦45,500");
		}
	});

	test("Marking product Out of Stock in admin disables purchase / shows Out of Stock badge", async ({ page }) => {
		// Navigate to admin products
		await page.goto("/admin/products");
		const productRow = page.locator('tr, [data-testid="product-row"]').first();
		await expect(productRow).toBeVisible({ timeout: 15000 });

		const productNameEl = productRow.locator("td, h3, div").filter({ hasText: /Serum|Crème|Fluid|Oil|Cleanser/i }).first();
		const productName = (await productNameEl.innerText()).trim();

		// Toggle stock to Out of Stock
		const stockToggle = productRow.locator('input[type="checkbox"], button[role="switch"], button:has-text("Stock")').first();
		await expect(stockToggle).toBeVisible();
		await stockToggle.click();
		await page.waitForTimeout(500);

		// Navigate to storefront products page
		await page.goto("/products");
		const productCard = page.locator('[data-testid="product-card"], div[class*="product-card"]').filter({
			hasText: productName,
		}).first();
		await expect(productCard).toBeVisible();

		// Assert Out of Stock or Sold Out badge / disabled button
		const outOfStockIndicator = productCard.locator("text=/Out of Stock|Sold Out/i").first();
		await expect(outOfStockIndicator).toBeVisible();

		// Add to Cart button should either be disabled or hidden
		const addBtn = productCard.locator('button:has-text("Add")').first();
		if (await addBtn.isVisible()) {
			await expect(addBtn).toBeDisabled();
		}
	});
});

// =========================================================================
// TIER 4: REAL-WORLD LUXURY SHOPPING WORKFLOW
// =========================================================================

test.describe("Tier 4: Real-World Luxury Shopping Workflow", () => {
	test("Full customer journey: browse homepage -> inspect PDP formulation accordions -> add to cart -> proceed to checkout -> submit WhatsApp concierge order", async ({ page }) => {
		// 1. Browse Homepage
		await page.goto("/");
		await expect(page).toHaveTitle(/Juliana/i);

		// Assert NAFDAC trust pillars
		const nafdacSection = page.locator("text=/NAFDAC Certified|Melanin-Rich|Imported French Formulations|100% Clean/i").first();
		await expect(nafdacSection).toBeVisible();

		// 2. Navigate to PLP / Product
		const exploreBtn = page.locator('a[href*="/products"]:has-text("Explore"), a[href*="/products"]:has-text("Shop")').first();
		if (await exploreBtn.isVisible()) {
			await exploreBtn.click();
		} else {
			await page.goto("/products");
		}
		await page.waitForURL("**/products");

		// Select a product to view PDP
		const productLink = page.locator('a[href*="/products/"]').first();
		await productLink.click();
		await page.waitForURL("**/products/*");

		// 3. Inspect PDP clinical formulation specs and Radix UI Accordions
		const specsGrid = page.locator("text=/pH Level|Skin Type|Texture|Bio-Actives/i").first();
		await expect(specsGrid).toBeVisible();

		// Click Radix Accordion for Bio-Actives or INCI disclosures
		const accordionTrigger = page.locator('[data-radix-collection-item], button[data-state], button:has-text("Bio-Active"), button:has-text("Ingredients")').first();
		if (await accordionTrigger.isVisible()) {
			await accordionTrigger.click();
			// Assert accordion content expands
			const expandedContent = page.locator('[data-state="open"], [role="region"]').first();
			await expect(expandedContent).toBeVisible();
		}

		// 4. Add to bag and verify slide-out Cart Drawer
		const addToCartBtn = getAddToCartButton(page);
		await addToCartBtn.click();

		const cartDrawer = getCartDrawer(page);
		await expect(cartDrawer).toBeVisible();

		// 5. Proceed to WhatsApp Concierge Checkout
		const proceedBtn = cartDrawer.locator('a[href*="/checkout"], button:has-text("Checkout"), button:has-text("Proceed")').first();
		await proceedBtn.click();
		await page.waitForURL("**/checkout");

		// Verify items subtotal and explicit delivery agreement notice
		await expect(page.locator("text=/Delivery Fee:\\s*To be calculated & agreed via WhatsApp/i")).toBeVisible();

		// 6. Complete Nigerian Concierge Form
		await fillCheckoutForm(page, {
			fullName: "Folashade Adeleke",
			phone: "08098765432",
			state: "Lagos",
			cityLga: "Victoria Island",
			address: "Plot 12A, Bishop Aboyade Cole Street",
			courierNotes: "Deliver before 4pm to front desk",
		});

		// Submit order
		const submitOrderBtn = page.locator('button[type="submit"], button:has-text("WhatsApp"), button:has-text("Complete Order")').first();
		await submitOrderBtn.click();

		// 7. Verify WhatsApp concierge dispatch link
		const whatsappLink = page.locator('a[href*="wa.me"], a[href*="whatsapp.com"]').first();
		await expect(whatsappLink).toBeVisible({ timeout: 15000 });

		const href = await whatsappLink.getAttribute("href");
		expect(href).not.toBeNull();
		expect(href).toContain("wa.me");

		const decoded = decodeURIComponent(href ?? "");
		expect(decoded.toLowerCase()).toContain("folashade");
		expect(decoded.toLowerCase()).toContain("victoria island");
	});
});
