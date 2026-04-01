import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "핵핵 | 해커톤 올인원 플랫폼",
  description: "숨가쁘게 몰입하는 순간, 세상을 바꾸는 해커톤",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" style={{ background: "#0a0a0f" }}>
<body style={{ background: "#0a0a0f", color: "#e8e8f0", margin: 0 }}>
        <ClientProviders>
          <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
