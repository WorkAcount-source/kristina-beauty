import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDuration } from "@/lib/utils";
import type { Service } from "@/types/db";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group relative editorial-panel rounded-[1.5rem] overflow-hidden lift gradient-border">
      <div className="relative aspect-square overflow-hidden">
        <SafeImage src={service.image_url} alt={service.name} fill sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition-transform transition-luxe group-hover:scale-[1.08]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase text-rose-900">
          <Clock className="size-3 text-rose-700" /> {formatDuration(service.duration_min)}
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-base sm:text-lg leading-tight group-hover:text-rose-800 transition-colors line-clamp-1">{service.name}</h3>
          <span className="font-display text-base sm:text-lg text-gradient whitespace-nowrap">{formatPrice(Number(service.price))}</span>
        </div>
        {service.description && <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>}
        <Button asChild size="sm" className="w-full mt-1">
          <Link href={`/booking?service=${service.id}`}><Calendar className="size-3.5" /> הזמנת תור</Link>
        </Button>
      </div>
    </div>
  );
}
