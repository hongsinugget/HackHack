"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useStore } from "@/lib/store";
import Navbar from "./Navbar";
import NicknameModal from "./NicknameModal";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const init = useStore((s) => s.init);
  const initialized = useStore((s) => s.initialized);
  const initError = useStore((s) => s.initError);

  // init은 여기 한 곳에서만 실행 — 각 page의 중복 init() 불필요
  useEffect(() => {
    if (!initialized) init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Navbar />
      {initialized && initError ? (
        <main style={{ maxWidth: 480, margin: "6rem auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "0.5rem", color: "var(--text)" }}>
            데이터 로드 실패
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem", lineHeight: 1.6 }}>
            로컬 데이터를 불러오는 중 문제가 발생했습니다.
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1.5rem", padding: "0.75rem", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)", wordBreak: "break-all" }}>
            {initError}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ padding: "0.625rem 1.5rem", borderRadius: 8, background: "var(--accent)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.9rem" }}
          >
            초기화 후 재시작
          </button>
        </main>
      ) : (
        <>
          {children}
          <NicknameModal />
        </>
      )}
      <Toaster theme="dark" position="bottom-right" richColors />
    </>
  );
}
