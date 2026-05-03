import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import { Calendar, Package, GraduationCap, User } from "lucide-react";

export const metadata = { title: "החשבון שלי" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/account");

  const [profileRes, bookingsRes, ordersRes, enrollmentsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("bookings").select("*, services(name)").eq("user_id", user.id).order("start_at", { ascending: false }),
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("enrollments").select("*, courses(title)").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  type BookingRow = { id: string; start_at: string; status: string; services: { name: string } | null };
  type OrderRow = { id: string; total: number; status: string; created_at: string };
  type EnrollRow = { id: string; status: string; courses: { title: string } | null };

  const bookings = (bookingsRes.data as BookingRow[]) ?? [];
  const orders = (ordersRes.data as OrderRow[]) ?? [];
  const enrollments = (enrollmentsRes.data as EnrollRow[]) ?? [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-gradient-to-b from-rose-50/50 to-white">
        <div className="container max-w-5xl">
          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-5 sm:p-8 mb-6 sm:mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-14 sm:size-16 rounded-2xl bg-gradient-luxe text-white flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
                {profileRes.data?.full_name?.[0] || <User className="size-7 sm:size-8" />}
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xl sm:text-2xl font-bold truncate">שלום, {profileRes.data?.full_name || "לקוחה"}</h1>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <Section icon={<Calendar className="size-5" />} title="התורים שלי" count={bookings.length}>
              {bookings.length === 0 ? (
                <Empty><Link href="/booking" className="text-rose-600 hover:underline">הזמיני תור</Link></Empty>
              ) : (
                <ul className="space-y-3">
                  {bookings.slice(0, 5).map((b) => (
                    <li key={b.id} className="bg-rose-50/60 rounded-xl p-3">
                      <div className="font-semibold">{b.services?.name}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(b.start_at)} · {formatTime(b.start_at)}</div>
                      <div className="text-xs mt-1">סטטוס: <span className="font-medium">{statusHe(b.status)}</span></div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section icon={<Package className="size-5" />} title="ההזמנות שלי" count={orders.length}>
              {orders.length === 0 ? (
                <Empty><Link href="/shop" className="text-rose-600 hover:underline">לחנות</Link></Empty>
              ) : (
                <ul className="space-y-3">
                  {orders.slice(0, 5).map((o) => (
                    <li key={o.id} className="bg-rose-50/60 rounded-xl p-3">
                      <div className="flex justify-between"><span className="font-mono text-xs">#{o.id.slice(0, 8)}</span><span className="font-bold">{formatPrice(Number(o.total))}</span></div>
                      <div className="text-sm text-muted-foreground">{formatDate(o.created_at)}</div>
                      <div className="text-xs mt-1">סטטוס: <span className="font-medium">{statusHe(o.status)}</span></div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section icon={<GraduationCap className="size-5" />} title="הקורסים שלי" count={enrollments.length}>
              {enrollments.length === 0 ? (
                <Empty><Link href="/courses" className="text-rose-600 hover:underline">לקורסים</Link></Empty>
              ) : (
                <ul className="space-y-3">
                  {enrollments.map((e) => (
                    <li key={e.id} className="bg-rose-50/60 rounded-xl p-3">
                      <div className="font-semibold">{e.courses?.title}</div>
                      <div className="text-xs">סטטוס: <span className="font-medium">{statusHe(e.status)}</span></div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          {profileRes.data?.role === "admin" && (
            <div className="mt-8 text-center">
              <Button asChild variant="outline" size="lg"><Link href="/admin">ניהול אתר →</Link></Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ icon, title, count, children }: { icon: React.ReactNode; title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <span className="size-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">{icon}</span>
          {title}
        </h2>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-center py-6 text-sm text-muted-foreground">{children}</div>;
}

function statusHe(s: string) {
  const map: Record<string, string> = {
    pending: "ממתין", confirmed: "מאושר", cancelled: "בוטל", completed: "הושלם",
    paid: "שולם", shipped: "נשלח", delivered: "נמסר", refunded: "הוחזר",
    active: "פעיל",
  };
  return map[s] || s;
}
