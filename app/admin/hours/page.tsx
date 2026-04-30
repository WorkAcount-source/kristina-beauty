import { createClient } from "@/lib/supabase/server";
import { BusinessHoursForm } from "./form";

export default async function AdminBusinessHours() {
  const supabase = await createClient();
  const { data } = await supabase.from("business_hours").select("*").order("weekday");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">שעות פעילות</h1>
      <p className="text-sm text-muted-foreground">
        הגדרת שעות הפתיחה לפי יום בשבוע. בימים שמסומנים כסגור לא ניתן לקבוע תורים.
      </p>
      <BusinessHoursForm rows={data ?? []} />
    </div>
  );
}
