import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminOrders() {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
  type Row = { id: string; created_at: string; customer_name: string | null; total: number; status: string };
  const rows = (data as Row[]) ?? [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">הזמנות</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-rose-50">
            <tr className="text-right">
              <th className="p-3">#</th><th className="p-3">תאריך</th><th className="p-3">לקוחה</th><th className="p-3">סכום</th><th className="p-3">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-rose-50/40">
                <td className="p-3 font-mono text-xs">{r.id.slice(0, 8)}</td>
                <td className="p-3">{formatDate(r.created_at)}</td>
                <td className="p-3">{r.customer_name}</td>
                <td className="p-3 font-semibold">{formatPrice(Number(r.total))}</td>
                <td className="p-3"><span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
