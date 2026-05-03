import { Router } from "express";
import { createServiceClient } from "../lib/supabase";

const router = Router();

router.get("/feed/:token", async (req, res) => {
  const { token } = req.params;
  const expected = process.env.CALENDAR_FEED_TOKEN;
  if (!expected || token !== expected) {
    res.status(403).send("forbidden");
    return;
  }

  try {
    const svc = createServiceClient();
    const { data } = await svc
      .from("bookings")
      .select(
        "id, start_at, end_at, status, customer_name, customer_phone, customer_email, notes, services(name)"
      )
      .neq("status", "cancelled")
      .order("start_at", { ascending: false })
      .limit(2000);

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kristina Beauty//Bookings//HE",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:תורים - Kristina",
      "X-WR-TIMEZONE:Asia/Jerusalem",
    ];

    const now = formatICalDate(new Date());
    for (const b of data ?? []) {
      const service = (b.services as { name?: string } | null)?.name ?? "תור";
      const summary = `${b.customer_name as string} · ${service}`;
      const desc = [
        `שירות: ${service}`,
        `סטטוס: ${b.status}`,
        `טלפון: ${b.customer_phone}`,
        b.customer_email ? `אימייל: ${b.customer_email}` : "",
        b.notes ? `הערות: ${b.notes}` : "",
      ]
        .filter(Boolean)
        .join("\\n");

      lines.push(
        "BEGIN:VEVENT",
        `UID:${b.id}@kristina-beauty`,
        `DTSTAMP:${now}`,
        `DTSTART:${formatICalDate(new Date(b.start_at as string))}`,
        `DTEND:${formatICalDate(new Date(b.end_at as string))}`,
        `SUMMARY:${escapeICal(summary)}`,
        `DESCRIPTION:${escapeICal(desc)}`,
        `STATUS:${b.status === "confirmed" || b.status === "completed" ? "CONFIRMED" : "TENTATIVE"}`,
        "END:VEVENT"
      );
    }

    lines.push("END:VCALENDAR");

    res.set({
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'inline; filename="kristina-bookings.ics"',
      "cache-control": "public, max-age=300",
    });
    res.send(lines.join("\r\n"));
  } catch (err) {
    console.error("[GET /api/calendar/feed]", err);
    res.status(500).send("internal server error");
  }
});

function formatICalDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeICal(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export { router as calendarRouter };
