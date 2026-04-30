"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

// Known-broken Unsplash photo IDs from seed data — proactively swap to mock
// before the optimizer ever requests them, so no 404s hit the network.
const BROKEN_UNSPLASH_IDS = [
  "photo-1604654894609-5f24e06ca19f",
  "photo-1604654894610-df63bc536371",
  "photo-1570194065650-d99fb4bedf0a",
  "photo-1522335789203-aaa2cdaa1822",
  "photo-1556228720-195a672e8a03",
  "photo-1608248543803-ba4f8c70ae0b",
  "photo-1583241800698-9c2e463cb4f1",
  "photo-1632345031435-8727f6897d53",
  "photo-1610992015732-2449b76344bc",
];

function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mockFor(src: string) {
  return `https://picsum.photos/seed/${hashSeed(src) % 10000}/800/800`;
}

function resolve(src: string | null | undefined): string {
  if (!src) return mockFor("empty");
  if (src.includes("images.unsplash.com")) {
    for (const id of BROKEN_UNSPLASH_IDS) {
      if (src.includes(id)) return mockFor(id);
    }
  }
  return src;
}

type Props = Omit<ImageProps, "src"> & { src: string | null | undefined };

export function SafeImage({ src, alt, ...rest }: Props) {
  const initial = resolve(src);
  const [current, setCurrent] = useState<string>(initial);
  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      onError={() => {
        const fb = mockFor(typeof src === "string" ? src : "fallback");
        if (current !== fb) setCurrent(fb);
      }}
    />
  );
}
