import express from "express";
import cors from "cors";
import { adminRouter } from "./routes/admin";
import { checkoutRouter } from "./routes/checkout";
import { stripeWebhookRouter } from "./routes/stripe-webhook";
import { calendarRouter } from "./routes/calendar";

const app = express();

// Stripe webhook MUST be registered before express.json() — needs the raw request body
app.use("/api/stripe", stripeWebhookRouter);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/api/admin", adminRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/calendar", calendarRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
