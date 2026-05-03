import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/db";
import { SafeImage } from "@/components/safe-image";

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("products").select("id").eq("active", true);
  return (data ?? []).map((row) => ({ id: String(row.id) }));
}

export const revalidate = 3600;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).single();
  const product = data as Product | null;
  if (!product) notFound();

  return (
    <div className="pt-32 pb-20">
      <div className="container">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-rose-600">בית</Link>
          <ChevronRight className="size-4 rotate-180" />
          <Link href="/shop" className="hover:text-rose-600">חנות</Link>
          <ChevronRight className="size-4 rotate-180" />
          <span className="text-foreground">{product.name}</span>
        </nav>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-rose-50 shadow-lg">
            {product.image_url && <SafeImage src={product.image_url} alt={product.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" priority />}
          </div>
          <div className="space-y-6">
            {product.category && (
              <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">{product.category}</span>
            )}
            <h1 className="font-display text-4xl md:text-5xl font-bold">{product.name}</h1>
            <div className="text-3xl font-bold text-gradient">{formatPrice(Number(product.price))}</div>
            {product.description && <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>}
            <div className="text-sm text-muted-foreground">
              {product.stock > 0 ? <span className="text-emerald-600 font-medium">✓ במלאי ({product.stock} זמינים)</span> : <span className="text-destructive">אזל מהמלאי</span>}
            </div>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
