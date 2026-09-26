import { test, expect } from "@playwright/test";

test.describe("Milestone M3: Storefront, Catalog & Cart Experience", () => {
	test("Homepage renders 60/40 hero, 4 NAFDAC trust pillars, featured grid, and routine callout", async ({
		page,
	}) => {
		await page.goto("/");

		// 1. Verify Page Title & Hero Headline
		await expect(page).toHaveTitle(/Juliana/i);
		const heroHeading = page.locator("h1").first();
		await expect(heroHeading).toBeVisible();
		await expect(heroHeading).toContainText("Awaken Radiant Skin with Pure African Botanicals");

		// 2. Verify CTA buttons
		const shopBestsellersBtn = page.locator('a[href*="/products"]:has-text("Shop Bestsellers")').first();
		await expect(shopBestsellersBtn).toBeVisible();
		const exploreBtn = page.locator('a[href*="/products"]:has-text("Explore Formulations")').first();
		await expect(exploreBtn).toBeVisible();

		// 3. Verify 4 NAFDAC Trust Pillars
		const trustSection = page.locator("section").filter({
			hasText: /The Juliana's Standards of Clean Botanical Care/i,
		});
		await expect(trustSection).toBeVisible();
		await expect(page.locator("text=/NAFDAC Certified Clean/i").first()).toBeVisible();
		await expect(page.locator("text=/Melanin-Rich Formulations/i").first()).toBeVisible();
		await expect(page.locator("text=/African Native Botanicals/i").first()).toBeVisible();
		await expect(page.locator("text=/100% Clean Bio-Actives/i").first()).toBeVisible();

		// 4. Verify Featured Botanical Grid
		const featuredSection = page.locator("section").filter({
			hasText: /Featured Clean Formulations/i,
		});
		await expect(featuredSection).toBeVisible();
		const featuredCards = featuredSection.locator('[data-testid="product-card"]');
		const cardCount = await featuredCards.count();
		expect(cardCount).toBeGreaterThanOrEqual(2);

		// 5. Verify Routine Consultation Section
		const routineSection = page.locator("text=/Tailored Botanical Rituals for Your Skin Barrier/i").first();
		await expect(routineSection).toBeVisible();
	});

	test("PLP enables category filtering and sorting across formulations", async ({ page }) => {
		await page.goto("/products");

		// 1. Verify PLP Header
		await expect(page.locator("h1:has-text('The Formulations Archive')")).toBeVisible();

		// 2. Test Category Filtering
		const allCards = page.locator('[data-testid="product-card"]');
		const totalInitialCount = await allCards.count();
		expect(totalInitialCount).toBeGreaterThan(0);

		// Click "Serums" pill
		const serumsPill = page.locator('button:has-text("Serums")').first();
		await serumsPill.click();
		await page.waitForTimeout(300);

		// All visible cards should be Serums
		const serumCards = page.locator('[data-testid="product-card"]');
		const serumCount = await serumCards.count();
		expect(serumCount).toBeGreaterThan(0);
		for (let i = 0; i < serumCount; i++) {
			await expect(serumCards.nth(i)).toContainText(/Serum|Glaze/i);
		}

		// Click "Suncare" pill
		const suncarePill = page.locator('button:has-text("Suncare")').first();
		await suncarePill.click();
		await page.waitForTimeout(300);
		const suncareCards = page.locator('[data-testid="product-card"]');
		const suncareCount = await suncareCards.count();
		expect(suncareCount).toBeGreaterThan(0);
		for (let i = 0; i < suncareCount; i++) {
			await expect(suncareCards.nth(i)).toContainText(/Sun|SPF|Shield/i);
		}

		// Reset to "All"
		const allPill = page.locator('button:has-text("All")').first();
		await allPill.click();
		await page.waitForTimeout(300);
		const resetCount = await page.locator('[data-testid="product-card"]').count();
		expect(resetCount).toBe(totalInitialCount);

		// 3. Test Sorting Dropdown
		const sortSelect = page.locator("select#sort-select");
		await expect(sortSelect).toBeVisible();
		await sortSelect.selectOption("Price: Low to High");
		await page.waitForTimeout(300);
		const sortedCards = page.locator('[data-testid="product-card"]');
		await expect(sortedCards.first()).toBeVisible();
	});

	test("PDP displays visual zoom, formulation specs grid, and 4 Radix UI Accordions", async ({ page }) => {
		await page.goto("/products/luminous-peptide-glaze-serum");

		// 1. Verify Product Title and Price in ₦
		await expect(page.locator("h1:has-text('Luminous Peptide Glaze Serum')")).toBeVisible();
		await expect(page.locator("text=/₦38,500/").first()).toBeVisible();

		// 2. Verify Clinical Formulation Specifications Grid
		await expect(page.locator("text=/pH Level/i").first()).toBeVisible();
		await expect(page.locator("text=/5.2 - 5.5/").first()).toBeVisible();
		await expect(page.locator("text=/Texture/i").first()).toBeVisible();
		await expect(page.locator("text=/Skin Type/i").first()).toBeVisible();
		await expect(page.locator("text=/Bio-Actives/i").first()).toBeVisible();

		// 3. Verify 4 Radix UI Accordions
		const bioActivesTrigger = page.locator('button:has-text("Bio-Actives & Clinical Chemistry")');
		await expect(bioActivesTrigger).toBeVisible();

		const inciTrigger = page.locator('button:has-text("Full INCI Transparency")');
		await expect(inciTrigger).toBeVisible();

		const ritualTrigger = page.locator('button:has-text("Daily Ritual & Application Guide")');
		await expect(ritualTrigger).toBeVisible();

		const nafdacTrigger = page.locator('button:has-text("NAFDAC Registration & Safety Certification")');
		await expect(nafdacTrigger).toBeVisible();

		// Click Bio-Actives accordion and assert expansion
		await bioActivesTrigger.click();
		const expandedBioActives = page.locator('[data-state="open"][role="region"]').first();
		await expect(expandedBioActives).toBeVisible();
		await expect(expandedBioActives).toContainText(/Multi-Peptide/i);

		// 4. Test Quantity Selector & Add to Bag
		const quantityDisplay = page.locator("span:has-text('1')").first();
		await expect(quantityDisplay).toBeVisible();

		// Click Add to Bag
		const addBtn = page.locator('button:has-text("Add to Bag")').first();
		await addBtn.click();

		// Assert Cart Drawer opens with product added
		const cartDrawer = page.locator('[data-testid="cart-drawer"]');
		await expect(cartDrawer).toBeVisible();
		await expect(cartDrawer).toContainText("Luminous Peptide Glaze Serum");
		await expect(cartDrawer).toContainText("₦38,500");
	});

	test("CartDrawer supports empty state, item removal, and checkout navigation", async ({ page }) => {
		await page.goto("/products");

		// 1. Open empty cart via header trigger
		const cartTrigger = page.locator('[data-testid="cart-trigger"]');
		await cartTrigger.click();

		const cartDrawer = page.locator('[data-testid="cart-drawer"]');
		await expect(cartDrawer).toBeVisible();

		// Assert empty state
		const emptyText = cartDrawer.locator("text=/Your bag is empty/i").first();
		await expect(emptyText).toBeVisible();

		// Close drawer via close button
		const closeBtn = cartDrawer.locator('button[aria-label*="Close" i]').first();
		await closeBtn.click();
		await expect(cartDrawer).not.toBeVisible();

		// 2. Add product to cart
		const addBtn = page.locator('[data-testid="product-card"] button:has-text("Add to Bag")').first();
		await addBtn.click();
		await expect(cartDrawer).toBeVisible();

		// 3. Verify subtotal formatted in ₦
		const subtotalLabel = cartDrawer.locator("text=/Items Subtotal/i").first();
		await expect(subtotalLabel).toBeVisible();

		// 4. Verify checkout button exists with data-testid="checkout-button" and links to /checkout
		const checkoutBtn = cartDrawer.locator('[data-testid="checkout-button"]');
		await expect(checkoutBtn).toBeVisible();
		await expect(checkoutBtn).toHaveAttribute("href", "/checkout");
	});
});
