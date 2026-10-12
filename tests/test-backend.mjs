import http from "node:http";

let simulateOutage = false;

const initialProducts = [
	{
		id: "luminous-peptide-glaze-serum",
		slug: "luminous-peptide-glaze-serum",
		name: "Luminous Peptide Glaze Serum",
		tagline: "Cellular Radiance & Multi-Peptide Barrier Glaze",
		price: 38500,
		category: "Serums",
		stockStatus: "In Stock",
		inStock: true,
		size: "30 ml / 1.0 fl. oz.",
		rating: 4.9,
		reviewCount: 128,
		featured: true,
		nafdacRegNo: "NAFDAC Reg. No. 04-9218",
		images: [
			"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
			"https://images.unsplash.com/photo-1608248597359-5989e248b652?auto=format&fit=crop&w=1000&q=80",
		],
		description:
			"An ultra-concentrated Parisian botanical elixir infusing multi-peptides, pure French botanical seed oils, and 3% niacinamide to illuminate skin while reinforcing cellular lipid barriers.",
		formulation: {
			phLevel: "5.2 - 5.5",
			texture: "Silky, fast-absorbing micro-glaze",
			skinType: "All skin types, optimized for delicate & sensitive skin",
			keyActives: [
				"5% Multi-Peptide Matrix",
				"3% Niacinamide",
				"French Camellia Seed Oil",
				"Botanical Hyaluronic Acid",
			],
		},
		accordions: {
			bioActives:
				"5% Multi-Peptide Complex stimulates collagen renewal and epidermal elasticity. 3% Niacinamide smooths hyperpigmentation and refines pore architecture.",
			inci:
				"Aqua (Water), Camellia Oleifera Seed Oil, Niacinamide, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Sodium Hyaluronate, Glycerin, Tocopherol.",
			ritual:
				"Dispense 3–4 drops onto freshly cleansed, damp skin. Gently press into face, neck, and décolletage using upward motions.",
			nafdac:
				"NAFDAC Reg. No. 04-9218. Verified and manufactured in adherence to strict cGMP cosmetic guidelines.",
		},
	},
	{
		id: "parisian-mineral-sun-shield-spf-50",
		slug: "parisian-mineral-sun-shield-spf-50",
		name: "Parisian Mineral Sun Shield SPF 50",
		tagline: "Invisible Broad-Spectrum Zinc Shield — Zero White Cast",
		price: 28000,
		category: "Suncare",
		stockStatus: "In Stock",
		inStock: true,
		size: "50 ml / 1.7 fl. oz.",
		rating: 4.8,
		reviewCount: 94,
		featured: true,
		nafdacRegNo: "NAFDAC Reg. No. 04-8841",
		images: [
			"https://images.unsplash.com/photo-1556228722-d0b777a83d73?auto=format&fit=crop&w=1000&q=80",
		],
		description:
			"A weightless physical broad-spectrum mineral shield crafted in Paris. Engineered exclusively for melanin-rich complexions.",
		formulation: {
			phLevel: "6.0 - 6.5",
			texture: "Featherlight emulsion with matte velvet finish",
			skinType: "All skin tones, phototypes I through VI",
			keyActives: [
				"18% Non-Nano Micronized Zinc Oxide",
				"French Golden Algae Extract",
				"Squalane",
			],
		},
		accordions: {
			bioActives: "Non-Nano Zinc Oxide offers physical UVA/UVB defense without chalkiness.",
			inci: "Zinc Oxide (Non-Nano), Aqua, Caprylic/Capric Triglyceride, Squalane, Glycerin.",
			ritual: "Apply generously 15 minutes before sun exposure as the final step.",
			nafdac: "NAFDAC Reg. No. 04-8841. Broad-spectrum certified.",
		},
	},
	{
		id: "botanical-purifying-jelly-cleanser",
		slug: "botanical-purifying-jelly-cleanser",
		name: "Botanical Purifying Jelly Cleanser",
		tagline: "pH-Balanced Hydrating Melt & Botanical Lipid Preserver",
		price: 22500,
		category: "Cleansers",
		stockStatus: "In Stock",
		inStock: true,
		size: "150 ml / 5.1 fl. oz.",
		rating: 4.7,
		reviewCount: 76,
		featured: true,
		nafdacRegNo: "NAFDAC Reg. No. 04-7123",
		images: [
			"https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80",
		],
		description:
			"A luxurious cushion jelly melt that sweeps away long-wear pigments and particulate pollutants while replenishing lipid reserves.",
		formulation: {
			phLevel: "5.0 - 5.4",
			texture: "Bouncy water-gel converting to milk",
			skinType: "All skin types",
			keyActives: ["French Chamomile Hydrosol", "Plant Amino Acids"],
		},
		accordions: {
			bioActives: "Chamomile hydrosol purifies and calms irritated skin.",
			inci: "Aqua, Anthemis Nobilis Flower Water, Sodium Cocoyl Glycinate, Glycerin.",
			ritual: "Massage 1-2 pumps onto damp skin, then rinse.",
			nafdac: "NAFDAC Reg. No. 04-7123.",
		},
	},
	{
		id: "botanical-hydration-creme",
		slug: "botanical-hydration-creme",
		name: "Botanical Hydration Crème",
		tagline: "Deep Cellular Moisture & Biomimetic Lipid Barrier Seal",
		price: 34000,
		category: "Moisturisers",
		stockStatus: "In Stock",
		inStock: true,
		size: "50 ml / 1.7 fl. oz.",
		rating: 4.9,
		reviewCount: 112,
		featured: true,
		nafdacRegNo: "NAFDAC Reg. No. 04-9540",
		images: [
			"https://images.unsplash.com/photo-1608248597359-5989e248b652?auto=format&fit=crop&w=1000&q=80",
		],
		description:
			"An intensely restorative Parisian whipped crème that mimics the natural skin lipid matrix to seal in hydration.",
		formulation: {
			phLevel: "5.5 - 5.8",
			texture: "Whipped velvet crème",
			skinType: "Normal to dry and sensitive skin",
			keyActives: ["Ceramide NP, AP, EOP", "French Shea Butter", "Centella Asiatica"],
		},
		accordions: {
			bioActives: "Triple Ceramide Complex restores natural stratum corneum barrier integrity.",
			inci: "Aqua, Butyrospermum Parkii Butter, Ceramide NP, Ceramide AP, Glycerin.",
			ritual: "Warm a pea-sized amount between fingertips and press into face and neck.",
			nafdac: "NAFDAC Reg. No. 04-9540.",
		},
	},
	{
		id: "parisian-botanical-barrier-oil",
		slug: "parisian-botanical-barrier-oil",
		name: "Parisian Botanical Barrier Oil",
		tagline: "Cold-Pressed Lipid Elixir for Trans-Epidermal Seal",
		price: 32000,
		category: "Treatments",
		stockStatus: "In Stock",
		inStock: true,
		size: "30 ml / 1.0 fl. oz.",
		rating: 4.9,
		reviewCount: 68,
		featured: false,
		nafdacRegNo: "NAFDAC Reg. No. 04-6320",
		images: [
			"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
		],
		description:
			"A golden Parisian elixir of cold-pressed French botanical oils providing essential omegas and protective antioxidants.",
		formulation: {
			phLevel: "Anhydrous",
			texture: "Dry-touch golden nectar oil",
			skinType: "Dry, compromised, or sensitized skin",
			keyActives: ["French Rosehip Seed Oil", "Camellia Oil", "Bakuchiol 1%"],
		},
		accordions: {
			bioActives: "Cold-pressed French botanical oils deliver omegas 3, 6, and 9.",
			inci: "Rosa Canina Fruit Oil, Camellia Oleifera Seed Oil, Bakuchiol, Tocopherol.",
			ritual: "Press 2–3 drops as the final step of nighttime ritual.",
			nafdac: "NAFDAC Reg. No. 04-6320.",
		},
	},
	{
		id: "hibiscus-aha-glow-tonic",
		slug: "hibiscus-aha-glow-tonic",
		name: "Hibiscus AHA Glow Tonic",
		tagline: "Gentle Botanical Exfoliating Acid Solution for Melanin Clarity",
		price: 26000,
		category: "Treatments",
		stockStatus: "In Stock",
		inStock: true,
		size: "120 ml / 4.0 fl. oz.",
		rating: 4.8,
		reviewCount: 88,
		featured: false,
		nafdacRegNo: "NAFDAC Reg. No. 04-8119",
		images: [
			"https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80",
		],
		description:
			"A gentle botanical acid tonic formulated in Paris with hibiscus flower AHAs and lactic acid to brighten melanin skin safely.",
		formulation: {
			phLevel: "3.8 - 4.2",
			texture: "Lightweight refreshing liquid essence",
			skinType: "All phototypes prone to dullness or hyperpigmentation",
			keyActives: ["Hibiscus Flower Extract (Natural AHAs)", "5% Lactic Acid"],
		},
		accordions: {
			bioActives: "Natural hibiscus flower acids dissolve surface cohesion.",
			inci: "Aqua, Hibiscus Sabdariffa Flower Extract, Lactic Acid, Glycerin, Sodium Hydroxide.",
			ritual: "Saturate a cotton pad and sweep across face 2–3 evenings weekly.",
			nafdac: "NAFDAC Reg. No. 04-8119.",
		},
	},
];

let products = JSON.parse(JSON.stringify(initialProducts));
let orders = [];

function parseBody(req) {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk;
		});
		req.on("end", () => {
			if (!body.trim()) return resolve({});
			try {
				resolve(JSON.parse(body));
			} catch {
				resolve({});
			}
		});
		req.on("error", reject);
	});
}

const server = http.createServer(async (req, res) => {
	// CORS Headers
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");

	if (req.method === "OPTIONS") {
		res.writeHead(204);
		return res.end();
	}

	const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1:5279"}`);
	const pathname = url.pathname;

	// Outage simulation endpoint
	if (pathname === "/api/test/toggle-outage" && req.method === "POST") {
		const body = await parseBody(req);
		simulateOutage = typeof body.enabled === "boolean" ? body.enabled : !simulateOutage;
		res.writeHead(200, { "Content-Type": "application/json" });
		return res.end(JSON.stringify({ simulateOutage }));
	}

	if (pathname === "/api/test/reset" && req.method === "POST") {
		products = JSON.parse(JSON.stringify(initialProducts));
		orders = [];
		simulateOutage = false;
		res.writeHead(200, { "Content-Type": "application/json" });
		return res.end(JSON.stringify({ success: true }));
	}

	// Check if simulating outage
	if (simulateOutage) {
		res.writeHead(503, { "Content-Type": "application/json" });
		return res.end(
			JSON.stringify({
				error: "Backend service temporarily unavailable for testing.",
			})
		);
	}

	// 1. /api/products
	if (pathname === "/api/products") {
		if (req.method === "GET") {
			const category = url.searchParams.get("category");
			let list = [...products];
			if (category && category !== "All") {
				list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
			}
			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(list));
		}

		if (req.method === "POST") {
			const body = await parseBody(req);
			const slug =
				body.name
					?.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, "") || `item-${Date.now()}`;
			const newProduct = {
				id: slug,
				slug,
				name: body.name || "Untitled Formulation",
				tagline: body.tagline || "",
				price: Number(body.price || 0),
				category: body.category || "Serums",
				stockStatus: body.stockStatus || "In Stock",
				inStock: body.inStock !== false && body.stockStatus !== "Out of Stock",
				featured: Boolean(body.featured),
				size: body.size || "50 ml",
				images: body.images || ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be"],
				description: body.description || "",
				formulation: body.formulation || { keyActives: ["French Botanical Extracts"] },
				accordions: body.accordions || { bioActives: "", inci: "", ritual: "", nafdac: "" },
			};
			products.unshift(newProduct);
			res.writeHead(201, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(newProduct));
		}
	}

	// /api/products/:id
	const productMatch = pathname.match(/^\/api\/products\/(.+)$/);
	if (productMatch) {
		const id = decodeURIComponent(productMatch[1]);
		const idx = products.findIndex((p) => p.id === id || p.slug === id);

		if (req.method === "GET") {
			if (idx === -1) {
				res.writeHead(404, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: `Product '${id}' not found` }));
			}
			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(products[idx]));
		}

		if (req.method === "PATCH") {
			if (idx === -1) {
				res.writeHead(404, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: `Product '${id}' not found` }));
			}
			const body = await parseBody(req);
			const existing = products[idx];
			const updated = { ...existing };
			if (body.name !== undefined) updated.name = body.name;
			if (body.tagline !== undefined) updated.tagline = body.tagline;
			if (body.description !== undefined) updated.description = body.description;
			if (body.price !== undefined) updated.price = Number(body.price);
			if (body.category !== undefined) updated.category = body.category;
			if (body.size !== undefined) updated.size = body.size;
			if (body.stockStatus !== undefined) {
				updated.stockStatus = body.stockStatus;
				updated.inStock = body.stockStatus === "In Stock";
			} else if (body.inStock !== undefined) {
				updated.inStock = body.inStock;
				updated.stockStatus = body.inStock ? "In Stock" : "Out of Stock";
			}
			if (body.featured !== undefined) updated.featured = Boolean(body.featured);
			if (body.images !== undefined) updated.images = body.images;
			if (body.formulation !== undefined) {
				updated.formulation = { ...existing.formulation, ...body.formulation };
			}
			if (body.accordions !== undefined) {
				updated.accordions = { ...existing.accordions, ...body.accordions };
			}
			products[idx] = updated;
			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(updated));
		}

		if (req.method === "DELETE") {
			if (idx === -1) {
				res.writeHead(404, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: `Product '${id}' not found` }));
			}
			products.splice(idx, 1);
			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify({ success: true, id }));
		}
	}

	// 2. /api/orders
	if (pathname === "/api/orders") {
		if (req.method === "GET") {
			const status = url.searchParams.get("status");
			let list = [...orders];
			if (status) {
				list = list.filter((o) => o.status === status);
			}
			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(list));
		}

		if (req.method === "POST") {
			const body = await parseBody(req);
			const orderNumber = `JC-${Date.now().toString().slice(-6)}`;
			const subtotal = (body.items || []).reduce((sum, item) => {
				const prod = products.find((p) => p.id === item.productId);
				return sum + (prod ? prod.price * item.quantity : 0);
			}, 0);

			const cust = body.customer || {};
			const itemsText = (body.items || [])
				.map((item) => {
					const prod = products.find((p) => p.id === item.productId);
					const name = prod ? prod.name : "Custom Item";
					const price = prod ? prod.price * item.quantity : 0;
					return `• ${name} x ${item.quantity} - ₦${price.toLocaleString()}`;
				})
				.join("\n");

			const waText = encodeURIComponent(
				`*JULIANA'S COSMETICS — CONCIERGE ORDER*\n` +
					`*Order Ref:* #${orderNumber}\n\n` +
					`*Customer Details:*\n` +
					`• Name: ${cust.fullName || ""}\n` +
					`• Phone: ${cust.phone || ""}\n` +
					`• Location: ${cust.cityLga || ""}, ${cust.state || ""}\n` +
					`• Address: ${cust.address || ""}\n\n` +
					`*Order Summary:*\n${itemsText}\n\n` +
					`*Items Subtotal:* ₦${subtotal.toLocaleString()}\n` +
					`*Delivery Fee:* To be calculated & agreed via WhatsApp`
			);
			const whatsappUrl = `https://wa.me/2347043726428?text=${waText}`;

			const newOrder = {
				id: orderNumber,
				orderNumber,
				customer: body.customer,
				items: (body.items || []).map((item) => {
					const prod = products.find((p) => p.id === item.productId);
					return {
						productId: item.productId,
						productName: prod ? prod.name : "Custom Item",
						price: prod ? prod.price : 0,
						quantity: item.quantity,
						size: item.size || "Standard",
					};
				}),
				subtotal,
				agreedDeliveryFee: null,
				total: subtotal,
				status: "Awaiting Delivery Agreement",
				whatsappMessageUrl: whatsappUrl,
				whatsappUrl,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			orders.unshift(newOrder);
			res.writeHead(201, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(newOrder));
		}
	}

	// /api/orders/:id
	const orderMatch = pathname.match(/^\/api\/orders\/(.+)$/);
	if (orderMatch) {
		const id = decodeURIComponent(orderMatch[1]);
		const idx = orders.findIndex((o) => o.id === id || o.orderNumber === id);

		if (req.method === "GET") {
			if (idx === -1) {
				res.writeHead(404, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: `Order '${id}' not found` }));
			}
			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(orders[idx]));
		}

		if (req.method === "PATCH") {
			if (idx === -1) {
				res.writeHead(404, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: `Order '${id}' not found` }));
			}
			const body = await parseBody(req);
			const existing = orders[idx];
			const updated = { ...existing };
			if (body.agreedDeliveryFee !== undefined) {
				const fee = body.agreedDeliveryFee === null ? null : Number(body.agreedDeliveryFee);
				updated.agreedDeliveryFee = fee;
				updated.total = existing.subtotal + (fee || 0);
			}
			if (body.status !== undefined) updated.status = body.status;
			if (body.notes !== undefined) updated.notes = body.notes;
			updated.updatedAt = new Date().toISOString();
			orders[idx] = updated;
			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(updated));
		}
	}

	res.writeHead(404, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ error: "Not found" }));
});

const PORT = process.env.PORT || 5279;
server.listen(PORT, () => {
	console.log(`[test-backend] Running on http://127.0.0.1:${PORT}`);
});
