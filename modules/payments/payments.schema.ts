import { z } from "zod";

const MAX_LINE_ITEMS = 50;
const MAX_QTY_PER_ITEM = 99;

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        qty: z.number().int().positive().max(MAX_QTY_PER_ITEM),
      })
    )
    .min(1)
    .max(MAX_LINE_ITEMS),
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(5).max(40),
    address: z.object({
      line1: z.string().trim().min(1).max(200),
      city: z.string().trim().min(1).max(120),
      zip: z.string().trim().max(20).optional(),
    }),
    notes: z.string().trim().max(2000).optional(),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
