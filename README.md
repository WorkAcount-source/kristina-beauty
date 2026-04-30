# Kristina Place Of Beauty 💅✨

A modern, elegant Hebrew (RTL) beauty salon website with full-stack capabilities — booking system, e-commerce shop, online courses, portfolio gallery, and admin dashboard.

Built with **Next.js 15**, **Supabase**, **Tailwind CSS**, **Framer Motion**, and **Stripe**.

---

## ✨ Features

- 🏠 **Home page** — hero, animated portfolio carousel, services, Instagram feed, featured shop & courses, contact form
- 📅 **Booking system** — multi-step flow with calendar, time slots, real-time availability checks
- 🛍️ **Shop** — product grid, product details, cart with persisted state, Stripe checkout
- 🎓 **Courses** — listing, details, enrollment (paid + free)
- 🖼️ **Portfolio gallery** — masonry layout
- 🔐 **Auth** — email/password login & registration via Supabase
- 👤 **Customer account** — view bookings, orders, course enrollments
- ⚙️ **Admin dashboard** — full CRUD for products, services, courses, portfolio; view bookings, orders, contact messages
- 📱 Fully responsive, RTL-first, accessible
- 🎨 Beautiful rose/luxe gradient design with smooth animations

---

## 🛠️ Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, RSC) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS + custom design system |
| Animations | Framer Motion + Embla Carousel |
| Database | Supabase Postgres |
| Auth | Supabase Auth |
| Storage | Supabase Storage (for uploaded images) |
| State | Zustand (cart) + TanStack Query |
| Forms | React Hook Form + Zod |
| Payments | Stripe |
| Notifications | Sonner |
| Icons | Lucide |
| Fonts | Heebo (Hebrew) + Playfair Display |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
pnpm install
# or: npm install / yarn
```

### 2. Set up Supabase

1. Create a new project at https://supabase.com
2. In **SQL Editor**, run the migration file:
   ```
   supabase/migrations/20260101000000_init.sql
   ```
3. Run the seed file (optional, for demo data):
   ```
   supabase/seed.sql
   ```

### 3. Configure environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project (Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side mutations bypassing RLS)
- Stripe keys (optional — checkout will work in mock mode without them)

### 4. Create your first admin user

After registering through the UI, run this in Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where id = '<YOUR_USER_ID>';
```

### 5. Run

```bash
pnpm dev
```

Open http://localhost:3000

---

## 📁 Structure

```
app/
  (public)/          # All public-facing pages
  (auth)/            # Login & register
  account/           # Customer dashboard
  admin/             # Admin dashboard (role-protected)
  api/               # Stripe checkout + webhook
components/
  ui/                # Button, Card, Input primitives
  sections/          # Hero, Gallery, Instagram, Contact
  booking/           # Multi-step booking flow
  admin/             # Admin CRUD generic component
lib/
  supabase/          # Browser + server clients, middleware helper
  store/             # Zustand cart store
  utils.ts           # formatPrice, formatDate, cn, etc.
  stripe.ts
supabase/
  migrations/        # Schema + RLS policies
  seed.sql           # Demo data
types/
  db.ts              # TypeScript types matching DB
```

---

## 🔒 Security

- Row Level Security (RLS) enabled on every table
- Customers can only see/edit their own bookings, orders, enrollments
- Admin role checked server-side for `/admin` routes
- Stripe price validation server-side (cart prices never trusted from client)
- Service-role key only used server-side for order creation

---

## 🚢 Deployment

Recommended: **Vercel** + **Supabase Cloud**

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

For Stripe webhooks, set the endpoint URL to:
```
https://your-domain.com/api/stripe/webhook
```

---

## 📞 Original Inspiration

Inspired by [Kristina Place Of Beauty](https://kristina-place-of-beauty-e8aaae29.base44.app/) — קיבוץ גניגר.
