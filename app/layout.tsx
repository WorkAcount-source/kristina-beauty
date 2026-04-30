import type { Metadata } from "next";
import { Heebo, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Kristina Place Of Beauty", template: "%s | Kristina Place Of Beauty" },
  description: "סטודיו יופי מקצועי - מניקור, פדיקור, עיצוב ציפורניים, גבות וקורסים מקצועיים. קיבוץ גניגר.",
  keywords: ["מניקור", "פדיקור", "ציפורניים", "גבות", "קורסים", "יופי", "קיבוץ גניגר"],
  openGraph: {
    title: "Kristina Place Of Beauty",
    description: "המקום שלך ליופי מקצועי",
    locale: "he_IL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={`${heebo.variable} ${playfair.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster position="top-center" richColors closeButton dir="rtl" />
        </Providers>
      </body>
    </html>
  );
}
