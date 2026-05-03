"use client";

import { Suspense, useState } from "react";
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
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const router = useRouter();

  async function recordConsent(email: string, source: string) {
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          consents: [
            { type: "terms", accepted: true },
            { type: "privacy", accepted: true },
            { type: "marketing", accepted: acceptMarketing },
          ],
        }),
      });
    } catch {
      // non-blocking
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!acceptTerms) {
      setShowTermsError(true);
      toast.error("יש לאשר את תנאי השימוש ומדיניות הפרטיות כדי להירשם");
      return;
    }
    setShowTermsError(false);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: String(fd.get("password") || ""),
      options: {
        data: {
          full_name: String(fd.get("name") || ""),
          phone: String(fd.get("phone") || ""),
          marketing_consent: acceptMarketing,
        },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error("הרשמה נכשלה", { description: error.message });
    }
    await recordConsent(email, "register");
    setLoading(false);
    toast.success("נרשמת בהצלחה!", { description: "ברוכה הבאה" });
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-rose-100 mx-4 sm:mx-auto my-10 sm:my-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-luxe shadow-lg shadow-rose-500/40 mb-4">
          <Sparkles className="size-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">הצטרפי אלינו</h1>
        <p className="text-muted-foreground">פתחי חשבון חדש</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">
            שם מלא <span className="text-rose-600" aria-hidden="true">*</span>
          </Label>
          <Input id="name" name="name" required autoComplete="name" aria-required="true" />
        </div>
        <div>
          <Label htmlFor="phone">
            טלפון <span className="text-rose-600" aria-hidden="true">*</span>
          </Label>
          <Input id="phone" name="phone" type="tel" required autoComplete="tel" aria-required="true" />
        </div>
        <div>
          <Label htmlFor="email">
            דוא&quot;ל <span className="text-rose-600" aria-hidden="true">*</span>
          </Label>
          <Input id="email" name="email" type="email" required autoComplete="email" aria-required="true" />
        </div>
        <div>
          <Label htmlFor="password">
            סיסמה <span className="text-rose-600" aria-hidden="true">*</span>
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            aria-required="true"
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-xs text-muted-foreground mt-1">
            לפחות 6 תווים
          </p>
        </div>

        <fieldset className="space-y-3 pt-2">
          <legend className="sr-only">הסכמות</legend>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (e.target.checked) setShowTermsError(false);
              }}
              required
              aria-required="true"
              aria-invalid={showTermsError || undefined}
              aria-describedby={showTermsError ? "terms-error" : undefined}
              className="mt-1 size-4 accent-rose-600 cursor-pointer"
            />
            <span className="text-sm leading-relaxed">
              קראתי ואני מאשרת את{" "}
              <Link href="/terms" target="_blank" className="text-rose-600 underline hover:text-rose-700">
                תנאי השימוש
              </Link>{" "}
              ואת{" "}
              <Link href="/privacy" target="_blank" className="text-rose-600 underline hover:text-rose-700">
                מדיניות הפרטיות
              </Link>
              <span className="text-rose-600" aria-hidden="true"> *</span>
            </span>
          </label>
          {showTermsError && (
            <p id="terms-error" role="alert" className="text-xs text-red-600 -mt-1">
              חובה לאשר את תנאי השימוש ומדיניות הפרטיות
            </p>
          )}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="acceptMarketing"
              checked={acceptMarketing}
              onChange={(e) => setAcceptMarketing(e.target.checked)}
              className="mt-1 size-4 accent-rose-600 cursor-pointer"
            />
            <span className="text-sm leading-relaxed">
              אני מסכימה לקבל עדכונים, מבצעים ותכנים שיווקיים בדוא&quot;ל ובהודעות SMS.
              ניתן להסיר את ההסכמה בכל עת.
              <span className="block text-xs text-muted-foreground">(אופציונלי)</span>
            </span>
          </label>
        </fieldset>

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? "נרשמת..." : "הרשמה"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-rose-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-muted-foreground">או</span>
        </div>
      </div>

      <GoogleSignInButtonSuspense
        acceptTerms={acceptTerms}
        acceptMarketing={acceptMarketing}
        onTermsRequired={() => {
          setShowTermsError(true);
          toast.error("יש לאשר את תנאי השימוש ומדיניות הפרטיות לפני התחברות עם Google");
        }}
      />

      <p className="text-center text-sm mt-6 text-muted-foreground">
        כבר יש לך חשבון?{" "}
        <Link href="/auth/login" className="text-rose-600 font-medium hover:underline">
          התחברי כאן
        </Link>
      </p>
    </div>
  );
}

function GoogleSignInButtonSuspense(props: {
  acceptTerms: boolean;
  acceptMarketing: boolean;
  onTermsRequired: () => void;
}) {
  return (
    <Suspense fallback={<div className="h-11 rounded-md bg-rose-50 animate-pulse" />}>
      <GoogleSignInButton
        requireConsent
        consentAccepted={props.acceptTerms}
        marketingConsent={props.acceptMarketing}
        onConsentMissing={props.onTermsRequired}
      />
    </Suspense>
  );
}
