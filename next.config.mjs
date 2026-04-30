/** @type {import('next').NextConfig} */

// Build a Content-Security-Policy compatible with:
// - Next.js (inline styles for hydration boundaries are gated to nonce in
//   Next 15, but we use 'unsafe-inline' on style-src for Tailwind's runtime
//   inline styles; scripts are nonce-free but origin-restricted)
// - Supabase auth (HTTPS XHR/WebSocket to *.supabase.co)
// - Stripe Checkout redirect + js.stripe.com
// - Cloudinary / Unsplash / picsum / Supabase storage for <img>
const SUPABASE_HOST = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
      : "*.supabase.co";
  } catch {
    return "*.supabase.co";
  }
})();

const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `form-action 'self' https://checkout.stripe.com`,
  `frame-ancestors 'none'`,
  `object-src 'none'`,
  // Next.js + Stripe.js. 'unsafe-inline' is required for Next runtime inline
  // bootstrap; 'unsafe-eval' is needed only in dev for React refresh.
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'"} https://js.stripe.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos https://*.supabase.co https://*.supabase.in`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api.stripe.com`,
  `frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://www.google.com https://maps.google.com`,
  `media-src 'self' blob: https://res.cloudinary.com https://videos.pexels.com https://*.pexels.com`,
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
  `upgrade-insecure-requests`,
]
  .filter(Boolean)
  .join("; ");

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
