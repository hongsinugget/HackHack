import Link from "next/link";
import Image from "next/image";

export default function FooterBanner() {
  return (
    <div className="footer-banner">
      {/* 텍스트 블록 */}
      <div className="footer-text-block">
        <p className="footer-small-text">숨이 찰 만큼 우리는 만들고, 배우고, 결국 성장해요</p>
        <p className="footer-big-text">핵핵은 그 모든 과정을 연결하는 공간이에요</p>
      </div>

      {/* 캐릭터 이미지 — 하단 정렬 */}
      <Image
        src="/icons/Footer-harry.png"
        alt="핵핵 캐릭터"
        width={160}
        height={140}
        className="footer-char-img"
      />

      {/* CTA 버튼 */}
      <Link href="/hackathons" className="footer-cta-link">
        지금 바로 참여하기
      </Link>
    </div>
  );
}
