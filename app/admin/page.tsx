import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Package, ShoppingBag, GraduationCap } from "lucide-react";

export default async function AdminHome() {
  const supabase = await createClient();
  const [b, o, p, c] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
  ]);
  const stats = [
    { label: "תורים", count: b.count ?? 0, icon: Calendar, color: "from-rose-500 to-pink-500" },
    { label: "הזמנות", count: o.count ?? 0, icon: ShoppingBag, color: "from-purple-500 to-pink-500" },
    { label: "מוצרים", count: p.count ?? 0, icon: Package, color: "from-amber-500 to-rose-500" },
    { label: "קורסים", count: c.count ?? 0, icon: GraduationCap, color: "from-emerald-500 to-teal-500" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">סקירה כללית</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`size-14 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg`}>
                <s.icon className="size-6" />
              </div>
              <div>
                <div className="text-3xl font-bold">{s.count}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>ברוכה הבאה למערכת הניהול</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">בחרי מהתפריט בצד את הקטגוריה שברצונך לנהל - תורים, הזמנות, מוצרים, קורסים, שירותים, גלריה והודעות.</p>
        </CardContent>
      </Card>
    </div>
  );
}
