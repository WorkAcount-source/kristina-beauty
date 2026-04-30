import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminCourses() {
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">קורסים</h1>
      <AdminCrud
        table="courses"
        rows={data ?? []}
        fields={[
          { name: "title", label: "כותרת", required: true },
          { name: "duration_min", label: "משך (דקות)", type: "number", required: true },
          { name: "price", label: "מחיר", type: "number", required: true },
          { name: "image_url", label: "תמונה (URL)" },
          { name: "description", label: "תיאור קצר", type: "textarea" },
          { name: "content", label: "תוכן הקורס", type: "textarea" },
          { name: "active", label: "פעיל", type: "boolean" },
        ]}
        displayFields={[{ name: "title", label: "כותרת" }, { name: "duration_min", label: "דקות" }, { name: "price", label: "מחיר" }]}
      />
    </div>
  );
}
