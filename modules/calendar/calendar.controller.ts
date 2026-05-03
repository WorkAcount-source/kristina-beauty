import { NextRequest, NextResponse } from "next/server";
import { generateCalendarFeed } from "./calendar.service";
import { handleError } from "@/lib/utils/response";

export async function handleCalendarFeed(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const { token } = await ctx.params;
    const expected = process.env.CALENDAR_FEED_TOKEN;
    if (!expected || token !== expected) {
      return new NextResponse("forbidden", { status: 403 });
    }
    const body = await generateCalendarFeed();
    return new NextResponse(body, {
      headers: {
        "content-type": "text/calendar; charset=utf-8",
        "content-disposition": 'inline; filename="kristina-bookings.ics"',
        "cache-control": "public, max-age=300",
      },
    });
  } catch (err) {
    return handleError(err, "/api/calendar/feed");
  }
}
