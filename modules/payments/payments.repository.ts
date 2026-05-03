import { createClient, createServiceClient } from "@/lib/db";
import type { Product } from "@/types/db";

export async function fetchActiveProducts(ids: string[]): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("active", true);
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function createOrder(payload: {
  user_id: string;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: object;
}) {
  const admin = await createServiceClient();
  const { data, error } = await admin
    .from("orders")
    .insert({ ...payload, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createOrderItems(
  items: { order_id: string; product_id: string; qty: number; unit_price: number }[]
) {
  const admin = await createServiceClient();
  const { error } = await admin.from("order_items").insert(items);
  if (error) throw error;
}

export async function rollbackOrder(orderId: string) {
  const admin = await createServiceClient();
  await admin.from("orders").delete().eq("id", orderId);
}

export async function updateOrderPaymentIntent(orderId: string, sessionId: string) {
  const admin = await createServiceClient();
  const { error } = await admin
    .from("orders")
    .update({ payment_intent_id: sessionId })
    .eq("id", orderId);
  if (error) throw error;
}

export async function setOrderStatus(orderId: string, status: string) {
  const admin = await createServiceClient();
  const { error } = await admin.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

// Only transitions if the current status matches expectedStatus (idempotency guard).
export async function setOrderStatusConditional(
  orderId: string,
  newStatus: string,
  expectedStatus: string
) {
  const admin = await createServiceClient();
  const { error } = await admin
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .eq("status", expectedStatus);
  if (error) throw error;
}
