"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

export function PurchaseBanner({ isEnrolled }: { isEnrolled: boolean }) {
  const router = useRouter();

  // If the webhook hasn't fired yet, poll until enrolled
  useEffect(() => {
    if (isEnrolled) return;
    const timer = setTimeout(() => router.refresh(), 3000);
    return () => clearTimeout(timer);
  }, [isEnrolled, router]);

  if (isEnrolled) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4">
        <CheckCircle className="size-5 text-emerald-500 shrink-0" />
        <p className="text-sm text-emerald-800 font-medium">
          התשלום אושר! כל פרקי הקורס פתוחים עבורך.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl bg-sky-50 border border-sky-200 px-5 py-4">
      <Loader2 className="size-5 text-sky-500 shrink-0 animate-spin" />
      <p className="text-sm text-sky-800">
        מעבד את התשלום... הפרקים ייפתחו תוך שניות.
      </p>
    </div>
  );
}
