import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { ServiceCard } from "@/components/service-card";
import { SectionHeader } from "@/components/section-header";
import { createPublicClient } from "@/lib/supabase/public";
import type { Service } from "@/types/db";

export const metadata = { title: "שירותים" };
export const revalidate = 300;

const getServices = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    return (data as Service[]) ?? [];
  },
  ["services-list"],
  { revalidate: 300, tags: ["services"] }
);

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="container">
        <SectionHeader eyebrow="Services" title="השירותים שלנו" subtitle="טיפוח מקצועי לכל אישה" />
        <Suspense fallback={<ServicesGridSkeleton />}>
          <ServicesGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function ServicesGrid() {
  const services = await getServices();
  if (services.length === 0) {
    return <p className="text-center text-muted-foreground py-20">אין שירותים זמינים כרגע</p>;
  }
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((s) => <ServiceCard key={s.id} service={s} />)}
    </div>
  );
}

function ServicesGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-rose-50/60 animate-pulse h-72" />
      ))}
    </div>
  );
}
