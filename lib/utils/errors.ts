import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    public override readonly message: string,
    public readonly status: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toResponse(): NextResponse {
    return NextResponse.json({ error: this.message }, { status: this.status });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "יש להתחבר") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "אין הרשאה") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "לא נמצא") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "ניגוד נתונים") {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message = "נתונים לא תקינים") {
    super(message, 400);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "בקשה שגויה") {
    super(message, 400);
  }
}
