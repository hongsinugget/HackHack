import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js hydration 및 inline script 필요
              "script-src 'self' 'unsafe-inline'",
              // Tailwind inline style 필요
              "style-src 'self' 'unsafe-inline'",
              // html2canvas blob URL, 파비콘 등 이미지
              "img-src 'self' data: blob:",
              // canvas-confetti worker
              "worker-src 'self' blob:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
