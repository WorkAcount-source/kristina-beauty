"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, Archive, Trash2, Search, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Row {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  created_at: string;
  read_at: string | null;
  archived_at: string | null;
}

type Tab = "inbox" | "archived";

export function MessagesList({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("inbox");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab === "inbox" && r.archived_at) return false;
      if (tab === "archived" && !r.archived_at) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.phone ?? "").toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q)
      );
    });
  }, [rows, query, tab]);

  const unreadCount = rows.filter((r) => !r.read_at && !r.archived_at).length;

  async function markRead(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("contact_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    router.refresh();
  }

  async function archive(id: string, archived: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("contact_messages")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(archived ? "הועבר לארכיון" : "הוחזר לתיבה");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("למחוק לצמיתות?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex rounded-xl border border-rose-200 overflow-hidden">
          <button
            onClick={() => setTab("inbox")}
            className={`px-4 py-2 text-sm ${
              tab === "inbox" ? "bg-rose-600 text-white" : "hover:bg-rose-50"
            }`}
          >
            תיבת דואר {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`px-4 py-2 text-sm ${
              tab === "archived" ? "bg-rose-600 text-white" : "hover:bg-rose-50"
            }`}
          >
            ארכיון
          </button>
        </div>
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש..."
            className="pr-9"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => {
          const unread = !r.read_at;
          return (
            <div
              key={r.id}
              className={`rounded-2xl shadow-sm border p-5 ${
                unread
                  ? "bg-rose-50/40 border-rose-300"
                  : "bg-white border-rose-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {unread && (
                    <span className="size-2 rounded-full bg-rose-600" aria-label="לא נקרא" />
                  )}
                  <div className="font-semibold">{r.name}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(r.created_at)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-2 flex flex-wrap gap-3">
                {r.email && (
                  <a href={`mailto:${r.email}`} className="hover:text-rose-700" dir="ltr">
                    {r.email}
                  </a>
                )}
                {r.phone && (
                  <a href={`tel:${r.phone}`} className="hover:text-rose-700" dir="ltr">
                    {r.phone}
                  </a>
                )}
              </div>
              <p className="whitespace-pre-wrap mb-3">{r.message}</p>
              <div className="flex flex-wrap gap-2">
                {unread && (
                  <Button size="sm" variant="outline" onClick={() => markRead(r.id)}>
                    <Eye className="size-4" /> סמן כנקרא
                  </Button>
                )}
                {r.email && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${r.email}`}>
                      <Mail className="size-4" /> השב
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => archive(r.id, !r.archived_at)}
                >
                  <Archive className="size-4" />
                  {r.archived_at ? " החזר לתיבה" : " ארכיון"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => remove(r.id)}
                  className="text-destructive"
                >
                  <Trash2 className="size-4" /> מחק
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground p-8">אין הודעות</div>
        )}
      </div>
    </div>
  );
}
