import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  insert: "יצירה",
  update: "עדכון",
  delete: "מחיקה",
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const pageSize = 50;
  const page = Math.max(1, Number(sp.page ?? 1));
  let q = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (sp.table) q = q.eq("table_name", sp.table);
  const { data, count } = await q;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl md:text-3xl font-bold">יומן פעילות</h1>
      <p className="text-sm text-muted-foreground">
        תיעוד כל פעולות היצירה, עדכון ומחיקה בטבלאות הניהוליות. שימושי לשחזור ושקיפות.
      </p>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {(data ?? []).map((r) => (
          <div
            key={r.id as number}
            className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  r.action === "delete"
                    ? "bg-red-100 text-red-700"
                    : r.action === "insert"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {ACTION_LABELS[r.action as string] ?? (r.action as string)}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(r.created_at as string).toLocaleString("he-IL")}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">טבלה: </span>
              <span className="font-mono">{r.table_name as string}</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">משתמש: </span>
              <span dir="ltr">{(r.actor_email as string) ?? "—"}</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">רשומה: </span>
              <span className="font-mono" dir="ltr">
                {String(r.record_id ?? "").slice(0, 8)}
              </span>
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8 text-center text-muted-foreground text-sm">
            אין רשומות
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-rose-100 overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-rose-50">
            <tr>
              <th className="p-3">תאריך</th>
              <th className="p-3">משתמש</th>
              <th className="p-3">פעולה</th>
              <th className="p-3">טבלה</th>
              <th className="p-3">רשומה</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r) => (
              <tr key={r.id} className="border-t hover:bg-rose-50/40 align-top">
                <td className="p-3 whitespace-nowrap text-xs">
                  {new Date(r.created_at as string).toLocaleString("he-IL")}
                </td>
                <td className="p-3 text-xs" dir="ltr">
                  {(r.actor_email as string) ?? "—"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      r.action === "delete"
                        ? "bg-red-100 text-red-700"
                        : r.action === "insert"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ACTION_LABELS[r.action as string] ?? (r.action as string)}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">{r.table_name as string}</td>
                <td className="p-3 font-mono text-xs" dir="ltr">
                  {String(r.record_id ?? "").slice(0, 8)}
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  אין רשומות
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 text-sm">
          <span>
            עמוד {page} מתוך {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
