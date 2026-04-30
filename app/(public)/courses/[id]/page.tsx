import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Clock, ChevronRight } from "lucide-react";
import { EnrollButton } from "@/components/enroll-button";
import type { Course } from "@/types/db";
import { SafeImage } from "@/components/safe-image";

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("courses").select("id").eq("active", true);
  return (data ?? []).map((row) => ({ id: String(row.id) }));
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Viewing the full details of a course requires authentication.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?redirect=/courses/${id}`);
  }

  // Use the public (cookie-less) client for the data fetch — content is the
  // same for every authenticated user, so the query result can be cached.
  const pub = createPublicClient();
  const { data } = await pub.from("courses").select("*").eq("id", id).single();
  const course = data as Course | null;
  if (!course) notFound();

  return (
    <div className="pt-32 pb-20">
      <div className="container">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-rose-600">בית</Link>
          <ChevronRight className="size-4 rotate-180" />
          <Link href="/courses" className="hover:text-rose-600">קורסים</Link>
          <ChevronRight className="size-4 rotate-180" />
          <span className="text-foreground">{course.title}</span>
        </nav>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
            {course.image_url && <SafeImage src={course.image_url} alt={course.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" priority />}
          </div>
          <div className="space-y-6">
            <h1 className="font-display text-4xl md:text-5xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-muted-foreground"><Clock className="size-5 text-rose-600" /> {formatDuration(course.duration_min)}</span>
              <span className="text-3xl font-bold text-gradient">{Number(course.price) === 0 ? "חינם" : formatPrice(Number(course.price))}</span>
            </div>
            {course.description && <p className="text-lg text-muted-foreground leading-relaxed">{course.description}</p>}
            {course.content && (
              <div className="prose prose-rose max-w-none">
                <h3 className="font-display text-xl font-semibold mb-2">מה תלמדי בקורס?</h3>
                <p className="text-muted-foreground leading-relaxed">{course.content}</p>
              </div>
            )}
            <EnrollButton course={course} />
          </div>
        </div>
      </div>
    </div>
  );
}
