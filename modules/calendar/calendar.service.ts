import { fetchUpcomingBookings } from "./calendar.repository";

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

export async function generateCalendarFeed(): Promise<string> {
  const bookings = await fetchUpcomingBookings();

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
  for (const b of bookings) {
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
      `STATUS:${
        b.status === "confirmed" || b.status === "completed" ? "CONFIRMED" : "TENTATIVE"
      }`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
