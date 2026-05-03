"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

interface Row {
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
}

export function BusinessHoursForm({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const initial: Row[] = Array.from({ length: 7 }, (_, w) => {
    const r = rows.find((x) => x.weekday === w);
    return r ?? { weekday: w, open_time: "09:00", close_time: "18:00", closed: false };
  });
  const [state, setState] = useState<Row[]>(initial);
  const [saving, setSaving] = useState(false);

  function update(w: number, patch: Partial<Row>) {
    setState((s) => s.map((r) => (r.weekday === w ? { ...r, ...patch } : r)));
  }

  async function save() {
    setSaving(true);
    const payload = state.map((r) => ({
      weekday: r.weekday,
      open_time: r.closed ? null : r.open_time || null,
      close_time: r.closed ? null : r.close_time || null,
      closed: r.closed,
    }));
    const supabase = createClient();
    const { error } = await supabase.from("business_hours").upsert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("נשמר");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 space-y-4">
      {state.map((r) => (
        <div
          key={r.weekday}
          className="grid grid-cols-1 sm:grid-cols-[8rem_1fr_1fr_auto] gap-3 items-end pb-4 border-b last:border-0"
        >
          <div className="font-semibold pt-2">{DAYS[r.weekday]}</div>
          <div>
            <Label>פתיחה</Label>
            <Input
              type="time"
              value={r.open_time ?? ""}
              onChange={(e) => update(r.weekday, { open_time: e.target.value })}
              disabled={r.closed}
              dir="ltr"
            />
          </div>
          <div>
            <Label>סגירה</Label>
            <Input
              type="time"
              value={r.close_time ?? ""}
              onChange={(e) => update(r.weekday, { close_time: e.target.value })}
              disabled={r.closed}
              dir="ltr"
            />
          </div>
          <label className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              checked={r.closed}
              onChange={(e) => update(r.weekday, { closed: e.target.checked })}
              className="size-5 rounded border-rose-300"
            />
            <span className="text-sm">סגור</span>
          </label>
        </div>
      ))}
      <Button onClick={save} disabled={saving}>
        <Save className="size-4" /> {saving ? "שומר..." : "שמור הכל"}
      </Button>
    </div>
  );
}
