"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Shield, ShieldOff, KeyRound, Ban, Trash2, Loader2 } from "lucide-react";

interface UserRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "admin" | "customer";
  created_at: string;
  email: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
}

export function UsersManager() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json()).error || "שגיאה");
      const j = await res.json();
      setUsers(j.users);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.full_name ?? "").toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
    );
  }, [users, query]);

  async function patch(id: string, action: "role" | "ban", value: string | boolean) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action, value }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(j.error || "שגיאה");
    toast.success("עודכן");
    load();
  }

  async function reset(email: string) {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reset", email }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(j.error || "שגיאה");
    if (j.link) {
      try {
        await navigator.clipboard.writeText(j.link);
        toast.success("הקישור הועתק");
      } catch {
        toast.success("נוצר קישור איפוס");
      }
    } else {
      toast.success("נשלח קישור איפוס");
    }
  }

  async function remove(id: string, email: string | null) {
    if (!confirm(`למחוק לצמיתות את ${email ?? id}?`)) return;
    const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(j.error || "שגיאה");
    toast.success("נמחק");
    load();
  }

  function isBanned(u: UserRow) {
    if (!u.banned_until) return false;
    return new Date(u.banned_until).getTime() > Date.now();
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש לפי שם / אימייל / טלפון..."
          className="pr-9"
        />
      </div>

      {loading && (
        <div className="flex justify-center p-8">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((u) => {
          const banned = isBanned(u);
          return (
            <div
              key={u.id}
              className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">
                    {u.full_name ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate" dir="ltr">
                    {u.email ?? "—"}
                  </div>
                  {u.phone && (
                    <div className="text-xs text-muted-foreground" dir="ltr">
                      {u.phone}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      u.role === "admin"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {u.role === "admin" ? "מנהל" : "לקוחה"}
                  </span>
                  {banned ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      חסום
                    </span>
                  ) : u.email_confirmed_at ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      פעיל
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      לא אומת
                    </span>
                  )}
                </div>
              </div>
              {u.last_sign_in_at && (
                <div className="text-[11px] text-muted-foreground">
                  כניסה אחרונה:{" "}
                  {new Date(u.last_sign_in_at).toLocaleDateString("he-IL")}
                </div>
              )}
              <div className="flex flex-wrap gap-1 pt-1 border-t border-rose-50">
                <button
                  onClick={() =>
                    patch(u.id, "role", u.role === "admin" ? "customer" : "admin")
                  }
                  className="size-9 rounded-lg hover:bg-rose-100 text-rose-700 flex items-center justify-center"
                  title={u.role === "admin" ? "הסר הרשאות מנהל" : "הפוך למנהל"}
                >
                  {u.role === "admin" ? (
                    <ShieldOff className="size-4" />
                  ) : (
                    <Shield className="size-4" />
                  )}
                </button>
                <button
                  onClick={() => u.email && reset(u.email)}
                  disabled={!u.email}
                  className="size-9 rounded-lg hover:bg-amber-100 text-amber-700 flex items-center justify-center disabled:opacity-40"
                  title="איפוס סיסמה"
                >
                  <KeyRound className="size-4" />
                </button>
                <button
                  onClick={() => patch(u.id, "ban", !banned)}
                  className="size-9 rounded-lg hover:bg-orange-100 text-orange-700 flex items-center justify-center"
                  title={banned ? "בטל חסימה" : "חסום"}
                >
                  <Ban className="size-4" />
                </button>
                <button
                  onClick={() => remove(u.id, u.email)}
                  className="size-9 rounded-lg hover:bg-destructive/10 text-destructive flex items-center justify-center"
                  title="מחק"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8 text-center text-muted-foreground text-sm">
            אין משתמשים
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-rose-100 overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-rose-50">
            <tr>
              <th className="p-3">שם</th>
              <th className="p-3">אימייל</th>
              <th className="p-3">טלפון</th>
              <th className="p-3">תפקיד</th>
              <th className="p-3">סטטוס</th>
              <th className="p-3">כניסה אחרונה</th>
              <th className="p-3 w-48">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const banned = isBanned(u);
              return (
                <tr key={u.id} className="border-t hover:bg-rose-50/40">
                  <td className="p-3">{u.full_name ?? "—"}</td>
                  <td className="p-3" dir="ltr">{u.email ?? "—"}</td>
                  <td className="p-3" dir="ltr">{u.phone ?? "—"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        u.role === "admin"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {u.role === "admin" ? "מנהל" : "לקוחה"}
                    </span>
                  </td>
                  <td className="p-3">
                    {banned ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        חסום
                      </span>
                    ) : u.email_confirmed_at ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        פעיל
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        לא אומת
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-xs whitespace-nowrap">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString("he-IL")
                      : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <button
                        onClick={() =>
                          patch(u.id, "role", u.role === "admin" ? "customer" : "admin")
                        }
                        className="size-8 rounded-lg hover:bg-rose-100 text-rose-700 flex items-center justify-center"
                        title={u.role === "admin" ? "הסר הרשאות מנהל" : "הפוך למנהל"}
                      >
                        {u.role === "admin" ? (
                          <ShieldOff className="size-4" />
                        ) : (
                          <Shield className="size-4" />
                        )}
                      </button>
                      <button
                        onClick={() => u.email && reset(u.email)}
                        disabled={!u.email}
                        className="size-8 rounded-lg hover:bg-amber-100 text-amber-700 flex items-center justify-center disabled:opacity-40"
                        title="איפוס סיסמה"
                      >
                        <KeyRound className="size-4" />
                      </button>
                      <button
                        onClick={() => patch(u.id, "ban", !banned)}
                        className="size-8 rounded-lg hover:bg-orange-100 text-orange-700 flex items-center justify-center"
                        title={banned ? "בטל חסימה" : "חסום"}
                      >
                        <Ban className="size-4" />
                      </button>
                      <button
                        onClick={() => remove(u.id, u.email)}
                        className="size-8 rounded-lg hover:bg-destructive/10 text-destructive flex items-center justify-center"
                        title="מחק"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  אין משתמשים
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
