import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/auth";
import { listUsers, updateUser, resetUserPassword, deleteUser } from "./users.service";
import { patchUserSchema, postUserSchema } from "./users.schema";
import { ok, handleError } from "@/lib/utils/response";

export async function handleGetUsers(): Promise<NextResponse> {
  try {
    await requireAdmin();
    const users = await listUsers();
    return ok({ users });
  } catch (err) {
    return handleError(err, "/api/admin/users GET");
  }
}

export async function handlePatchUser(req: NextRequest): Promise<NextResponse> {
  try {
    const adminUser = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const parsed = patchUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "bad request" }, { status: 400 });
    }
    const { id, action, value } = parsed.data;
    await updateUser(adminUser.id, id, action, value);
    return ok({ ok: true });
  } catch (err) {
    return handleError(err, "/api/admin/users PATCH");
  }
}

export async function handlePostUser(req: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const parsed = postUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "bad request" }, { status: 400 });
    }
    const result = await resetUserPassword(parsed.data.email);
    return ok(result);
  } catch (err) {
    return handleError(err, "/api/admin/users POST");
  }
}

export async function handleDeleteUser(req: NextRequest): Promise<NextResponse> {
  try {
    const adminUser = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
    await deleteUser(adminUser.id, id);
    return ok({ ok: true });
  } catch (err) {
    return handleError(err, "/api/admin/users DELETE");
  }
}
