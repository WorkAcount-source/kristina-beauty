import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDuration } from "@/lib/utils";
import type { Course } from "@/types/db";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} className="group block editorial-panel rounded-[1.75rem] overflow-hidden lift gradient-border">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage src={course.image_url} alt={course.title} fill sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform transition-luxe group-hover:scale-[1.08]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/28 to-transparent" />
        <div className="absolute top-4 right-4 px-3 py-1.5 glass rounded-full text-[11px] font-medium tracking-[0.18em] uppercase flex items-center gap-1.5">
          <Clock className="size-3.5 text-rose-600" />
          {formatDuration(course.duration_min)}
        </div>
        <div className="absolute bottom-4 right-4 left-4">
          <h3 className="font-display text-2xl text-white drop-shadow-lg">{course.title}</h3>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {course.description && <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>}
        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-3xl text-gradient">
            {Number(course.price) === 0 ? "חינם" : formatPrice(Number(course.price))}
          </span>
          <Button size="sm" variant="soft" className="group/btn">
            למידע נוסף <ArrowLeft className="size-4 transition-transform duration-500 ease-out group-hover/btn:-translate-x-1" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
