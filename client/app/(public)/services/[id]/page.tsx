import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clock, Calendar as CalIcon, ChevronRight } from "lucide-react";
import type { Service } from "@/types/db";
import { SafeImage } from "@/components/safe-image";

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("services").select("id").eq("active", true);
  return (data ?? []).map((row) => ({ id: String(row.id) }));
}

export const revalidate = 3600;

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase.from("services").select("*").eq("id", id).single();
  const service = data as Service | null;
  if (!service) notFound();

  return (
    <div className="pt-32 pb-20">
      <div className="container">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-rose-600">בית</Link>
          <ChevronRight className="size-4 rotate-180" />
          <Link href="/services" className="hover:text-rose-600">שירותים</Link>
          <ChevronRight className="size-4 rotate-180" />
          <span className="text-foreground">{service.name}</span>
        </nav>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
            {service.image_url ? <SafeImage src={service.image_url} alt={service.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" priority /> : <div className="absolute inset-0 bg-gradient-rose" />}
          </div>
          <div className="space-y-6">
            <h1 className="font-display text-4xl md:text-5xl font-bold">{service.name}</h1>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-muted-foreground"><Clock className="size-5 text-rose-600" /> {formatDuration(service.duration_min)}</span>
              <span className="text-3xl font-bold text-gradient">{formatPrice(Number(service.price))}</span>
            </div>
            {service.description && <p className="text-lg text-muted-foreground leading-relaxed">{service.description}</p>}
            <Button asChild size="xl">
              <Link href={`/booking?service=${service.id}`}><CalIcon className="size-5" /> הזמנת תור</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
