import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminServices() {
  const supabase = await createClient();
  const [{ data }, { data: cats }] = await Promise.all([
    supabase.from("services").select("*").order("created_at", { ascending: false }),
    supabase.from("service_categories").select("id, name").order("sort_order"),
  ]);
  const categoryOptions = (cats ?? []).map((c) => ({ value: c.id as string, label: c.name as string }));
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">שירותים</h1>
      <AdminCrud
        table="services"
        rows={data ?? []}
        fields={[
          { name: "name", label: "שם", required: true },
          { name: "category_id", label: "קטגוריה", type: "select", options: categoryOptions },
          { name: "duration_min", label: "משך (דקות)", type: "number", required: true, step: 1 },
          { name: "price", label: "מחיר", type: "number", required: true },
          { name: "image_url", label: "תמונה", type: "image" },
          { name: "description", label: "תיאור", type: "textarea" },
          { name: "active", label: "פעיל", type: "boolean" },
        ]}
        displayFields={[
          { name: "image_url", label: "", type: "image" },
          { name: "name", label: "שם" },
          { name: "duration_min", label: "דקות" },
          { name: "price", label: "מחיר", type: "currency" },
          { name: "active", label: "סטטוס", type: "boolean" },
        ]}
      />
    </div>
  );
}
