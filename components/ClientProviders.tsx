"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useStore } from "@/lib/store";
import Navbar from "./Navbar";
import NicknameModal from "./NicknameModal";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const init = useStore((s) => s.init);
  const initialized = useStore((s) => s.initialized);

  // init은 여기 한 곳에서만 실행 — 각 page의 중복 init() 불필요
  useEffect(() => {
    if (!initialized) init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Navbar />
      {children}
      <NicknameModal />
      <Toaster theme="dark" position="bottom-right" richColors />
    </>
  );
}
