import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for Juliana's Cosmetics Luxury Clean Beauty Storefront.
 * Indentation: Hard tabs (\t), width 4.
 */
export default defineConfig({
	testDir: "./tests",
	timeout: 30 * 1000,
	expect: {
		timeout: 10 * 1000,
	},
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: [["html", { open: "never" }], ["list"]],
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: process.env.CI ? "pnpm run build && pnpm run start" : "pnpm run dev",
		port: 3000,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
