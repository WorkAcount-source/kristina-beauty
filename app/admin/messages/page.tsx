import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminMessages() {
  const supabase = await createClient();
  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100);
  type Row = { id: string; name: string; email: string | null; phone: string | null; message: string; created_at: string };
  const rows = (data as Row[]) ?? [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">הודעות</h1>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-rose-100 p-5">
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground">{formatDate(r.created_at)}</div>
            </div>
            <div className="text-sm text-muted-foreground mb-2">{r.email} · {r.phone}</div>
            <p className="whitespace-pre-wrap">{r.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
