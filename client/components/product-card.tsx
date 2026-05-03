"use client";

import Link from "next/link";
import { ShoppingBag, Plus } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/types/db";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url });
    toast.success("נוסף לעגלה", { description: product.name });
  };
  return (
    <Link href={`/shop/${product.id}`} className="group block editorial-panel rounded-[1.5rem] p-2 lift gradient-border">
      <div className="relative aspect-square rounded-[1.25rem] overflow-hidden bg-secondary mb-4">
        <SafeImage src={product.image_url} alt={product.name} fill sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition-transform transition-luxe group-hover:scale-[1.08]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <button onClick={handleAdd}
          className="absolute bottom-3 left-3 size-12 rounded-full bg-white shadow-xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-rose-600 hover:text-white hover:scale-110"
          aria-label="הוסיפי לסל">
          <Plus className="size-5" />
        </button>
        {product.category && (
          <span className="absolute top-3 right-3 px-3 py-1 glass rounded-full text-[11px] font-medium tracking-[0.16em] uppercase">
            {product.category}
          </span>
        )}
      </div>
      <div className="px-2 pb-3">
      <h3 className="font-display text-base sm:text-xl mb-1 group-hover:text-rose-800 transition-colors">{product.name}</h3>
      {product.description && <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <span className="font-display text-base sm:text-xl text-gradient">{formatPrice(Number(product.price))}</span>
        <Button size="sm" variant="soft" onClick={handleAdd}>
          <ShoppingBag className="size-4" /> <span className="hidden sm:inline">לסל</span><span className="sm:hidden">+</span>
        </Button>
      </div>
      </div>
    </Link>
  );
}
