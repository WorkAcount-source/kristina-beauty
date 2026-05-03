# Kristina Beauty — Project Guide

> A complete map of the codebase for someone new to the project.
> Read this top to bottom once, then use it as a reference.

---

## What is this project?

A **beauty salon web app** built with Next.js. It has:

- A **public website** — homepage, services, shop, booking, courses
- A **customer dashboard** — view your orders, bookings, enrollments
- An **admin dashboard** — manage everything (users, products, bookings, etc.)
- A **payment system** via Stripe
- A **booking system** with calendar integration

---

## The Tech Stack (what tools we use and why)

| Tool | What it does | Why we use it |
|---|---|---|
| **Next.js 15** | The main framework. Handles pages, routing, and API routes | Full-stack React framework — one repo for frontend + backend |
| **React 19** | UI library | Building interactive user interfaces |
| **Supabase** | Database + Auth + Storage | Postgres database with built-in authentication and file storage |
| **Stripe** | Payments | Processing credit card payments securely |
| **Tailwind CSS** | Styling | Utility-first CSS, fast to write |
| **Zod** | Input validation | Validates that data has the right shape before we process it |
| **Zustand** | Client-side state | Stores the shopping cart in the browser |
| **React Query** | Server data fetching | Caches and manages data from the server |
| **TypeScript** | Type safety | Catches bugs at compile time, not at runtime |

---

## Folder Structure — The Big Picture

```
kristina-beauty/
│
├── app/                  ← Pages and API routes (Next.js App Router)
├── components/           ← Reusable UI pieces
├── modules/              ← Business logic, organized by feature
├── lib/                  ← Shared infrastructure (DB client, Stripe, utilities)
├── middleware/           ← Auth helpers for API routes
├── middleware.ts         ← Next.js request interceptor (runs on every request)
├── types/                ← TypeScript type definitions
├── supabase/             ← Database migrations and seed data
├── public/               ← Static files (images, videos)
└── docs/                 ← This file and other documentation
```

The key idea: **feature logic lives in `modules/`, infrastructure lives in `lib/`, and `app/` just wires them together.**

---

## `app/` — Pages and API Routes

This is the Next.js App Router. Every folder here maps to a URL.

```
app/
├── (public)/             ← Public pages (no login required)
│   ├── page.tsx          → /               (homepage)
│   ├── booking/          → /booking        (book an appointment)
│   ├── shop/             → /shop           (buy products)
│   ├── courses/          → /courses        (online courses)
│   ├── services/         → /services       (view services)
│   ├── cart/             → /cart
│   └── checkout/         → /checkout
│
├── (auth)/               ← Login / Register pages
│   └── auth/
│       ├── login/        → /auth/login
│       └── register/     → /auth/register
│
├── account/              → /account        (customer dashboard, login required)
│
├── admin/                → /admin/*        (admin dashboard, admin role required)
│   ├── bookings/         → /admin/bookings
│   ├── products/         → /admin/products
│   ├── orders/           → /admin/orders
│   ├── users/            → /admin/users
│   ├── calendar/         → /admin/calendar
│   └── ...               (many more admin pages)
│
├── api/                  ← API routes (server-side endpoints)
│   ├── admin/users/      → POST/GET/PATCH/DELETE /api/admin/users
│   ├── checkout/         → POST /api/checkout
│   ├── stripe/webhook/   → POST /api/stripe/webhook
│   └── calendar/feed/    → GET  /api/calendar/feed/[token]
│
└── auth/callback/        ← OAuth callback after Google login
```

### What is `(public)` and `(auth)`?

The parentheses `()` create **route groups** — they organize pages into folders without affecting the URL. `/app/(public)/booking/page.tsx` still maps to `/booking`, not `/public/booking`. It's just for code organization.

### What's inside an API route file?

After the refactor, API route files are **thin** — they just re-export the handler from the matching module:

```typescript
// app/api/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export { handleCheckout as POST } from "@/modules/payments/payments.controller";
//       ↑ The real logic lives in modules/, not here
```

---

## `modules/` — Business Logic by Feature

This is the heart of the backend. Each folder is a **domain** (a feature area). Every domain has the same 4 files:

```
modules/
├── payments/
│   ├── payments.schema.ts      ← Zod validation: what shape is valid input?
│   ├── payments.repository.ts  ← Database: read/write orders and products
│   ├── payments.service.ts     ← Business logic: the actual rules
│   └── payments.controller.ts  ← HTTP layer: parse request → call service → return response
│
├── users/
│   ├── users.schema.ts
│   ├── users.repository.ts
│   ├── users.service.ts
│   └── users.controller.ts
│
└── calendar/
    ├── calendar.repository.ts
    ├── calendar.service.ts
    └── calendar.controller.ts
```

### The 4 layers explained

Think of it like an assembly line. A request enters at the controller and travels down:

```
HTTP Request
     ↓
┌─────────────────────────────────────────────────────┐
│  CONTROLLER  (*.controller.ts)                       │
│  "What did the client send?"                         │
│  → Parse the request body                            │
│  → Validate it with Zod                              │
│  → Call the service                                  │
│  → Return the HTTP response                          │
└─────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────┐
│  SERVICE  (*.service.ts)                             │
│  "What are the business rules?"                      │
│  → Check stock availability                          │
│  → Enforce "can't delete yourself" rule              │
│  → Orchestrate multiple repository calls             │
│  → Throw domain errors (ValidationError, etc.)       │
└─────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────┐
│  REPOSITORY  (*.repository.ts)                       │
│  "How do I talk to the database?"                    │
│  → All Supabase queries live here                    │
│  → Returns raw data, throws on DB error              │
│  → No business logic here — just data access         │
└─────────────────────────────────────────────────────┘
     ↓
  Supabase (Postgres database)
```

### Why this separation?

- **Easy to test**: you can test the service without touching the database
- **Easy to change**: if you switch from Supabase to another DB, you only edit repository files
- **Easy to read**: when you open a file you immediately know what it does

### Schema files (*.schema.ts)

These define what valid input looks like using [Zod](https://zod.dev):

```typescript
// payments.schema.ts
export const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),  // must be a UUID
    qty: z.number().int().positive().max(99),
  })).min(1),
  customer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    // ...
  }),
});
```

If someone sends `qty: -5`, Zod rejects it before we ever touch the database.

---

## `lib/` — Shared Infrastructure

Things that are used across the whole project, not specific to one feature.

```
lib/
├── db/
│   └── index.ts          ← One place to import Supabase clients
│                            (re-exports from lib/supabase/server)
│
├── stripe/
│   └── client.ts         ← The Stripe instance (null if no API key set)
│
├── utils/
│   ├── errors.ts         ← Custom error classes (UnauthorizedError, etc.)
│   └── response.ts       ← Helper functions: ok(), handleError()
│
├── supabase/
│   ├── client.ts         ← Supabase client for the browser
│   ├── server.ts         ← Supabase clients for the server
│   ├── public.ts         ← Supabase client without a session (public queries)
│   └── middleware.ts     ← Session refresh + route protection logic
│
├── store/
│   └── cart.ts           ← Zustand store: shopping cart state in the browser
│
├── admin/
│   └── upload.ts         ← File upload helper (images/videos to Supabase Storage)
│
├── utils.ts              ← General helpers: cn(), formatPrice(), formatDate()
└── safe-redirect.ts      ← Prevents open-redirect attacks
```

### Two types of Supabase clients

This is important to understand:

| Client | File | Key used | Access level |
|---|---|---|---|
| `createClient()` | `lib/supabase/server.ts` | anon key | Respects RLS — user sees only their own data |
| `createServiceClient()` | `lib/supabase/server.ts` | service_role key | Bypasses RLS — sees everything |

**Rule**: Use `createClient()` everywhere. Only use `createServiceClient()` in places that need admin-level DB access (like creating an order, or the admin user management panel).

### The error system (`lib/utils/errors.ts`)

Instead of throwing random errors, we throw typed errors:

```typescript
throw new UnauthorizedError()  // → 401 response
throw new ForbiddenError()     // → 403 response
throw new ValidationError("מוצר לא זמין")  // → 400 response
throw new ConflictError("אזל המלאי")        // → 409 response
```

The `handleError()` function in controllers catches these and converts them to the right HTTP response automatically.

---

## `middleware/auth.ts` — Auth Helpers for API Routes

```typescript
// Three exported functions:
getAuthUser()   // Returns the logged-in user or null
requireAuth()   // Returns the user or throws UnauthorizedError (401)
requireAdmin()  // Returns the user or throws ForbiddenError (403) if not admin
```

Usage in a controller:

```typescript
const user = await requireAuth();    // throws if not logged in
const admin = await requireAdmin();  // throws if not admin
```

---

## `middleware.ts` (root) — The Request Interceptor

This file runs on **every single request** before it reaches a page or API route. It's like a security guard at the front door.

```
User visits /admin/bookings
      ↓
middleware.ts runs
      ↓
Does the request have an auth cookie? → No → Redirect to /auth/login
      ↓ Yes
Is the session still valid?          → No → Redirect to /auth/login
      ↓ Yes
Is the user's role = "admin"?        → No → Redirect to /
      ↓ Yes
Allow the request through → /admin/bookings loads
```

**What it protects:**

| Routes | Protection |
|---|---|
| `/account/*`, `/booking/*`, `/checkout/*` | Must be logged in |
| `/admin/*` | Must be logged in AND have `role = "admin"` |
| `/auth/*`, `/api/stripe/webhook` | Always bypassed (no auth needed) |

---

## `types/db.ts` — TypeScript Types

This file defines the TypeScript shape of every database table. For example:

```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number | null;
  active: boolean;
  // ...
}
```

These types are imported all over the codebase so TypeScript can catch bugs like accessing a field that doesn't exist on a product.

---

## `supabase/` — Database Migrations

```
supabase/
├── migrations/
│   ├── 20260101000000_init.sql             ← Full schema: all tables, RLS, functions
│   ├── 20260430000000_security_hardening.sql
│   ├── 20260501000000_admin_foundation.sql  ← Audit logs, storage buckets
│   └── 20260502000000_audit_actor_fallback.sql
└── seed.sql                                 ← Demo data for development
```

Migrations run in order (sorted by timestamp). **Never edit an existing migration** — always create a new one.

### What is RLS?

Row Level Security is a Postgres feature. It means the database itself enforces who can see what data — not just your application code.

Example rule: *"A user can only read their own orders."*
This means even if there's a bug in the app code, a user can never accidentally see another user's orders.

---

## `components/` — Reusable UI

```
components/
├── ui/              ← Base UI primitives (Button, Card, Input, Badge)
│                      These are from shadcn/ui — unstyled, highly composable
├── sections/        ← Homepage sections (Hero, Gallery, Instagram feed)
├── admin/           ← Admin-specific components (data tables, media upload)
├── booking/         ← Multi-step booking flow component
├── layout/          ← Navbar, Footer
└── auth/            ← Google Sign-In button
```

---

## How a Request Flows — Real Example

**Scenario:** A logged-in customer submits the checkout form.

```
1. Browser
   POST /api/checkout  { items: [...], customer: {...} }

2. middleware.ts (root)
   → Has auth cookie? Yes → refresh session → allow through

3. app/api/checkout/route.ts
   → exports { handleCheckout as POST }
   → delegates to modules/payments/payments.controller.ts

4. payments.controller.ts
   → requireAuth()          ← confirms user is logged in
   → checkoutSchema.parse() ← validates the request body with Zod
   → createCheckoutSession(data, user.id)  ← calls the service

5. payments.service.ts
   → dedupeItems()                  ← merge duplicate cart items
   → fetchActiveProducts(ids)       ← calls repository
   → stock check                    ← business rule: throw if out of stock
   → createOrder(...)               ← calls repository
   → createOrderItems(...)          ← calls repository
   → stripe.checkout.sessions.create(...)  ← call Stripe API
   → return { url, orderId }

6. payments.repository.ts
   → supabase.from("products").select(...)  ← actual DB query
   → supabase.from("orders").insert(...)    ← actual DB write

7. Response flows back up the chain
   → controller returns NextResponse.json({ url, orderId })

8. Browser
   → redirects to Stripe checkout page
```

---

## How Auth Works — The Full Flow

### Sign in with Google

```
1. User clicks "Sign in with Google"
2. Supabase redirects to Google OAuth
3. Google redirects back to /auth/callback?code=xyz
4. app/auth/callback/route.ts:
   → exchanges the code for a session
   → Supabase sets an HTTP-only cookie with the session
5. User is redirected to /account
6. Every future request carries the cookie
7. middleware.ts reads the cookie → user is authenticated
```

### Session refresh

Supabase sessions expire. `middleware.ts` automatically refreshes them on every request that carries an auth cookie, so users never get randomly logged out.

---

## Adding a New Feature — The Pattern

Say you want to add a `reviews` feature (customers can leave reviews for services).

**1. Create the module folder:**
```
modules/reviews/
  reviews.schema.ts      ← Zod schema for creating a review
  reviews.repository.ts  ← DB queries (insert review, list reviews)
  reviews.service.ts     ← Business rules (max one review per booking, etc.)
  reviews.controller.ts  ← HTTP handler
```

**2. Create the API route:**
```typescript
// app/api/reviews/route.ts
export { handleCreateReview as POST } from "@/modules/reviews/reviews.controller";
```

**3. Write the controller (thin):**
```typescript
export async function handleCreateReview(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
    const result = await submitReview(parsed.data, user.id);
    return ok(result);
  } catch (err) {
    return handleError(err, "/api/reviews");
  }
}
```

**4. Add a DB migration:**
```sql
-- supabase/migrations/20260503000000_add_reviews.sql
CREATE TABLE reviews ( ... );
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
```

That's the full pattern. Every new backend feature follows the same structure.

---

## Environment Variables

```
.env.local
│
├── NEXT_PUBLIC_SUPABASE_URL        ← Supabase project URL (safe to expose)
├── NEXT_PUBLIC_SUPABASE_ANON_KEY   ← Supabase anon key (safe to expose, RLS enforces security)
├── SUPABASE_SERVICE_ROLE_KEY       ← Service role key — NEVER expose, bypasses RLS
│
├── STRIPE_SECRET_KEY               ← Stripe server key — NEVER expose
├── STRIPE_WEBHOOK_SECRET           ← Verifies that webhooks are really from Stripe
│
├── NEXT_PUBLIC_SITE_URL            ← Your domain (used in Stripe redirect URLs)
└── CALENDAR_FEED_TOKEN             ← Secret in the iCal feed URL
```

**Rule:** Anything starting with `NEXT_PUBLIC_` is visible to the browser. Everything else is server-only. Never put secrets in `NEXT_PUBLIC_` variables.

---

## Key Concepts Glossary

| Term | What it means |
|---|---|
| **App Router** | Next.js 15 routing system. Files in `app/` become pages/routes automatically |
| **Server Component** | A React component that runs on the server, never in the browser. Can access DB directly |
| **Client Component** | A React component that runs in the browser. Needs `"use client"` at top of file |
| **API Route** | A server-side function that handles HTTP requests. Lives in `app/api/` |
| **RLS** | Row Level Security — Postgres enforces data access rules at the DB level |
| **Zod** | A library that validates data shapes at runtime |
| **Middleware** | Code that runs before every request. Used for auth checks, session refresh |
| **Service role** | A Supabase key that bypasses RLS. Only use server-side for admin operations |
| **Webhook** | Stripe calls your `/api/stripe/webhook` endpoint when a payment completes |
| **Migration** | A SQL file that modifies the database schema. Run once, never edit |
| **Repository** | The layer that talks to the database. No business logic, just queries |
