# Juliana's Cosmetics — Automated Test Suite Readiness (TEST_READY)

**Project**: Juliana's Cosmetics Luxury Clean Beauty Storefront & Admin Portal  
**Testing Framework**: Playwright Test (`@playwright/test` v1.63.0)  
**Browser Target**: Chromium (Desktop Chrome)  
**Test Suite File**: `tests/storefront.spec.ts`  
**Configuration File**: `playwright.config.ts`  
**Status**: **READY** (100% test specifications authored, typechecked, and verified)

---

## 1. Test Suite Architecture & Summary

The automated end-to-end verification suite provides complete, requirement-driven, opaque-box coverage of all storefront and administrative features outlined in `ORIGINAL_REQUEST.md` and `PROJECT.md`.

```
=============================================================================
                    JULIANA'S COSMETICS TEST MATRIX
=============================================================================
Tier 1: Core Feature Coverage (Happy Path)                    [7 Test Cases]
Tier 2: Boundary & Corner Cases                               [3 Test Cases]
Tier 3: Cross-Feature Combinations & State Sync               [2 Test Cases]
Tier 4: Real-World Luxury Shopping Workflow                   [1 Test Case]
-----------------------------------------------------------------------------
TOTAL TEST CASES:                                             13 Test Cases
=============================================================================
```

---

## 2. Test Case Coverage Matrix

### Tier 1: Core Feature Coverage (Happy Path)
| Test ID | Test Description | Requirements Covered | Assertions & Observable Behaviors |
|:---:|---|---|---|
| **T1.1** | Header Logo & Priority Rendering | ORIGINAL_REQUEST §R2<br>PROJECT §Feature 4 | Asserts `header` renders `public/logo.png` with priority, alt text containing "Juliana", and global navigation links. |
| **T1.2** | Add to Bag & Slide-out Cart Drawer | ORIGINAL_REQUEST §R3<br>PROJECT §Feature 9, 17 | Asserts clicking "Add to Bag" increments the header bag counter badge and triggers the slide-out `@radix-ui/react-dialog` cart drawer. |
| **T1.3** | Cart Subtotal & Stepper Modifiers | ORIGINAL_REQUEST §R3<br>PROJECT §Feature 17 | Asserts Cart Drawer displays item prices in ₦, items subtotal, and quantity modifier (+) increases quantity and updates subtotal & badge. |
| **T1.4** | Checkout WhatsApp Delivery Agreement Notice | ORIGINAL_REQUEST §R4<br>PROJECT §Feature 18 | Asserts items subtotal in ₦ and strictly displays explicit notice: *"Delivery Fee: To be calculated & agreed via WhatsApp"*. Strictly asserts **no automated free shipping** is applied. |
| **T1.5** | Order Persistence & WhatsApp Concierge Dispatch | ORIGINAL_REQUEST §R4<br>PROJECT §Feature 20, 21 | Asserts submitting checkout persists order to `POST /api/orders` with status `"Awaiting Delivery Agreement"`, and generates formatted `https://wa.me/` concierge link with customer details & order items. |
| **T1.6** | Admin Orders Management & Status Progression | ORIGINAL_REQUEST §R5<br>PROJECT §Feature 22, 23, 24 | Asserts `/admin/orders` renders persisted orders, allows recording agreed delivery fee in ₦, updates order total, and transitions status to `"Paid"`. |
| **T1.7** | Admin Product Catalog Price & Stock Toggle | ORIGINAL_REQUEST §R5<br>PROJECT §Feature 25, 26 | Asserts `/admin/products` renders catalog in ₦, allows price updates, and toggles stock between `"In Stock"` and `"Out of Stock"`. |

### Tier 2: Boundary & Corner Cases
| Test ID | Test Description | Requirements Covered | Assertions & Observable Behaviors |
|:---:|---|---|---|
| **T2.1** | Nigerian Form Validation (+234 Phone) | ORIGINAL_REQUEST §R4<br>PROJECT §Feature 19 | Asserts form prevents submission on empty required fields and validates Nigerian phone formats (+234 / 080... telecom prefixes). |
| **T2.2** | Cart Quantity Bounds & Item Removal | ORIGINAL_REQUEST §R3<br>PROJECT §Feature 17 | Enforces quantity cannot decrement below 1 into negative numbers, and tests clean item removal from cart drawer. |
| **T2.3** | Zero / Pending Delivery Fee Default | ORIGINAL_REQUEST §R4<br>PROJECT §Feature 18 | Asserts delivery fee is not defaulted to automated shipping thresholds or flat rate before merchant agreement. |

### Tier 3: Cross-Feature Combinations & State Synchronization
| Test ID | Test Description | Requirements Covered | Assertions & Observable Behaviors |
|:---:|---|---|---|
| **T3.1** | Price Mutation Propagation | ORIGINAL_REQUEST §R5<br>PROJECT §Feature 25 | Asserts price update in `/admin/products` immediately reflects on the storefront catalog (`/products`) and updates Cart Drawer subtotal calculations. |
| **T3.2** | Stock Availability Propagation | ORIGINAL_REQUEST §R5<br>PROJECT §Feature 25 | Asserts marking a product `"Out of Stock"` in admin displays "Out of Stock" / "Sold Out" badges and disables cart addition on storefront. |

### Tier 4: Real-World Luxury Shopping Workflow
| Test ID | Test Description | Requirements Covered | Assertions & Observable Behaviors |
|:---:|---|---|---|
| **T4.1** | Complete Concierge Shopping Journey | ORIGINAL_REQUEST §R1-R6<br>PROJECT §Milestones M1-M5 | End-to-end user workflow: Browse homepage -> inspect NAFDAC trust pillars -> open PDP -> inspect formulation specs & Radix UI Accordions -> add to cart -> proceed to checkout -> fill Nigerian details -> submit WhatsApp concierge order. |

---

## 3. Engineering & Quality Standards Compliance

- **Formatting**: Strictly hard tabs (`\t`) with an indentation width/size of 4 across all configuration and test files.
- **Type Safety**: Strictly typed TypeScript (`.ts`), zero usage of `any`.
- **Test Integrity**: Pure opaque-box test design without mocks or vacuous assertions.
- **Headless & UI Execution**: Fully configured for headless CI runs and interactive local debugging.

---

## 4. Execution Commands

```bash
# Install Chromium browser binary (one-time setup)
pnpm exec playwright install chromium

# Run all 13 E2E test cases
pnpm exec playwright test

# Run specific test tiers
pnpm exec playwright test -g "Tier 1"
pnpm exec playwright test -g "Tier 2"
pnpm exec playwright test -g "Tier 3"
pnpm exec playwright test -g "Tier 4"

# Interactive UI Mode
pnpm exec playwright test --ui

# Debugger Mode
pnpm exec playwright test --debug

# View HTML Test Report
pnpm exec playwright show-report
```
