import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { CourseCard } from "@/components/course-card";
import { SectionHeader } from "@/components/section-header";
import { createPublicClient } from "@/lib/supabase/public";
import type { Course } from "@/types/db";

export const metadata = { title: "קורסים" };
export const revalidate = 300;

const getCourses = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    return (data as Course[]) ?? [];
  },
  ["courses-list"],
  { revalidate: 300, tags: ["courses"] }
);

export default function CoursesPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="container">
        <SectionHeader eyebrow="Courses" title="קורסים מקצועיים" subtitle="למדי מהמומחים שלנו את הטכניקות המובילות בתחום" />
        <Suspense fallback={<CoursesGridSkeleton />}>
          <CoursesGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function CoursesGrid() {
  const courses = await getCourses();
  if (courses.length === 0) {
    return <p className="text-center text-muted-foreground py-20">אין קורסים זמינים כרגע</p>;
  }
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((c) => <CourseCard key={c.id} course={c} />)}
    </div>
  );
}

function CoursesGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-[1.75rem] overflow-hidden bg-rose-50/60 animate-pulse">
          <div className="aspect-[4/3] bg-rose-100/70" />
          <div className="p-6 space-y-3">
            <div className="h-4 w-3/4 bg-rose-100 rounded" />
            <div className="h-3 w-full bg-rose-100/70 rounded" />
            <div className="h-3 w-2/3 bg-rose-100/70 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
