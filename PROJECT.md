# Project: Juliana's Cosmetics Luxury E-Commerce & Admin Portal

## Architecture
- **Framework & Runtime**: Next.js 16.3.6 (Turbopack, App Router), React 19.2.8, Tailwind CSS v4.3.3 (`@theme inline`), pnpm 10.17.1.
- **Design System**: "L'Élixir Editorial" extracted from Stitch Project `4560820610682567739` (#1F2937 primary carbon, #D4A017 secondary gold, #FAF9F6 surface cream, #EAE8E3 delicate border, #FDF2F4 blush tint).
- **Typography**: Google Fonts `Playfair Display` (editorial headlines) and `Plus Jakarta Sans` (refined body and labels) loaded with `next/font/google` (`display: swap`, CSS variable bindings).
- **Layering & Separation of Concerns**:
  - `src/types/`: Domain contracts and statically typed schemas (`src/types/store.ts`). Hard tabs (`\t`, width 4), zero `any`.
  - `src/data/`: Flat-file JSON persistence (`src/data/products.json`, `src/data/orders.json`).
  - `src/lib/`: Storage, serialization, atomic file operations, currency formatting (₦), WhatsApp link generators.
  - `src/context/`: Client state management (`CartContext.tsx` with local storage persistence and cart drawer controller).
  - `src/components/ui/`: Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-accordion`).
  - `src/components/layout/`: Global Header (with `public/logo.png` priority image, cart trigger badge), Announcement Bar, Footer.
  - `src/components/storefront/`: Hero Split, NAFDAC Trust Pillars, Botanical Grid, Product Cards, PLP filters, PDP Visual Zoom, Formulation Specs, Accordion Disclosures.
  - `src/components/cart/`: Slide-out Cart Drawer with badge counter, quantity steppers, subtotal, and checkout CTA.
  - `src/components/checkout/`: WhatsApp Concierge Checkout Form, Nigerian phone (+234), State/LGA selectors, Delivery notice.
  - `src/components/admin/`: Admin navigation, Orders table, agreed delivery fee (₦) inline input, status progression chips, Product catalog price/stock management.
  - `app/api/`: REST API route handlers (`/api/orders`, `/api/orders/[id]`, `/api/products`).
  - `tests/`: Automated Playwright E2E suite (`tests/storefront.spec.ts`).

## Code Layout
| Path | Responsibility | Write Owner |
|------|---------------|-------------|
| `DESIGN.md` | Extracted Stitch design tokens, colors, typography, screen specifications | Worker (M1) |
| `app/globals.css` | Tailwind CSS v4 `@theme` block and CSS custom variables | Worker (M1) |
| `package.json` | Dependency management (`@radix-ui`, `lucide-react`, `@playwright/test`, etc.) | Worker (M1) |
| `app/layout.tsx` | Font configuration (`Playfair Display`, `Plus Jakarta Sans`), metadata, favicon | Worker (M2) |
| `src/types/store.ts` | TypeScript domain types and DTO interfaces (hard tabs, zero `any`) | Worker (M2) |
| `src/data/products.json` | Default botanical product catalog in ₦ | Worker (M2) |
| `src/data/orders.json` | Persisted orders database | Worker (M2) |
| `src/lib/storage.ts` | Thread-safe atomic JSON file persistence | Worker (M2) |
| `src/lib/utils.ts` | Currency formatting (₦), WhatsApp link encoding, class merge utilities | Worker (M2) |
| `src/context/CartContext.tsx` | Global cart provider, drawer open/close state, item counter | Worker (M2) |
| `src/components/layout/Header.tsx` | Header with `public/logo.png`, nav links, and cart badge | Worker (M2) |
| `src/components/layout/Footer.tsx` | Luxury brand footer with NAFDAC credentials and newsletter | Worker (M2) |
| `app/page.tsx` | Storefront Homepage (hero split, NAFDAC pillars, featured botanical grid) | Worker (M3) |
| `app/products/page.tsx` | Product Listing Page (PLP) with category filtering and sorting | Worker (M3) |
| `app/products/[id]/page.tsx` | Product Detail Page (PDP) with visual zoom, formulation specs, Radix accordions | Worker (M3) |
| `src/components/cart/CartDrawer.tsx` | Slide-out cart drawer using `@radix-ui/react-dialog` | Worker (M3) |
| `app/checkout/page.tsx` | Concierge WhatsApp checkout form with +234 inputs & delivery notice | Worker (M4) |
| `app/api/orders/route.ts` | Order submission handler (`POST /api/orders`) and listing (`GET /api/orders`) | Worker (M4) |
| `app/api/orders/[id]/route.ts` | Order update handler (`PATCH /api/orders/[id]`) for delivery fee & status | Worker (M5) |
| `app/api/products/route.ts` | Product catalog retrieval and price/stock mutation handler | Worker (M5) |
| `app/admin/page.tsx` | Admin portal dashboard redirect / overview | Worker (M5) |
| `app/admin/orders/page.tsx` | Orders management table, delivery fee input, mark as paid | Worker (M5) |
| `app/admin/products/page.tsx` | Product price editor and in/out of stock toggle table | Worker (M5) |
| `playwright.config.ts` | Playwright test configuration | E2E Testing Track |
| `tests/storefront.spec.ts` | Automated end-to-end verification suite | E2E Testing Track |

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Design Token Extraction | Extract all colors, typography, elevation, and screens into `DESIGN.md` | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Tailwind CSS v4 System Tokens | Configure `@theme` and CSS variables in `app/globals.css` | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Core Dependencies | Install `@radix-ui/react-dialog`, `@radix-ui/react-accordion`, `lucide-react`, `clsx`, `tailwind-merge` | M1 | ORIGINAL_REQUEST §R1, R3 |
| 4 | Brand Logo Integration | Bind `public/logo.png` to global Header with priority `next/image` | M2 | ORIGINAL_REQUEST §R2 |
| 5 | Typography Zero-Layout Shift | Load `Playfair Display` and `Plus Jakarta Sans` via `next/font/google` in `app/layout.tsx` | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Dynamic Metadata & Favicon | Configure luxury brand metadata and favicon in `app/layout.tsx` | M2 | ORIGINAL_REQUEST §R2 |
| 7 | TypeScript Domain Schemas | Create `src/types/store.ts` with strict types, zero `any`, hard tabs (`\t`, width 4) | M2 | ORIGINAL_REQUEST §R6 |
| 8 | Persistent Data Foundation | Create `src/data/products.json`, `src/data/orders.json`, and `src/lib/storage.ts` | M2 | ORIGINAL_REQUEST §R5 |
| 9 | Cart State Context | Create `src/context/CartContext.tsx` with drawer toggle, badge counter, and subtotal | M2 | ORIGINAL_REQUEST §R3 |
| 10 | Homepage Hero Split | 60/40 editorial hero split with gold accents and CTA | M3 | ORIGINAL_REQUEST §R3 |
| 11 | NAFDAC Trust Pillars | 4 trust pillar cards (Certified, Melanin-Rich, African Botanicals, 100% Clean) | M3 | ORIGINAL_REQUEST §R3 |
| 12 | Botanical Product Grid | Featured bestsellers grid with quick add to cart | M3 | ORIGINAL_REQUEST §R3 |
| 13 | PLP Category Filter & Sort | Filter by category (Serums, Moisturisers, Suncare, etc.) and sort by price/newest | M3 | ORIGINAL_REQUEST §R3 |
| 14 | PDP High-Res Visual Zoom | Interactive visual zoom on product images | M3 | ORIGINAL_REQUEST §R3 |
| 15 | PDP Formulation Specs | Clinical specification grid (pH level, key bio-actives, texture, skin type) | M3 | ORIGINAL_REQUEST §R3 |
| 16 | PDP Radix Accordions | Radix UI Accordions for Bio-Actives, Full INCI, Ritual, and NAFDAC Registration | M3 | ORIGINAL_REQUEST §R3 |
| 17 | Slide-Out Cart Drawer | Radix UI Dialog drawer with live counter badge, quantity modifiers, subtotal in ₦ | M3 | ORIGINAL_REQUEST §R3 |
| 18 | Delivery Agreement Notice | Checkout display: Items Subtotal: ₦XX,XXX + "Delivery Fee: To be calculated & agreed via WhatsApp" without automatic free shipping | M4 | ORIGINAL_REQUEST §R4 |
| 19 | Nigerian Customer Form | Inputs for Legal name, +234 phone, 36 States + FCT, City/LGA, address, notes | M4 | ORIGINAL_REQUEST §R4 |
| 20 | Order API Persistence | Persist order via `POST /api/orders` with initial status `"Awaiting Delivery Agreement"` | M4 | ORIGINAL_REQUEST §R4 |
| 21 | WhatsApp Concierge Dispatch | Generate & open `https://wa.me/{phone}?text={encoded}` with itemized cart summary and courier agreement request | M4 | ORIGINAL_REQUEST §R4 |
| 22 | Admin Orders Management | `/admin/orders` table showing orders, customer details, status chips | M5 | ORIGINAL_REQUEST §R5 |
| 23 | Agreed Delivery Fee Input | Inline input in `/admin/orders` to record agreed delivery fee in ₦ and update total | M5 | ORIGINAL_REQUEST §R5 |
| 24 | Mark Order as Paid Action | Action in `/admin/orders` to transition order status to `"Paid"` | M5 | ORIGINAL_REQUEST §R5 |
| 25 | Admin Products Management | `/admin/products` catalog table to adjust price (₦) and toggle In Stock / Out of Stock | M5 | ORIGINAL_REQUEST §R5 |
| 26 | Admin Backend Endpoints | Robust `/api/orders`, `/api/orders/[id]`, `/api/products` endpoints backed by JSON persistence | M5 | ORIGINAL_REQUEST §R5 |
| 27 | E2E Testing Suite (Tiers 1-4) | Comprehensive Playwright test suite in `tests/storefront.spec.ts` | E2E Track | ORIGINAL_REQUEST §R6 |
| 28 | Final Quality & Build Verification | Pass 100% E2E tests, `pnpm run build` 0 errors, `pnpm run lint` 0 errors | M6 | ORIGINAL_REQUEST §R6 |
| 29 | Adversarial Coverage Hardening | White-box stress testing and boundary validation (Tier 5) | M6 | Orchestration Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design Extraction & System Tokens | `DESIGN.md`, Tailwind v4 `@theme`, `app/globals.css`, install core packages | none | DONE |
| M2 | Branding, Layout & Domain Foundation | `public/logo.png` Header, layout fonts, `src/types/store.ts`, data store, CartContext | M1 | DONE |
| M3 | Storefront & Cart Experience | Homepage (Hero, NAFDAC, Grid), PLP, PDP (Zoom, Radix Accordion), Cart Drawer | M2 | DONE |
| M4 | WhatsApp Concierge Checkout Flow | Checkout form, +234 validation, notice, `POST /api/orders`, WhatsApp link | M3 | DONE |
| M5 | Admin Management Portal | `/admin/orders`, `/admin/products`, API routes (`/api/orders/[id]`, `/api/products`) | M4 | DONE |
| M6 | Final Verification & Hardening | Pass 100% E2E tests (Tiers 1-4), Tier 5 adversarial hardening, build & lint pass | M5, E2E Track | DONE |

## Interface Contracts
### Data Models (`src/types/store.ts`)
```typescript
export type OrderStatus = "Awaiting Delivery Agreement" | "Awaiting Payment" | "Paid" | "Dispatched";

export interface Product {
	id: string;
	name: string;
	tagline: string;
	price: number;
	category: "Serums" | "Moisturisers" | "Suncare" | "Cleansers" | "Treatments";
	stockStatus: "In Stock" | "Out of Stock";
	images: string[];
	description: string;
	formulation: {
		phLevel: string;
		texture: string;
		skinType: string;
		keyActives: string[];
	};
	accordions: {
		bioActives: string;
		inci: string;
		ritual: string;
		nafdac: string;
	};
	featured?: boolean;
}

export interface CartItem {
	product: Product;
	quantity: number;
}

export interface CustomerInfo {
	fullName: string;
	phone: string;
	state: string;
	cityLga: string;
	address: string;
	courierNotes?: string;
}

export interface Order {
	id: string;
	orderNumber: string;
	customer: CustomerInfo;
	items: {
		productId: string;
		productName: string;
		price: number;
		quantity: number;
	}[];
	subtotal: number;
	agreedDeliveryFee: number | null;
	total: number;
	status: OrderStatus;
	whatsappMessageUrl: string;
	createdAt: string;
	updatedAt: string;
}
```

### API Endpoints
- `GET /api/products`: returns `Product[]`
- `PATCH /api/products`: payload `{ id: string, price?: number, stockStatus?: "In Stock" | "Out of Stock" }`
- `GET /api/orders`: returns `Order[]`
- `POST /api/orders`: payload `{ customer: CustomerInfo, items: CartItem[] }` -> returns created `Order` with initial status `"Awaiting Delivery Agreement"`
- `PATCH /api/orders/[id]`: payload `{ agreedDeliveryFee?: number, status?: OrderStatus }` -> returns updated `Order`
