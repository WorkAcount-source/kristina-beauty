import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Routes that require an authenticated user. Matched as path prefixes.
 */
const PROTECTED_PREFIXES = [
  "/account",
  "/admin",
  "/booking",
  "/checkout",
] as const;

/**
 * Routes that additionally require admin role.
 */
const ADMIN_PREFIXES = ["/admin"] as const;

/**
 * Paths the middleware should fully bypass — they never need session refresh,
 * authorization checks, or DB lookups. This keeps the auth flow itself fast
 * (the login page doesn't need to refresh a session that doesn't exist yet)
 * and avoids touching the Stripe webhook (signed body must be untouched).
 */
const BYPASS_PREFIXES = ["/auth", "/api/stripe/webhook"] as const;

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Detects whether the incoming request carries a Supabase auth cookie.
 * The cookie name pattern Supabase uses is `sb-<project-ref>-auth-token`
 * (or chunks `sb-<ref>-auth-token.0`, `.1`, ...). When no such cookie is
 * present we can skip the network call to refresh the session entirely.
 */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  for (const c of request.cookies.getAll()) {
    if (c.name.startsWith("sb-") && c.name.includes("-auth-token")) {
      return true;
    }
  }
  return false;
}

/**
 * Build a same-origin login redirect URL preserving the original path + query
 * as `?redirect=<path>`. The host is never taken from user input, so this is
 * safe against open-redirect (CWE-601).
 */
function loginRedirectUrl(request: NextRequest): URL {
  const url = request.nextUrl.clone();
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/auth/login";
  url.search = `?redirect=${encodeURIComponent(target)}`;
  return url;
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast path: bypass entirely for paths that never need middleware work.
  if (matchesPrefix(pathname, BYPASS_PREFIXES)) {
    return NextResponse.next({ request });
  }

  // Fast path: no auth cookie + not a protected route → no work needed.
  // This avoids a network round-trip to Supabase for every anonymous visitor.
  const hasAuthCookie = hasSupabaseAuthCookie(request);
  if (!hasAuthCookie && !matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    return NextResponse.next({ request });
  }

  // Anonymous visitor on a protected route — redirect immediately, no
  // network call to Supabase.
  if (!hasAuthCookie && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    return NextResponse.redirect(loginRedirectUrl(request));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }: CookieToSet) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh + verify the session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authentication gate
  if (!user && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    return NextResponse.redirect(loginRedirectUrl(request));
  }

  // Authorization gate (admin role)
  if (user && matchesPrefix(pathname, ADMIN_PREFIXES)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      const home = request.nextUrl.clone();
      home.pathname = "/";
      home.search = "";
      return NextResponse.redirect(home);
    }
  }

  return response;
}
