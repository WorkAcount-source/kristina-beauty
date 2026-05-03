import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLICY_VERSION = "v1.0";

type ConsentType = "terms" | "privacy" | "marketing" | "accessibility";

interface ConsentItem {
  type: ConsentType;
  accepted: boolean;
}

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

export async function POST(request: NextRequest) {
  let body: { consents?: ConsentItem[]; email?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const consents = Array.isArray(body.consents) ? body.consents : [];
  if (!consents.length) {
    return NextResponse.json({ error: "No consents provided" }, { status: 400 });
  }

  const allowed: ConsentType[] = ["terms", "privacy", "marketing", "accessibility"];
  const clean = consents.filter(
    (c) => c && allowed.includes(c.type) && typeof c.accepted === "boolean"
  );
  if (!clean.length) {
    return NextResponse.json({ error: "No valid consents" }, { status: 400 });
  }

  // Resolve current user (if signed in)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent");
  const email = (body.email || user?.email || "").toString().toLowerCase().trim() || null;
  const source = body.source || "form";

  const rows = clean.map((c) => ({
    user_id: user?.id ?? null,
    email,
    consent_type: c.type,
    accepted: c.accepted,
    policy_version: POLICY_VERSION,
    ip_address: ip,
    user_agent: ua,
    source,
  }));

  // Use service-role to bypass RLS (the log is append-only, system-managed)
  const admin = await createServiceClient();
  const { error } = await admin.from("consent_log").insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, recorded: rows.length, version: POLICY_VERSION });
}
