import { createClient } from "@/lib/supabase/server";
import { MessagesList } from "./list";

export default async function AdminMessages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">הודעות מהאתר</h1>
      <MessagesList rows={data ?? []} />
    </div>
  );
}
