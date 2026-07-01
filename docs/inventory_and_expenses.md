# Inventory Tracking & Profitability

## Overview
Lather & Line includes a robust inventory and expense tracking system to help you understand your actual operating costs, COGS (Cost of Goods Sold), and true net profit margins.

## Features
- **Inventory Items:** Track detergents, hangers, packaging, and other supplies.
- **Service Requirements:** Map inventory items to specific services (e.g., 50ml detergent per KG of Wash & Fold).
- **Auto-Deduction:** When an order moves to the `IN_PROGRESS` state, the required inventory is automatically deducted from stock.
- **Cost of Goods Sold (COGS):** Calculates the exact cost of supplies used for each order.
- **Expense Logging:** Track fixed and variable operational expenses like rent, salaries, utilities, and marketing.
- **Real-Time Profitability Dashboard:** A financial overview widget on the admin dashboard that calculates gross revenue, COGS, operating expenses, and net profit margins in real-time.

## Workflows

### 1. Adding Inventory
Go to `Business Portal -> Inventory`. Add items like "Premium Liquid Detergent". Set the stock quantity, unit cost, and a low-stock threshold.

### 2. Linking Inventory to Services (Backend)
Inventory items are linked to `ServiceTypes` via `ServiceInventoryRequirements`. This dictates exactly what and how much gets deducted when a service is performed.

### 3. Fulfilling an Order
When staff scans an order bag and clicks **Start Washing**, the order status changes to `IN_PROGRESS`. The system automatically calculates the required materials based on the order items and deducts them from your stock levels. 

*(Note: The system allows stock to go negative to ensure operations are never blocked due to unlogged stock deliveries).*

### 4. Logging Expenses
Go to `Business Portal -> Expenses` to log day-to-day outlays. Categorize them appropriately (e.g., RESTOCK, RENT).

### 5. Reviewing Profitability
The main **Overview** dashboard features a "Financial Overview" widget detailing the current profit margins for your business based on the tracked metrics.
