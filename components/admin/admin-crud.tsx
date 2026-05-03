"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, Save, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MediaUpload } from "@/components/admin/media-upload";
import { deleteMediaIfOwned } from "@/lib/admin/upload";
import Image from "next/image";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "textarea"
    | "image"
    | "video"
    | "url"
    | "boolean"
    | "select"
    | "datetime";
  required?: boolean;
  /** For type === "select" */
  options?: SelectOption[];
  /** Help text shown under the input. */
  hint?: string;
  /** Step for number inputs. Defaults to 0.01. */
  step?: string | number;
}

export interface AdminCrudRow {
  id: string;
  [key: string]: unknown;
}

export interface DisplayField {
  name: string;
  label: string;
  /** Render hint for the cell. */
  type?: "image" | "boolean" | "currency" | "date" | "text";
}

export function AdminCrud({
  table,
  rows,
  fields,
  displayFields,
  pageSize = 20,
  searchableFields,
  uploadFolder,
  rowLink,
}: {
  table: string;
  rows: AdminCrudRow[];
  fields: FieldDef[];
  displayFields: DisplayField[];
  pageSize?: number;
  searchableFields?: string[];
  uploadFolder?: string;
  /** Optional link per row. Use `{id}` as placeholder for the row id. e.g. "/admin/courses/{id}/chapters" */
  rowLink?: { href: string; label: string };
}) {
  const [editing, setEditing] = useState<AdminCrudRow | null>(null);
  const [creating, setCreating] = useState(false);
  // Working copy of file/url fields so MediaUpload can be controlled.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const folder = uploadFolder ?? table;

  const searchKeys = useMemo(
    () =>
      searchableFields ??
      displayFields
        .filter((d) => d.type !== "image" && d.type !== "boolean")
        .map((d) => d.name),
    [searchableFields, displayFields]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q))
    );
  }, [rows, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setDraft({});
  }
  function openEdit(r: AdminCrudRow) {
    setCreating(false);
    setEditing(r);
    const d: Record<string, string> = {};
    for (const f of fields) {
      if (f.type === "image" || f.type === "video" || f.type === "url") {
        d[f.name] = (r[f.name] as string) ?? "";
      }
    }
    setDraft(d);
  }
  function closeForm() {
    setEditing(null);
    setCreating(false);
    setDraft({});
  }

  async function onDelete(r: AdminCrudRow) {
    if (!confirm("למחוק?")) return;
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    // Best-effort: clean up any uploaded assets we own.
    for (const f of fields) {
      if (f.type === "image" || f.type === "video") {
        await deleteMediaIfOwned(r[f.name] as string | null).catch(() => {});
      }
    }
    toast.success("נמחק");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const fd = new FormData(e.currentTarget);
      const payload: Record<string, unknown> = {};

      for (const f of fields) {
        if (f.type === "image" || f.type === "video" || f.type === "url") {
          const val = (draft[f.name] ?? "").trim();
          payload[f.name] = val === "" ? null : val;
          continue;
        }
        if (f.type === "boolean") {
          payload[f.name] = fd.get(f.name) === "on";
          continue;
        }
        const raw = fd.get(f.name);
        if (raw == null || raw === "") {
          payload[f.name] = null;
          continue;
        }
        if (f.type === "number") {
          payload[f.name] = Number(raw);
        } else if (f.type === "datetime") {
          payload[f.name] = new Date(String(raw)).toISOString();
        } else {
          payload[f.name] = String(raw);
        }
      }

      const supabase = createClient();
      const { error } = editing
        ? await supabase.from(table).update(payload).eq("id", editing.id)
        : await supabase.from(table).insert(payload);
      if (error) return toast.error(error.message);
      toast.success("נשמר");
      closeForm();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const showForm = creating || !!editing;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="חיפוש..."
            className="pr-9"
          />
        </div>
        <div className="text-xs text-muted-foreground hidden md:block">
          {filtered.length} פריטים
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> חדש
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl font-semibold">
              {editing ? "עריכה" : "הוספה"}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="size-9 rounded-full hover:bg-rose-50 flex items-center justify-center"
            >
              <X className="size-4" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <FieldRenderer
                key={f.name}
                field={f}
                editing={editing}
                draft={draft}
                setDraft={setDraft}
                folder={folder}
              />
            ))}
            <div className="sm:col-span-2 flex gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                <Save className="size-4" /> {submitting ? "שומר..." : "שמור"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={submitting}
              >
                ביטול
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile card list — visible on <md */}
      <div className="md:hidden space-y-3">
        {visible.map((r) => {
          const imageField = displayFields.find((d) => d.type === "image");
          const titleField =
            displayFields.find((d) => d.type !== "image" && d.type !== "boolean") ??
            displayFields[0];
          const otherFields = displayFields.filter(
            (d) => d !== imageField && d !== titleField
          );
          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4"
            >
              <div className="flex items-start gap-3">
                {imageField && (
                  <div className="shrink-0">
                    <CellRenderer field={imageField} value={r[imageField.name]} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {titleField && (
                    <div className="font-semibold text-sm break-words">
                      <CellRenderer
                        field={{ ...titleField, type: "text" }}
                        value={r[titleField.name]}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  {rowLink && (
                    <Link
                      href={rowLink.href.replace("{id}", r.id)}
                      className="size-9 rounded-lg hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-medium px-2"
                      title={rowLink.label}
                    >
                      {rowLink.label}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="size-9 rounded-lg hover:bg-rose-100 text-rose-700 flex items-center justify-center"
                    aria-label="ערוך"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r)}
                    className="size-9 rounded-lg hover:bg-destructive/10 text-destructive flex items-center justify-center"
                    aria-label="מחק"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {otherFields.length > 0 && (
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  {otherFields.map((d) => (
                    <div key={d.name} className="min-w-0">
                      <dt className="text-muted-foreground">{d.label}</dt>
                      <dd className="font-medium break-words">
                        <CellRenderer field={d} value={r[d.name]} />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8 text-center text-muted-foreground text-sm">
            אין נתונים להצגה
          </div>
        )}
      </div>

      {/* Desktop table — visible on md+ */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-rose-100 overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-rose-50">
            <tr>
              {displayFields.map((d) => (
                <th key={d.name} className="p-3 font-semibold whitespace-nowrap">
                  {d.label}
                </th>
              ))}
              <th className="p-3 w-24">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-t hover:bg-rose-50/40">
                {displayFields.map((d) => (
                  <td key={d.name} className="p-3 max-w-xs">
                    <CellRenderer field={d} value={r[d.name]} />
                  </td>
                ))}
                <td className="p-3">
                  <div className="flex gap-1 justify-center">
                    {rowLink && (
                      <Link
                        href={rowLink.href.replace("{id}", r.id)}
                        className="h-8 rounded-lg hover:bg-rose-100 text-rose-600 flex items-center justify-center px-2 text-xs font-medium"
                        title={rowLink.label}
                      >
                        {rowLink.label}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="size-8 rounded-lg hover:bg-rose-100 text-rose-700 flex items-center justify-center"
                      aria-label="ערוך"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r)}
                      className="size-8 rounded-lg hover:bg-destructive/10 text-destructive flex items-center justify-center"
                      aria-label="מחק"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={displayFields.length + 1}
                  className="p-8 text-center text-muted-foreground"
                >
                  אין נתונים להצגה
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
          >
            <ChevronRight className="size-4" />
          </Button>
          <div className="text-sm">
            עמוד {safePage} מתוך {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------- field renderer ---------------------------------------------------

function FieldRenderer({
  field: f,
  editing,
  draft,
  setDraft,
  folder,
}: {
  field: FieldDef;
  editing: AdminCrudRow | null;
  draft: Record<string, string>;
  setDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  folder: string;
}) {
  const wide = f.type === "textarea" || f.type === "image" || f.type === "video";
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label htmlFor={f.name}>
        {f.label}
        {f.required && <span className="text-rose-600 mr-1">*</span>}
      </Label>

      {f.type === "textarea" ? (
        <Textarea
          id={f.name}
          name={f.name}
          rows={4}
          defaultValue={(editing?.[f.name] as string) || ""}
          required={f.required}
        />
      ) : f.type === "boolean" ? (
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id={f.name}
            name={f.name}
            defaultChecked={editing ? !!editing[f.name] : true}
            className="size-5 rounded border-rose-300 text-rose-600"
          />
          <span className="text-sm text-muted-foreground">פעיל</span>
        </label>
      ) : f.type === "select" ? (
        <select
          id={f.name}
          name={f.name}
          defaultValue={(editing?.[f.name] as string) || ""}
          required={f.required}
          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
        >
          <option value="">— ללא —</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : f.type === "image" || f.type === "video" ? (
        <MediaUpload
          value={draft[f.name] ?? ""}
          onChange={(url) => setDraft((d) => ({ ...d, [f.name]: url }))}
          kind={f.type}
          folder={folder}
        />
      ) : f.type === "url" ? (
        <Input
          id={f.name}
          name={f.name}
          type="url"
          dir="ltr"
          value={draft[f.name] ?? ""}
          onChange={(e) =>
            setDraft((d) => ({ ...d, [f.name]: e.target.value }))
          }
          required={f.required}
          placeholder="https://..."
        />
      ) : f.type === "datetime" ? (
        <Input
          id={f.name}
          name={f.name}
          type="datetime-local"
          defaultValue={
            editing?.[f.name]
              ? new Date(editing[f.name] as string).toISOString().slice(0, 16)
              : ""
          }
          required={f.required}
        />
      ) : (
        <Input
          id={f.name}
          name={f.name}
          type={f.type === "number" ? "number" : "text"}
          step={f.step ?? (f.type === "number" ? "0.01" : undefined)}
          defaultValue={
            (editing?.[f.name] as string | number | undefined) ?? ""
          }
          required={f.required}
        />
      )}

      {f.hint && <p className="text-xs text-muted-foreground mt-1">{f.hint}</p>}
    </div>
  );
}

// ---------- cell renderer ----------------------------------------------------

function CellRenderer({ field, value }: { field: DisplayField; value: unknown }) {
  if (field.type === "image") {
    const url = typeof value === "string" ? value : "";
    return url ? (
      <div className="relative size-12 rounded-lg overflow-hidden bg-rose-50">
        <Image src={url} alt="" fill sizes="48px" className="object-cover" unoptimized />
      </div>
    ) : (
      <span className="text-muted-foreground text-xs">—</span>
    );
  }
  if (field.type === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
        ✓ פעיל
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-600">
        כבוי
      </span>
    );
  }
  if (field.type === "currency") {
    return <span>{Number(value ?? 0).toFixed(2)} ₪</span>;
  }
  if (field.type === "date") {
    if (!value) return <span className="text-muted-foreground text-xs">—</span>;
    const d = new Date(String(value));
    return <span className="text-xs whitespace-nowrap">{d.toLocaleDateString("he-IL")}</span>;
  }
  return <span className="block truncate">{String(value ?? "")}</span>;
}
