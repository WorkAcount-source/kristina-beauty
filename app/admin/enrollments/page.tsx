import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminEnrollments() {
  const supabase = await createClient();
  const [{ data: enrollments }, { data: courses }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, user_id, course_id, status, paid_at, created_at, courses(title)")
      .order("created_at", { ascending: false }),
    supabase.from("courses").select("id, title").order("title"),
  ]);
  const courseOptions = (courses ?? []).map((c) => ({
    value: c.id as string,
    label: c.title as string,
  }));
  const rows = (enrollments ?? []).map((e) => ({
    ...e,
    course_title: (e.courses as { title?: string } | null)?.title ?? "—",
  }));
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">רישומים לקורסים</h1>
      <AdminCrud
        table="enrollments"
        rows={rows}
        fields={[
          { name: "course_id", label: "קורס", type: "select", options: courseOptions, required: true },
          {
            name: "status",
            label: "סטטוס",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "ממתין" },
              { value: "active", label: "פעיל" },
              { value: "completed", label: "הושלם" },
              { value: "cancelled", label: "בוטל" },
            ],
          },
          { name: "paid_at", label: "תאריך תשלום", type: "datetime" },
        ]}
        displayFields={[
          { name: "course_title", label: "קורס" },
          { name: "status", label: "סטטוס" },
          { name: "paid_at", label: "שולם", type: "date" },
          { name: "created_at", label: "נרשם", type: "date" },
        ]}
      />
    </div>
  );
}
