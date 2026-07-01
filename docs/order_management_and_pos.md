# Order Management & Walk-in POS 📦🛍️

This document details the architecture, features, and implementation of the Order Management system and the Walk-in Point of Sale (POS) interface in Lather & Line.

## 1. What the Feature Does 🚀

- **Online Order Creation:** Customers can build multi-item laundry orders by selecting services (e.g., Wash & Fold, Dry Cleaning), specifying exact quantities (in Kg or Pieces), and adding optional labels to piece items (e.g., "Saree", "White Shirt"). They then choose a pickup address, schedule a pickup date/time, and can optionally apply a promo/coupon code before placing the order.
- **Walk-in POS (Point of Sale):** A fast, dedicated interface for Admins, Managers, and Washers to create orders for in-store walk-in customers. Staff can enter the customer's phone and name on the left, use a quick-search service grid to build the cart on the right, dynamically adjust quantities, add specific item labels, and apply optional notes.
- **Order Lifecycle & Tracking:** Both online and walk-in orders support real-time status tracking via a defined lifecycle (`PENDING` -> `PICKED_UP` -> `IN_PROGRESS` -> `READY` -> `OUT_FOR_DELIVERY` -> `DELIVERED` | `CANCELLED`), driver assignment, real-time WebSocket updates, and automatic coupon code parsing.
- **Auto-Registration:** Walk-in customers are frictionlessly auto-registered in the background so they can track their orders and participate in loyalty or subscription plans later.

## 2. What Problem it Solves 🎯

- **Frictionless In-Store Operations:** Replaces pen-and-paper or disjointed registers with an integrated Point of Sale. Rapid entry means fewer queues and zero manual calculation errors.
- **Unified Inventory and Pricing:** Both online customers and walk-in staff draw from the same dynamic `ServiceType` catalog. Changing a price or adding a new service updates both the POS and the online storefront instantly.
- **Complex Multi-item Orders:** Overcomes the limitation of "one service per order." Customers can mix weight-based (Kg) and piece-based items in a single cart.
- **Seamless Subscriptions & Coupons:** Resolves the complexity of applying subscription balances and max-discount coupons dynamically against a varied cart.

## 3. How it's Implemented 🛠️

### Entities & Architecture
- **`Order.java`:** The core entity. Uses a `UUID publicId` for secure, unguessable URL routes and API references instead of exposing internal sequential primary keys. It tracks the status, driver assignments, and totals.
- **`OrderItem.java`:** Represents a single line item. Crucially, it snapshots the `unitPrice` and `subtotal` at the time of order creation. This prevents historical orders from altering their totals when a service's price changes in the future.
- **`OrderStatus.java`:** Enum tracking the strict lifecycle of an order.

### Backend Flow (`OrderService.java`)
- **`createOrder` (Online):** Resolves the user, creates a new `Address` record for pickup, builds the order, processes items via `buildItems()`, calculates subtotal, applies `Coupon` logic (checking expiration, active status, max discount limits), and saves the order. Emits a WebSocket notification on `/topic/tenant/{id}/orders` and assigns the order to the business tenant.
- **`createPosOrder` (Walk-in):** Optimized for speed. Checks if a user exists by phone number. If not, it auto-creates a user with a placeholder email (`{phone}.b{tenantId}@walkin.local`) and a random encoded password. It assigns a dummy "Walk-in POS" address to bypass the pickup step.
- **`buildItems()` logic:** Iterates over the requested items. It checks if the user has an active `UserSubscription`. If so, it dynamically deducts available Kg/Pieces quotas from the subscription balance before charging the remainder at the service's `pricePerUnit`. It calculates exact subtotals based on proportional math.

### Frontend Flow
- **POS UI (`POSPage.tsx`):** Split-screen design built for rapid entry. The left side handles customer lookup/creation and a searchable grid of services. The right side is a sticky cart allowing precise quantity inputs (e.g., `0.5` kg steps or exact float values) and text labels for `PIECE` items.
- **Online Order UI (`NewOrderPage.tsx`):** A multi-step wizard (Items -> Address/Schedule) that includes inline coupon validation (`useValidateCoupon`) and estimated total rendering.
- Uses `useMemo` for highly responsive, client-side subtotal and discount calculations before submission.

## 4. What was Learned from Building It 💡

- **Snapshotting Prices is Crucial:** Early iterations might link directly to the service price, but snapshotting `unitPrice` in `OrderItem` is strictly required for financial auditing and historical accuracy. If prices change tomorrow, yesterday's receipts must remain untouched.
- **Subscription Math Complexity:** Calculating partial subscription coverage (e.g., a user has 1.5kg left but orders 3.0kg) requires careful math to ensure only the excess is charged, and updating the remaining quota transactionally.
- **Auto-Registration UX:** Creating dummy emails for walk-in customers elegantly solves the database constraint of requiring a `User` entity for every `Order`, while keeping the POS interface lightning fast (no tedious signup forms for the staff to fill).
- **Client vs Server Validation:** The frontend calculates totals for instantaneous UI feedback, but the backend *recalculates* everything from scratch (prices, coupons, subscription deductions) to ensure security and data consistency.

## 5. Key Files Involved 📂

- [OrderStatus.java](file:///c:/games/java%20code/Lether-line/backend/src/main/java/com/latherline/enums/OrderStatus.java) - Order lifecycle definitions.
- [Order.java](file:///c:/games/java%20code/Lether-line/backend/src/main/java/com/latherline/entity/Order.java) - Core order entity schema.
- [OrderItem.java](file:///c:/games/java%20code/Lether-line/backend/src/main/java/com/latherline/entity/OrderItem.java) - Individual items within a cart, handling price snapshotting.
- [OrderService.java](file:///c:/games/java%20code/Lether-line/backend/src/main/java/com/latherline/service/OrderService.java) - Contains the complex logic for `createOrder`, `createPosOrder`, and `buildItems`.
- [NewOrderPage.tsx](file:///c:/games/java%20code/Lether-line/frontend/src/pages/NewOrderPage.tsx) - The customer-facing multi-step order wizard.
- [POSPage.tsx](file:///c:/games/java%20code/Lether-line/frontend/src/pages/admin/POSPage.tsx) - The rapid-entry Point of Sale interface for staff.
