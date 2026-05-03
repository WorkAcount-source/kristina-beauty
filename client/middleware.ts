import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on all paths except static assets and the Stripe webhook (signed body
  // must reach the route handler untouched). The webhook is also short-circuited
  // inside updateSession() as defense in depth.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|css|js|map)$).*)",
  ],
};
