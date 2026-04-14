# 🧺 Lather & Line — Laundry SaaS Platform

A full-stack **B2B SaaS laundry management platform** built with Spring Boot and React. Local laundry businesses can onboard as tenants and manage their orders, services, and customers through a dedicated Business Portal.

## ✨ Features

### Customer App
- Browse available laundry services
- Schedule pickup orders with date/time/address selection
- Track order status in real-time
- Live AI chatbot assistant

### Business Admin Portal
- Dedicated `/admin` dashboard for laundry business owners
- Overview of all orders, revenue, and pending pickups
- Isolated data — each business only sees their own orders

## 🏗️ Architecture

```
Lether-line/
├── backend/      # Spring Boot 3.2 + Hibernate 6 + PostgreSQL
├── frontend/     # React 18 + TypeScript + Vite + TailwindCSS
└── infra/        # Docker Compose (PostgreSQL)
```

### Multi-Tenancy
Uses Hibernate 6's `@TenantId` for shared-schema multi-tenancy. Every `User`, `Order`, `Address`, and `ServiceType` is scoped to a `business_id` automatically.

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
