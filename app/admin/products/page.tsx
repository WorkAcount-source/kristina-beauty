import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminProducts() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">מוצרים</h1>
      <AdminCrud
        table="products"
        rows={data ?? []}
        fields={[
          { name: "name", label: "שם", required: true },
          { name: "category", label: "קטגוריה" },
          { name: "price", label: "מחיר", type: "number", required: true },
          { name: "stock", label: "מלאי", type: "number", step: 1 },
          { name: "image_url", label: "תמונה", type: "image" },
          { name: "description", label: "תיאור", type: "textarea" },
          { name: "active", label: "פעיל", type: "boolean" },
        ]}
        displayFields={[
          { name: "image_url", label: "", type: "image" },
          { name: "name", label: "שם" },
          { name: "category", label: "קטגוריה" },
          { name: "price", label: "מחיר", type: "currency" },
          { name: "stock", label: "מלאי" },
          { name: "active", label: "סטטוס", type: "boolean" },
        ]}
      />
    </div>
  );
}
