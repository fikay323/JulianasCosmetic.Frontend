import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for Juliana's Cosmetics Luxury Clean Beauty Storefront.
 * Indentation: Hard tabs (\t), width 4.
 */
export default defineConfig({
	testDir: "./tests",
	timeout: 45 * 1000,
	expect: {
		timeout: 15 * 1000,
	},
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: [["html", { open: "never" }], ["list"]],
	use: {
		baseURL: "http://localhost:3005",
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
		command: "npx next dev -p 3005",
		port: 3005,
		reuseExistingServer: false,
		timeout: 120 * 1000,
	},
});
