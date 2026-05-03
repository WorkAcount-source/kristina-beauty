"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { MediaUpload } from "@/components/admin/media-upload";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";
import type { Course } from "@/types/db";

export function CourseEditForm({ course }: { course: Course }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(course.image_url ?? "");
  const [videoUrl, setVideoUrl] = useState(course.video_url ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        title: String(fd.get("title") ?? "").trim(),
        description: String(fd.get("description") ?? "").trim() || null,
        content: String(fd.get("content") ?? "").trim() || null,
        price: Number(fd.get("price") ?? 0),
        duration_min: Number(fd.get("duration_min") ?? 0),
        image_url: imageUrl.trim() || null,
        video_url: videoUrl.trim() || null,
        active: fd.get("active") === "on",
      };
      const supabase = createClient();
      const { error } = await supabase.from("courses").update(payload).eq("id", course.id);
      if (error) { toast.error(error.message); return; }
      toast.success("הקורס עודכן");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
      {/* Title */}
      <div className="sm:col-span-2">
        <Label htmlFor="title">
          כותרת הקורס <span className="text-rose-600">*</span>
        </Label>
        <Input id="title" name="title" defaultValue={course.title} required />
      </div>

      {/* Description */}
      <div className="sm:col-span-2">
        <Label htmlFor="description">תיאור קצר</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={course.description ?? ""}
          placeholder="תיאור קצר שיוצג בכרטיס הקורס..."
        />
      </div>

      {/* Content */}
      <div className="sm:col-span-2">
        <Label htmlFor="content">מה תלמדי בקורס?</Label>
        <Textarea
          id="content"
          name="content"
          rows={4}
          defaultValue={course.content ?? ""}
          placeholder="פרטי תוכן הקורס, נושאים ומיומנויות..."
        />
      </div>

      {/* Price */}
      <div>
        <Label htmlFor="price">מחיר (₪)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={course.price}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">הזיני 0 לקורס חינמי</p>
      </div>

      {/* Duration */}
      <div>
        <Label htmlFor="duration_min">משך כולל (דקות)</Label>
        <Input
          id="duration_min"
          name="duration_min"
          type="number"
          step="1"
          min="0"
          defaultValue={course.duration_min}
        />
      </div>

      {/* Active */}
      <div>
        <Label>סטטוס קורס</Label>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            defaultChecked={course.active}
            className="size-5 rounded border-rose-300 text-rose-600"
          />
          <span className="text-sm text-muted-foreground">פעיל ומוצג באתר</span>
        </label>
      </div>

      {/* Preview video URL */}
      <div>
        <Label htmlFor="video_url">סרטון תצוגה מקדימה</Label>
        <Input
          id="video_url"
          type="url"
          dir="ltr"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground mt-1">YouTube / Vimeo / Mux</p>
      </div>

      {/* Cover image */}
      <div className="sm:col-span-2">
        <Label>תמונת עטיפה</Label>
        <MediaUpload
          value={imageUrl}
          onChange={setImageUrl}
          kind="image"
          folder="courses"
        />
      </div>

      {/* Submit */}
      <div className="sm:col-span-2 pt-2">
        <Button type="submit" disabled={submitting}>
          <Save className="size-4" />
          {submitting ? "שומר..." : "שמור שינויים"}
        </Button>
      </div>
    </form>
  );
}
