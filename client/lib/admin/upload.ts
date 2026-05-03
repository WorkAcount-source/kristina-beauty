"use client";

import { createClient } from "@/lib/supabase/client";

export type MediaKind = "image" | "video";

const BUCKETS: Record<MediaKind, string> = {
  image: "media-images",
  video: "media-videos",
};

const MAX_BYTES: Record<MediaKind, number> = {
  image: 5 * 1024 * 1024,
  video: 50 * 1024 * 1024,
};

const ALLOWED_MIME: Record<MediaKind, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

export interface UploadResult {
  publicUrl: string;
  path: string;
  bucket: string;
}

/**
 * Uploads a single file to the configured Supabase Storage bucket and returns
 * the public URL. Validates MIME type and size *before* the request.
 *
 * @param file        The browser File object.
 * @param kind        "image" | "video".
 * @param folder      Logical folder inside the bucket — typically the table
 *                    name (e.g. "courses", "products"). Use `"misc"` if not
 *                    table-scoped.
 */
export async function uploadMedia(
  file: File,
  kind: MediaKind,
  folder: string
): Promise<UploadResult> {
  if (!ALLOWED_MIME[kind].includes(file.type)) {
    throw new Error(`סוג קובץ לא נתמך (${file.type})`);
  }
  if (file.size > MAX_BYTES[kind]) {
    const mb = Math.round(MAX_BYTES[kind] / (1024 * 1024));
    throw new Error(`הקובץ גדול מדי (מקסימום ${mb}MB)`);
  }

  const ext =
    file.name.split(".").pop()?.toLowerCase() ||
    (file.type.split("/")[1] ?? "bin");
  // crypto.randomUUID is available in all modern browsers.
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now();
  const path = `${folder}/${uuid}.${ext}`;

  const supabase = createClient();
  const bucket = BUCKETS[kind];

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    if (/row-level security|permission/i.test(error.message)) {
      throw new Error("אין הרשאה להעלאת קבצים (נדרש מנהל)");
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path, bucket };
}

/**
 * Best-effort delete of a file given its full public URL. Silently no-ops if
 * the URL doesn't belong to one of our buckets (so admins can paste in
 * external Cloudinary/Unsplash URLs and we won't try to delete those).
 */
export async function deleteMediaIfOwned(publicUrl: string | null | undefined) {
  if (!publicUrl) return;
  const match = publicUrl.match(
    /\/storage\/v1\/object\/public\/(media-images|media-videos)\/(.+)$/
  );
  if (!match) return;
  const [, bucket, path] = match;
  const supabase = createClient();
  await supabase.storage.from(bucket).remove([path]);
}
