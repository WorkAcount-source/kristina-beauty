"use client";

import Link from "next/link";
import { useCart, useCartHydrated } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { SafeImage } from "@/components/safe-image";

export default function CartPage() {
  const hydrated = useCartHydrated();
  // Subscribe with narrow selectors so unrelated store changes don't rerender.
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const sum = items.reduce((a, b) => a + b.price * b.qty, 0);
  const totalQty = items.reduce((a, b) => a + b.qty, 0);

  // While the persist middleware rehydrates from localStorage, render a
  // skeleton instead of the empty state. This prevents the empty → full
  // flash and the resulting hydration mismatch.
  if (!hydrated) {
    return (
      <div className="pt-32 pb-20">
        <div className="container max-w-4xl">
          <div className="h-10 w-48 bg-rose-100/70 rounded-lg animate-pulse mb-8" />
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-rose-100 p-4 h-28 animate-pulse"
                />
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-rose-100 p-6 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20">
        <div className="container max-w-2xl text-center py-20">
          <ShoppingBag className="size-20 text-rose-300 mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold mb-4">העגלה ריקה</h1>
          <p className="text-muted-foreground mb-8">לא נוספו עדיין מוצרים לעגלה</p>
          <Button asChild size="lg">
            <Link href="/shop">לחנות</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20">
      <div className="container max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">העגלה שלך</h1>
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4 space-y-3"
              >
                <div className="flex gap-3 items-center">
                  <div className="relative size-16 sm:size-24 rounded-xl overflow-hidden bg-rose-50 shrink-0">
                    {it.image_url && (
                      <SafeImage
                        src={it.image_url}
                        alt={it.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{it.name}</h3>
                    <div className="text-rose-600 font-bold">{formatPrice(it.price)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-rose-50 rounded-full p-1">
                    <button
                      onClick={() => setQty(it.id, it.qty - 1)}
                      className="size-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-rose-600 hover:text-white"
                      aria-label="הפחת"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{it.qty}</span>
                    <button
                      onClick={() => setQty(it.id, it.qty + 1)}
                      className="size-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-rose-600 hover:text-white"
                      aria-label="הוסף"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    className="size-9 rounded-full hover:bg-destructive/10 text-destructive flex items-center justify-center"
                    aria-label="מחק"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={clear}
              className="text-sm text-muted-foreground hover:text-destructive"
            >
              נקה עגלה
            </button>
          </div>
          <aside className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 h-fit lg:sticky lg:top-28 space-y-4">
            <h2 className="font-display text-xl font-semibold">סיכום הזמנה</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">סה&quot;כ פריטים</span>
              <span className="font-medium">{totalQty}</span>
            </div>
            <div className="flex justify-between text-lg pt-3 border-t">
              <span className="font-semibold">סה&quot;כ לתשלום</span>
              <span className="font-bold text-gradient">{formatPrice(sum)}</span>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">
                למעבר לתשלום <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href="/shop">המשיכי בקנייה</Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
