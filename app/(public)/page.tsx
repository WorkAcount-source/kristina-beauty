import Link from "next/link";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { Hero } from "@/components/sections/hero";
import { GalleryCarousel } from "@/components/sections/gallery-carousel";
import { InstagramFeed } from "@/components/sections/instagram-feed";
import { ProductCard } from "@/components/product-card";
import { CourseCard } from "@/components/course-card";
import { ServiceCard } from "@/components/service-card";
import { ContactSection } from "@/components/sections/contact-section";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { createPublicClient } from "@/lib/supabase/public";
import { ArrowLeft, Instagram } from "lucide-react";
import type { PortfolioItem, Product, Course, Service, InstagramPost } from "@/types/db";

const getHomepageData = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const [portfolioRes, productsRes, coursesRes, servicesRes, instagramRes] = await Promise.all([
      supabase.from("portfolio_items").select("*").order("sort_order").limit(8),
      supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false }).limit(4),
      supabase.from("courses").select("*").eq("active", true).order("created_at", { ascending: false }).limit(3),
      supabase.from("services").select("*").eq("active", true).order("created_at", { ascending: false }).limit(6),
      supabase.from("instagram_posts").select("*").order("sort_order").limit(4),
    ]);
    return {
      portfolio: (portfolioRes.data as PortfolioItem[]) ?? [],
      products: (productsRes.data as Product[]) ?? [],
      courses: (coursesRes.data as Course[]) ?? [],
      services: (servicesRes.data as Service[]) ?? [],
      instagram: (instagramRes.data as InstagramPost[]) ?? [],
    };
  },
  ["homepage-data"],
  { revalidate: 300 }
);

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<HomepageSectionsFallback />}>
        <HomepageSections />
      </Suspense>
      <ContactSection />
    </>
  );
}

async function HomepageSections() {
  const { portfolio, products, courses, services, instagram } = await getHomepageData();

  return (
    <>
      {/* Portfolio gallery */}
      {portfolio.length > 0 && (
        <section id="content" className="relative py-14 md:py-24 bg-white">
          <div className="container">
            <SectionHeader eyebrow="Portfolio" title="תיק העבודות שלי" subtitle="גלריית העיצובים המובילה שלנו מציגה את היצירות האומנותיות שלנו באמנות הציפורניים" />
            <GalleryCarousel items={portfolio} />
            <div className="flex justify-center mt-8 md:mt-10">
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">לכל הגלריה <ArrowLeft className="size-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="relative py-14 md:py-24 bg-gradient-rose">
          <div className="container">
            <SectionHeader eyebrow="Services" title="השירותים שלנו" subtitle="טיפוח מקצועי לכל אישה - בחרי את השירות המועדף עלייך" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {services.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          </div>
        </section>
      )}

      {/* Instagram */}
      {instagram.length > 0 && (
        <section className="relative py-14 md:py-24 bg-white">
          <div className="container">
            <SectionHeader eyebrow="Follow us" title="מהאינסטגרם שלנו" subtitle="עדכונים, טיפים וסרטונים מעולם היופי והטיפוח" />
            <InstagramFeed posts={instagram} />
            <div className="flex justify-center mt-8 md:mt-10">
              <Button asChild variant="outline" size="lg">
                <a href="https://www.instagram.com/kristina_place_of_beauty/" target="_blank" rel="noopener noreferrer">
                  <Instagram className="size-4" /> עקבו אחרינו באינסטגרם
                </a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Shop */}
      {products.length > 0 && (
        <section className="relative py-14 md:py-24 bg-gradient-to-b from-rose-50/50 to-white">
          <div className="container">
            <SectionHeader eyebrow="Shop" title="חנות" subtitle="מוצרי האיכות שלנו לטיפוח עצמי בבית" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="flex justify-center mt-8 md:mt-10">
              <Button asChild variant="outline" size="lg">
                <Link href="/shop">לכל המוצרים <ArrowLeft className="size-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <section className="relative py-14 md:py-24 bg-white">
          <div className="container">
            <SectionHeader eyebrow="Courses" title="קורסים מקצועיים" subtitle="למדי מהמומחים שלנו את הטכניקות המובילות בתחום" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {courses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
            <div className="flex justify-center mt-8 md:mt-10">
              <Button asChild variant="outline" size="lg">
                <Link href="/courses">לכל הקורסים <ArrowLeft className="size-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Booking CTA */}
      <section className="relative py-14 md:py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-luxe p-8 sm:p-12 md:p-16 text-center text-white shadow-xl">
            <div className="relative max-w-3xl mx-auto space-y-5 md:space-y-6">
              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl leading-tight">מוכנה להתפנק?</h2>
              <p className="text-base md:text-xl text-white/85 max-w-xl mx-auto leading-relaxed">בחרי את השירות המועדף עלייך וקבעי תור בקלות עוד היום</p>
              <Button asChild size="xl" className="bg-white text-rose-700 hover:bg-rose-50">
                <Link href="/booking">הזמנת תור עכשיו <ArrowLeft className="size-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HomepageSectionsFallback() {
  return (
    <div className="py-14 md:py-24 bg-white">
      <div className="container space-y-6">
        <div className="h-8 w-56 bg-rose-100 rounded-full animate-pulse mx-auto" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-rose-100/70 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
