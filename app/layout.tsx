import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "핵핵 | 해커톤 올인원 플랫폼",
  description: "숨가쁘게 몰입하는 순간, 세상을 바꾸는 해커톤",
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon.ico", sizes: "any" },
    ],
    apple: { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    other: [
      { rel: "android-chrome-192x192", url: "/favicon_io/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/favicon_io/android-chrome-512x512.png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" style={{ background: "#f0f2f5" }}>
      <body style={{ background: "#f0f2f5", color: "#12121a", margin: 0 }}>
        <ClientProviders>
          <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
