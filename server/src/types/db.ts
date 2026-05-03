// Keep in sync with client/types/db.ts

export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_min: number;
  price: number;
  image_url: string | null;
  category_id: string | null;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number;
  active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  duration_min: number;
  price: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface InstagramPost {
  id: string;
  post_url: string;
  thumbnail_url: string;
  caption: string | null;
  sort_order: number;
}

export interface BusinessHours {
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
}

export interface Booking {
  id: string;
  user_id: string | null;
  service_id: string;
  start_at: string;
  end_at: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, unknown> | null;
  payment_intent_id: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  unit_price: number;
}

export interface SiteContact {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
}
