import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import { BookingFlow } from "@/components/booking/booking-flow";
import { createClient } from "@/lib/supabase/server";
import type { Service, BusinessHours } from "@/types/db";

export const metadata = { title: "הזמנת תור" };

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const target = sp.service ? `/booking?service=${sp.service}` : "/booking";
    redirect(`/auth/login?redirect=${encodeURIComponent(target)}`);
  }

  const [{ data: services }, { data: hours }, { data: profile }] = await Promise.all([
    supabase.from("services").select("*").eq("active", true).order("created_at"),
    supabase.from("business_hours").select("*").order("weekday"),
    supabase.from("profiles").select("full_name,phone").eq("id", user.id).single(),
  ]);
  return (
    <div className="pt-32 pb-20">
      <div className="container max-w-4xl">
        <SectionHeader eyebrow="Booking" title="הזמנת תור" subtitle="בחרי את השירות המועדף עלייך וקבעי תור בקלות" />
        <BookingFlow
          services={(services as Service[]) ?? []}
          businessHours={(hours as BusinessHours[]) ?? []}
          initialServiceId={sp.service}
          defaultName={profile?.full_name ?? ""}
          defaultEmail={user.email ?? ""}
          defaultPhone={profile?.phone ?? ""}
        />
      </div>
    </div>
  );
}
