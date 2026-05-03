import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata = { title: "תשלום" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?redirect=/checkout`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,phone")
    .eq("id", user.id)
    .single();

  return (
    <div className="pt-32 pb-20">
      <div className="container max-w-5xl">
        <h1 className="font-display text-4xl font-bold mb-8">תשלום</h1>
        <CheckoutForm
          defaultName={profile?.full_name ?? ""}
          defaultEmail={user.email ?? ""}
          defaultPhone={profile?.phone ?? ""}
        />
      </div>
    </div>
  );
}
