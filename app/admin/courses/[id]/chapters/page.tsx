import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: course }, { data: chapters }] = await Promise.all([
    supabase.from("courses").select("id, title").eq("id", id).single(),
    supabase
      .from("course_chapters")
      .select("*")
      .eq("course_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!course) notFound();

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/courses" className="hover:text-rose-600">
          קורסים
        </Link>
        <ChevronRight className="size-4 rotate-180" />
        <span className="text-foreground font-medium">{course.title}</span>
        <ChevronRight className="size-4 rotate-180" />
        <span className="text-foreground">פרקים</span>
      </nav>

      <h1 className="font-display text-2xl md:text-3xl font-bold">
        פרקי הקורס — {course.title}
      </h1>

      <AdminCrud
        table="course_chapters"
        rows={(chapters ?? []).map((ch) => ({ ...ch, course_id: id }))}
        fields={[
          { name: "course_id", label: "course_id", type: "text" },
          { name: "title", label: "כותרת פרק", required: true },
          { name: "description", label: "תיאור קצר", type: "textarea" },
          {
            name: "video_url",
            label: "קישור לסרטון",
            type: "url",
            hint: "YouTube / Vimeo / קישור ישיר לקובץ",
          },
          {
            name: "duration_min",
            label: "משך (דקות)",
            type: "number",
            step: 1,
          },
          {
            name: "sort_order",
            label: "סדר הצגה",
            type: "number",
            step: 1,
            hint: "מספר נמוך = מוצג ראשון",
          },
          {
            name: "is_free",
            label: "פרק חינמי (תצוגה מקדימה)",
            type: "boolean",
          },
        ]}
        displayFields={[
          { name: "sort_order", label: "#" },
          { name: "title", label: "כותרת" },
          { name: "duration_min", label: "דקות" },
          { name: "is_free", label: "חינמי", type: "boolean" },
        ]}
        searchableFields={["title"]}
      />
    </div>
  );
}
