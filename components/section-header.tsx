"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  index,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Two-digit chapter number for editorial flair, e.g. "01" */
  index?: string;
  center?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE }}
      className={`relative ${center ? "text-center max-w-3xl mx-auto" : ""} mb-14`}
    >
      {index && (
        <span
          aria-hidden
          className={`numeral block text-[110px] md:text-[160px] text-foreground/[0.06] absolute -top-10 ${
            center ? "left-1/2 -translate-x-1/2" : "right-0"
          } pointer-events-none select-none`}
        >
          {index}
        </span>
      )}
      <div className="relative">
        <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
          {eyebrow && <span className="h-px w-10 bg-gradient-to-l from-transparent via-rose-500/70 to-amber-300/40" />}
          <h2 className="font-display text-3xl sm:text-[2.5rem] md:text-6xl leading-[1.02] tracking-tight">
            {title}
          </h2>
          {eyebrow && <span className="h-px w-10 bg-gradient-to-r from-transparent via-rose-500/70 to-amber-300/40" />}
        </div>
        {subtitle && (
          <p className="mt-5 text-base md:text-lg text-current/65 leading-relaxed max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  y = 30,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
