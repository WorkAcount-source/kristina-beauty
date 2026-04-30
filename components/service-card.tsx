import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDuration } from "@/lib/utils";
import type { Service } from "@/types/db";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group relative editorial-panel rounded-[1.75rem] overflow-hidden lift gradient-border">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage src={service.image_url} alt={service.name} fill sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform transition-luxe group-hover:scale-[1.08]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase text-rose-900">
          <Clock className="size-3.5 text-rose-700" /> {formatDuration(service.duration_min)}
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight group-hover:text-rose-800 transition-colors">{service.name}</h3>
          <span className="font-display text-2xl text-gradient whitespace-nowrap">{formatPrice(Number(service.price))}</span>
        </div>
        {service.description && <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>}
        <Button asChild className="w-full mt-3">
          <Link href={`/booking?service=${service.id}`}><Calendar className="size-4" /> הזמנת תור</Link>
        </Button>
      </div>
    </div>
  );
}
