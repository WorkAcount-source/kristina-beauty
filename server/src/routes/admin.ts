import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { createServiceClient } from "../lib/supabase";

const router = Router();

router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const svc = createServiceClient();
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
    res.json({ users: rows });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    res.status(500).json({ error: "שגיאה בטעינת המשתמשים" });
  }
});

router.patch("/users", requireAuth, requireAdmin, async (req, res) => {
  const { id, action, value } = req.body as {
    id?: string;
    action?: "role" | "ban";
    value?: string | boolean;
  };
  if (!id || !action) {
    res.status(400).json({ error: "bad request" });
    return;
  }
  if (id === req.user!.id) {
    res.status(400).json({ error: "אי אפשר לשנות את עצמך" });
    return;
  }
  try {
    const svc = createServiceClient();
    if (action === "role") {
      if (value !== "admin" && value !== "customer") {
        res.status(400).json({ error: "bad role" });
        return;
      }
      const { error } = await svc.from("profiles").update({ role: value }).eq("id", id);
      if (error) { res.status(400).json({ error: error.message }); return; }
      res.json({ ok: true });
      return;
    }
    if (action === "ban") {
      const { error } = await svc.auth.admin.updateUserById(id, {
        ban_duration: value ? "876000h" : "none",
      });
      if (error) { res.status(400).json({ error: error.message }); return; }
      res.json({ ok: true });
      return;
    }
    res.status(400).json({ error: "unknown action" });
  } catch (err) {
    console.error("[PATCH /api/admin/users]", err);
    res.status(500).json({ error: "שגיאה בעדכון המשתמש" });
  }
});

router.post("/users", requireAuth, requireAdmin, async (req, res) => {
  const { email, action } = req.body as { email?: string; action?: "reset" };
  if (action !== "reset" || !email) {
    res.status(400).json({ error: "bad request" });
    return;
  }
  try {
    const svc = createServiceClient();
    const { data, error } = await svc.auth.admin.generateLink({
      type: "recovery",
      email,
    });
    if (error) { res.status(400).json({ error: error.message }); return; }
    res.json({ link: data.properties?.action_link ?? null });
  } catch (err) {
    console.error("[POST /api/admin/users]", err);
    res.status(500).json({ error: "שגיאה ביצירת הקישור" });
  }
});

router.delete("/users", requireAuth, requireAdmin, async (req, res) => {
  const id = req.query.id as string | undefined;
  if (!id) {
    res.status(400).json({ error: "missing id" });
    return;
  }
  if (id === req.user!.id) {
    res.status(400).json({ error: "אי אפשר למחוק את עצמך" });
    return;
  }
  try {
    const svc = createServiceClient();
    const { error } = await svc.auth.admin.deleteUser(id);
    if (error) { res.status(400).json({ error: error.message }); return; }
    res.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/users]", err);
    res.status(500).json({ error: "שגיאה במחיקת המשתמש" });
  }
});

export { router as adminRouter };
