import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";
import Link from "next/link";

export default async function AdminOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  const rows = (data ?? []).map((o) => ({
    ...o,
    short_id: String(o.id).slice(0, 8),
  }));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl md:text-3xl font-bold">הזמנות</h1>
        <Link
          href="/admin/orders/items"
          className="text-sm text-rose-700 hover:underline"
        />
      </div>
      <AdminCrud
        table="orders"
        rows={rows}
        fields={[
          { name: "customer_name", label: "שם לקוחה" },
          { name: "customer_email", label: "אימייל" },
          { name: "customer_phone", label: "טלפון" },
          { name: "total", label: "סכום", type: "number", required: true },
          {
            name: "status",
            label: "סטטוס",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "ממתין" },
              { value: "paid", label: "שולם" },
              { value: "shipped", label: "נשלח" },
              { value: "delivered", label: "נמסר" },
              { value: "cancelled", label: "בוטל" },
              { value: "refunded", label: "הוחזר" },
            ],
          },
        ]}
        searchableFields={["short_id", "customer_name", "customer_email", "status"]}
        displayFields={[
          { name: "short_id", label: "#" },
          { name: "created_at", label: "תאריך", type: "date" },
          { name: "customer_name", label: "לקוחה" },
          { name: "total", label: "סכום", type: "currency" },
          { name: "status", label: "סטטוס" },
        ]}
      />
    </div>
  );
}
