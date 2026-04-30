import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminBookings() {
  const supabase = await createClient();
  const [{ data: bookings }, { data: services }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, services(name)")
      .order("start_at", { ascending: false })
      .limit(500),
    supabase.from("services").select("id, name").eq("active", true).order("name"),
  ]);
  const serviceOptions = (services ?? []).map((s) => ({
    value: s.id as string,
    label: s.name as string,
  }));
  const rows = (bookings ?? []).map((b) => ({
    ...b,
    service_name: (b.services as { name?: string } | null)?.name ?? "—",
  }));
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">תורים</h1>
      <AdminCrud
        table="bookings"
        rows={rows}
        fields={[
          {
            name: "service_id",
            label: "שירות",
            type: "select",
            required: true,
            options: serviceOptions,
          },
          { name: "start_at", label: "התחלה", type: "datetime", required: true },
          { name: "end_at", label: "סיום", type: "datetime", required: true },
          { name: "customer_name", label: "שם לקוחה", required: true },
          { name: "customer_phone", label: "טלפון", required: true },
          { name: "customer_email", label: "אימייל" },
          {
            name: "status",
            label: "סטטוס",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "ממתין" },
              { value: "confirmed", label: "מאושר" },
              { value: "cancelled", label: "בוטל" },
              { value: "completed", label: "הושלם" },
            ],
          },
          { name: "notes", label: "הערות", type: "textarea" },
        ]}
        searchableFields={["customer_name", "customer_phone", "service_name", "status"]}
        displayFields={[
          { name: "start_at", label: "מועד", type: "date" },
          { name: "service_name", label: "שירות" },
          { name: "customer_name", label: "לקוחה" },
          { name: "customer_phone", label: "טלפון" },
          { name: "status", label: "סטטוס" },
        ]}
      />
    </div>
  );
}
