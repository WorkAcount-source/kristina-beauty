import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminInstagram() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("instagram_posts")
    .select("*")
    .order("sort_order");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl md:text-3xl font-bold">פיד אינסטגרם</h1>
      <AdminCrud
        table="instagram_posts"
        rows={data ?? []}
        fields={[
          { name: "post_url", label: "קישור לפוסט", type: "url", required: true },
          { name: "thumbnail_url", label: "תמונה ממוזערת", type: "image", required: true },
          { name: "caption", label: "כיתוב", type: "textarea" },
          { name: "sort_order", label: "סדר", type: "number", step: 1 },
        ]}
        uploadFolder="instagram"
        displayFields={[
          { name: "thumbnail_url", label: "", type: "image" },
          { name: "caption", label: "כיתוב" },
          { name: "post_url", label: "קישור" },
          { name: "sort_order", label: "סדר" },
        ]}
      />
    </div>
  );
}
