"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      options: {
        data: {
          full_name: String(fd.get("name") || ""),
          phone: String(fd.get("phone") || ""),
        },
      },
    });
    setLoading(false);
    if (error) return toast.error("הרשמה נכשלה", { description: error.message });
    toast.success("נרשמת בהצלחה!", { description: "ברוכה הבאה" });
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-rose-100 mx-4 sm:mx-auto my-10 sm:my-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-luxe shadow-lg shadow-rose-500/40 mb-4">
          <Sparkles className="size-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">הצטרפי אלינו</h1>
        <p className="text-muted-foreground">פתחי חשבון חדש</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div><Label htmlFor="name">שם מלא</Label><Input id="name" name="name" required /></div>
        <div><Label htmlFor="phone">טלפון</Label><Input id="phone" name="phone" type="tel" required /></div>
        <div><Label htmlFor="email">דוא&quot;ל</Label><Input id="email" name="email" type="email" required /></div>
        <div><Label htmlFor="password">סיסמה</Label><Input id="password" name="password" type="password" required minLength={6} /></div>
        <Button type="submit" disabled={loading} size="lg" className="w-full">{loading ? "נרשמת..." : "הרשמה"}</Button>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-rose-100" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-muted-foreground">או</span></div>
      </div>
      <GoogleSignInButton />
      <p className="text-center text-sm mt-6 text-muted-foreground">
        כבר יש לך חשבון? <Link href="/auth/login" className="text-rose-600 font-medium hover:underline">התחברי כאן</Link>
      </p>
    </div>
  );
}
