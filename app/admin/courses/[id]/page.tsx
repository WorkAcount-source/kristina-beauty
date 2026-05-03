import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, BookOpen, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CourseEditForm } from "@/components/admin/course-edit-form";
import { CourseChaptersEditor } from "@/components/admin/course-chapters-editor";
import type { Course, CourseChapter } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: courseData }, { data: chaptersData }, { count: enrollCount }] =
    await Promise.all([
      supabase.from("courses").select("*").eq("id", id).single(),
      supabase
        .from("course_chapters")
        .select("*")
        .eq("course_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", id)
        .eq("status", "active"),
    ]);

  if (!courseData) notFound();

  const course = courseData as Course;
  const chapters = (chaptersData ?? []) as CourseChapter[];

  const totalDuration = chapters.reduce((s, c) => s + (c.duration_min ?? 0), 0);
  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/courses" className="hover:text-rose-600">
          קורסים
        </Link>
        <ChevronRight className="size-4 rotate-180" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {course.title}
        </span>
      </nav>

      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">{course.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4" />
            {chapters.length} פרקים
            {totalDuration > 0 && (
              <span className="text-muted-foreground/60">
                ({hours > 0 ? `${hours}ש' ` : ""}{mins > 0 ? `${mins}ד'` : ""})
              </span>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {enrollCount ?? 0} נרשמות
          </span>
          <span
            className={[
              "px-2 py-0.5 rounded-full text-xs font-medium",
              course.active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-neutral-100 text-neutral-500",
            ].join(" ")}
          >
            {course.active ? "פעיל" : "לא פעיל"}
          </span>
        </div>
      </div>

      {/* Course details */}
      <section>
        <h2 className="text-lg font-semibold mb-4">פרטי הקורס</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
          <CourseEditForm course={course} />
        </div>
      </section>

      {/* Chapters */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          פרקי הקורס
          <span className="text-sm font-normal text-muted-foreground mr-2">
            ({chapters.length} פרקים)
          </span>
        </h2>
        <CourseChaptersEditor chapters={chapters} courseId={id} />
      </section>
    </div>
  );
}
