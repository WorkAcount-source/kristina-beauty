import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (prof?.role !== "admin") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 403 });

  const svc = await createServiceClient();
  const [{ data: profiles }, { data: list }] = await Promise.all([
    svc.from("profiles").select("*"),
    svc.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);
  const authMap = new Map(
    (list?.users ?? []).map((u) => [u.id, u] as const)
  );
  const rows = (profiles ?? []).map((p) => {
    const a = authMap.get(p.id as string);
    return {
      id: p.id,
      full_name: p.full_name,
      phone: p.phone,
      role: p.role,
      created_at: p.created_at,
      email: a?.email ?? null,
      last_sign_in_at: a?.last_sign_in_at ?? null,
      email_confirmed_at: a?.email_confirmed_at ?? null,
      banned_until: (a as { banned_until?: string } | undefined)?.banned_until ?? null,
    };
  });
  return NextResponse.json({ users: rows });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { id, action, value } = body as {
    id?: string;
    action?: "role" | "ban";
    value?: string | boolean;
  };
  if (!id || !action) return NextResponse.json({ error: "bad request" }, { status: 400 });
  if (id === admin.id) {
    return NextResponse.json({ error: "אי אפשר לשנות את עצמך" }, { status: 400 });
  }
  const svc = await createServiceClient();

  if (action === "role") {
    if (value !== "admin" && value !== "customer") {
      return NextResponse.json({ error: "bad role" }, { status: 400 });
    }
    const { error } = await svc.from("profiles").update({ role: value }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === "ban") {
    const { error } = await svc.auth.admin.updateUserById(id, {
      ban_duration: value ? "876000h" : "none",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { email, action } = body as { email?: string; action?: "reset" };
  if (action !== "reset" || !email) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const svc = await createServiceClient();
  const { data, error } = await svc.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ link: data.properties?.action_link ?? null });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  if (id === admin.id) {
    return NextResponse.json({ error: "אי אפשר למחוק את עצמך" }, { status: 400 });
  }
  const svc = await createServiceClient();
  const { error } = await svc.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
