# Lather & Line: Application Documentation

Welcome to the comprehensive documentation for Lather & Line! This guide is designed to help you understand every aspect of the application, from its core architecture to its specific features.

Whether you're exploring the codebase to learn how it works, explaining the app to someone else, or preparing to add new features, these documents will serve as your complete reference guide.

## Feature Guides

We've broken down the application into logical feature areas. Click on any of the guides below to dive deep into how that specific part of the application works:

### 🏗️ Core Architecture
- **[Architecture & Multi-Tenancy](file:///c:/games/java%20code/Lether-line/docs/architecture_and_multi_tenancy.md)**: Learn about the tech stack and how the app supports multiple independent laundry businesses securely using a single shared database.

### 🔒 Security & Deployment
- **[Authentication & Security](file:///c:/games/java%20code/Lether-line/docs/authentication_and_security.md)**: Discover how the app keeps user data safe with JWTs, secure cookies, and role-based access control (RBAC).
- **[Payments, Deployment & Production Readiness](file:///c:/games/java%20code/Lether-line/docs/payments_and_hosting.md)**: Explore the Razorpay integration, Docker multi-stage builds, and Infrastructure-as-Code for Render.com.

### 📦 Order & Logistics
- **[Order Management & POS](file:///c:/games/java%20code/Lether-line/docs/order_management_and_pos.md)**: The heart of the app. Learn how online orders are processed and how the Walk-in Point of Sale (POS) system works.
- **[Driver Delivery System](file:///c:/games/java%20code/Lether-line/docs/driver_delivery_system.md)**: See how delivery drivers claim orders, navigate their routes, and update statuses on the go.
- **[QR Code Bag Tags & Scanning](file:///c:/games/java%20code/Lether-line/docs/qr_code_scanning.md)**: Learn how QR codes are used to track individual laundry bags throughout the cleaning process.
- **[Inventory & Expense Tracking](file:///c:/games/java%20code/Lether-line/docs/inventory_and_expenses.md)**: Manage your laundry supplies, track costs, and maintain stock levels efficiently.

### 📢 Communication & Engagement
- **[Real-time WebSockets & Notifications](file:///c:/games/java%20code/Lether-line/docs/realtime_and_notifications.md)**: Understand how the app updates screens instantly without refreshing, and how it sends automated Email and SMS updates to customers.
- **[AI Chatbot & Rate Limiting](file:///c:/games/java%20code/Lether-line/docs/ai_chatbot.md)**: Explore the built-in customer support chatbot and how we prevent abuse using rate limiting.

### 🎨 Frontend Experiences
- **[UI Polish & Frontend Architecture](file:///c:/games/java%20code/Lether-line/docs/ui_and_frontend_polish.md)**: Dive into the Progressive Web App (PWA) setup, Skeleton Loaders, Context-based Toast Notifications, and Code Splitting with Suspense.

### 📈 Business Management
- **[Marketing, Coupons & Subscriptions](file:///c:/games/java%20code/Lether-line/docs/marketing_and_subscriptions.md)**: Learn how the app handles recurring revenue models (subscriptions) and promotional discounts.
- **[Analytics & Dashboard](file:///c:/games/java%20code/Lether-line/docs/analytics_and_dashboard.md)**: See how raw data is transformed into beautiful, actionable charts for business owners.

---

### How to use these docs:
Each document is structured to answer four key questions:
1. **What does the feature do?** (The user experience)
2. **What problem does it solve?** (The business value)
3. **How is it implemented?** (The technical deep-dive)
4. **What can be learned from it?** (The educational takeaway)

Enjoy exploring the Lather & Line codebase!
