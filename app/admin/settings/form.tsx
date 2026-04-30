"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";

interface Row {
  key: string;
  value: unknown;
}

export function SettingsForm({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [items, setItems] = useState<{ key: string; value: string }[]>(
    rows.map((r) => ({ key: r.key, value: JSON.stringify(r.value, null, 2) }))
  );
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState('""');

  async function saveOne(idx: number) {
    const it = items[idx];
    let parsed: unknown;
    try {
      parsed = JSON.parse(it.value);
    } catch {
      return toast.error("הערך אינו JSON תקין");
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: it.key, value: parsed });
    if (error) return toast.error(error.message);
    toast.success("נשמר");
    router.refresh();
  }

  async function remove(key: string) {
    if (!confirm(`למחוק ${key}?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("site_settings").delete().eq("key", key);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    router.refresh();
  }

  async function addNew() {
    if (!newKey.trim()) return toast.error("חסר מפתח");
    let parsed: unknown;
    try {
      parsed = JSON.parse(newValue);
    } catch {
      return toast.error("הערך אינו JSON תקין");
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .insert({ key: newKey.trim(), value: parsed });
    if (error) return toast.error(error.message);
    toast.success("נוסף");
    setNewKey("");
    setNewValue('""');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold">הוספת הגדרה חדשה</h2>
        <div className="grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
          <div>
            <Label>מפתח</Label>
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="phone"
              dir="ltr"
            />
          </div>
          <div>
            <Label>ערך (JSON)</Label>
            <Textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              rows={2}
              dir="ltr"
            />
          </div>
          <Button onClick={addNew}>
            <Plus className="size-4" /> הוסף
          </Button>
        </div>
      </div>

      {items.map((it, i) => (
        <div
          key={it.key}
          className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 space-y-3"
        >
          <div className="flex justify-between items-center">
            <code className="text-rose-700 font-semibold" dir="ltr">
              {it.key}
            </code>
            <button
              onClick={() => remove(it.key)}
              className="size-8 rounded-lg hover:bg-destructive/10 text-destructive flex items-center justify-center"
              aria-label="מחק"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <Textarea
            value={it.value}
            onChange={(e) => {
              const v = e.target.value;
              setItems((arr) => arr.map((x, idx) => (idx === i ? { ...x, value: v } : x)));
            }}
            rows={4}
            dir="ltr"
          />
          <Button size="sm" onClick={() => saveOne(i)}>
            <Save className="size-4" /> שמור
          </Button>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center text-muted-foreground p-8">אין הגדרות עדיין</div>
      )}
    </div>
  );
}
