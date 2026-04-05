"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export default function NicknameModal() {
  const { showNicknameModal, initialized, setNickname } = useStore();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // 초기화 전에는 렌더링 안 함 (hydration mismatch 방지)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !initialized || !showNicknameModal) return null;

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed.length < 2) { setError("닉네임은 2자 이상이어야 합니다"); return; }
    if (trimmed.length > 12) { setError("닉네임은 12자 이하여야 합니다"); return; }
    if (/\s/.test(trimmed)) { setError("공백은 사용할 수 없습니다"); return; }
    setNickname(trimmed);
    toast.success(`🔥 ${trimmed}님 환영합니다! 첫 불꽃 배지를 획득했습니다`);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "2.5rem 2rem",
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        {/* 로고 */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
          <Image src="/icons/logo.svg" alt="핵핵 로고" width={96} height={96} />
        </div>
        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--brand-primary)", marginBottom: "0.375rem" }}>
          핵핵에 오신 걸 환영합니다
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
          해커톤의 모든 순간을 함께할<br />닉네임을 설정해주세요
        </p>

        <div style={{ marginBottom: "1.25rem" }}>
          <input
            autoFocus
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="닉네임 입력 (2~12자)"
            maxLength={12}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: 10,
              background: "var(--surface2)",
              border: error ? "1px solid #ef4444" : "1px solid var(--border)",
              color: "var(--text)",
              fontSize: "1rem",
              textAlign: "center",
              outline: "none",
              transition: "border-color 0.15s",
            }}
          />
          {error && (
            <div style={{ marginTop: 6, fontSize: "0.78rem", color: "#ef4444" }}>{error}</div>
          )}
          <div style={{ marginTop: 4, fontSize: "0.72rem", color: "var(--muted)" }}>
            {value.trim().length} / 12자
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={value.trim().length < 2}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "1rem",
            background: value.trim().length >= 2 ? "var(--brand-primary)" : "rgba(124,58,237,0.3)",
            color: "#fff",
            border: "none",
            cursor: value.trim().length >= 2 ? "pointer" : "default",
            transition: "background 0.15s",
          }}
        >
          시작하기
        </button>

        <div style={{ marginTop: "1rem", fontSize: "0.72rem", color: "var(--muted)" }}>
          닉네임은 나중에 프로필에서 변경할 수 있습니다
        </div>
      </div>
    </div>
  );
}
