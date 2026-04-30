import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Calendar, Package, ShoppingBag, GraduationCap, Image as ImgIcon, Sparkles, Users } from "lucide-react";

export const metadata = { title: "ניהול" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/admin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const links = [
    { href: "/admin", label: "סקירה", icon: Sparkles },
    { href: "/admin/bookings", label: "תורים", icon: Calendar },
    { href: "/admin/orders", label: "הזמנות", icon: ShoppingBag },
    { href: "/admin/services", label: "שירותים", icon: Sparkles },
    { href: "/admin/products", label: "מוצרים", icon: Package },
    { href: "/admin/courses", label: "קורסים", icon: GraduationCap },
    { href: "/admin/portfolio", label: "תיק עבודות", icon: ImgIcon },
    { href: "/admin/messages", label: "הודעות", icon: Users },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 bg-rose-50/30">
        <div className="container grid lg:grid-cols-[240px_1fr] gap-4 lg:gap-8 py-4 lg:py-8">
          <aside className="bg-white rounded-2xl shadow-sm border border-rose-100 p-3 h-fit lg:sticky lg:top-28">
            <h2 className="font-display text-lg font-bold px-3 py-2 text-gradient hidden lg:block">ניהול אתר</h2>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center gap-2 px-3 py-2 lg:py-2.5 rounded-xl text-sm font-medium hover:bg-rose-50 hover:text-rose-700 transition-colors whitespace-nowrap shrink-0">
                  <l.icon className="size-4 shrink-0" /> <span className="hidden sm:inline">{l.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </>
  );
}
