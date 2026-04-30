"use client";

import { useState, useMemo, useEffect } from "react";
import { format, addDays, startOfDay, addMinutes, isSameDay, isAfter } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Check, ChevronLeft, ChevronRight, Clock, Calendar as CalIcon, User, Sparkles } from "lucide-react";
import { cn, formatDuration, formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Service, BusinessHours } from "@/types/db";

type Step = 1 | 2 | 3 | 4;

export function BookingFlow({ services, businessHours, initialServiceId, defaultName, defaultEmail, defaultPhone }: {
  services: Service[]; businessHours: BusinessHours[]; initialServiceId?: string;
  defaultName?: string; defaultEmail?: string; defaultPhone?: string;
}) {
  const [step, setStep] = useState<Step>(initialServiceId ? 2 : 1);
  const [serviceId, setServiceId] = useState<string | undefined>(initialServiceId);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const service = services.find((s) => s.id === serviceId);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-6 md:p-10">
      <Stepper step={step} />
      <div className="mt-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Motion key="1">
              <ServiceStep services={services} selected={serviceId} onSelect={(id) => { setServiceId(id); setStep(2); }} />
            </Motion>
          )}
          {step === 2 && service && (
            <Motion key="2">
              <DateTimeStep
                service={service}
                businessHours={businessHours}
                date={date} time={time}
                onDate={setDate} onTime={setTime}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            </Motion>
          )}
          {step === 3 && service && date && time && (
            <Motion key="3">
              <DetailsStep
                service={service} date={date} time={time}
                defaultName={defaultName}
                defaultEmail={defaultEmail}
                defaultPhone={defaultPhone}
                onBack={() => setStep(2)}
                onSuccess={() => { setSubmitted(true); setStep(4); }}
              />
            </Motion>
          )}
          {step === 4 && submitted && service && date && time && (
            <Motion key="4">
              <SuccessStep service={service} date={date} time={time} />
            </Motion>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Motion({ children, ...rest }: React.ComponentProps<typeof motion.div>) {
  return <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} {...rest}>{children}</motion.div>;
}

function Stepper({ step }: { step: Step }) {
  const labels = ["שירות", "תאריך ושעה", "פרטים", "אישור"];
  return (
    <div className="flex items-center justify-between">
      {labels.map((l, i) => {
        const idx = i + 1;
        const active = step === idx;
        const done = step > idx;
        return (
          <div key={l} className="flex-1 flex items-center">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={cn(
                "size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                done ? "bg-emerald-500 text-white" : active ? "bg-gradient-luxe text-white shadow-lg shadow-rose-500/40 scale-110" : "bg-rose-100 text-rose-400"
              )}>
                {done ? <Check className="size-5" /> : idx}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", active ? "text-rose-700" : "text-muted-foreground")}>{l}</span>
            </div>
            {i < labels.length - 1 && <div className={cn("flex-1 h-0.5 mx-2", done ? "bg-emerald-500" : "bg-rose-100")} />}
          </div>
        );
      })}
    </div>
  );
}

function ServiceStep({ services, selected, onSelect }: { services: Service[]; selected?: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-2xl font-semibold text-center mb-6">בחרי שירות</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {services.map((s) => (
          <button key={s.id} onClick={() => onSelect(s.id)}
            className={cn(
              "text-right p-5 rounded-2xl border-2 transition-all hover:border-rose-400 hover:shadow-md",
              selected === s.id ? "border-rose-500 bg-rose-50" : "border-rose-100 bg-white"
            )}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-lg mb-1">{s.name}</div>
                {s.description && <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{s.description}</div>}
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-rose-600"><Clock className="size-4" /> {formatDuration(s.duration_min)}</span>
                  <span className="font-bold">{formatPrice(Number(s.price))}</span>
                </div>
              </div>
              <Sparkles className="size-5 text-rose-400 shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateTimeStep({ service, businessHours, date, time, onDate, onTime, onBack, onNext }: {
  service: Service; businessHours: BusinessHours[]; date: Date | null; time: string | null;
  onDate: (d: Date) => void; onTime: (t: string) => void; onBack: () => void; onNext: () => void;
}) {
  const today = startOfDay(new Date());
  const days = useMemo(() => Array.from({ length: 21 }, (_, i) => addDays(today, i)), [today]);

  const [bookedSlots, setBookedSlots] = useState<{ start: Date; end: Date }[]>([]);

  useEffect(() => {
    if (!date) return;
    (async () => {
      const supabase = createClient();
      const start = startOfDay(date);
      const end = addDays(start, 1);
      const { data } = await supabase
        .from("bookings")
        .select("start_at,end_at,status")
        .gte("start_at", start.toISOString())
        .lt("start_at", end.toISOString())
        .in("status", ["pending", "confirmed"]);
      setBookedSlots((data || []).map((b: { start_at: string; end_at: string }) => ({ start: new Date(b.start_at), end: new Date(b.end_at) })));
    })();
  }, [date]);

  const slots = useMemo(() => {
    if (!date) return [];
    const wd = date.getDay();
    const hours = businessHours.find((h) => h.weekday === wd);
    if (!hours || hours.closed || !hours.open_time || !hours.close_time) return [];
    const [oH, oM] = hours.open_time.split(":").map(Number);
    const [cH, cM] = hours.close_time.split(":").map(Number);
    const dayStart = new Date(date); dayStart.setHours(oH, oM, 0, 0);
    const dayEnd = new Date(date); dayEnd.setHours(cH, cM, 0, 0);
    const out: { time: string; available: boolean }[] = [];
    let cur = dayStart;
    const now = new Date();
    while (addMinutes(cur, service.duration_min) <= dayEnd) {
      const slotEnd = addMinutes(cur, service.duration_min);
      const overlap = bookedSlots.some((b) => cur < b.end && slotEnd > b.start);
      const past = isSameDay(cur, now) && !isAfter(cur, now);
      out.push({ time: format(cur, "HH:mm"), available: !overlap && !past });
      cur = addMinutes(cur, 30);
    }
    return out;
  }, [date, businessHours, service.duration_min, bookedSlots]);

  return (
    <div className="space-y-6">
      <h3 className="font-display text-2xl font-semibold text-center">בחרי תאריך ושעה ל{service.name}</h3>

      <div>
        <Label className="mb-3 flex items-center gap-2"><CalIcon className="size-4 text-rose-600" /> תאריך</Label>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {days.map((d) => {
            const wd = d.getDay();
            const hours = businessHours.find((h) => h.weekday === wd);
            const closed = !hours || hours.closed;
            const active = date && isSameDay(date, d);
            return (
              <button key={d.toISOString()} onClick={() => !closed && onDate(d)} disabled={closed}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[72px] rounded-2xl py-3 px-2 border-2 transition-all shrink-0",
                  active ? "border-rose-500 bg-gradient-luxe text-white shadow-lg shadow-rose-500/30" : closed ? "border-rose-100 bg-rose-50/30 opacity-40 cursor-not-allowed" : "border-rose-100 bg-white hover:border-rose-300"
                )}>
                <span className="text-xs font-medium">{format(d, "EEE", { locale: he })}</span>
                <span className="text-xl font-bold">{format(d, "d")}</span>
                <span className="text-xs">{format(d, "MMM", { locale: he })}</span>
              </button>
            );
          })}
        </div>
      </div>

      {date && (
        <div>
          <Label className="mb-3 flex items-center gap-2"><Clock className="size-4 text-rose-600" /> שעה</Label>
          {slots.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">אין שעות פנויות בתאריך זה</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {slots.map((s) => (
                <button key={s.time} onClick={() => s.available && onTime(s.time)} disabled={!s.available}
                  className={cn(
                    "h-11 rounded-xl text-sm font-medium border-2 transition-all",
                    time === s.time ? "border-rose-500 bg-gradient-luxe text-white" : !s.available ? "border-rose-100 bg-rose-50/30 text-muted-foreground line-through cursor-not-allowed" : "border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50"
                  )}>
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack}><ChevronRight className="size-4" /> חזרה</Button>
        <Button onClick={onNext} disabled={!date || !time} className="flex-1">המשך <ChevronLeft className="size-4" /></Button>
      </div>
    </div>
  );
}

function DetailsStep({ service, date, time, defaultName, defaultEmail, defaultPhone, onBack, onSuccess }: {
  service: Service; date: Date; time: string;
  defaultName?: string; defaultEmail?: string; defaultPhone?: string;
  onBack: () => void; onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      toast.error("יש להתחבר כדי להזמין תור");
      window.location.href = `/auth/login?redirect=${encodeURIComponent(`/booking?service=${service.id}`)}`;
      return;
    }
    const [h, m] = time.split(":").map(Number);
    const start = new Date(date); start.setHours(h, m, 0, 0);
    const end = addMinutes(start, service.duration_min);

    // availability check
    const { data: ok } = await supabase.rpc("check_booking_availability", { p_start: start.toISOString(), p_end: end.toISOString() });
    if (!ok) {
      setLoading(false);
      return toast.error("השעה כבר תפוסה", { description: "אנא בחרי שעה אחרת" });
    }

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: service.id,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: "confirmed",
      customer_name: String(fd.get("name") || ""),
      customer_phone: String(fd.get("phone") || ""),
      customer_email: String(fd.get("email") || "") || null,
      notes: String(fd.get("notes") || "") || null,
    });
    setLoading(false);
    if (error) return toast.error("שגיאה", { description: error.message });
    onSuccess();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <h3 className="font-display text-2xl font-semibold text-center mb-2">פרטים אישיים</h3>
      <div className="bg-rose-50 rounded-2xl p-4 text-sm flex flex-wrap gap-x-6 gap-y-2">
        <span><strong>שירות:</strong> {service.name}</span>
        <span><strong>תאריך:</strong> {format(date, "EEEE, d MMMM yyyy", { locale: he })}</span>
        <span><strong>שעה:</strong> {time}</span>
        <span><strong>מחיר:</strong> {formatPrice(Number(service.price))}</span>
      </div>
      <div>
        <Label htmlFor="name">שם מלא *</Label>
        <Input id="name" name="name" required placeholder="שמך המלא" defaultValue={defaultName} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">טלפון *</Label>
          <Input id="phone" name="phone" type="tel" required placeholder="050-0000000" defaultValue={defaultPhone} />
        </div>
        <div>
          <Label htmlFor="email">דוא&quot;ל</Label>
          <Input id="email" name="email" type="email" placeholder="example@mail.com" defaultValue={defaultEmail} />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">הערות</Label>
        <Textarea id="notes" name="notes" rows={3} placeholder="בקשות מיוחדות..." />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}><ChevronRight className="size-4" /> חזרה</Button>
        <Button type="submit" disabled={loading} className="flex-1"><User className="size-4" /> {loading ? "מאשר..." : "אישור הזמנה"}</Button>
      </div>
    </form>
  );
}

function SuccessStep({ service, date, time }: { service: Service; date: Date; time: string }) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="mx-auto size-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
        <Check className="size-10 text-white" strokeWidth={3} />
      </div>
      <h3 className="font-display text-3xl font-bold">התור נקבע בהצלחה! 🎉</h3>
      <p className="text-muted-foreground">נשלח אישור לטלפון/דוא&quot;ל שלך</p>
      <div className="bg-rose-50 rounded-2xl p-6 inline-block text-right space-y-2">
        <div><strong>שירות:</strong> {service.name}</div>
        <div><strong>תאריך:</strong> {format(date, "EEEE, d MMMM yyyy", { locale: he })}</div>
        <div><strong>שעה:</strong> {time}</div>
      </div>
      <div className="pt-4">
        <Button asChild size="lg"><a href="/">חזרה לעמוד הבית</a></Button>
      </div>
    </div>
  );
}
