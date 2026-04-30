"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return { items: s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i)) };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.id !== id) : s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: "kristina-cart" }
  )
);

/**
 * React to the persist middleware finishing rehydration.
 *
 * Usage:
 *   const hydrated = useCartHydrated();
 *   if (!hydrated) return <Skeleton />;
 *
 * This avoids the empty → full flash + hydration mismatch on routes that
 * render based on the cart contents (e.g. the cart page, the checkout page).
 */
import { useEffect, useState } from "react";

export function useCartHydrated(): boolean {
  // Important: during static prerender (SSG) and on the very first client
  // render before effects run, we must report `false`. Reading
  // `useCart.persist.hasHydrated()` directly in the `useState` initializer
  // crashes on the server because the persist middleware API isn't fully
  // initialized in that environment ("Cannot read properties of undefined
  // (reading 'hasHydrated')"). We start with `false` and flip it inside
  // `useEffect`, which only runs on the client.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const persist = useCart.persist;
    if (!persist) {
      // No persist middleware in this environment — treat as hydrated so the
      // UI doesn't get stuck on the skeleton.
      setHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    // Re-check after subscribing in case hydration finished between the
    // initial check and the subscription being attached.
    if (persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);
  return hydrated;
}
