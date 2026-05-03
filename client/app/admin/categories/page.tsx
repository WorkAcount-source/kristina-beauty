import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_categories")
    .select("*")
    .order("sort_order");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl md:text-3xl font-bold">קטגוריות שירותים</h1>
      <AdminCrud
        table="service_categories"
        rows={data ?? []}
        fields={[
          { name: "name", label: "שם", required: true },
          { name: "sort_order", label: "סדר", type: "number", step: 1 },
        ]}
        displayFields={[
          { name: "name", label: "שם" },
          { name: "sort_order", label: "סדר" },
        ]}
      />
    </div>
  );
}
