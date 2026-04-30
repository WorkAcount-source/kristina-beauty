"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { CreditCard, Lock } from "lucide-react";

export function CheckoutForm({ defaultName, defaultEmail, defaultPhone }: {
  defaultName?: string; defaultEmail?: string; defaultPhone?: string;
}) {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (items.length === 0 && !loading) {
    return (
      <div className="text-center py-20">
        <p>העגלה ריקה</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          customer: {
            name: String(fd.get("name") || ""),
            email: String(fd.get("email") || ""),
            phone: String(fd.get("phone") || ""),
            address: {
              line1: String(fd.get("address") || ""),
              city: String(fd.get("city") || ""),
              zip: String(fd.get("zip") || ""),
            },
            notes: String(fd.get("notes") || ""),
          },
        }),
      });
      const json = await res.json();
      if (res.status === 401) {
        toast.error("יש להתחבר כדי להשלים תשלום");
        router.push(`/auth/login?redirect=/checkout`);
        return;
      }
      if (!res.ok) throw new Error(json.error || "שגיאה");
      if (json.url) {
        window.location.href = json.url;
      } else {
        clear();
        toast.success("ההזמנה נקלטה!");
        router.push(`/account?tab=orders&new=${json.orderId || ""}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "שגיאה";
      toast.error("שגיאה בתשלום", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 space-y-5 order-2 lg:order-1">
        <h2 className="font-display text-xl font-semibold">פרטי משלוח</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label htmlFor="name">שם מלא *</Label><Input id="name" name="name" defaultValue={defaultName} required /></div>
          <div><Label htmlFor="phone">טלפון *</Label><Input id="phone" name="phone" type="tel" defaultValue={defaultPhone} required /></div>
        </div>
        <div><Label htmlFor="email">דוא&quot;ל *</Label><Input id="email" name="email" type="email" defaultValue={defaultEmail} required /></div>
        <div><Label htmlFor="address">כתובת *</Label><Input id="address" name="address" required /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label htmlFor="city">עיר *</Label><Input id="city" name="city" required /></div>
          <div><Label htmlFor="zip">מיקוד</Label><Input id="zip" name="zip" /></div>
        </div>
        <div><Label htmlFor="notes">הערות להזמנה</Label><Textarea id="notes" name="notes" rows={3} /></div>
        <Button type="submit" disabled={loading} size="lg" className="w-full">
          <CreditCard className="size-5" /> {loading ? "מעבד..." : `שלם ${formatPrice(total())}`}
        </Button>
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Lock className="size-3" /> תשלום מאובטח דרך Stripe
        </p>
      </div>
      <aside className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 h-fit lg:sticky lg:top-28 space-y-3 order-1 lg:order-2">
        <h2 className="font-display text-xl font-semibold mb-2">סיכום הזמנה</h2>
        {items.map((it) => (
          <div key={it.id} className="flex justify-between text-sm">
            <span className="truncate">{it.name} × {it.qty}</span>
            <span className="font-medium shrink-0 mr-2">{formatPrice(it.price * it.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between text-lg pt-3 border-t">
          <span className="font-semibold">סה&quot;כ</span>
          <span className="font-bold text-gradient">{formatPrice(total())}</span>
        </div>
      </aside>
    </form>
  );
}
