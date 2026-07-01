# QR Code System Documentation

## Overview
The QR Code System in the Lather & Line application allows for seamless tracking and management of laundry orders. Each order generated via the system is assigned a unique public ID (UUID), which is embedded into a QR code.

## Flow
1. **Order Creation:** When a new order (online or Walk-in POS) is created, the system generates a unique `publicId`.
2. **QR Generation:** The frontend displays the QR Code for that specific order in the order details modal or print receipt view, utilizing the `qrcode.react` library.
3. **QR Scanning:** A user (Washer or Admin) with access to the scanning capability can scan the QR code to instantly pull up the corresponding order details and update its status (e.g., from `PENDING` to `IN_PROGRESS` or `READY`).

## Frontend Integration
- **Library Used:** `qrcode.react`
- **Location:** Integrated directly into the `OrderDetailsModal` or `ReceiptComponent`.
- **Data Encoded:** The full URL or the unique `publicId` of the order to ensure it directly deep-links to the order details page.

## Backend Integration
- The backend ensures that `publicId` is unique and unguessable (UUID v4) for secure tracking.
- The `OrderController` exposes a `GET /api/orders/{id}` endpoint which is queried when the QR code is scanned.

## Future Enhancements
- Provide a dedicated scanner UI using `html5-qrcode` directly in the Washer dashboard for mobile/tablet devices.
- Auto-print QR codes on thermal labels when an order is received.
