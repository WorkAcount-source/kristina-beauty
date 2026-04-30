"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "image" | "boolean";
  required?: boolean;
}

export interface AdminCrudRow {
  id: string;
  [key: string]: unknown;
}

export function AdminCrud({ table, rows, fields, displayFields }: {
  table: string;
  rows: AdminCrudRow[];
  fields: FieldDef[];
  displayFields: { name: string; label: string }[];
}) {
  const [editing, setEditing] = useState<AdminCrudRow | null>(null);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function onDelete(id: string) {
    if (!confirm("למחוק?")) return;
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = fd.get(f.name);
      if (raw == null || raw === "") {
        if (f.type === "boolean") payload[f.name] = false;
        continue;
      }
      payload[f.name] = f.type === "number" ? Number(raw) : f.type === "boolean" ? raw === "on" : String(raw);
    }
    const supabase = createClient();
    const { error } = editing
      ? await supabase.from(table).update(payload).eq("id", editing.id)
      : await supabase.from(table).insert(payload);
    if (error) return toast.error(error.message);
    toast.success("נשמר");
    setEditing(null);
    setCreating(false);
    router.refresh();
  }

  const showForm = creating || !!editing;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setCreating(true); setEditing(null); }}><Plus className="size-4" /> חדש</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl font-semibold">{editing ? "עריכה" : "הוספה"}</h3>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="size-9 rounded-full hover:bg-rose-50 flex items-center justify-center"><X className="size-4" /></button>
          </div>
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <Label htmlFor={f.name}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea id={f.name} name={f.name} rows={3} defaultValue={(editing?.[f.name] as string) || ""} required={f.required} />
                ) : f.type === "boolean" ? (
                  <input type="checkbox" id={f.name} name={f.name} defaultChecked={editing ? !!editing[f.name] : true} className="size-5 rounded border-rose-300 text-rose-600" />
                ) : (
                  <Input id={f.name} name={f.name} type={f.type === "number" ? "number" : "text"} step="0.01"
                    defaultValue={(editing?.[f.name] as string | number | undefined) ?? ""} required={f.required} />
                )}
              </div>
            ))}
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit"><Save className="size-4" /> שמור</Button>
              <Button type="button" variant="outline" onClick={() => { setEditing(null); setCreating(false); }}>ביטול</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-rose-50">
            <tr className="text-right">
              {displayFields.map((d) => <th key={d.name} className="p-3">{d.label}</th>)}
              <th className="p-3 w-24">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-rose-50/40">
                {displayFields.map((d) => (
                  <td key={d.name} className="p-3 max-w-xs truncate">{String(r[d.name] ?? "")}</td>
                ))}
                <td className="p-3 flex gap-1">
                  <button onClick={() => { setEditing(r); setCreating(false); }} className="size-8 rounded-lg hover:bg-rose-100 text-rose-700 flex items-center justify-center" aria-label="ערוך"><Pencil className="size-4" /></button>
                  <button onClick={() => onDelete(r.id)} className="size-8 rounded-lg hover:bg-destructive/10 text-destructive flex items-center justify-center" aria-label="מחק"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
