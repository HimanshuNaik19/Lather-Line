# 🧺 Lather & Line — Laundry SaaS Platform

A full-stack **B2B SaaS laundry management platform** built with Spring Boot and React. Local laundry businesses can onboard as tenants and manage their orders, services, and customers through a dedicated Business Portal.

## ✨ Features

### Customer App
- **Progressive Web App (PWA):** Installable on mobile devices with native-like experience.
- Browse available laundry services
- Schedule pickup orders with date/time/address selection
- **Real-Time Tracking:** Powered by WebSockets, see when drivers pickup or washers clean your clothes.
- **Online Payments:** Secure checkout via Razorpay integration.
- Live AI chatbot assistant

### Business Portals (Multi-Tenant)
- **Admin Dashboard:** Full financial overview, marketing tools, and inventory management.
- **Manager Dashboard:** Day-to-day operations and POS system.
- **Washer Portal:** Interface for facility workers to update item statuses (e.g. IN_WASH).
- **Driver Portal:** Interface for delivery personnel to track pickups and dropoffs.
- **Isolated Data:** Each business (tenant) only sees their own orders via Hibernate `@TenantId`.

## 🏗️ Architecture

```
Lether-line/
├── backend/      # Java 21, Spring Boot 3.2, Hibernate 6, WebSockets (STOMP)
├── frontend/     # React 18, TypeScript, Vite, Tailwind CSS, PWA, Razorpay
└── infra/        # Docker Compose (PostgreSQL)
```

### Multi-Tenancy
Uses Hibernate 6's `@TenantId` for shared-schema multi-tenancy. Every `User`, `Order`, `Address`, and `ServiceType` is scoped to a `business_id` automatically. When users register, they use a specific store's "Invite Code" to securely bind to that tenant.

> **Want to learn how this works?** Check out the `learning_guide.md` and `interview_and_hosting_guide.md` artifacts generated in this project for deep dives into WebSockets, Role-Based Access Control, and Deployment.

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- Docker Desktop

### 1. Start the database
```bash
cd infra
docker-compose up -d postgres
```

### 2. Start the backend
```bash
cd backend
./mvnw spring-boot:run
```

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sunshine.com | admin123 |
| Customer | Register via UI | — |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Hibernate 6, Spring Security, JWT |
| Database | PostgreSQL 16 (Docker) |
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Auth | JWT (HS512), BCrypt password hashing |
| Multi-tenancy | Hibernate `@TenantId`, ThreadLocal context |

## 📡 Key API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register new customer |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/services` | Public | List available services |
| GET | `/api/businesses` | Public | List active businesses |
| POST | `/api/orders` | Customer | Create new order |
| GET | `/api/orders` | Customer | My orders |
| GET | `/api/orders/all` | Admin | All store orders |
| PATCH | `/api/orders/{id}/status` | Admin | Update order status |
| POST | `/api/chat` | Public | AI chatbot |
