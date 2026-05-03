import { Request, Response, NextFunction } from "express";
import { createUserClient, createServiceClient } from "../lib/supabase";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email?: string };
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const token = header.slice(7);
  const {
    data: { user },
    error,
  } = await createUserClient(token).auth.getUser();
  if (error || !user) {
    res.status(401).json({ error: "invalid token" });
    return;
  }
  req.user = { id: user.id, email: user.email };
  next();
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const { data } = await createServiceClient()
    .from("profiles")
    .select("role")
    .eq("id", req.user.id)
    .maybeSingle();
  if (data?.role !== "admin") {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  next();
}
