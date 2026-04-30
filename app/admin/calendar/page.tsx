import { createClient } from "@/lib/supabase/server";
import { BookingCalendar } from "./calendar-client";
import { GoogleCalendarPanel } from "./google-panel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const supabase = await createClient();
  const [{ data: bookings }, { data: services }, { data: blocked }, { data: hours }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id, service_id, start_at, end_at, status, customer_name, customer_phone, customer_email, notes, services(name)")
        .order("start_at", { ascending: false })
        .limit(2000),
      supabase
        .from("services")
        .select("id, name, duration_min, price")
        .eq("active", true)
        .order("name"),
      supabase.from("blocked_slots").select("id, start_at, end_at, reason"),
      supabase.from("business_hours").select("*").order("weekday"),
    ]);

  const feedToken = process.env.CALENDAR_FEED_TOKEN ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold">יומן תורים</h1>
        <Link
          href="/admin/bookings"
          className="text-sm text-rose-700 hover:underline"
        >
          תצוגת רשימה ←
        </Link>
      </div>
      <BookingCalendar
        bookings={(bookings ?? []).map((b) => ({
          id: b.id as string,
          service_id: b.service_id as string,
          start_at: b.start_at as string,
          end_at: b.end_at as string,
          status: b.status as string,
          customer_name: b.customer_name as string,
          customer_phone: b.customer_phone as string,
          customer_email: (b.customer_email as string) ?? null,
          notes: (b.notes as string) ?? null,
          service_name: (b.services as { name?: string } | null)?.name ?? "—",
        }))}
        services={(services ?? []).map((s) => ({
          id: s.id as string,
          name: s.name as string,
          duration_min: s.duration_min as number,
          price: Number(s.price ?? 0),
        }))}
        blocked={(blocked ?? []).map((b) => ({
          id: b.id as string,
          start_at: b.start_at as string,
          end_at: b.end_at as string,
          reason: (b.reason as string) ?? null,
        }))}
        businessHours={(hours ?? []).map((h) => ({
          weekday: h.weekday as number,
          open_time: (h.open_time as string) ?? null,
          close_time: (h.close_time as string) ?? null,
          closed: !!h.closed,
        }))}
      />
      <GoogleCalendarPanel feedToken={feedToken} />
    </div>
  );
}
