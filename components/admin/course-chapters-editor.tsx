"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Plus,
  Save,
  X,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Play,
  Lock,
  Video,
} from "lucide-react";
import type { CourseChapter } from "@/types/db";

interface Props {
  chapters: CourseChapter[];
  courseId: string;
}

export function CourseChaptersEditor({ chapters, courseId }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<CourseChapter | null>(null);
  const [adding, setAdding] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);

  const sorted = [...chapters].sort((a, b) => a.sort_order - b.sort_order);

  function openAdd() {
    setAdding(true);
    setEditing(null);
    setVideoUrl("");
  }

  function openEdit(ch: CourseChapter) {
    setEditing(ch);
    setAdding(false);
    setVideoUrl(ch.video_url ?? "");
  }

  function closeForm() {
    setEditing(null);
    setAdding(false);
    setVideoUrl("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        course_id: courseId,
        title: String(fd.get("title") ?? "").trim(),
        description: String(fd.get("description") ?? "").trim() || null,
        video_url: videoUrl.trim() || null,
        duration_min: fd.get("duration_min") ? Number(fd.get("duration_min")) : null,
        sort_order: Number(fd.get("sort_order") ?? chapters.length + 1),
        is_free: fd.get("is_free") === "on",
      };
      const supabase = createClient();
      let error;
      if (editing) {
        ({ error } = await supabase.from("course_chapters").update(payload).eq("id", editing.id));
      } else {
        ({ error } = await supabase.from("course_chapters").insert(payload));
      }
      if (error) { toast.error(error.message); return; }
      toast.success(editing ? "הפרק עודכן" : "הפרק נוסף");
      closeForm();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(ch: CourseChapter) {
    if (!confirm(`למחוק את הפרק "${ch.title}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("course_chapters").delete().eq("id", ch.id);
    if (error) { toast.error(error.message); return; }
    toast.success("הפרק נמחק");
    router.refresh();
  }

  async function move(ch: CourseChapter, dir: "up" | "down") {
    const idx = sorted.findIndex((c) => c.id === ch.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    setMoving(ch.id);
    const supabase = createClient();
    await Promise.all([
      supabase.from("course_chapters").update({ sort_order: other.sort_order }).eq("id", ch.id),
      supabase.from("course_chapters").update({ sort_order: ch.sort_order }).eq("id", other.id),
    ]);
    setMoving(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Chapter list */}
      <div className="bg-white rounded-2xl border border-rose-100 overflow-hidden">
        {sorted.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground text-sm">
            אין פרקים עדיין. לחצי על &quot;הוספת פרק&quot; כדי להתחיל.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-rose-50 text-center">
                  <tr>
                    <th className="p-3 w-10">#</th>
                    <th className="p-3 text-right">כותרת</th>
                    <th className="p-3 w-16">דקות</th>
                    <th className="p-3 w-24">סטטוס</th>
                    <th className="p-3 w-36">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((ch, i) => (
                    <tr
                      key={ch.id}
                      className={[
                        "border-t transition-colors",
                        editing?.id === ch.id ? "bg-rose-50" : "hover:bg-rose-50/40",
                      ].join(" ")}
                    >
                      <td className="p-3 text-center text-muted-foreground font-medium">
                        {i + 1}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{ch.title}</div>
                        {ch.video_url ? (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                            <Video className="size-3 shrink-0" />
                            <span className="truncate max-w-[260px]" dir="ltr">
                              {ch.video_url}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">אין סרטון</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {ch.duration_min ?? "—"}
                      </td>
                      <td className="p-3 text-center">
                        {ch.is_free ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            <Play className="size-3" /> חינמי
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                            <Lock className="size-3" /> בתשלום
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => move(ch, "up")}
                            disabled={i === 0 || moving === ch.id}
                            className="size-7 rounded hover:bg-rose-100 flex items-center justify-center disabled:opacity-30 transition-opacity"
                            title="הזז למעלה"
                          >
                            <ChevronUp className="size-4" />
                          </button>
                          <button
                            onClick={() => move(ch, "down")}
                            disabled={i === sorted.length - 1 || moving === ch.id}
                            className="size-7 rounded hover:bg-rose-100 flex items-center justify-center disabled:opacity-30 transition-opacity"
                            title="הזז למטה"
                          >
                            <ChevronDown className="size-4" />
                          </button>
                          <button
                            onClick={() => openEdit(ch)}
                            className="size-7 rounded hover:bg-rose-100 text-rose-700 flex items-center justify-center"
                            title="ערוך"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(ch)}
                            className="size-7 rounded hover:bg-destructive/10 text-destructive flex items-center justify-center"
                            title="מחק"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-rose-100">
              {sorted.map((ch, i) => (
                <div key={ch.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-medium text-sm">{ch.title}</div>
                        {ch.duration_min && (
                          <div className="text-xs text-muted-foreground">{ch.duration_min} דקות</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => move(ch, "up")}
                        disabled={i === 0}
                        className="size-7 rounded hover:bg-rose-100 flex items-center justify-center disabled:opacity-30"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        onClick={() => move(ch, "down")}
                        disabled={i === sorted.length - 1}
                        className="size-7 rounded hover:bg-rose-100 flex items-center justify-center disabled:opacity-30"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                      <button
                        onClick={() => openEdit(ch)}
                        className="size-7 rounded hover:bg-rose-100 text-rose-700 flex items-center justify-center"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(ch)}
                        className="size-7 rounded hover:bg-destructive/10 text-destructive flex items-center justify-center"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ch.is_free ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        <Play className="size-3" /> חינמי
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                        <Lock className="size-3" /> בתשלום
                      </span>
                    )}
                    {ch.video_url ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <Video className="size-3" /> יש סרטון
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">אין סרטון</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add button */}
      {!adding && !editing && (
        <Button onClick={openAdd} variant="outline" className="w-full border-dashed border-rose-300 text-rose-600 hover:bg-rose-50">
          <Plus className="size-4" /> הוספת פרק
        </Button>
      )}

      {/* Add / Edit form */}
      {(adding || editing) && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">
              {editing ? `עריכת פרק: ${editing.title}` : "פרק חדש"}
            </h4>
            <button
              onClick={closeForm}
              className="size-8 rounded-full hover:bg-rose-100 flex items-center justify-center"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <Label htmlFor="ch-title">
                כותרת הפרק <span className="text-rose-600">*</span>
              </Label>
              <Input
                id="ch-title"
                name="title"
                defaultValue={editing?.title ?? ""}
                required
                placeholder="לדוגמה: מבוא לטכניקת האקריל"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <Label htmlFor="ch-desc">תיאור קצר</Label>
              <Textarea
                id="ch-desc"
                name="description"
                rows={2}
                defaultValue={editing?.description ?? ""}
                placeholder="מה הלומדת תלמד בפרק זה..."
              />
            </div>

            {/* Video URL */}
            <div className="sm:col-span-2">
              <Label htmlFor="ch-video">קישור לסרטון</Label>
              <Input
                id="ch-video"
                type="url"
                dir="ltr"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                YouTube / Vimeo / קישור ישיר למשוב MP4
              </p>
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="ch-duration">משך (דקות)</Label>
              <Input
                id="ch-duration"
                name="duration_min"
                type="number"
                step="1"
                min="1"
                defaultValue={editing?.duration_min ?? ""}
                placeholder="15"
              />
            </div>

            {/* Sort order */}
            <div>
              <Label htmlFor="ch-sort">סדר הצגה</Label>
              <Input
                id="ch-sort"
                name="sort_order"
                type="number"
                step="1"
                min="1"
                defaultValue={editing?.sort_order ?? sorted.length + 1}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">מספר נמוך = מוצג ראשון</p>
            </div>

            {/* Free chapter */}
            <div className="sm:col-span-2">
              <Label>גישה</Label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_free"
                  defaultChecked={editing ? editing.is_free : false}
                  className="size-5 rounded border-rose-300 text-rose-600"
                />
                <span className="text-sm text-muted-foreground">
                  פרק חינמי — גלוי לכולם כתצוגה מקדימה
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="sm:col-span-2 flex gap-2 pt-1">
              <Button type="submit" disabled={submitting}>
                <Save className="size-4" />
                {submitting ? "שומר..." : "שמור פרק"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={submitting}
              >
                ביטול
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
