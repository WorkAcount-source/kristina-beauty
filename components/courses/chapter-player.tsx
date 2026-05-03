"use client";

import { useState } from "react";
import { Lock, PlayCircle, ChevronDown, Clock, ShoppingBag, X } from "lucide-react";
import type { CourseChapter } from "@/types/db";
import { formatDuration } from "@/lib/utils";

interface Props {
  chapters: CourseChapter[];
  isEnrolled: boolean;
  courseId: string;
}

function getEmbedUrl(url: string): { type: "youtube" | "vimeo" | "video"; src: string } {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return { type: "youtube", src: `https://www.youtube.com/embed/${v}?autoplay=1` };
    }
    if (u.hostname === "youtu.be") {
      const v = u.pathname.slice(1);
      return { type: "youtube", src: `https://www.youtube.com/embed/${v}?autoplay=1` };
    }
    if (u.hostname.includes("vimeo.com")) {
      const v = u.pathname.split("/").filter(Boolean)[0];
      return { type: "vimeo", src: `https://player.vimeo.com/video/${v}?autoplay=1` };
    }
  } catch {
    // fallback to direct video
  }
  return { type: "video", src: url };
}

export function ChapterPlayer({ chapters, isEnrolled, courseId }: Props) {
  const [openId, setOpenId] = useState<string | null>(() => {
    const first = chapters.find((c) => c.is_free);
    return first?.id ?? null;
  });
  const [showLockedMsg, setShowLockedMsg] = useState(false);

  // User has access rights to this chapter (free or enrolled)
  const isAccessible = (ch: CourseChapter) => ch.is_free || isEnrolled;
  // User can actually play the video (has access AND video exists)
  const canWatch = (ch: CourseChapter) => isAccessible(ch) && !!ch.video_url;

  function toggle(ch: CourseChapter) {
    if (!isAccessible(ch)) {
      setShowLockedMsg(true);
      return;
    }
    setOpenId((prev) => (prev === ch.id ? null : ch.id));
  }

  return (
    <div className="space-y-2">
      {/* Locked chapter toast */}
      {showLockedMsg && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 mb-2">
          <Lock className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="flex-1 text-sm text-amber-800">
            פרק זה נעול. רכשי את הקורס כדי לצפות בכל הפרקים.
          </p>
          <button
            onClick={() => setShowLockedMsg(false)}
            className="shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
            aria-label="סגור"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {chapters.map((ch, i) => {
        const unlocked = isAccessible(ch);
        const isOpen = openId === ch.id;
        const embed = isOpen && ch.video_url ? getEmbedUrl(ch.video_url) : null;

        return (
          <div
            key={ch.id}
            className={[
              "rounded-2xl border overflow-hidden transition-all",
              isOpen
                ? "border-rose-300 shadow-md"
                : unlocked
                ? "border-rose-100 bg-white hover:border-rose-200"
                : "border-border/40 bg-muted/30",
            ].join(" ")}
          >
            {/* Chapter row */}
            <button
              onClick={() => toggle(ch)}
              aria-expanded={isOpen}
              className={[
                "w-full flex items-center gap-4 px-5 py-4 text-right transition-colors cursor-pointer",
                isOpen ? "bg-rose-50" : "",
              ].join(" ")}
            >
              {/* Number badge */}
              <span
                className={[
                  "shrink-0 size-8 rounded-full flex items-center justify-center text-sm font-bold",
                  isOpen
                    ? "bg-rose-600 text-white"
                    : unlocked
                    ? "bg-rose-100 text-rose-700"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {i + 1}
              </span>

              {/* Title + meta */}
              <div className="flex-1 min-w-0 text-start">
                <span
                  className={[
                    "font-medium text-sm leading-snug",
                    isOpen ? "text-rose-700" : unlocked ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {ch.title}
                </span>
                {(ch.duration_min || ch.description) && (
                  <div className="flex items-center gap-3 mt-0.5">
                    {ch.duration_min && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDuration(ch.duration_min)}
                      </span>
                    )}
                    {ch.description && (
                      <span className="text-xs text-muted-foreground truncate hidden sm:block">
                        {ch.description}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right icon */}
              <div className="shrink-0 flex items-center gap-2">
                {ch.is_free && !isEnrolled && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                    חינם
                  </span>
                )}
                {unlocked ? (
                  isOpen ? (
                    <ChevronDown className="size-5 text-rose-600 rotate-180 transition-transform" />
                  ) : (
                    <PlayCircle className="size-5 text-rose-400" />
                  )
                ) : (
                  <Lock className="size-4 text-muted-foreground/50" />
                )}
              </div>
            </button>

            {/* Expanded video */}
            {isOpen && embed && (
              <div className="border-t border-rose-100">
                <div className="aspect-video bg-black">
                  {embed.type === "video" ? (
                    <video
                      key={embed.src}
                      src={embed.src}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      key={embed.src}
                      src={embed.src}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={ch.title}
                    />
                  )}
                </div>
                {ch.description && (
                  <p className="px-5 py-3 text-sm text-muted-foreground">{ch.description}</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Upsell banner if not enrolled and there are locked chapters */}
      {!isEnrolled && chapters.some((c) => !c.is_free) && (
        <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Lock className="size-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-muted-foreground flex-1">
            רכשי את הקורס כדי לפתוח את כל הפרקים
          </p>
          <a
            href={`/courses/${courseId}#purchase`}
            className="shrink-0 inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <ShoppingBag className="size-4" />
            לרכישה
          </a>
        </div>
      )}
    </div>
  );
}
