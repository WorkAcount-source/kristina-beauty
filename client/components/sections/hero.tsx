import Link from "next/link";
import Image from "next/image";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVideo } from "@/components/sections/hero-video";

export function Hero() {
  return (
    <section
      id="home"
      className="relative bg-black overflow-hidden pt-[7.5rem] md:pt-[8.5rem] pb-16 md:pb-24 min-h-[88vh]"
    >
      {/* Background — instant gradient + lazy video on top */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 70% 30%, #5a1f33 0%, #1a0a13 55%, #050203 100%)",
          }}
          aria-hidden
        />
        <HeroVideo />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      </div>

      <div className="relative container grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Text — RIGHT side in RTL */}
        <div className="text-center lg:text-right space-y-6 lg:order-1 text-white motion-safe:animate-[heroFadeUp_600ms_cubic-bezier(0.16,1,0.3,1)_both]">
          <h1 className="font-display font-semibold text-[2.6rem] sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.5rem] leading-[1.02] tracking-tight">
            <span className="block drop-shadow-2xl">Kristina</span>
            <span className="block text-white/90">
              <span className="italic font-light text-rose-300">Place</span>{" "}
              <span className="text-white/70 font-light">Of</span>{" "}
              <span className="bg-gradient-to-r from-rose-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                Beauty
              </span>
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/85 max-w-md md:max-w-lg leading-relaxed mx-auto lg:mx-0 lg:mr-0">
            סטודיו יופי בוטיק בקיבוץ גניגר. מניקור, פדיקור ועיצוב ציפורניים — עם תשומת לב לכל פרט,
            בגישה אישית וברמה הגבוהה ביותר.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
            <Button asChild size="xl" className="group shadow-2xl shadow-rose-500/40">
              <Link href="/booking">
                <span>קביעת תור</span>
                <ArrowLeft className="size-5 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="bg-white/5 backdrop-blur-md text-white border-white/30 hover:bg-white/15 hover:text-white hover:border-white/60"
            >
              <Link href="/portfolio">תיק העבודות</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start pt-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-sm">4.9</span>
              <span className="text-white/60 text-xs">/ 5</span>
            </div>
            <div className="h-7 w-px bg-white/25" />
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-3xl text-rose-300 font-bold">+300</span>
              <span className="text-xs text-white/70 tracking-wider uppercase">לקוחות</span>
            </div>
            <div className="h-7 w-px bg-white/25" />
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-3xl text-rose-300 font-bold">10+</span>
              <span className="text-xs text-white/70 tracking-wider uppercase">שנות ניסיון</span>
            </div>
          </div>
        </div>

        {/* Founder image — LEFT side in RTL */}
        <div
          className="relative mx-auto lg:order-2 w-full max-w-[320px] sm:max-w-[380px] md:max-w-[440px] lg:max-w-[500px] aspect-square mt-10 lg:mt-12 motion-safe:animate-[heroFadeIn_700ms_cubic-bezier(0.16,1,0.3,1)_both]"
          style={{ animationDelay: "100ms" }}
        >
          {/* Soft glow halo */}
          <div className="absolute -inset-10 rounded-full bg-rose-300/25 blur-3xl" aria-hidden />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200/50 via-rose-100/35 to-amber-100/30 blur-2xl" aria-hidden />

          {/* Portrait */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full overflow-hidden rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-l border-white/20 bg-gradient-to-tr from-rose-500/10 to-transparent transform transition-all duration-700 hover:scale-[1.03] hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(225,29,72,0.3)] group">
              <Image
                src="/images/kris.png"
                alt="Kristina - מייסדת Place Of Beauty"
                fill
                sizes="(max-width:1024px) 80vw, 45vw"
                className="object-cover object-top drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)] transition-transform duration-700 group-hover:scale-105"
                priority
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
