"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminNavLink {
  href: string;
  label: string;
  icon: string;
}

export interface AdminNavSection {
  title: string;
  links: AdminNavLink[];
}

import {
  Calendar,
  Package,
  ShoppingBag,
  GraduationCap,
  Image as ImgIcon,
  Sparkles,
  Mail,
  LayoutDashboard,
  Tag,
  Clock,
  CalendarOff,
  Instagram,
  Settings,
  Users,
  ScrollText,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  Package,
  ShoppingBag,
  GraduationCap,
  ImgIcon,
  Sparkles,
  Mail,
  LayoutDashboard,
  Tag,
  Clock,
  CalendarOff,
  Instagram,
  Settings,
  Users,
  ScrollText,
};

export function AdminNav({ sections }: { sections: AdminNavSection[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Auto-close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open on mobile.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const currentLabel =
    sections
      .flatMap((s) => s.links)
      .find((l) => isActive(l.href))?.label ?? "ניהול";

  const NavList = (
    <nav className="space-y-3 p-3">
      {sections.map((sec) => (
        <div key={sec.title}>
          <div className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground mt-2 mb-1">
            {sec.title}
          </div>
          <div className="flex flex-col gap-1">
            {sec.links.map((l) => {
              const Icon = ICONS[l.icon] ?? LayoutDashboard;
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-rose-100 text-rose-700"
                      : "hover:bg-rose-50 hover:text-rose-700"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar — only on <lg */}
      <div className="lg:hidden -mx-4 mb-3 sticky top-20 z-30 bg-rose-50/80 backdrop-blur supports-[backdrop-filter]:bg-rose-50/60 border-b border-rose-100">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="size-10 rounded-xl bg-white border border-rose-100 shadow-sm flex items-center justify-center text-rose-700 hover:bg-rose-50"
            aria-label="פתח תפריט ניהול"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-rose-600/70">
              ניהול אתר
            </div>
            <div className="font-display text-base font-bold truncate">
              {currentLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block bg-white rounded-2xl shadow-sm border border-rose-100 h-fit lg:sticky lg:top-28">
        <h2 className="font-display text-lg font-bold px-6 pt-4 pb-1 text-gradient">
          ניהול אתר
        </h2>
        {NavList}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="סגור תפריט"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 bottom-0 w-[82%] max-w-xs bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-rose-100">
              <h2 className="font-display text-lg font-bold text-gradient">
                ניהול אתר
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="size-9 rounded-full hover:bg-rose-50 flex items-center justify-center"
                aria-label="סגור"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{NavList}</div>
          </div>
        </div>
      )}
    </>
  );
}
