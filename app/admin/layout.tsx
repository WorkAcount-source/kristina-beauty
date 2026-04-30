import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { AdminNav, type AdminNavSection } from "@/components/admin/admin-nav";

export const metadata = { title: "ניהול" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/admin");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const sections: AdminNavSection[] = [
    {
      title: "כללי",
      links: [
        { href: "/admin", label: "סקירה", icon: "LayoutDashboard" },
        { href: "/admin/audit", label: "יומן פעילות", icon: "ScrollText" },
      ],
    },
    {
      title: "פעילות יומיומית",
      links: [
        { href: "/admin/calendar", label: "יומן", icon: "Calendar" },
        { href: "/admin/bookings", label: "תורים", icon: "Calendar" },
        { href: "/admin/orders", label: "הזמנות", icon: "ShoppingBag" },
        { href: "/admin/messages", label: "הודעות", icon: "Mail" },
        { href: "/admin/enrollments", label: "רישומים", icon: "GraduationCap" },
      ],
    },
    {
      title: "תוכן",
      links: [
        { href: "/admin/services", label: "שירותים", icon: "Sparkles" },
        { href: "/admin/categories", label: "קטגוריות", icon: "Tag" },
        { href: "/admin/products", label: "מוצרים", icon: "Package" },
        { href: "/admin/courses", label: "קורסים", icon: "GraduationCap" },
        { href: "/admin/portfolio", label: "תיק עבודות", icon: "ImgIcon" },
        { href: "/admin/instagram", label: "אינסטגרם", icon: "Instagram" },
      ],
    },
    {
      title: "תצורה",
      links: [
        { href: "/admin/hours", label: "שעות פעילות", icon: "Clock" },
        { href: "/admin/blocked-slots", label: "חסימות יומן", icon: "CalendarOff" },
        { href: "/admin/users", label: "משתמשים", icon: "Users" },
        { href: "/admin/settings", label: "הגדרות", icon: "Settings" },
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 lg:pt-24 bg-rose-50/30">
        <div className="container grid lg:grid-cols-[240px_1fr] gap-4 lg:gap-8 py-4 lg:py-8">
          <AdminNav sections={sections} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </>
  );
}
