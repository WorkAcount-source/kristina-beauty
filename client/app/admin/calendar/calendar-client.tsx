"use client";

import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  EventDropArg,
  EventClickArg,
  DateSelectArg,
  EventInput,
  EventApi,
} from "@fullcalendar/core";
import heLocale from "@fullcalendar/core/locales/he";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { X, Save, Trash2, Copy } from "lucide-react";

interface Booking {
  id: string;
  service_id: string;
  start_at: string;
  end_at: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  service_name: string;
}

interface Service {
  id: string;
  name: string;
  duration_min: number;
  price: number;
}

interface BlockedSlot {
  id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
}

interface BusinessHour {
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  pending: { bg: "#fde68a", border: "#f59e0b" },
  confirmed: { bg: "#fbcfe8", border: "#ec4899" },
  cancelled: { bg: "#e5e7eb", border: "#9ca3af" },
  completed: { bg: "#bbf7d0", border: "#10b981" },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתין",
  confirmed: "מאושר",
  cancelled: "בוטל",
  completed: "הושלם",
};

export function BookingCalendar({
  bookings,
  services,
  blocked,
  businessHours,
}: {
  bookings: Booking[];
  services: Service[];
  blocked: BlockedSlot[];
  businessHours: BusinessHour[];
}) {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar | null>(null);
  const [editing, setEditing] = useState<Partial<Booking> | null>(null);
  const [creating, setCreating] = useState<{ start: string; end: string } | null>(null);

  const events: EventInput[] = useMemo(() => {
    const list: EventInput[] = bookings.map((b) => {
      const c = STATUS_COLORS[b.status] ?? STATUS_COLORS.confirmed;
      return {
        id: b.id,
        title: `${b.customer_name} · ${b.service_name}`,
        start: b.start_at,
        end: b.end_at,
        backgroundColor: c.bg,
        borderColor: c.border,
        textColor: "#7f1d1d",
        extendedProps: { kind: "booking", booking: b },
        editable: b.status !== "cancelled",
      };
    });
    for (const bs of blocked) {
      list.push({
        id: `blocked-${bs.id}`,
        title: bs.reason ? `🚫 ${bs.reason}` : "🚫 חסום",
        start: bs.start_at,
        end: bs.end_at,
        backgroundColor: "#f3f4f6",
        borderColor: "#9ca3af",
        textColor: "#374151",
        editable: false,
        display: "background",
        extendedProps: { kind: "blocked" },
      });
    }
    return list;
  }, [bookings, blocked]);

  // Convert business_hours rows to FullCalendar businessHours config.
  const fcBusinessHours = useMemo(
    () =>
      businessHours
        .filter((h) => !h.closed && h.open_time && h.close_time)
        .map((h) => ({
          daysOfWeek: [h.weekday],
          startTime: h.open_time as string,
          endTime: h.close_time as string,
        })),
    [businessHours]
  );

  async function onEventDrop(arg: EventDropArg) {
    const ext = arg.event.extendedProps as { kind?: string };
    if (ext.kind !== "booking") return arg.revert();
    const supabase = createClient();
    const { error } = await supabase
      .from("bookings")
      .update({
        start_at: arg.event.start?.toISOString(),
        end_at: arg.event.end?.toISOString(),
      })
      .eq("id", arg.event.id);
    if (error) {
      toast.error(error.message);
      arg.revert();
      return;
    }
    toast.success("התור עודכן");
    router.refresh();
  }

  async function onEventResize(arg: { event: EventApi; revert: () => void }) {
    const ext = arg.event.extendedProps as { kind?: string };
    if (ext.kind !== "booking") return arg.revert();
    const supabase = createClient();
    const { error } = await supabase
      .from("bookings")
      .update({
        start_at: arg.event.start?.toISOString(),
        end_at: arg.event.end?.toISOString(),
      })
      .eq("id", arg.event.id);
    if (error) {
      toast.error(error.message);
      arg.revert();
      return;
    }
    toast.success("משך התור עודכן");
    router.refresh();
  }

  function onEventClick(arg: EventClickArg) {
    const ext = arg.event.extendedProps as { kind?: string; booking?: Booking };
    if (ext.kind !== "booking" || !ext.booking) return;
    setEditing(ext.booking);
    setCreating(null);
  }

  function onSelect(arg: DateSelectArg) {
    setCreating({ start: arg.start.toISOString(), end: arg.end.toISOString() });
    setEditing(null);
  }

  return (
    <>
      <div className="flex items-center gap-3 text-xs flex-wrap">
        {Object.entries(STATUS_LABELS).map(([k, l]) => {
          const c = STATUS_COLORS[k];
          return (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span
                className="size-3 rounded"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}
              />
              {l}
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-3 rounded"
            style={{ background: "#f3f4f6", border: "1px solid #9ca3af" }}
          />
          חסום
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-3 sm:p-4 fc-rtl-fix">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={heLocale}
          direction="rtl"
          firstDay={0}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator
          businessHours={fcBusinessHours.length ? fcBusinessHours : undefined}
          headerToolbar={{
            start: "today,prev,next",
            center: "title",
            end: "timeGridDay,timeGridWeek,dayGridMonth",
          }}
          buttonText={{
            today: "היום",
            month: "חודש",
            week: "שבוע",
            day: "יום",
          }}
          events={events}
          editable
          selectable
          selectMirror
          eventDrop={onEventDrop}
          eventResize={onEventResize}
          eventClick={onEventClick}
          select={onSelect}
          slotDuration="00:30:00"
          slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          dayHeaderFormat={{ weekday: "short", day: "numeric", month: "numeric" }}
        />
      </div>

      {(editing || creating) && (
        <BookingDialog
          editing={editing}
          creating={creating}
          services={services}
          onClose={() => {
            setEditing(null);
            setCreating(null);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(null);
            router.refresh();
          }}
        />
      )}

      {/* RTL header alignment fix for FullCalendar */}
      <style jsx global>{`
        .fc-rtl-fix .fc-toolbar.fc-header-toolbar {
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .fc-rtl-fix .fc-button-primary {
          background: #e11d48 !important;
          border-color: #e11d48 !important;
          text-transform: none !important;
        }
        .fc-rtl-fix .fc-button-primary:hover {
          background: #be123c !important;
          border-color: #be123c !important;
        }
        .fc-rtl-fix .fc-button-primary:disabled {
          opacity: 0.5;
        }
        .fc-rtl-fix .fc-event {
          cursor: pointer;
          font-size: 0.75rem;
          padding: 2px 4px;
        }
      `}</style>
    </>
  );
}

// ----- create / edit dialog --------------------------------------------------

function BookingDialog({
  editing,
  creating,
  services,
  onClose,
  onSaved,
}: {
  editing: Partial<Booking> | null;
  creating: { start: string; end: string } | null;
  services: Service[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const [serviceId, setServiceId] = useState(editing?.service_id ?? services[0]?.id ?? "");
  const [start, setStart] = useState(
    toLocalInput(editing?.start_at ?? creating?.start ?? new Date().toISOString())
  );
  const [end, setEnd] = useState(
    toLocalInput(editing?.end_at ?? creating?.end ?? new Date().toISOString())
  );
  const [name, setName] = useState(editing?.customer_name ?? "");
  const [phone, setPhone] = useState(editing?.customer_phone ?? "");
  const [email, setEmail] = useState(editing?.customer_email ?? "");
  const [status, setStatus] = useState(editing?.status ?? "confirmed");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [saving, setSaving] = useState(false);

  // When service changes (and we're creating), auto-set end based on duration.
  function onServiceChange(id: string) {
    setServiceId(id);
    if (!isEdit) {
      const svc = services.find((s) => s.id === id);
      if (svc) {
        const startD = new Date(start);
        const endD = new Date(startD.getTime() + svc.duration_min * 60_000);
        setEnd(toLocalInput(endD.toISOString()));
      }
    }
  }

  async function save() {
    if (!serviceId) return toast.error("בחר/י שירות");
    if (!name.trim() || !phone.trim()) return toast.error("חסרים פרטי לקוחה");
    setSaving(true);
    const payload = {
      service_id: serviceId,
      start_at: new Date(start).toISOString(),
      end_at: new Date(end).toISOString(),
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || null,
      status,
      notes: notes.trim() || null,
    };
    const supabase = createClient();
    const { error } = isEdit
      ? await supabase.from("bookings").update(payload).eq("id", editing!.id!)
      : await supabase.from("bookings").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("נשמר");
    onSaved();
  }

  async function remove() {
    if (!editing?.id) return;
    if (!confirm("למחוק את התור?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("bookings").delete().eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">
            {isEdit ? "עריכת תור" : "תור חדש"}
          </h3>
          <button
            onClick={onClose}
            className="size-8 rounded-full hover:bg-rose-50 flex items-center justify-center"
            aria-label="סגור"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label>שירות</Label>
            <select
              value={serviceId}
              onChange={(e) => onServiceChange(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration_min} דק׳ · {s.price} ₪)
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>התחלה</Label>
            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <Label>סיום</Label>
            <Input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div>
            <Label>שם לקוחה</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>טלפון</Label>
            <Input
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>אימייל</Label>
            <Input
              dir="ltr"
              type="email"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>סטטוס</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
            >
              <option value="pending">ממתין</option>
              <option value="confirmed">מאושר</option>
              <option value="cancelled">בוטל</option>
              <option value="completed">הושלם</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>הערות</Label>
            <Textarea
              rows={3}
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between flex-wrap gap-2 pt-2">
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>
              <Save className="size-4" /> {saving ? "שומר..." : "שמור"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              ביטול
            </Button>
          </div>
          {isEdit && (
            <div className="flex gap-2">
              {phone && (
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(phone);
                    toast.success("הטלפון הועתק");
                  }}
                >
                  <Copy className="size-4" /> טלפון
                </Button>
              )}
              <Button
                variant="outline"
                onClick={remove}
                className="text-destructive"
              >
                <Trash2 className="size-4" /> מחק
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function toLocalInput(iso: string): string {
  // Convert an ISO string to the value format expected by datetime-local in local time.
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
