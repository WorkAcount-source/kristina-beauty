import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

export function formatDuration(min: number) {
  if (min < 60) return `${min} דקות`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} שעות` : `${h}:${m.toString().padStart(2, "0")} שעות`;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function whatsappLink(phone: string, message?: string) {
  const m = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone.replace(/\D/g, "")}${m}`;
}
