# Lather & Line — System Architecture Report
**Version:** 1.0.0-SNAPSHOT  
**Date:** April 2026  
**Repository:** [github.com/HimanshuNaik19/Lather-Line](https://github.com/HimanshuNaik19/Lather-Line)

---

## 1. Executive Summary

**Lather & Line** is a full-stack B2B SaaS laundry management platform that has been successfully built from a single-store application into a multi-tenant platform. Local laundry businesses can onboard as independent tenants, each with complete data isolation. The platform serves two distinct user types:

- **Customers** — Schedule pickups, track orders, and chat with an AI assistant
- **Business Owners (Admins)** — Manage their store's orders and services through a dedicated Business Portal

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Spring Boot | 3.2.4 |
| **ORM / Multi-tenancy** | Hibernate | 6.4.4 |
| **Database** | PostgreSQL | 16 (Docker) |
| **Security** | Spring Security + JWT | HS512 |
| **Password Hashing** | BCrypt | Spring Security built-in |
| **Frontend** | React + TypeScript | 18 / 5.x |
| **Build Tool** | Vite | 5.4 |
| **Styling** | TailwindCSS | 3.x |
| **HTTP Client** | Axios | Latest |
| **State Management** | React Context + TanStack Query | v5 |
| **Containerization** | Docker + Docker Compose | v2 |

---

## 3. Directory Structure

```
Lether-line/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/latherline/
│   │   ├── config/                 # Security, JWT, multi-tenancy
│   │   │   ├── JwtAuthFilter.java
│   │   │   ├── JwtUtil.java
│   │   │   ├── SecurityConfig.java
│   │   │   └── tenant/
│   │   │       ├── TenantContextHolder.java
│   │   │       └── TenantIdentifierResolver.java
│   │   ├── controller/             # REST API endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── BusinessController.java
│   │   │   ├── ChatController.java
│   │   │   ├── OrderController.java
│   │   │   └── ServiceTypeController.java
│   │   ├── dto/                    # Data Transfer Objects
│   │   │   ├── AuthDto.java
│   │   │   ├── ChatDto.java
│   │   │   └── OrderDto.java
│   │   ├── entity/                 # JPA Entities (database tables)
│   │   │   ├── Business.java
│   │   │   ├── User.java
│   │   │   ├── Order.java
│   │   │   ├── Address.java
│   │   │   └── ServiceType.java
│   │   ├── enums/
│   │   │   ├── OrderStatus.java
│   │   │   └── UserRole.java
│   │   ├── exception/              # Global error handling
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ConflictException.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   └── UnauthorizedException.java
│   │   ├── repository/             # Spring Data JPA repositories
│   │   │   ├── BusinessRepository.java
│   │   │   ├── UserRepository.java
│   │   │   ├── OrderRepository.java
│   │   │   ├── AddressRepository.java
│   │   │   └── ServiceTypeRepository.java
│   │   └── service/                # Business logic
│   │       ├── AuthService.java
│   │       ├── OrderService.java
│   │       └── ChatService.java
│   └── src/main/resources/
│       └── application.yml
│
├── frontend/                       # React application
│   └── src/
│       ├── api/                    # Axios API clients
│       │   ├── axiosClient.ts
│       │   ├── authApi.ts
│       │   ├── ordersApi.ts
│       │   ├── servicesApi.ts
│       │   └── chatApi.ts
│       ├── components/             # Shared UI components
│       │   ├── Navbar.tsx          # With user dropdown menu
│       │   ├── AdminLayout.tsx     # Business Portal sidebar layout
│       │   ├── Chatbot.tsx
│       │   └── StatusBadge.tsx
│       ├── hooks/                  # Custom React hooks
│       │   ├── useAuth.tsx         # Global auth context
│       │   ├── useOrders.ts
│       │   ├── useServices.ts
│       │   └── useBusinesses.ts
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── OrdersPage.tsx
│       │   ├── NewOrderPage.tsx
│       │   └── admin/
│       │       └── AdminDashboardPage.tsx
│       ├── types/index.ts          # TypeScript interfaces
│       └── main.tsx                # App router
│
└── infra/
    └── docker-compose.yml          # PostgreSQL container config
```

---

## 4. Database Schema

### 4.1 Entity Relationship

```
businesses
    id (PK)
    name, code (unique)
    contact_email, contact_phone
    active

users
    id (PK)
    business_id (FK → businesses.id) ← @TenantId
    email, password (bcrypt)
    full_name, phone
    role (CUSTOMER | WASHER | ADMIN)
    created_at

orders
    id (PK)
    business_id ← @TenantId
    user_id (FK → users.id)
    service_type_id (FK → service_types.id)
    address_id (FK → addresses.id)
    pickup_time, order_status
    total_amount, special_instructions
    created_at, updated_at

service_types
    id (PK)
    business_id ← @TenantId
    name, description
    price_per_unit
    active

addresses
    id (PK)
    business_id ← @TenantId
    user_id (FK → users.id)
    street, city, state, pin_code
    is_default
```

### 4.2 Order Status Lifecycle

```
PENDING → PICKED_UP → IN_PROGRESS → READY → DELIVERED
                                           ↘
                                          CANCELLED
```

### 4.3 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `CUSTOMER` | End customers | Create & view own orders |
| `WASHER` | Staff | Update order status |
| `ADMIN` | Business owner | View all orders, manage services |

---

## 5. Multi-Tenancy Architecture

### Strategy: Shared Database, Shared Schema with `@TenantId`

Every core entity (`User`, `Order`, `Address`, `ServiceType`) carries a `business_id` column annotated with Hibernate 6's `@TenantId`. Hibernate automatically appends `WHERE business_id = ?` to every query.

### How it works end-to-end:

```
1. Customer logs in
        ↓
2. AuthService verifies password, reads user.businessId from DB
        ↓
3. JWT minted with { "businessId": 1 } in claims
        ↓
4. JWT returned to React frontend, stored in localStorage
        ↓
5. Every subsequent request → Axios sends Authorization: Bearer <token>
        ↓
6. JwtAuthFilter reads token → extracts businessId claim
        ↓
7. TenantContextHolder.setTenantId(businessId) on the current thread
        ↓
8. Hibernate's TenantIdentifierResolver.resolveCurrentTenantIdentifier()
   reads the ThreadLocal → returns business_id
        ↓
9. ALL repository queries automatically scoped to that business
        ↓
10. JwtAuthFilter finally block → TenantContextHolder.clear()
```

### Key files:

| File | Responsibility |
|------|---------------|
| `TenantContextHolder.java` | ThreadLocal storage for active `businessId` |
| `TenantIdentifierResolver.java` | Plugs into Hibernate, reads ThreadLocal (defaults to `1L`) |
| `JwtAuthFilter.java` | Extracts `businessId` from JWT, sets ThreadLocal |
| `JwtUtil.java` | Mints and validates JWT HS512 tokens with `businessId` claim |

---

## 6. Security Architecture

### Authentication Flow

```
POST /api/auth/login { email, password }
        ↓
AuthService.login()
  → userRepository.findByEmail() (scoped to tenant 1 by default)
  → passwordEncoder.matches(raw, hashed)
  → jwtUtil.generateToken({ businessId }, userDetails)
        ↓
Response: { token, email, fullName, role }
        ↓
Frontend stores token in localStorage ("ll_token")
        ↓
All future requests: Authorization: Bearer <token>
```

### Public Endpoints (no JWT required)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/login` | Login |
| `POST /api/auth/register` | Register |
| `GET /api/businesses` | Store selector list |
| `GET /api/services` | Browse service types |
| `POST /api/chat` | AI chatbot |
| `GET /actuator/health` | Health check |

### JWT Configuration

- **Algorithm:** HS512
- **Expiry:** 24 hours (86,400,000 ms)
- **Claims:** `sub` (email), `businessId`, standard `iat`/`exp`
- **Secret:** Configurable via `JWT_SECRET` env var

---

## 7. REST API Reference

### Auth (`/api/auth`)

| Method | Path | Auth | Request Body | Response |
|--------|------|------|-------------|----------|
| `POST` | `/login` | Public | `{ email, password }` | `{ token, email, fullName, role }` |
| `POST` | `/register` | Public | `{ email, password, fullName, phone? }` | `{ token, email, fullName, role }` |

### Orders (`/api/orders`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/` | CUSTOMER | Create new order |
| `GET` | `/` | CUSTOMER, ADMIN | Get own orders |
| `GET` | `/all` | ADMIN only | Get ALL store orders |
| `GET` | `/{id}` | CUSTOMER, ADMIN, WASHER | Get single order |
| `PATCH` | `/{id}/status` | ADMIN, WASHER | Update order status |

**Create Order Request:**
```json
{
  "serviceTypeId": 1,
  "street": "101, MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pinCode": "560001",
  "pickupTime": "2026-04-25T09:00:00",
  "totalAmount": 150.00,
  "specialInstructions": "Separate whites"
}
```

### Services (`/api/services`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | Get all active service types |

### Businesses (`/api/businesses`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | Get all active businesses |

### Chat (`/api/chat`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/` | Public | Send message to AI chatbot |

---

## 8. Frontend Architecture

### Routing Structure

```
/                   → HomePage (public landing)
/login              → LoginPage
/register           → RegisterPage
/dashboard          → DashboardPage [CUSTOMER, protected]
/orders             → OrdersPage [CUSTOMER, protected]
/orders/new         → NewOrderPage [CUSTOMER, protected]
/admin              → AdminLayout (sidebar wrapper)
  /admin/dashboard  → AdminDashboardPage [ADMIN]
```

### Role-Based Routing

```typescript
// Login → automatic redirect based on role
if (role === 'ADMIN' || role === 'WASHER') → /admin/dashboard
else → /dashboard

// AdminLayout guard
if (!user || user.role !== 'ADMIN') → redirect to /dashboard
```

### Component Hierarchy

```
App (BrowserRouter)
├── GlobalUI
│   ├── Navbar (hidden on /admin/* routes)
│   └── Chatbot (hidden on /admin/* routes)
└── Routes
    ├── Public pages (Home, Login, Register)
    ├── Customer pages (Dashboard, Orders, NewOrder)
    └── AdminLayout (sidebar)
        └── AdminDashboardPage
```

### Navbar User Dropdown

When logged in, clicking the avatar opens a dropdown with:
- User info (name, email, role badge)
- **Business Portal** *(ADMIN/WASHER only)*
- Dashboard, My Orders, Account, Settings
- Sign Out

### State Management

| Concern | Solution |
|---------|----------|
| Auth (user, token) | React Context (`useAuth`) + localStorage |
| Server data (orders, services) | TanStack Query (caching, refetch) |
| Local UI state | `useState` |

### Axios Interceptors

**Request:** Automatically attaches `Authorization: Bearer <token>` from localStorage  
**Response:** On `401` → clears localStorage and redirects to `/login`

---

## 9. Infrastructure

### Docker Compose (PostgreSQL)

```yaml
# infra/docker-compose.yml
postgres:
  image: postgres:16
  port: 5432
  database: latherline_db
  user: latherline
  password: latherline_pass
  volume: postgres_data (persistent)
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `latherline_db` | Database name |
| `DB_USER` | `latherline` | DB username |
| `DB_PASSWORD` | `latherline_pass` | DB password |
| `JWT_SECRET` | `lather-and-line-super-secret...` | JWT signing key |

---

## 10. Running the Application

```bash
# 1. Start Database
cd infra && docker-compose up -d postgres

# 2. Start Backend (port 8080)
cd backend && ./mvnw spring-boot:run

# 3. Start Frontend (port 3000)
cd frontend && npm run dev
```

### Seed Data (already in DB)

| Business | Admin Email | Password |
|----------|-------------|----------|
| Sunshine Laundry (id=1) | admin@sunshine.com | admin123 |
| Moonlight Cleaners (id=2) | admin@moonclean.com | admin123 |

---

## 11. Known Gaps & Future Improvements

| Area | Current State | Recommended Enhancement |
|------|--------------|------------------------|
| **Account Page** | Route exists in dropdown, page not built | Build profile edit page |
| **Settings Page** | Route exists in dropdown, page not built | Notification prefs, password change |
| **Service Management** | Read-only via API | Admin UI to add/edit service types |
| **Order Notifications** | None | WebSocket push or email/SMS alerts |
| **Payment** | Not implemented | Integrate Razorpay/Stripe |
| **Multi-tenant onboarding** | Manual DB seed only | Self-service business registration |
| **Database migrations** | Hibernate `ddl-auto: update` | Replace with Flyway for production safety |
| **Production deployment** | Local only | Dockerize backend, deploy to cloud VM |
| **AI Chatbot** | Basic implementation | Improve prompting, add order-context awareness |
| **Testing** | Minimal | Add unit tests for services, integration tests for APIs |

---

## 12. GitHub Repository

**URL:** https://github.com/HimanshuNaik19/Lather-Line  
**Branch:** `main`  
**Commit:** Initial commit — 80 files, 9,478 insertions  
**Last pushed:** April 14, 2026
