import Link from "next/link";
import Image from "next/image";
import { Instagram, Phone, MapPin, Mail, Clock } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

const HOURS = [
  { label: "ראשון - חמישי", time: "08:00 - 16:00" },
  { label: "שישי", time: "08:00 - 14:00" },
  { label: "שבת", time: "סגור" },
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-rose-50 to-rose-100 border-t border-rose-200 mt-20">
      <div className="container py-14 md:py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" aria-label="Kristina Place Of Beauty - דף הבית">
            <Image
              src="/images/logo.png"
              alt="Kristina Place Of Beauty"
              width={160}
              height={70}
              className="h-16 w-auto object-contain mix-blend-multiply"
            />
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">המקום שלך ליופי מקצועי</p>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/kristina_place_of_beauty/" target="_blank" rel="noopener noreferrer"
              className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all hover:scale-110">
              <Instagram className="size-5" />
            </a>
            <a href={whatsappLink("972523060735")} target="_blank" rel="noopener noreferrer"
              className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all hover:scale-110">
              <Phone className="size-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold mb-4">ניווט מהיר</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-rose-600 transition-colors">דף הבית</Link></li>
            <li><Link href="/shop" className="hover:text-rose-600 transition-colors">חנות</Link></li>
            <li><Link href="/courses" className="hover:text-rose-600 transition-colors">קורסים</Link></li>
            <li><Link href="/booking" className="hover:text-rose-600 transition-colors">הזמנת תור</Link></li>
            <li><Link href="/portfolio" className="hover:text-rose-600 transition-colors">תיק עבודות</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold mb-4">יצירת קשר</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><MapPin className="size-4 text-rose-600" /> קיבוץ גניגר</li>
            <li><a href="tel:0523060735" className="flex items-center gap-2 hover:text-rose-600"><Phone className="size-4 text-rose-600" /> 052-3060735</a></li>
            <li><a href="mailto:yagudaeva09@gmail.com" className="flex items-center gap-2 hover:text-rose-600"><Mail className="size-4 text-rose-600" /> yagudaeva09@gmail.com</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold mb-4">שעות פעילות</h3>
          <ul className="space-y-2 text-sm">
            {HOURS.map((h) => (
              <li key={h.label} className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                <span className="flex items-center gap-2 shrink-0"><Clock className="size-4 text-rose-600 shrink-0" /> {h.label}</span>
                <span className="text-muted-foreground">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-rose-200 py-6 text-sm text-muted-foreground">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Kristina Place Of Beauty. כל הזכויות שמורות.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-rose-600">מדיניות פרטיות</Link>
            <Link href="/terms" className="hover:text-rose-600">תנאי שימוש</Link>
            <Link href="/accessibility" className="hover:text-rose-600">הצהרת נגישות</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
