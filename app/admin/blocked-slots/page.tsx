import { createClient } from "@/lib/supabase/server";
import { AdminCrud } from "@/components/admin/admin-crud";

export default async function AdminBlockedSlots() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocked_slots")
    .select("*")
    .order("start_at", { ascending: false });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">חסימות יומן</h1>
      <p className="text-muted-foreground text-sm">
        חסימת טווחי זמן בהם לא ניתן לקבוע תור (חופשה, אירוע פרטי וכו׳).
      </p>
      <AdminCrud
        table="blocked_slots"
        rows={data ?? []}
        fields={[
          { name: "start_at", label: "התחלה", type: "datetime", required: true },
          { name: "end_at", label: "סיום", type: "datetime", required: true },
          { name: "reason", label: "סיבה" },
        ]}
        displayFields={[
          { name: "start_at", label: "התחלה", type: "date" },
          { name: "end_at", label: "סיום", type: "date" },
          { name: "reason", label: "סיבה" },
        ]}
      />
    </div>
  );
}
