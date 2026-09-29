import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

async function generateAssets() {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	const logoBase64 = fs.readFileSync(path.resolve("public/logo.png")).toString("base64");
	const logoDataUrl = `data:image/png;base64,${logoBase64}`;

	// 1. Generate 1200x630 OpenGraph Image (for WhatsApp large preview card)
	await page.setViewportSize({ width: 1200, height: 630 });
	const ogHtml = `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
		<style>
			* { box-sizing: border-box; margin: 0; padding: 0; }
			body {
				width: 1200px;
				height: 630px;
				background-color: #FAF9F6;
				background-image: 
					radial-gradient(circle at 15% 20%, rgba(212, 160, 23, 0.08) 0%, transparent 40%),
					radial-gradient(circle at 85% 80%, rgba(253, 242, 244, 0.9) 0%, transparent 45%);
				font-family: 'Plus Jakarta Sans', sans-serif;
				color: #1F2937;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				padding: 56px 72px;
				position: relative;
				overflow: hidden;
				border: 12px solid #FFFFFF;
			}
			.ambient-border {
				position: absolute;
				inset: 20px;
				border: 1px solid #EAE8E3;
				pointer-events: none;
				border-radius: 16px;
			}
			.top-bar {
				display: flex;
				justify-content: space-between;
				align-items: center;
				z-index: 10;
			}
			.badge {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				background: #FFFFFF;
				border: 1px solid #EAE8E3;
				padding: 8px 18px;
				border-radius: 9999px;
				font-size: 11px;
				font-weight: 700;
				letter-spacing: 0.16em;
				text-transform: uppercase;
				color: #1F2937;
				box-shadow: 0 2px 8px rgba(31, 41, 55, 0.04);
			}
			.pulse {
				width: 8px;
				height: 8px;
				background: #D4A017;
				border-radius: 50%;
			}
			.main-content {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 40px;
				z-index: 10;
				margin: auto 0;
			}
			.text-col {
				max-width: 660px;
			}
			.pre-title {
				font-size: 13px;
				font-weight: 600;
				letter-spacing: 0.2em;
				text-transform: uppercase;
				color: #D4A017;
				margin-bottom: 12px;
			}
			h1 {
				font-family: 'Playfair Display', serif;
				font-size: 52px;
				line-height: 1.15;
				font-weight: 400;
				color: #1F2937;
				letter-spacing: -0.02em;
				margin-bottom: 16px;
			}
			h1 span {
				font-style: italic;
				color: #795900;
			}
			p {
				font-size: 18px;
				line-height: 1.5;
				color: #44474C;
				font-weight: 300;
				max-width: 580px;
			}
			.logo-col {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				background: #FFFFFF;
				padding: 32px 48px;
				border-radius: 24px;
				border: 1px solid #EAE8E3;
				box-shadow: 0 16px 32px -8px rgba(31, 41, 55, 0.06);
			}
			.logo-img {
				width: 240px;
				height: auto;
				object-fit: contain;
			}
			.logo-caption {
				font-size: 11px;
				font-weight: 600;
				letter-spacing: 0.16em;
				text-transform: uppercase;
				color: #75777C;
				margin-top: 14px;
			}
			.footer-bar {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-top: 20px;
				border-top: 1px solid #EAE8E3;
				z-index: 10;
			}
			.pillars {
				display: flex;
				gap: 24px;
			}
			.pillar-item {
				font-size: 12px;
				font-weight: 600;
				color: #1F2937;
				letter-spacing: 0.08em;
				text-transform: uppercase;
				display: flex;
				align-items: center;
				gap: 6px;
			}
			.domain {
				font-size: 13px;
				font-weight: 600;
				letter-spacing: 0.1em;
				color: #795900;
				text-transform: uppercase;
			}
		</style>
	</head>
	<body>
		<div class="ambient-border"></div>
		
		<div class="top-bar">
			<div class="badge">
				<div class="pulse"></div>
				Botanical Apothecary • Lagos & Paris
			</div>
			<div class="badge">
				NAFDAC Certified Formulations
			</div>
		</div>

		<div class="main-content">
			<div class="text-col">
				<div class="pre-title">Juliana's Cosmetics</div>
				<h1>Radiance Grounded in <span>Parisian Elegance</span></h1>
				<p>Potent, clinically backed luxury skincare consciously crafted in France with refined botanical complexes and pure bio-actives for radiant skin.</p>
			</div>
			<div class="logo-col">
				<img class="logo-img" src="${logoDataUrl}" alt="Juliana's Cosmetics Logo" />
				<div class="logo-caption">Luxury Clean Skincare</div>
			</div>
		</div>

		<div class="footer-bar">
			<div class="pillars">
				<div class="pillar-item">✓ Imported from Paris</div>
				<div class="pillar-item">✓ Clinical Grade Bio-Actives</div>
				<div class="pillar-item">✓ WhatsApp Concierge Dispatch</div>
			</div>
			<div class="domain">julianas-cosmetic.com</div>
		</div>
	</body>
	</html>
	`;

	await page.setContent(ogHtml, { waitUntil: "networkidle" });
	
	// Save as public/og-image.jpg (high quality, under 200KB)
	await page.screenshot({
		path: "public/og-image.jpg",
		type: "jpeg",
		quality: 85,
	});
	console.log("Generated public/og-image.jpg");

	// Save as app/opengraph-image.png (Next.js native OG)
	await page.screenshot({
		path: "app/opengraph-image.png",
		type: "png",
	});
	console.log("Generated app/opengraph-image.png");

	// 2. Generate Favicon & App Icon from logo
	// Create a clean square icon container with padding
	await page.setViewportSize({ width: 512, height: 512 });
	const iconHtml = `
	<!DOCTYPE html>
	<html>
	<head>
		<style>
			* { margin: 0; padding: 0; box-sizing: border-box; }
			body {
				width: 512px;
				height: 512px;
				background: #FAF9F6;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 40px;
			}
			.circle {
				width: 440px;
				height: 440px;
				background: #FFFFFF;
				border-radius: 50%;
				border: 8px solid #EAE8E3;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 30px;
				box-shadow: 0 12px 32px rgba(31, 41, 55, 0.08);
			}
			img {
				width: 85%;
				height: 85%;
				object-fit: contain;
			}
		</style>
	</head>
	<body>
		<div class="circle">
			<img src="${logoDataUrl}" />
		</div>
	</body>
	</html>
	`;

	await page.setContent(iconHtml, { waitUntil: "networkidle" });
	await page.screenshot({ path: "public/icon.png", type: "png" });
	await page.screenshot({ path: "app/icon.png", type: "png" });
	await page.screenshot({ path: "app/apple-icon.png", type: "png" });
	await page.screenshot({ path: "public/apple-touch-icon.png", type: "png" });
	console.log("Generated icon.png and apple-icon.png");

	// Generate 32x32 favicon
	await page.setViewportSize({ width: 32, height: 32 });
	const favHtml = `
	<!DOCTYPE html>
	<html>
	<head>
		<style>
			* { margin: 0; padding: 0; }
			body {
				width: 32px;
				height: 32px;
				background: #FFFFFF;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			img {
				width: 28px;
				height: 28px;
				object-fit: contain;
			}
		</style>
	</head>
	<body>
		<img src="${logoDataUrl}" />
	</body>
	</html>
	`;
	await page.setContent(favHtml, { waitUntil: "networkidle" });
	// Replace favicon.ico with the real logo png rendered at 32x32
	const favBuffer = await page.screenshot({ type: "png" });
	fs.writeFileSync("public/favicon.ico", favBuffer);
	fs.writeFileSync("app/favicon.ico", favBuffer);
	console.log("Replaced favicon.ico with Juliana's logo");

	await browser.close();
}

generateAssets().catch((err) => {
	console.error(err);
	process.exit(1);
});
