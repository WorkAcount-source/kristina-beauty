"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Course } from "@/types/db";

export function EnrollButton({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEnroll() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("יש להתחבר כדי להירשם לקורס");
      router.push(`/auth/login?redirect=/courses/${course.id}`);
      return;
    }
    const { error } = await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: course.id,
      status: Number(course.price) === 0 ? "active" : "pending",
      paid_at: Number(course.price) === 0 ? new Date().toISOString() : null,
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") return toast.info("את כבר רשומה לקורס זה");
      return toast.error("שגיאה", { description: error.message });
    }
    toast.success("נרשמת לקורס!");
    router.push("/account");
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} size="xl" className="w-full sm:w-auto">
      <GraduationCap className="size-5" /> {loading ? "רושם..." : "להרשמה לקורס"}
    </Button>
  );
}
