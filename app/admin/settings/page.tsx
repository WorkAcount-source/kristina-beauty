import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./form";

export default async function AdminSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").order("key");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">הגדרות אתר</h1>
      <p className="text-sm text-muted-foreground">
        זוגות מפתח/ערך עבור הגדרות גלובליות (מספר טלפון, אימייל, כתובת, רשתות חברתיות וכו׳).
        הערך הוא JSON: מחרוזת בתוך מירכאות, מספר ללא, אובייקט בסוגריים מסולסלים.
      </p>
      <SettingsForm rows={data ?? []} />
    </div>
  );
}
