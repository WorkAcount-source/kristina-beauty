import { createServiceClient } from "@/lib/db";

export async function fetchUpcomingBookings() {
  const svc = await createServiceClient();
  const { data } = await svc
    .from("bookings")
    .select(
      "id, start_at, end_at, status, customer_name, customer_phone, customer_email, notes, services(name)"
    )
    .neq("status", "cancelled")
    .order("start_at", { ascending: false })
    .limit(2000);
  return data ?? [];
}
