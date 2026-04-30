"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, Copy, ChevronDown } from "lucide-react";

export function GoogleCalendarPanel({ feedToken }: { feedToken: string | null }) {
  const [open, setOpen] = useState(false);

  const url =
    typeof window !== "undefined" && feedToken
      ? `${window.location.origin}/api/calendar/feed/${feedToken}`
      : feedToken
      ? `/api/calendar/feed/${feedToken}`
      : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-rose-50/50"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Calendar className="size-4 text-rose-600" />
          סנכרון עם Google Calendar
        </div>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="p-4 pt-0 space-y-3 text-sm">
          {!url ? (
            <div className="bg-amber-50 text-amber-800 rounded-xl p-3 text-xs leading-relaxed">
              <strong>לא הוגדר מפתח סנכרון.</strong> כדי להפעיל סנכרון לגוגל
              קלנדר, יש להוסיף משתנה סביבה <code dir="ltr">CALENDAR_FEED_TOKEN</code> עם מחרוזת אקראית
              (ב־<code dir="ltr">.env.local</code> ובהגדרות Vercel) ולפרוס מחדש.
            </div>
          ) : (
            <>
              <p className="text-muted-foreground leading-relaxed">
                העתיקי את הקישור הבא והוסיפי אותו ל־Google Calendar בתור{" "}
                <em>&quot;יומנים נוספים → מ־URL&quot;</em>. גוגל יעדכן את היומן אוטומטית
                כל מספר שעות (קצב הרענון נשלט על ידי גוגל).
              </p>
              <div className="flex gap-2">
                <Input value={url} readOnly dir="ltr" className="font-mono text-xs" />
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url);
                      toast.success("הקישור הועתק");
                    } catch {
                      toast.error("העתקה נכשלה");
                    }
                  }}
                >
                  <Copy className="size-4" /> העתק
                </Button>
              </div>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal pr-5 pt-2">
                <li>
                  פתחי את{" "}
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-700 hover:underline"
                  >
                    Google Calendar
                  </a>
                </li>
                <li>בצד שמאל: &quot;יומנים נוספים&quot; → &quot;➕&quot; → &quot;מ־URL&quot;</li>
                <li>הדביקי את הקישור ולחצי &quot;הוסף יומן&quot;</li>
              </ol>
              <p className="text-xs text-muted-foreground">
                הסנכרון הוא חד־כיווני (קריאה בלבד). שינויים שתעשי בגוגל קלנדר
                לא יחזרו לכאן — נהלי תורים תמיד מתוך מסך זה.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
