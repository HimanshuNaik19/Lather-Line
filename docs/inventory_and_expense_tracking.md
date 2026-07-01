# Inventory and Expense Tracking Documentation

## Overview
Lather & Line includes robust administrative features to manage day-to-day operations seamlessly: Inventory Tracking and Expense Tracking. These features ensure that stock levels are maintained and profitability can be calculated in real-time.

## Inventory Tracking
- **Purpose:** Track essential laundry supplies such as detergent, hangers, and covers.
- **Auto-deduction:** The system is designed to allow stock to be auto-deducted based on order volume. When an order is completed, the respective inventory items (like detergent used per kg, or covers used per garment) decrease.
- **Admin Management:** Administrators can manually adjust stock levels, add new inventory item types, and monitor low-stock thresholds from the Admin Dashboard.
- **Key Entity:** `InventoryItem` (tracks name, current quantity, threshold, unit of measurement).

## Expense Tracking & Profitability
- **Purpose:** Log daily operational expenses (e.g., electricity, maintenance, employee salaries, stock purchases).
- **Logging Expenses:** Administrators and Managers can log an expense amount, category, and date through the Expenses portal.
- **Profitability Calculation:** The Dashboard calculates real-time profit margins by aggregating all paid orders (`PaymentStatus.PAID`) minus the total logged expenses within a given date range.
- **Key Entity:** `Expense` (tracks description, amount, date, and business affiliation).

## API Endpoints
- `GET /api/inventory`: Retrieve all inventory items.
- `POST /api/inventory`: Add or update an inventory item.
- `GET /api/expenses`: Retrieve logged expenses.
- `POST /api/expenses`: Log a new expense.
- `GET /api/analytics/profitability`: Get the net revenue vs expenses for the profitability metrics.
