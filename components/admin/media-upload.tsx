"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadMedia, deleteMediaIfOwned, type MediaKind } from "@/lib/admin/upload";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  /** Current value (public URL) — may be empty. */
  value: string;
  /** Called when the URL changes (after upload, after manual edit, after clear). */
  onChange: (url: string) => void;
  /** Image or video. */
  kind: MediaKind;
  /** Folder inside the bucket — usually the table name. */
  folder: string;
  /** Allow pasting an external URL too (e.g. Cloudinary, Unsplash). */
  allowUrl?: boolean;
  /** Disable while parent is busy. */
  disabled?: boolean;
}

export function MediaUpload({
  value,
  onChange,
  kind,
  folder,
  allowUrl = true,
  disabled,
}: MediaUploadProps) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      // If the previous value was an uploaded asset, clean it up so the bucket
      // doesn't accumulate orphans.
      if (value) await deleteMediaIfOwned(value).catch(() => {});
      const { publicUrl } = await uploadMedia(file, kind, folder);
      onChange(publicUrl);
      toast.success("הקובץ הועלה");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה בהעלאה");
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    if (!value) return;
    setBusy(true);
    try {
      await deleteMediaIfOwned(value).catch(() => {});
      onChange("");
    } finally {
      setBusy(false);
    }
  }

  const accept =
    kind === "image"
      ? "image/jpeg,image/png,image/webp,image/avif,image/gif"
      : "video/mp4,video/webm,video/quicktime";

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-rose-100 bg-rose-50/40">
          {kind === "image" ? (
            <div className="relative w-full aspect-video">
              {/* unoptimized so it works for any external URL the admin pastes */}
              <Image
                src={value}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <video src={value} controls className="w-full max-h-72" />
          )}
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || busy}
            className="absolute top-2 left-2 size-8 rounded-full bg-white/95 shadow-md hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors"
            aria-label="הסר"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            "w-full rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
            drag ? "border-rose-500 bg-rose-50" : "border-rose-200 hover:border-rose-400 hover:bg-rose-50/60",
            disabled && "opacity-50 pointer-events-none"
          )}
        >
          {busy ? (
            <Loader2 className="size-6 mx-auto animate-spin text-rose-500" />
          ) : (
            <Upload className="size-6 mx-auto text-rose-500" />
          )}
          <p className="mt-2 text-sm font-medium">
            {kind === "image" ? "גרור תמונה לכאן או לחץ לבחירה" : "גרור סרטון לכאן או לחץ לבחירה"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {kind === "image" ? "JPG / PNG / WebP / AVIF · עד 5MB" : "MP4 / WebM · עד 50MB"}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {allowUrl && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="או הדבק קישור (Cloudinary, YouTube, וכו')"
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs"
          disabled={disabled || busy}
          dir="ltr"
        />
      )}
    </div>
  );
}
