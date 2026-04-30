import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminServices() {
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">שירותים</h1>
      <AdminCrud
        table="services"
        rows={data ?? []}
        fields={[
          { name: "name", label: "שם", required: true },
          { name: "duration_min", label: "משך (דקות)", type: "number", required: true },
          { name: "price", label: "מחיר", type: "number", required: true },
          { name: "image_url", label: "תמונה (URL)" },
          { name: "description", label: "תיאור", type: "textarea" },
          { name: "active", label: "פעיל", type: "boolean" },
        ]}
        displayFields={[{ name: "name", label: "שם" }, { name: "duration_min", label: "דקות" }, { name: "price", label: "מחיר" }]}
      />
    </div>
  );
}
