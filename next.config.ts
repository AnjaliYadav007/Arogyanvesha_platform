import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ── Experimental ── */


  /* ── Images ── */
  images: {
    // Domains we will load remote images from.
    // Add CDN / Cloudinary / Supabase Storage URLs here as the backend is built.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Serve modern formats automatically
    formats: ["image/avif", "image/webp"],
  },

  /* ── Security Headers ── */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },

  /* ── Redirects ── */
  async redirects() {
    return [
      // Redirect bare /dashboard to ensure auth gate fires
      {
        source: "/home",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;