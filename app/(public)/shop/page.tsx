import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product } from "@/types/db";

export const metadata = { title: "חנות" };
export const revalidate = 300;

const getProducts = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    return (data as Product[]) ?? [];
  },
  ["products-list"],
  { revalidate: 300, tags: ["products"] }
);

export default function ShopPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="container">
        <SectionHeader eyebrow="Shop" title="החנות שלנו" subtitle="מוצרי האיכות שלנו לטיפוח עצמי בבית" />
        <Suspense fallback={<ProductsGridSkeleton />}>
          <ProductsGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductsGrid() {
  const products = await getProducts();
  if (products.length === 0) {
    return <p className="text-center text-muted-foreground py-20">אין מוצרים זמינים כרגע</p>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-[1.5rem] p-2 bg-rose-50/60 animate-pulse">
          <div className="aspect-square rounded-[1.25rem] bg-rose-100/70" />
          <div className="p-2 mt-3 space-y-2">
            <div className="h-4 w-2/3 bg-rose-100 rounded" />
            <div className="h-3 w-1/2 bg-rose-100/70 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
