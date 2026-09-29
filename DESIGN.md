# Juliana's Cosmetics — Design System & Screen Specifications

**Stitch Project ID**: `4560820610682567739`  
**Project Title**: *Luxury Clean Beauty Store*  
**Theme**: *L'Élixir Editorial*  
**Brand**: Juliana's Cosmetics (*Aura Botanicals Apothecary*)  
**Target Audience**: Melanin-rich and sensitive skin barriers, conscious luxury beauty patrons across Nigeria and West Africa  

---

## 1. Executive Summary & Brand Identity

The design system for **Juliana's Cosmetics** embodies **"L'Élixir Editorial"**: an intentional synthesis of high-fashion editorial publication aesthetics and quiet-luxury apothecary discipline. Developed specifically for dermatologically rigorous, clean luxury skincare formulations imported directly from Paris, the aesthetic prioritizes:

- **Warm Minimalist Apothecary**: Clean, uncluttered layouts with generous negative space, replacing sterile clinical whites with warm alabaster and linen tones (`#FAF9F6`).
- **High-Fashion Editorial Typography**: Dramatic, literary serif headlines (**Playfair Display**) contrasted with hyper-legible, geometric sans-serif body copy and micro-accents (**Plus Jakarta Sans**). All metadata labels, categories, and technical skincare specs employ wide tracking (`0.12em` – `0.16em`) and uppercase formatting.
- **Organic Vessels & Tactile Opulence**: Soft architectural containers (`rounded-2xl`, `rounded-DEFAULT`) paired with organic pill-shaped touch targets (`rounded-full`) that evoke botanical seeds, cosmetic droppers, and polished river stones.
- **Subtle Layered Depth**: Fine hairline borders (`1px solid #EAE8E3`) combined with delicate, warm ambient shadows rather than heavy drop shadows.

---

## 2. Complete Design Token System

### 2.1 Color Palette & Semantic Roles

| Token Name | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| **`primary`** | `#1F2937` | Deep softened charcoal for headlines, primary buttons, high-contrast text, and footer background. Avoids pure black harshness. |
| **`primary-dark`** | `#0A1422` | Ultra-deep carbon shade for deep contrast borders and active states. |
| **`primary-container`** | `#1F2937` | Container background for primary floating CTA bars and active dark badges. |
| **`on-primary`** | `#FFFFFF` | Crisp white typography and glyphs on primary containers and buttons. |
| **`on-primary-container`** | `#8690A1` | Slate gray muted text on dark containers. |
| **`secondary`** | `#D4A017` | Antique champagne gold for ceremonial accents, ratings stars, award emblems, and premium badges. |
| **`secondary-dark`** | `#795900` | Deep golden bronze for text on light gold accents. |
| **`secondary-container`** | `#FFC641` | Warm amber container for urgent notices and promotional highlights. |
| **`on-secondary`** | `#FFFFFF` | White text on solid secondary gold surfaces. |
| **`on-secondary-container`** | `#715300` | Deep bronze typography on secondary-container pills. |
| **`secondary-fixed`** | `#FFDFA0` | Soft champagne gold wash for delivery status chips and category badges. |
| **`secondary-fixed-dim`** | `#F6BE39` | Medium gold accent border. |
| **`on-secondary-fixed`** | `#261A00` | Deep bronze text on gold status chips. |
| **`on-secondary-fixed-variant`** | `#5C4300` | Subdued gold text variant. |
| **`tertiary`** | `#2E0311` | Deep botanical plum for subtle organic contrast. |
| **`tertiary-light`** | `#FFB0C0` | Soft petal rose for interactive highlights and active chip borders. |
| **`tertiary-container`** | `#491725` | Plum wine container for diagnostic badges. |
| **`on-tertiary`** | `#FFFFFF` | White text on tertiary elements. |
| **`on-tertiary-container`** | `#C27C8B` | Rose-plum text on dark tertiary backgrounds. |
| **`tertiary-fixed`** | `#FFD9DF` | Soft blossom background wash for glowing elements and soft highlights. |
| **`tertiary-fixed-dim`** | `#FFB1C1` | Delicate botanical rose border accent. |
| **`on-tertiary-fixed`** | `#380A18` | Deep berry text on soft rose washes. |
| **`on-tertiary-fixed-variant`** | `#6E3543` | Supporting berry-rose text for announcement chips. |
| **`background`** | `#FAF9F6` | Organic warm alabaster/linen canvas underpinning all storefront pages. |
| **`on-background`** | `#1A1C1A` | Deep charcoal for body text on the main background. |
| **`surface`** | `#FAF9F6` | Base surface layer for the application. |
| **`surface-dim`** | `#DBDAD7` | Slightly muted stone for inactive dividers and structural lines. |
| **`surface-bright`** | `#FAF9F6` | High-luminance surface canvas. |
| **`surface-card`** | `#FFFFFF` | Crisp pure white canvas for product cards, modals, and summary drawers. |
| **`surface-container-lowest`** | `#FFFFFF` | Pure white inner container layer. |
| **`surface-container-low`** | `#F4F3F1` | Warm stone tint for input backgrounds, secondary pill buttons, and thumbnail wrappers. |
| **`surface-container`** | `#EFEEEB` | Medium warm neutral container for trust pillar icons, steppers, and dividers. |
| **`surface-container-high`** | `#E9E8E5` | Announcement bar background and card hover states. |
| **`surface-container-highest`** | `#E3E2E0` | Elevated border and progress bar background tracks. |
| **`surface-variant`** | `#E3E2E0` | Medium neutral container variant. |
| **`border-delicate`** | `#EAE8E3` | 1px structural hairline providing subtle definition to cards, inputs, and dividers. |
| **`blush-tint`** | `#FDF2F4` | Botanical rose wash for active filter chips, notification pills, and member incentives. |
| **`on-surface`** | `#1A1C1A` | Deep charcoal for primary body copy and general interface text. |
| **`on-surface-variant`** | `#44474C` | Medium charcoal for secondary metadata, descriptions, and breadcrumbs. |
| **`inverse-surface`** | `#2F312F` | Dark charcoal for inverse tooltips and toast surfaces. |
| **`inverse-on-surface`** | `#F2F1EE` | Pale cream text on inverse surfaces. |
| **`outline`** | `#75777C` | Muted neutral outline for secondary form states. |
| **`outline-variant`** | `#C5C6CC` | Subtle hairline outline for disabled or inactive borders. |
| **`error`** | `#BA1A1A` | Clear crimson for validation errors and out-of-stock indicators. |
| **`on-error`** | `#FFFFFF` | White text on error surfaces. |
| **`error-container`** | `#FFDAD6` | Soft blush red container for error alerts. |
| **`on-error-container`** | `#93000A` | Deep crimson text on error alerts. |

---

### 2.2 Typography Scale & Hierarchy

The typographical system establishes an editorial dialogue between classical serif mastheads (**Playfair Display**) and modern geometric sans-serif legibility (**Plus Jakarta Sans**).

| Style Token | Font Family | Size | Weight | Line Height | Tracking | Transform |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`headline-xl`** | Playfair Display | 56px (3.5rem) | 400 | 64px (4.0rem) | -0.02em | None |
| **`headline-xl-mobile`** | Playfair Display | 36px (2.25rem) | 400 | 44px (2.75rem) | -0.01em | None |
| **`headline-lg`** | Playfair Display | 40px (2.5rem) | 400 | 48px (3.0rem) | -0.01em | None |
| **`headline-lg-mobile`** | Playfair Display | 28px (1.75rem) | 400 | 36px (2.25rem) | normal | None |
| **`headline-md`** | Playfair Display | 28px (1.75rem) | 500 | 36px (2.25rem) | normal | None |
| **`headline-sm`** | Playfair Display | 22px (1.375rem) | 500 | 30px (1.875rem) | normal | None |
| **`body-lg`** | Plus Jakarta Sans | 18px (1.125rem) | 300 | 28px (1.75rem) | normal | None |
| **`body-md`** | Plus Jakarta Sans | 15px (0.9375rem)| 400 | 24px (1.5rem) | normal | None |
| **`body-sm`** | Plus Jakarta Sans | 13px (0.8125rem)| 400 | 20px (1.25rem) | normal | None |
| **`label-lg`** | Plus Jakarta Sans | 12px (0.75rem) | 600 | 16px (1.0rem) | +0.12em | Uppercase |
| **`label-md`** | Plus Jakarta Sans | 11px (0.6875rem)| 600 | 14px (0.875rem)| +0.14em | Uppercase |
| **`label-sm`** | Plus Jakarta Sans | 10px (0.625rem) | 700 | 12px (0.75rem) | +0.16em | Uppercase |

---

### 2.3 Radiuses, Elevation & Spacing

#### Border Radiuses
- **`radius-sm`**: `0.5rem` (8px) — Thumbnails, micro badges, and input accents.
- **`radius-DEFAULT`**: `1rem` (16px) — Standard cards, accordion items, form group containers.
- **`radius-md`**: `1.5rem` (24px) — Medium editorial cards and summary boxes.
- **`radius-lg`**: `2rem` (32px) — Major hero cards, promo modules, and modal containers.
- **`radius-xl`**: `3rem` (48px) — Diagnostic banner wrappers.
- **`radius-full`**: `9999px` — Buttons, search bars, pill tags, quantity steppers, chips.

#### Elevation & Shadows
- **Card Float Shadow**:
  ```css
  box-shadow: 0 4px 20px -2px rgba(31, 41, 55, 0.03), 0 12px 32px -4px rgba(31, 41, 55, 0.05);
  border: 1px solid #EAE8E3;
  ```
- **Card Hover Lift**:
  ```css
  box-shadow: 0 20px 40px -8px rgba(31, 41, 55, 0.08);
  transform: translateY(-2px);
  ```
- **Drawer / Modal Scrim**:
  ```css
  background-color: rgba(31, 41, 55, 0.35);
  backdrop-filter: blur(8px);
  ```
- **Sticky Header Glass**:
  ```css
  background-color: rgba(250, 249, 246, 0.85);
  backdrop-filter: blur(16px);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
  ```

#### Spacing System
- **`spacing-margin`**: `4rem` (64px desktop) / **`spacing-margin-mobile`**: `1.25rem` (20px mobile)
- **`spacing-gutter`**: `2rem` (32px desktop) / **`spacing-gutter-mobile`**: `1rem` (16px mobile)
- **`spacing-space-xs`**: `0.25rem` (4px)
- **`spacing-space-sm`**: `0.5rem` (8px)
- **`spacing-space-md`**: `1rem` (16px)
- **`spacing-space-lg`**: `1.75rem` (28px)
- **`spacing-space-xl`**: `3rem` (48px)

---

## 3. Screen Specifications

### 3.1 Global Header & Navigation
- **Announcement Bar**:
  - Background: `bg-surface-container-high/70 backdrop-blur-md` with hairline border `border-b border-border-delicate`.
  - Content: Complimentary delivery announcement `"COMPLIMENTARY CONCIERGE PACKAGING ON ALL ORDERS"`, with pill badge in `bg-blush-tint text-on-tertiary-fixed font-label-sm`.
- **Navigation Bar**:
  - Height: `h-20` (80px), sticky top with glassmorphic background `bg-surface/85 backdrop-blur-xl border-b border-border-delicate`.
  - Brand Logo: Renders `public/logo.png` via `next/image` with `priority` attribute. Height: 40px, auto width, linked to `/`.
  - Navigation Links: "Shop All", "Serums", "Moisturisers", "Suncare", "Rituals" (`font-label-lg tracking-wider text-primary hover:text-secondary transition-colors`).
  - Search Input: Pill input (`bg-surface-container-low rounded-full px-4 py-2 border border-border-delicate`).
  - Cart Trigger: Shopping bag icon with live count badge (`rounded-full bg-primary text-white text-xs px-2 py-0.5`). Clicking opens Cart Drawer.

---

### 3.2 Storefront Homepage (`/`)
- **Hero Split (60/40 Layout)**:
  - **Left Editorial Column**:
    - Pre-header Pill Tag: Amber pulsing dot + `"ORGANIC BOTANICAL SCIENCE • LAGOS & PARIS"`.
    - Headline: `"Radiance Grounded in Nature"` (`headline-xl`, Playfair Display).
    - Narrative: Specialized clean formulations engineered for melanin-rich skin barriers (`body-lg`).
    - CTAs: Primary button `"Shop Bestsellers"` (pill button in `#1F2937` with white text and arrow) + Secondary button `"Explore Formulations"` (pill in `#FFFFFF` with `#EAE8E3` border).
    - Social Proof: 5 antique gold stars (`#D4A017`) + `"Rated 4.9/5 by 12,000+ conscious women across West Africa"`.
  - **Right Visual Column**:
    - High-resolution editorial skincare photography with soft ambient blur rings in `#FFDFA0` and `#FFD9DF`.
    - Floating Pill Badge: `"100% Cold-Pressed Plant Actives"`.
    - Overlapping Glass Quick-Add Card: Preview card for best-selling serum with instant add-to-bag action.
- **NAFDAC Trust Pillars**:
  - 4 distinct trust cards in a horizontal grid (`grid-cols-1 md:grid-cols-4 gap-6`):
    1. **NAFDAC Certified**: Approved Nigerian safety and clinical efficacy standards.
    2. **Dermatologist Tested**: Formulated specifically for melanin-rich skin barriers.
    3. **Cruelty-Free & Vegan**: Certified clean, ethical bio-active ingredients.
    4. **Imported from Paris**: Direct French botanical extracts and clinical complexes.
- **Shop by Skin Concern**:
  - Category cards: Hyperpigmentation, Barrier Repair, Deep Hydration, Sun Protection.
- **Featured Botanical Product Grid**:
  - 4-column responsive grid displaying bestselling products.
  - Cards: Aspect ratio 4:5 image, category label (`label-sm`), product title (Playfair Display), clinical active tagline, price formatted in Nigerian Naira (`₦XX,XXX`), and quick "Add to Bag" button.
- **Diagnostic Routine Section**:
  - Editorial banner inviting customers to personalize their skincare ritual.

---

### 3.3 Product Listing Page (PLP, `/products`)
- **Header Section**:
  - Editorial title: `"The Formulations Archive"` (`headline-lg`, Playfair Display).
  - Subtitle: `"Showing 18 Clean Botanical Formulations • Formulated for Melanin-Rich Skin"`.
- **Filter & Sort Console**:
  - Filter category tabs: All, Serums, Moisturisers, Suncare, Cleansers, Treatments.
  - Active filter chips with removal glyphs and "Clear All" action.
  - Sort dropdown: "Featured Editorial", "Price: Low to High", "Price: High to Low", "Newest Harvest".
- **Catalog Grid**:
  - 3-column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`).
  - Cards feature hover zoom, instant stock indicator (`In Stock` / `Out of Stock`), pricing in ₦, and Quick Add action.

---

### 3.4 Product Detail Page (PDP, `/products/[id]`)
- **60/40 Editorial Split**:
  - **Left Column (Visual Gallery)**:
    - Vertical thumbnail carousel (4 formulation angles).
    - Large 4:5 hero visual with interactive hover zoom capability.
    - Trust badges: "NAFDAC Certified", "Melanin Tested", "Clean Formula".
  - **Right Column (Formulation & Purchase)**:
    - Category kicker: `CELLULAR RADIANCE CONCENTRATE` (`label-md`, uppercase, tracking-wider).
    - Product Title: `headline-lg` in Playfair Display.
    - Star Rating: 5 gold stars (`#D4A017`), review count, and repurchase rate.
    - Price in Nigerian Naira (`₦XX,XXX`).
    - Formulation Clinical Metrics Grid: pH level, texture, skin type compatibility, key bio-actives.
    - Volume Selector: 30ml vs 50ml options.
    - Quantity Stepper: `[-] [ 1 ] [+]`.
    - Primary CTA: `"Add to Bag — ₦XX,XXX"` (`bg-primary text-white rounded-full py-4 text-center`).
    - Same-Day Dispatch Timer: "Order within 3 hrs for same-day dispatch in Lagos & Abuja".
  - **Radix UI Accordion Disclosure Sections**:
    1. **Active Bio-Botanicals**: Clinical breakdown of active ingredients (Niacinamide, Copper Peptides, French Botanical Oils).
    2. **Full INCI Transparency**: Complete ingredient list disclosures.
    3. **Application Ritual**: Step-by-step application regimen diagram.
    4. **Safety & NAFDAC Certification**: Registration number and clinical test certifications.

---

### 3.5 Cart Drawer (Radix UI Dialog)
- **Trigger**: Shopping bag icon in global header with dynamic badge counter.
- **Drawer Layout**:
  - Anchored to right viewport (`max-w-[480px] w-full bg-surface-card shadow-2xl`).
  - Animated scrim overlay with `backdrop-filter: blur(8px)`.
  - Header: `"Your Curated Bag"` with item count and close button (`X`).
  - Item List: Scrollable list of cart items with product thumbnail, category, title, volume, unit price in ₦, quantity stepper (`-`, count, `+`), and delete item button.
  - Summary Section:
    - `Items Subtotal: ₦XX,XXX`
    - Delivery Note: *"Doorstep delivery fee calculated and agreed via WhatsApp concierge."*
  - Primary CTA: `"Proceed to WhatsApp Checkout"` button navigating to `/checkout`.

---

### 3.6 WhatsApp Concierge Checkout (`/checkout`)
- **Client Information Form**:
  - Full Legal Name (`fullName`): text input.
  - Nigerian Mobile / WhatsApp Phone (`phone`): with `+234` prefix and validation.
  - State / Territory Selector (`state`): 36 Nigerian States + FCT Abuja.
  - City / LGA (`cityLga`): text input.
  - Street Address & Suite (`address`): text input.
  - Courier / Gate Notes (`courierNotes`): textarea for estate gate access and delivery instructions.
- **Order Summary Sidebar**:
  - Itemized cart list with thumbnails, quantities, and line item totals in ₦.
  - `Items Subtotal: ₦XX,XXX`.
  - **Delivery Fee Notice (Strict Requirement)**:
    - Must prominently display:  
      **`Delivery Fee: To be calculated & agreed via WhatsApp`**  
    - **No automated shipping threshold or free delivery discount** is applied during checkout.
  - Subtotal & Notice clearly grouped.
- **Order Submission Workflow**:
  1. Client clicks `"Confirm Order on WhatsApp"`.
  2. Order record is persisted via `POST /api/orders` with initial status `"Awaiting Delivery Agreement"`.
  3. Formats concierge WhatsApp dispatch text:
     ```
     *Juliana's Cosmetics Concierge Dispatch Request*

     *Customer Name:* Folashade Alakija
     *Phone:* +234 803 456 7890
     *Delivery Address:* Plot 12, Adeola Odeku Street, Victoria Island, Lagos State
     *Gate & Courier Notes:* Deliver to security reception.

     *Order Items:*
     1. Luminous Peptide Glaze Serum (50ml) x 1 - ₦22,000
     2. Botanical Hydration Crème (50ml) x 2 - ₦28,000

     *Items Subtotal:* ₦50,000

     Please share the agreed doorstep delivery quote and bank account details for direct transfer.
     ```
  4. Redirects to `https://wa.me/{phone}?text={encoded}`.

---

### 3.7 Admin Orders Management (`/admin/orders`)
- **Orders Table**:
  - Columns: Order Number (`#JC-XXXX`), Customer Name, Phone, Delivery Location (City, State), Items Count, Subtotal (₦), Agreed Delivery Fee (₦), Total (₦), Status Chip, Actions.
  - **Status Chips**:
    - `Awaiting Delivery Agreement` (`bg-secondary-fixed text-on-secondary-fixed`)
    - `Awaiting Payment` (`bg-surface-container text-on-surface-variant`)
    - `Paid` (`bg-blush-tint text-primary font-semibold`)
    - `Dispatched` (`bg-surface-container-high text-on-surface`)
- **Order Details Drawer / Modal**:
  - Full client profile and address.
  - Direct "Chat on WhatsApp" button linking to customer's phone.
  - Itemized products with prices and quantities.
  - **Agreed Delivery Fee Inline Input (₦)**:
    - Merchant inputs negotiated delivery fee (e.g. `3500`).
    - Automatically updates Grand Total (`subtotal + agreedDeliveryFee`).
    - Persists fee via `PATCH /api/orders/[id]`.
  - **Mark as Paid Action**:
    - Button to transition order status to `"Paid"`.

---

### 3.8 Admin Product Catalog & Price Editor (`/admin/products`)
- **Header Metrics Strip**:
  - Total Formulations, Active Stock, Out of Stock, Average Price in ₦.
- **Catalog Management Table**:
  - Columns: Thumbnail, Product Name, Category, Current Price (₦), Stock Availability, Actions.
  - **Real-Time Price Editor (₦)**:
    - Inline editable price field with quick save or automatic sync.
    - Persists via `PATCH /api/products`.
  - **Stock Status Toggle**:
    - Interactive switch toggling between `"In Stock"` and `"Out of Stock"`.
    - Persists via `PATCH /api/products`.
