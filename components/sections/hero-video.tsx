"use client";

import { useEffect, useState } from "react";

/**
 * Lazy-mounted background video. Renders nothing during initial paint so the
 * hero image + text can ship instantly. The video element is added only after
 * the browser is idle, and only on connections that aren't data-saver / 2g.
 */
export function HeroVideo() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      if (conn?.saveData) return;
      if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return;
    }

    const mount = () => setShow(true);
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      w.requestIdleCallback(mount, { timeout: 1500 });
    } else {
      const t = setTimeout(mount, 600);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className="absolute inset-0 w-full h-full object-cover opacity-0 animate-[heroVideoFade_700ms_ease-out_forwards]"
      style={{ transform: "scale(1.08)", objectPosition: "75% center" }}
      onLoadedMetadata={(e) => {
        (e.currentTarget as HTMLVideoElement).playbackRate = 0.6;
      }}
    >
      <source src="/videos/hero.webm" type="video/webm" />
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  );
}
