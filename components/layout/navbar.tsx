"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, Sparkles, LogIn, LogOut, UserPlus, UserCircle2, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart, useCartHydrated } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV = [
  { href: "/", label: "בית" },
  { href: "/services", label: "שירותים" },
  { href: "/portfolio", label: "תיק עבודות" },
  { href: "/courses", label: "קורסים" },
  { href: "/shop", label: "חנות" },
  { href: "/booking", label: "הזמנת תור" },
  { href: "/#contact", label: "צרי קשר" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const cartHydrated = useCartHydrated();
  const itemCount = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));

  const isHome = pathname === "/";
  // On the home page we keep the original transparent → white-on-scroll behaviour.
  // On every other page the navbar always has a styled (light) background so it
  // stays readable against page content.
  const solid = !isHome || scrolled;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrolled(window.scrollY > 20); ticking = false; });
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Track auth state so the navbar shows the right buttons.
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    const loadRole = async (uid: string | undefined) => {
      if (!uid) { if (mounted) setIsAdmin(false); return; }
      const { data } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
      if (mounted) setIsAdmin(data?.role === "admin");
    };
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      loadRole(data.user?.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      loadRole(session?.user?.id);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* Main bar */}
      <div className={cn(
        "relative transition-all duration-500",
        solid
          ? "bg-white/80 supports-[backdrop-filter]:bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(190,24,93,0.18)] border-b border-rose-100/70"
          : "bg-transparent border-b border-white/10"
      )}>
        {/* Subtle modern gradient sheen — only when the bar is solid */}
        {solid && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-l from-rose-50/60 via-white/0 to-amber-50/40"
          />
        )}
        <div className="relative container flex h-16 md:h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="size-6 md:size-7 text-rose-500" strokeWidth={2.2} />
            <div className="flex flex-col leading-none">
              <span className={cn("font-display text-xl md:text-2xl font-bold transition-colors duration-300", solid ? "text-neutral-900" : "text-white")}>Kristina</span>
              <span className={cn("text-[9px] md:text-[10px] tracking-[0.25em] uppercase transition-colors duration-300", solid ? "text-rose-600/80" : "text-rose-200")}>Place of Beauty</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => {
              const [base, frag] = n.href.split("#");
              const isHashLink = Boolean(frag);
              let active: boolean;
              if (isHashLink) {
                // Hash links point to a section of another page (e.g. "/#contact").
                // They are never highlighted themselves — the parent page link is.
                active = false;
              } else if (n.href === "/") {
                active = pathname === "/";
              } else {
                active = pathname.startsWith(base);
              }
              return (
                <Link key={n.href} href={n.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-all duration-300 group rounded-full",
                    solid ? "text-neutral-700 hover:text-rose-600 hover:bg-rose-50" : "text-white/90 hover:text-white hover:bg-white/15"
                  )}>
                  <span className="relative">
                    {n.label}
                    <span className={cn(
                      "absolute -bottom-1 right-0 h-px transition-all duration-500 ease-out",
                      solid ? "bg-rose-500" : "bg-white",
                      active ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {(() => {
              const isCart = pathname === "/cart";
              return (
                <Link
                  href="/cart"
                  className={cn(
                    "relative p-2.5 rounded-full transition-colors",
                    isCart
                      ? (solid ? "bg-rose-100 text-rose-700" : "bg-white/25 text-white")
                      : (solid ? "hover:bg-rose-50" : "hover:bg-white/15")
                  )}
                  aria-label="עגלה"
                  title="עגלה"
                  aria-current={isCart ? "page" : undefined}
                >
                  <ShoppingBag
                    className={cn(
                      "size-5 transition-colors",
                      isCart
                        ? (solid ? "text-rose-700" : "text-white")
                        : (solid ? "text-neutral-700" : "text-white")
                    )}
                  />
                  {cartHydrated && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              );
            })()}

            {/* Vertical divider between cart and auth area */}
            <span
              aria-hidden
              className={cn(
                "hidden sm:block h-6 w-px mx-1 transition-colors",
                solid ? "bg-rose-200/70" : "bg-white/25"
              )}
            />

            {/* Auth area — icon-only buttons. Labels are provided via aria-label/title for a11y. */}
            {user ? (
              <>
                {isAdmin && (() => {
                  const isAdminPage = pathname?.startsWith("/admin");
                  return (
                    <Link
                      href="/admin"
                      aria-label="ניהול האתר"
                      title="ניהול האתר"
                      aria-current={isAdminPage ? "page" : undefined}
                      className={cn(
                        "p-2.5 rounded-full transition-colors",
                        isAdminPage
                          ? (solid ? "bg-rose-100 text-rose-700" : "bg-white/25 text-white")
                          : (solid ? "text-neutral-700 hover:bg-rose-50 hover:text-rose-700" : "text-white/95 hover:bg-white/15")
                      )}
                    >
                      <LayoutDashboard className="size-5" />
                    </Link>
                  );
                })()}
                {(() => {
                  const isAccount = pathname === "/account" || pathname?.startsWith("/account/");
                  return (
                    <Link
                      href="/account"
                      aria-label="החשבון שלי"
                      title="החשבון שלי"
                      aria-current={isAccount ? "page" : undefined}
                      className={cn(
                        "p-2.5 rounded-full transition-colors",
                        isAccount
                          ? (solid ? "bg-rose-100 text-rose-700" : "bg-white/25 text-white")
                          : (solid ? "text-neutral-700 hover:bg-rose-50 hover:text-rose-700" : "text-white/95 hover:bg-white/15")
                      )}
                    >
                      <UserCircle2 className="size-5" />
                    </Link>
                  );
                })()}
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="התנתקות"
                  title="התנתקות"
                  className={cn(
                    "p-2.5 rounded-full transition-colors",
                    solid ? "text-neutral-700 hover:bg-rose-50 hover:text-rose-700" : "text-white/95 hover:bg-white/15"
                  )}
                >
                  <LogOut className="size-5" />
                </button>
              </>
            ) : (
              <>
                {(() => {
                  const isLogin = pathname?.startsWith("/auth/login");
                  const isRegister = pathname?.startsWith("/auth/register");
                  return (
                    <>
                      <Link
                        href={`/auth/login?redirect=${encodeURIComponent(pathname || "/account")}`}
                        aria-label="כניסה"
                        title="כניסה"
                        aria-current={isLogin ? "page" : undefined}
                        className={cn(
                          "p-2.5 rounded-full transition-colors",
                          isLogin
                            ? (solid ? "bg-rose-100 text-rose-700" : "bg-white/25 text-white")
                            : (solid ? "text-neutral-700 hover:bg-rose-50 hover:text-rose-700" : "text-white/95 hover:bg-white/15")
                        )}
                      >
                        <LogIn className="size-5" />
                      </Link>
                      <Link
                        href="/auth/register"
                        aria-label="הרשמה"
                        title="הרשמה"
                        aria-current={isRegister ? "page" : undefined}
                        className={cn(
                          "hidden sm:inline-flex p-2.5 rounded-full transition-colors",
                          isRegister
                            ? (solid ? "bg-rose-100 text-rose-700" : "bg-white/25 text-white")
                            : (solid ? "text-neutral-700 hover:bg-rose-50 hover:text-rose-700" : "text-white/95 hover:bg-white/15")
                        )}
                      >
                        <UserPlus className="size-5" />
                      </Link>
                    </>
                  );
                })()}
              </>
            )}

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className={cn(
                "lg:hidden p-2.5 rounded-full transition-colors",
                solid ? "hover:bg-rose-50" : "hover:bg-white/15"
              )}
              aria-label="תפריט"
            >
              {open ? (
                <X className={cn("size-6 transition-colors", solid ? "text-neutral-800" : "text-white")} />
              ) : (
                <Menu className={cn("size-6 transition-colors", solid ? "text-neutral-800" : "text-white")} />
              )}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-rose-100 bg-white shadow-lg">
          <nav className="container py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}
                className="px-4 py-3 rounded-xl text-base font-medium hover:bg-rose-50 hover:text-rose-700 transition-colors">
                {n.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-rose-100" />

            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="px-4 py-3 rounded-xl text-base font-medium hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2">
                    <LayoutDashboard className="size-4" /> ניהול האתר
                  </Link>
                )}
                <Link href="/account" className="px-4 py-3 rounded-xl text-base font-medium hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2">
                  <UserCircle2 className="size-4" /> החשבון שלי
                </Link>
                <button onClick={handleLogout} className="text-right px-4 py-3 rounded-xl text-base font-medium hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2">
                  <LogOut className="size-4" /> התנתקות
                </button>
              </>
            ) : (
              <>
                <Link href={`/auth/login?redirect=${encodeURIComponent(pathname || "/account")}`} className="px-4 py-3 rounded-xl text-base font-medium hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2">
                  <LogIn className="size-4" /> כניסה
                </Link>
                <Link href="/auth/register" className="px-4 py-3 rounded-xl text-base font-medium hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2">
                  <UserPlus className="size-4" /> הרשמה
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
