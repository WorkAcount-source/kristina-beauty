import { NextResponse } from "next/server";
import { AppError } from "./errors";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function handleError(err: unknown, context: string): NextResponse {
  if (err instanceof AppError) return err.toResponse();
  console.error(`[${context}]`, err);
  return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
}
