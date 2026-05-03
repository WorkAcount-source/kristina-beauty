# Admin Upgrade — Apply Migration

## What was added

- **Storage buckets** `media-images` (5MB) and `media-videos` (50MB), public read, admin-only write
- **`updated_at`** column + trigger on every editable table
- **`audit_logs`** table + trigger that records every insert/update/delete done by an admin
- **`courses.video_url`** column (for embed links — YouTube / Vimeo / Mux / Cloudinary)
- **`contact_messages.read_at` / `archived_at`** columns + admin RLS for update/delete
- New indexes: `bookings_start_at_idx`, `orders_created_at_idx`

## How to apply (one of)

### Option A — Supabase CLI

```powershell
supabase db push
```

### Option B — SQL Editor (fastest)

1. Open https://supabase.com/dashboard/project/vujglejiijtgooojklff/sql/new
2. Paste the entire contents of `supabase/migrations/20260501000000_admin_foundation.sql`
3. Run

## Required environment variable

`SUPABASE_SERVICE_ROLE_KEY` is already in `.env.local` and **must also be set in Vercel**:

> Vercel → Project → Settings → Environment Variables → add `SUPABASE_SERVICE_ROLE_KEY`
> (Value = the same `service_role` JWT from the Supabase API settings page.)

Without it, `/admin/users` will not load (the API route returns 500).

## What admins can now do

| Page | Capability |
| --- | --- |
| `/admin` | KPIs (revenue, today's bookings, pending, unread messages), low-stock alerts, recent activity feed |
| `/admin/bookings` | Full CRUD with status select, datetime fields, search |
| `/admin/orders` | Status changes (pending → paid → shipped → delivered, refund) |
| `/admin/messages` | Inbox / archive split, mark-as-read, reply via mailto, delete |
| `/admin/services` | CRUD + image upload + category select |
| `/admin/categories` | Service categories CRUD |
| `/admin/products` | CRUD + image upload + low-stock visibility |
| `/admin/courses` | CRUD + image upload + **video_url** field for long videos (YouTube / Vimeo / Mux URL) |
| `/admin/portfolio` | CRUD + image upload |
| `/admin/instagram` | Feed CRUD with thumbnail upload |
| `/admin/enrollments` | View & change status |
| `/admin/hours` | Per-weekday open/close + closed flag |
| `/admin/blocked-slots` | Datetime range blocks (vacation, private events) |
| `/admin/users` | Role toggle, ban/unban, password-reset link, delete |
| `/admin/settings` | Key/value JSON config |
| `/admin/audit` | Full audit log of every change |

## Long-video strategy

For videos > 30 MB, **do not upload to Storage**. Instead paste a hosted URL into the
"קישור לסרטון" field on a course (YouTube/Vimeo/Mux/Cloudinary). The bucket has a
50 MB hard cap; large files will fail with a friendly Hebrew error.
