"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import type { PortfolioItem } from "@/types/db";

export function GalleryCarousel({ items }: { items: PortfolioItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: "rtl", align: "center" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[2rem]" ref={emblaRef}>
        <div className="flex">
          {items.map((it) => (
            <div key={it.id} className="flex-[0_0_60%] sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_25%] min-w-0 px-2">
              <div className="relative aspect-square rounded-[1.5rem] overflow-hidden shadow-[0_30px_70px_-48px_rgba(0,0,0,0.85)] ring-1 ring-white/10 group lift">
                <SafeImage src={it.image_url} alt={it.title || ""} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width:768px) 60vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/18 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <h3 className="font-display text-lg md:text-xl mb-1">{it.title}</h3>
                  {it.description && <p className="text-xs text-white/85 line-clamp-2">{it.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => emblaApi?.scrollPrev()} aria-label="הקודם"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 size-12 rounded-full glass shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all">
        <ChevronRight className="size-6 text-rose-700" />
      </button>
      <button onClick={() => emblaApi?.scrollNext()} aria-label="הבא"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 size-12 rounded-full glass shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all">
        <ChevronLeft className="size-6 text-rose-700" />
      </button>

      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button key={i} onClick={() => emblaApi?.scrollTo(i)} aria-label={`go to ${i + 1}`}
            className={`h-2 rounded-full transition-all ${selected === i ? "w-8 bg-rose-600" : "w-2 bg-rose-300"}`} />
        ))}
      </div>
    </div>
  );
}
