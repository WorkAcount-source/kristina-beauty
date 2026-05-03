import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Clock, ChevronRight, Users, BookOpen } from "lucide-react";
import { EnrollButton } from "@/components/enroll-button";
import { ChapterPlayer } from "@/components/courses/chapter-player";
import { PurchaseBanner } from "@/components/courses/purchase-banner";
import type { Course, CourseChapter } from "@/types/db";
import { SafeImage } from "@/components/safe-image";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ purchased?: string }>;
}) {
  const { id } = await params;
  const { purchased } = await searchParams;

  const supabase = await createClient();
  const [{ data: courseData }, { data: chaptersData }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).single(),
    supabase
      .from("course_chapters")
      .select("*")
      .eq("course_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  const course = courseData as Course | null;
  if (!course) notFound();

  const rawChapters = (chaptersData as CourseChapter[]) ?? [];

  // Check enrollment
  let isEnrolled = false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: enroll } = await supabase
        .from("enrollments")
        .select("status")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .maybeSingle();
      isEnrolled = enroll?.status === "active";
    }
  } catch {
    // Not authenticated — isEnrolled stays false
  }

  // Mask video_url for locked chapters to prevent client-side leakage
  const chapters: CourseChapter[] = rawChapters.map((ch) => ({
    ...ch,
    video_url: ch.is_free || isEnrolled ? ch.video_url : null,
  }));

  const hasChapters = chapters.length > 0;
  const totalDuration = chapters.reduce((s, c) => s + (c.duration_min ?? 0), 0);

  return (
    <div className="pt-24 md:pt-32 pb-12 md:pb-20">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-rose-600">בית</Link>
          <ChevronRight className="size-4 rotate-180" />
          <Link href="/courses" className="hover:text-rose-600">קורסים</Link>
          <ChevronRight className="size-4 rotate-180" />
          <span className="text-foreground">{course.title}</span>
        </nav>

        {/* Course header */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
            {course.image_url && (
              <SafeImage
                src={course.image_url}
                alt={course.title}
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            )}
          </div>
          <div className="space-y-5">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {totalDuration > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-rose-500" />
                  {formatDuration(totalDuration)}
                </span>
              )}
              {hasChapters && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-4 text-rose-500" />
                  {chapters.length} פרקים
                </span>
              )}
              <span className="text-2xl font-bold text-rose-600">
                {Number(course.price) === 0 ? "חינם" : formatPrice(Number(course.price))}
              </span>
            </div>
            {course.description && (
              <p className="text-base text-muted-foreground leading-relaxed">{course.description}</p>
            )}
            {course.content && (
              <div>
                <h3 className="font-display text-lg font-semibold mb-1">מה תלמדי בקורס?</h3>
                <p className="text-muted-foreground leading-relaxed">{course.content}</p>
              </div>
            )}
            {!isEnrolled && (
              <div id="purchase">
                <EnrollButton course={course} />
              </div>
            )}
            {isEnrolled && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2.5 font-medium">
                <Users className="size-4" />
                את רשומה לקורס זה
              </div>
            )}
          </div>
        </div>

        {/* Purchase confirmation banner */}
        {purchased === "true" && <PurchaseBanner isEnrolled={isEnrolled} />
        }

        {/* Chapter player */}
        {hasChapters && (
          <section>
            <h2 className="font-display text-2xl font-bold mb-4">
              {isEnrolled ? "פרקי הקורס" : "תוכן הקורס"}
            </h2>
            <ChapterPlayer chapters={chapters} isEnrolled={isEnrolled} courseId={id} />
          </section>
        )}
      </div>
    </div>
  );
}
