# Juliana's Cosmetics — End-to-End Test Infrastructure Specification

## 1. Opaque-Box Test Philosophy
The testing infrastructure for **Juliana's Cosmetics** follows strict **opaque-box (black-box)** testing principles. The test suite exercises the system solely through observable external interfaces: browser interactions, visible rendered DOM elements, network API contracts, and persistent state transitions.

### Core Principles
1. **Requirement-Driven & Anti-Facade**: Tests strictly validate requirements from `ORIGINAL_REQUEST.md` and `PROJECT.md`. Tests must never pass vacuously; they must execute authentic user interactions and assert observable business outcomes.
2. **Implementation Decoupling**: Selectors avoid fragile internal component class names, relying instead on semantic HTML elements, accessible roles (`role="dialog"`, `role="button"`), visible text content, and stable data attributes.
3. **Deterministic Persistence Verification**: State mutations made through storefront checkout or administrative controls are validated against both UI changes and flat-file JSON persistence via the Next.js API route handlers.
4. **Adversarial & Regional Integrity**: Explicit validation of Nigerian-specific commerce rules, including required `+234` phone prefixes, 36 states + FCT geographical integrity, and the strict rule that no automated free shipping may be applied at checkout.

---

## 2. Four-Tier Testing Methodology

```
+-----------------------------------------------------------------------+
|          Tier 4: Real-World Luxury Shopping Workflow                  |
|          (End-to-End Customer Journey & Concierge Order Dispatch)     |
+-----------------------------------------------------------------------+
                                    ^
+-----------------------------------------------------------------------+
|          Tier 3: Cross-Feature Combinations & State Sync              |
|          (Admin Price/Stock Mutations -> Storefront Reflection)       |
+-----------------------------------------------------------------------+
                                    ^
+-----------------------------------------------------------------------+
|          Tier 2: Boundary & Corner Cases                              |
|          (Form Validation, Cart Bounds, Zero Delivery Defaults)       |
+-----------------------------------------------------------------------+
                                    ^
+-----------------------------------------------------------------------+
|          Tier 1: Core Feature Coverage (Happy Path)                   |
|          (Header, Cart, Checkout, WhatsApp Link, Admin Routes)        |
+-----------------------------------------------------------------------+
```

### Tier 1: Core Feature Coverage (Happy Path)
- **Header & Logo**: Verifies `public/logo.png` renders with priority loading, proper `alt` text ("Juliana's Cosmetics"), and home navigation link.
- **Cart Drawer & Counter**: Verifies clicking "Add to Bag" increments the cart badge counter, triggers the slide-out `@radix-ui/react-dialog` cart drawer, displays items, subtotal in ₦, and quantity steppers.
- **Checkout Delivery Notice**: Verifies the checkout page strictly renders items subtotal in ₦ with the mandatory notice: *"Delivery Fee: To be calculated & agreed via WhatsApp"* and verifies **no automated free shipping** threshold is applied.
- **Order Persistence & WhatsApp Dispatch**: Verifies submitting customer details persists an order to `POST /api/orders` with initial status `"Awaiting Delivery Agreement"` and generates an encoded `https://wa.me/` concierge link itemizing customer details and order lines.
- **Admin Orders Portal**: Verifies `/admin/orders` displays persisted orders, allows recording an agreed delivery fee (₦), updates total price, and transitions order status to `"Paid"`.
- **Admin Products Portal**: Verifies `/admin/products` displays the botanical catalog, allows updating prices in ₦, and toggles stock between `"In Stock"` and `"Out of Stock"`.

### Tier 2: Boundary & Corner Cases
- **Nigerian Phone & Form Validation**: Rejection of empty required fields and validation of `+234` phone number formats (10 or 11 digits, standard Nigerian telecom prefixes).
- **Cart Quantity Boundaries**: Decrementing quantity at minimum 1 prevents negative values and either removes the item or prompts removal.
- **Zero Delivery Fee Default**: Delivery fee defaults to `null` or unassigned in order records until explicitly agreed and saved via admin controls.

### Tier 3: Cross-Feature Combinations & State Synchronization
- **Admin Price Mutation Sync**: Updating a product's price in `/admin/products` immediately reflects on the storefront PLP/PDP and recalculates cart subtotal upon subsequent additions.
- **Stock Status Propagation**: Marking a product `"Out of Stock"` in `/admin/products` immediately disables purchasing buttons and displays "Out of Stock" / "Sold Out" badges across the storefront.

### Tier 4: Real-World Luxury Shopping Workflow
- **Complete Luxury Purchase Flow**: Simulates a high-net-worth client discovering the brand:
  1. Lands on homepage hero split and reviews NAFDAC clinical trust pillars.
  2. Navigates to PDP and inspects Radix UI Accordions (Bio-Actives, Full INCI, Ritual, NAFDAC Registration).
  3. Adjusts quantity and adds product to luxury slide-out bag.
  4. Proceeds to checkout, inputs Nigerian contact information and delivery address.
  5. Submits order and receives order confirmation with active WhatsApp concierge link.

---

## 3. Feature Verification Checklist

| Tier | Test Case | Target Feature | Requirement Reference |
|:---:|---|---|---|
| 1.1 | Brand Logo & Header Navigation | Header renders `public/logo.png` with priority and alt text | ORIGINAL_REQUEST §R2, PROJECT §Feature 4 |
| 1.2 | Cart Drawer & Live Counter | Add to bag increments badge and opens slide-out drawer | ORIGINAL_REQUEST §R3, PROJECT §Feature 9, 17 |
| 1.3 | Cart Subtotal & Steppers | Quantity modifiers update line total and subtotal in ₦ | ORIGINAL_REQUEST §R3, PROJECT §Feature 17 |
| 1.4 | Checkout WhatsApp Notice | Strictly asserts delivery notice without automated free shipping | ORIGINAL_REQUEST §R4, PROJECT §Feature 18 |
| 1.5 | Order Creation & WhatsApp URL | Persists order to `/api/orders` and builds valid `https://wa.me/` link | ORIGINAL_REQUEST §R4, PROJECT §Feature 20, 21 |
| 1.6 | Admin Orders Fee & Status | Records agreed delivery fee in ₦ and marks order "Paid" | ORIGINAL_REQUEST §R5, PROJECT §Feature 22, 23, 24 |
| 1.7 | Admin Product Management | Updates price in ₦ and toggles stock availability | ORIGINAL_REQUEST §R5, PROJECT §Feature 25, 26 |
| 2.1 | Nigerian Form Validation | Validates +234 phone, state dropdown, and required fields | ORIGINAL_REQUEST §R4, PROJECT §Feature 19 |
| 2.2 | Cart Quantity Bounds | Enforces minimum quantity 1 and clean item removal | ORIGINAL_REQUEST §R3, PROJECT §Feature 17 |
| 2.3 | Default Delivery Fee State | Ensures delivery fee is null/uncalculated until merchant agreement | ORIGINAL_REQUEST §R4, PROJECT §Feature 18 |
| 3.1 | Cross-Route Price Propagation | Admin price updates propagate to storefront & cart subtotal | ORIGINAL_REQUEST §R5, PROJECT §Feature 25 |
| 3.2 | Cross-Route Stock Enforcement | Admin out-of-stock toggle disables purchasing on storefront | ORIGINAL_REQUEST §R5, PROJECT §Feature 25 |
| 4.1 | Luxury Concierge E2E Journey | Full browsing -> PDP accordion inspection -> cart -> WhatsApp order | ORIGINAL_REQUEST §R1-R6 |

---

## 4. Test Execution Commands

```bash
# 1. Install Playwright Chromium browser binary
pnpm exec playwright install chromium

# 2. Run the complete automated E2E test suite
pnpm exec playwright test

# 3. Run specific test tiers
pnpm exec playwright test -g "Tier 1"
pnpm exec playwright test -g "Tier 2"
pnpm exec playwright test -g "Tier 3"
pnpm exec playwright test -g "Tier 4"

# 4. Run tests with interactive UI mode
pnpm exec playwright test --ui

# 5. Run tests with step-by-step debugger
pnpm exec playwright test --debug

# 6. View detailed HTML test execution report
pnpm exec playwright show-report
```
