import Link from "next/link";
import Image from "next/image";

export default function FooterBanner() {
  return (
    <div
      style={{
        background: "var(--bg-dark, #12121a)",
        padding: "22px 77px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "2rem",
      }}
    >
      {/* Text block */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--text-light, #f0f2f5)" }}>
          숨이 찰 만큼 우리는 만들고, 배우고, 결국 성장해요
        </p>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 800, lineHeight: "30px", color: "#ffffff" }}>
          핵핵은 그 모든 과정을 연결하는 공간이에요
        </p>
      </div>

      {/* Character image */}
      <Image
        src="/icons/Footer-harry.png"
        alt="핵핵 캐릭터"
        width={120}
        height={80}
        style={{ height: 80, width: "auto", objectFit: "contain", flexShrink: 0 }}
      />

      {/* CTA button */}
      <Link
        href="/hackathons"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 24px",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          background: "var(--text-light, #f0f2f5)",
          color: "var(--brand-primary, #7c3aed)",
          textDecoration: "none",
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
      >
        지금 바로 참여하기
      </Link>
    </div>
  );
}
