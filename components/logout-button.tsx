"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button variant="outline" onClick={async () => {
      await createClient().auth.signOut();
      router.push("/");
      router.refresh();
    }}>
      <LogOut className="size-4" /> התנתקות
    </Button>
  );
}
