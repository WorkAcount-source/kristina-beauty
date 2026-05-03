import Link from "next/link";
import { Instagram, Play } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import type { InstagramPost } from "@/types/db";

export function InstagramFeed({ posts }: { posts: InstagramPost[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
      {posts.map((p) => (
        <Link key={p.id} href={p.post_url} target="_blank" rel="noopener noreferrer"
          className="group relative aspect-square rounded-[1.5rem] overflow-hidden shadow-[0_30px_70px_-48px_rgba(0,0,0,0.9)] ring-1 ring-white/10 lift">
          <SafeImage src={p.thumbnail_url} alt={p.caption || ""} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width:768px) 50vw, 25vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-rose-950/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
            <Play className="size-8 text-white mb-2 self-end" />
            <p className="text-white text-sm font-medium leading-snug">{p.caption}</p>
          </div>
          <div className="absolute top-3 right-3 size-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Instagram className="size-4 text-rose-600" />
          </div>
        </Link>
      ))}
    </div>
  );
}
