import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminPortfolio() {
  const supabase = await createClient();
  const { data } = await supabase.from("portfolio_items").select("*").order("sort_order");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">תיק עבודות</h1>
      <AdminCrud
        table="portfolio_items"
        rows={data ?? []}
        fields={[
          { name: "title", label: "כותרת" },
          { name: "description", label: "תיאור", type: "textarea" },
          { name: "image_url", label: "תמונה", type: "image", required: true },
          { name: "sort_order", label: "סדר", type: "number", step: 1 },
        ]}
        displayFields={[
          { name: "image_url", label: "", type: "image" },
          { name: "title", label: "כותרת" },
          { name: "description", label: "תיאור" },
          { name: "sort_order", label: "סדר" },
        ]}
      />
    </div>
  );
}
