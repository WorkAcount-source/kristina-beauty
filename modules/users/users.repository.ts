import { createServiceClient } from "@/lib/db";

export async function listUsersWithProfiles() {
  const svc = await createServiceClient();
  const [{ data: profiles }, { data: list }] = await Promise.all([
    svc.from("profiles").select("*"),
    svc.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);
  const authMap = new Map((list?.users ?? []).map((u) => [u.id, u] as const));
  return (profiles ?? []).map((p) => {
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
}

export async function updateUserRole(id: string, role: "admin" | "customer") {
  const svc = await createServiceClient();
  const { error } = await svc.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

export async function setUserBan(id: string, banned: boolean) {
  const svc = await createServiceClient();
  const { error } = await svc.auth.admin.updateUserById(id, {
    ban_duration: banned ? "876000h" : "none",
  });
  if (error) throw error;
}

export async function generatePasswordResetLink(email: string) {
  const svc = await createServiceClient();
  const { data, error } = await svc.auth.admin.generateLink({ type: "recovery", email });
  if (error) throw error;
  return data.properties?.action_link ?? null;
}

export async function deleteUserById(id: string) {
  const svc = await createServiceClient();
  const { error } = await svc.auth.admin.deleteUser(id);
  if (error) throw error;
}
