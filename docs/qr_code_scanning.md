# QR Code Bag Tags & Scanning

## Overview
Lather & Line supports physical QR code bag tags. This allows staff members to generate a printable QR sticker for a laundry bag, which when scanned by any device camera, immediately routes the user to that specific order's details.

## Architecture & Implementation

### 1. Generating the QR Code
- We use the `qrcode.react` library to dynamically generate SVG-based QR codes in the browser.
- **Admin Order Details Page (`AdminOrderDetailsPage.tsx`)**: Contains a "Print QR Bag Tag" quick-action button.
- **Print View**: Clicking the button overlays a full-screen, print-optimized view containing the company name, order reference, the QR code, customer location, and total items. It automatically triggers `window.print()` and hides the web app's navigation elements.

### 2. Smart Routing (`ScanRouter.tsx`)
The QR code encodes a deep link in the format: `https://<domain>/scan/:publicId`.
When a user scans the QR code with their mobile device:
1. The device opens the link in the browser.
2. The `ScanRouter.tsx` component intercepts the request.
3. If the user is unauthenticated, they are redirected to `/login` with a `returnTo` parameter.
4. If authenticated, the router evaluates their role:
   - **Admin / Manager**: Redirected to `/admin/orders/:publicId`.
   - **Washer**: Redirected to `/washer/orders/:publicId`.
   - **Driver**: Redirected to `/driver/deliveries` (as drivers don't have detail pages yet).
   - **Customer**: Redirected to `/orders?orderId=:publicId`.

### 3. Washer Order Details View (`WasherOrderDetailsPage.tsx`)
Washers have a dedicated mobile-friendly page to view scanned orders:
- **Large Typography**: Easy to read item lists and quantities at a glance.
- **Special Instructions**: Highlighted in bright yellow to prevent mistakes.
- **Floating Action Button**: A large, thumb-friendly button at the bottom of the screen to quickly advance the order status (e.g., "Mark Picked Up", "Start Washing", "Mark Ready").

## Why This Approach?
Generating QR codes on the frontend is computationally cheap and avoids storing unnecessary image files on the backend. By relying on native device cameras to scan standard URL QR codes, we completely avoid the need to build and maintain custom camera-scanning logic within a mobile app or browser API.
