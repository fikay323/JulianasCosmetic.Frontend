import { test, expect } from "@playwright/test";

const LIVE_URL = "https://julianas-cosmetic-frontend.vercel.app";

test.describe("Live Deployed Production Verification (Vercel)", () => {
	test.beforeEach(async ({ page }) => {
		// Ensure authenticated state in localStorage before loading admin pages
		await page.addInitScript(() => {
			window.localStorage.setItem("jc_admin_auth", "authenticated");
		});
	});

	test("1. Admin catalog page loads on live deployment and has Add Formulation link", async ({ page }) => {
		await page.goto(`${LIVE_URL}/admin/products`);

		// Verify catalog table renders
		const productsTable = page.locator('[data-testid="products-table"]');
		await expect(productsTable).toBeVisible({ timeout: 20000 });

		// Verify "+ Add Formulation" link exists and points to /admin/products/new
		const addLink = page.locator('a[href="/admin/products/new"]:has-text("Add Formulation")').first();
		await expect(addLink).toBeVisible();

		// Click to navigate to creation page
		await addLink.click();
		await expect(page).toHaveURL(`${LIVE_URL}/admin/products/new`, { timeout: 15000 });
	});

	test("2. Dedicated creation page (/admin/products/new) renders 5 editorial sections on live deployment", async ({ page }) => {
		await page.goto(`${LIVE_URL}/admin/products/new`);

		// Header check
		await expect(page.locator("h1")).toContainText("Craft Imported Formulation");

		// Section 1: Identity & Classification
		await expect(page.locator("text=/1. Formulation Identity & Classification/i")).toBeVisible();
		// Section 2: Pricing & Stock Availability
		await expect(page.locator("text=/2. Pricing & Stock Availability/i")).toBeVisible();
		// Section 3: Visual Gallery & Cloudinary CDN
		await expect(page.locator("text=/3. Formulation Visual Gallery & Cloudinary CDN/i")).toBeVisible();
		// Section 4: Clinical Specifications
		await expect(page.locator("text=/4. Clinical Specifications/i")).toBeVisible();
		// Section 5: Formulation Transparency & Protocols (Accordions)
		await expect(page.locator("text=/5. Formulation Transparency & Protocols/i")).toBeVisible();

		// Verify Cloudinary folder indicator is displayed
		await expect(page.locator("text=/Cloudinary Folder: julianas-cosmetics\\/products\\//i")).toBeVisible();
	});

	test("3. Multi-image uploader supports local preview, direct upload, and visual reordering on live deployment", async ({ page }) => {
		// Mock direct Cloudinary upload endpoint so we don't consume third-party API quotas during validation
		let uploadCount = 0;
		await page.route("**/api.cloudinary.com/**", async (route) => {
			uploadCount++;
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					secure_url: `https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80&mock=${uploadCount}`,
					public_id: `julianas-cosmetics/products/live-visual-${uploadCount}`,
				}),
			});
		});

		await page.goto(`${LIVE_URL}/admin/products/new`);

		// File input
		const fileInput = page.locator('[data-testid="product-image-file-input"]');
		await expect(fileInput).toBeAttached();

		const minimalPngBuffer = Buffer.from(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
			"base64"
		);

		// Upload two images
		await fileInput.setInputFiles([
			{ name: "live-first.png", mimeType: "image/png", buffer: minimalPngBuffer },
			{ name: "live-second.png", mimeType: "image/png", buffer: minimalPngBuffer },
		]);

		// Pre-upload preview card
		const previewCard = page.locator('[data-testid="image-local-preview-card"]');
		await expect(previewCard).toBeVisible();
		await expect(previewCard).toContainText("Preview before direct Cloudinary upload");
		await expect(previewCard).toContainText("live-first.png");
		await expect(previewCard).toContainText("live-second.png");

		// Click "Confirm & Upload All"
		const confirmBtn = page.locator('[data-testid="confirm-upload-btn"]');
		await expect(confirmBtn).toBeVisible();
		await confirmBtn.click();

		// Uploaded visuals gallery
		const uploadedGallery = page.locator('[data-testid="uploaded-image-card"]');
		await expect(uploadedGallery).toBeVisible({ timeout: 15000 });

		const removeBtns = page.locator('[data-testid="remove-uploaded-image-btn"]');
		await expect(removeBtns).toHaveCount(2);

		// Cover Visual badge is on first visual
		await expect(page.locator("text=/Cover Visual/i").first()).toBeVisible();

		// Click "Move visual right" to reorder
		const moveRightBtn = page.locator('button[title="Move visual right"]').first();
		await expect(moveRightBtn).toBeEnabled();
		await moveRightBtn.click();

		// Visual order swapped: first visual still has Cover Visual badge
		await expect(page.locator("text=/Cover Visual/i").first()).toBeVisible();

		// Delete one visual
		await removeBtns.first().click();
		await expect(page.locator('[data-testid="remove-uploaded-image-btn"]')).toHaveCount(1);
	});

	test("4. Live storefront PDP replica preview toggles and displays clinical specifications on live deployment", async ({ page }) => {
		await page.goto(`${LIVE_URL}/admin/products/new`);

		// Fill in formulation name and retail price
		const nameInput = page.locator('input[placeholder*="Luminous Peptide"]').first();
		await nameInput.fill("Parisian Bio-Retinol Nectar");

		const priceInput = page.locator('input[type="number"]').first();
		await priceInput.fill("56000");

		const activesInput = page.locator('input[placeholder*="Multi-Peptide Matrix"]').first();
		await activesInput.fill("1% Bakuchiol, French Plum Seed Oil, Botanical Peptides");

		// Click "Preview Storefront"
		const previewBtn = page.locator('button:has-text("Preview Storefront")');
		await previewBtn.click();

		// Assert PDP Preview is rendered
		const previewContainer = page.locator('[data-testid="product-pdp-preview"]');
		await expect(previewContainer).toBeVisible();
		await expect(previewContainer).toContainText("Parisian Bio-Retinol Nectar");
		await expect(previewContainer).toContainText("₦56,000");
		await expect(previewContainer).toContainText("1% Bakuchiol");

		// Return to editor
		const returnBtn = page.locator('button:has-text("Return to Editor")');
		await returnBtn.click();
		await expect(previewContainer).not.toBeVisible();
	});

	test("5. LocalStorage autosaves on live deployment, survives page reload, triggers exit confirmation guard modal, and displays admin resume toast", async ({ page }) => {
		await page.goto(`${LIVE_URL}/admin/products/new`);

		// Fill formulation name
		const nameInput = page.locator('input[placeholder*="Luminous Peptide"]').first();
		await nameInput.fill("Live Melanin Barrier Glaze");

		// Wait 400ms for debounce
		await page.waitForTimeout(400);

		// Verify draft is stored in localStorage
		const rawSaved = await page.evaluate(() => localStorage.getItem("jc_admin_product_draft"));
		expect(rawSaved).not.toBeNull();
		expect(rawSaved).toContain("Live Melanin Barrier Glaze");

		// Reload page and verify formulation name remains populated
		await page.reload();
		await expect(page.locator('input[placeholder*="Luminous Peptide"]').first()).toHaveValue("Live Melanin Barrier Glaze");

		// Click "Catalog" breadcrumb to trigger exit confirmation guard
		const catalogBreadcrumb = page.locator('button:has-text("Catalog")');
		await catalogBreadcrumb.click();

		// Exit confirmation modal should appear
		const exitModal = page.locator("text=/Discard Unfinished Draft/i");
		await expect(exitModal).toBeVisible();

		// Click "Stay and Keep Editing"
		const stayBtn = page.locator('button:has-text("Stay and Keep Editing")');
		await stayBtn.click();
		await expect(exitModal).not.toBeVisible();
		await expect(page).toHaveURL(`${LIVE_URL}/admin/products/new`);

		// Navigate to /admin/products to test the admin layout floating resume draft toast
		await page.goto(`${LIVE_URL}/admin/products`);
		const draftToast = page.locator('[data-testid="unfinished-draft-toast"]');
		await expect(draftToast).toBeVisible({ timeout: 15000 });
		await expect(draftToast).toContainText("Live Melanin Barrier Glaze");

		// Click "Resume Formulation" on toast and verify it navigates back to /admin/products/new
		const resumeBtn = page.locator('[data-testid="resume-draft-button"]');
		await resumeBtn.click();
		await expect(page).toHaveURL(`${LIVE_URL}/admin/products/new`);
		await expect(page.locator('input[placeholder*="Luminous Peptide"]').first()).toHaveValue("Live Melanin Barrier Glaze");

		// Navigate back to /admin/products and click "Discard" to verify cleanup
		await page.goto(`${LIVE_URL}/admin/products`);
		await expect(draftToast).toBeVisible({ timeout: 15000 });
		const discardBtn = page.locator('[data-testid="discard-draft-button"]');
		await discardBtn.click();

		// Verify toast disappears and localStorage is cleaned
		await expect(draftToast).not.toBeVisible();
		const cleared = await page.evaluate(() => localStorage.getItem("jc_admin_product_draft"));
		expect(cleared).toBeNull();
	});
});
