"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/db";

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const handleAdd = () => {
    add({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url }, qty);
    toast.success("נוסף לעגלה", { description: `${product.name} × ${qty}` });
  };
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <div className="flex items-center gap-2 bg-rose-50 rounded-full p-1">
        <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors" aria-label="הפחת">
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center font-bold">{qty}</span>
        <button onClick={() => setQty(qty + 1)} className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors" aria-label="הוסף">
          <Plus className="size-4" />
        </button>
      </div>
      <Button onClick={handleAdd} size="lg" className="flex-1" disabled={product.stock <= 0}>
        <ShoppingBag className="size-5" /> הוסיפי לעגלה
      </Button>
    </div>
  );
}
