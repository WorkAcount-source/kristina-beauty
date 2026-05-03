import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { SectionHeader } from "@/components/section-header";
import { createPublicClient } from "@/lib/supabase/public";
import type { PortfolioItem } from "@/types/db";
import { SafeImage } from "@/components/safe-image";

export const metadata = { title: "תיק עבודות" };
export const revalidate = 300;

const getPortfolio = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase.from("portfolio_items").select("*").order("sort_order");
    return (data as PortfolioItem[]) ?? [];
  },
  ["portfolio-list"],
  { revalidate: 300, tags: ["portfolio"] }
);

export default function PortfolioPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="container">
        <SectionHeader eyebrow="Portfolio" title="תיק העבודות שלי" subtitle="גלריית העיצובים המובילה שלנו" />
        <Suspense fallback={<PortfolioGridSkeleton />}>
          <PortfolioGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function PortfolioGrid() {
  const items = await getPortfolio();
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-20">אין פריטים בגלריה כרגע</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((it, i) => (
        <div key={it.id} className={`relative rounded-3xl overflow-hidden shadow-lg group ${i % 5 === 0 ? "lg:row-span-2 aspect-[3/4] lg:aspect-[3/5]" : "aspect-square"}`}>
          <SafeImage
            src={it.image_url}
            alt={it.title || ""}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loading={i < 3 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-white">
            <h3 className="font-display text-xl font-bold">{it.title}</h3>
            {it.description && <p className="text-sm text-white/90">{it.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PortfolioGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className={`rounded-3xl bg-rose-100/60 animate-pulse ${i % 5 === 0 ? "lg:row-span-2 aspect-[3/4] lg:aspect-[3/5]" : "aspect-square"}`} />
      ))}
    </div>
  );
}
