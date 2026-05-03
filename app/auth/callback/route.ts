import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLICY_VERSION = "v1.0";

function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-client-ip") ||
    null
  );
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirect(searchParams.get("next"), "/account");
  const consentFlag = searchParams.get("consent") === "1";
  const marketingFlag = searchParams.get("marketing") === "1";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Persist consent for OAuth signups (only if not already recorded).
      try {
        const admin = await createServiceClient();
        const { data: existing } = await admin
          .from("consent_log")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("consent_type", "terms")
          .limit(1);

        if (consentFlag && (!existing || existing.length === 0)) {
          const ip = getClientIp(request);
          const ua = request.headers.get("user-agent");
          const email = data.user.email?.toLowerCase() ?? null;
          await admin.from("consent_log").insert([
            {
              user_id: data.user.id,
              email,
              consent_type: "terms",
              accepted: true,
              policy_version: POLICY_VERSION,
              ip_address: ip,
              user_agent: ua,
              source: "oauth-google",
            },
            {
              user_id: data.user.id,
              email,
              consent_type: "privacy",
              accepted: true,
              policy_version: POLICY_VERSION,
              ip_address: ip,
              user_agent: ua,
              source: "oauth-google",
            },
            {
              user_id: data.user.id,
              email,
              consent_type: "marketing",
              accepted: marketingFlag,
              policy_version: POLICY_VERSION,
              ip_address: ip,
              user_agent: ua,
              source: "oauth-google",
            },
          ]);
        }
      } catch {
        // never fail auth because of consent logging
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth`);
}
