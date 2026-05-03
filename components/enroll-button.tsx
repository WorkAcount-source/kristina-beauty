"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Course } from "@/types/db";

export function EnrollButton({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isFree = Number(course.price) === 0;

  async function handleEnroll() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("יש להתחבר כדי לרכוש את הקורס");
      router.push(`/auth/login?redirect=/courses/${course.id}`);
      return;
    }

    if (isFree) {
      // Free course — enroll directly
      const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: course.id,
        status: "active",
        paid_at: new Date().toISOString(),
      });
      setLoading(false);
      if (error) {
        if (error.code === "23505") return toast.info("את כבר רשומה לקורס זה");
        return toast.error("שגיאה", { description: error.message });
      }
      toast.success("נרשמת לקורס!");
      router.refresh();
      return;
    }

    // Paid course — go to Stripe checkout
    try {
      const res = await fetch("/api/checkout/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: course.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.enrolled) {
          toast.info("הקורס כבר פתוח עבורך");
          router.refresh();
          return;
        }
        throw new Error(json.error ?? "שגיאה");
      }
      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "שגיאה";
      toast.error("שגיאה", { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} size="xl" className="w-full sm:w-auto">
      {isFree ? (
        <><GraduationCap className="size-5" /> {loading ? "רושם..." : "הרשמה חינם"}</>
      ) : (
        <><ShoppingBag className="size-5" /> {loading ? "מעבד..." : "לרכישת הקורס"}</>
      )}
    </Button>
  );
}
