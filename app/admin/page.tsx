import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Package,
  ShoppingBag,
  GraduationCap,
  Mail,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = await createClient();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    bookingsTotal,
    bookingsToday,
    bookingsPending,
    ordersTotal,
    ordersPaidThisMonth,
    productsTotal,
    coursesTotal,
    messagesUnread,
    lowStock,
    recentAudit,
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("start_at", startOfDay.toISOString())
      .lt("start_at", endOfDay.toISOString()),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("total")
      .eq("status", "paid")
      .gte("created_at", startOfMonth.toISOString()),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .is("read_at", null)
      .is("archived_at", null),
    supabase
      .from("products")
      .select("id, name, stock")
      .lt("stock", 5)
      .eq("active", true)
      .order("stock"),
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const revenue = (ordersPaidThisMonth.data ?? []).reduce(
    (s, o) => s + Number(o.total ?? 0),
    0
  );

  const kpis = [
    {
      label: "הכנסות החודש",
      value: `${revenue.toFixed(0)} ₪`,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
      href: "/admin/orders",
    },
    {
      label: "תורים היום",
      value: bookingsToday.count ?? 0,
      icon: Calendar,
      color: "from-rose-500 to-pink-500",
      href: "/admin/bookings",
    },
    {
      label: "תורים ממתינים",
      value: bookingsPending.count ?? 0,
      icon: Calendar,
      color: "from-amber-500 to-rose-500",
      href: "/admin/bookings",
    },
    {
      label: "הודעות חדשות",
      value: messagesUnread.count ?? 0,
      icon: Mail,
      color: "from-purple-500 to-pink-500",
      href: "/admin/messages",
    },
  ];

  const counts = [
    { label: "סה״כ תורים", count: bookingsTotal.count ?? 0, icon: Calendar },
    { label: "סה״כ הזמנות", count: ordersTotal.count ?? 0, icon: ShoppingBag },
    { label: "מוצרים", count: productsTotal.count ?? 0, icon: Package },
    { label: "קורסים", count: coursesTotal.count ?? 0, icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl md:text-3xl font-bold">סקירה כללית</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className="group-hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div
                  className={`size-14 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg`}
                >
                  <s.icon className="size-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {counts.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold">{s.count}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
              <s.icon className="size-5 text-rose-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              מלאי נמוך
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(lowStock.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">כל המוצרים במלאי תקין.</p>
            ) : (
              <ul className="space-y-2">
                {(lowStock.data ?? []).map((p) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span
                      className={
                        Number(p.stock) === 0 ? "text-red-600 font-semibold" : "text-amber-600"
                      }
                    >
                      {p.stock} ביחידות
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פעילות אחרונה</CardTitle>
          </CardHeader>
          <CardContent>
            {(recentAudit.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">אין פעילות עדיין.</p>
            ) : (
              <ul className="space-y-2">
                {(recentAudit.data ?? []).map((a) => (
                  <li key={a.id as number} className="flex justify-between text-xs gap-3">
                    <span className="truncate">
                      <span className="font-mono text-muted-foreground">
                        {String(a.action)}
                      </span>{" "}
                      <span className="font-semibold">{String(a.table_name)}</span>{" "}
                      {a.actor_email && (
                        <span className="text-muted-foreground" dir="ltr">
                          ({String(a.actor_email)})
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {new Date(a.created_at as string).toLocaleString("he-IL", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/audit"
              className="block text-xs text-rose-700 hover:underline mt-3"
            >
              לצפייה ביומן המלא ←
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
