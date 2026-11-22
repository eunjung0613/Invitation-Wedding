"use client";

import { useEffect, useState } from "react";
import { WEDDING_CONFIG } from "@/config/wedding";

type CurtainPhase = "showing" | "fading" | "gone";

export function OpeningCurtain() {
  const [phase, setPhase] = useState<CurtainPhase>("showing");

  const startDismiss = () => {
    setPhase((prev) => (prev === "showing" ? "fading" : prev));
  };

  useEffect(() => {
    const holdTimer = window.setTimeout(() => {
      setPhase((prev) => (prev === "showing" ? "fading" : prev));
    }, 1050);
    return () => window.clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    if (phase !== "fading") return;
    const unmountTimer = window.setTimeout(() => {
      setPhase("gone");
    }, 520);
    return () => window.clearTimeout(unmountTimer);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      onClick={startDismiss}
      role="dialog"
      aria-label="청첩장 오프닝 화면"
      className={`fixed inset-0 z-[90] flex cursor-pointer flex-col items-center justify-center bg-[#F7F4EE] px-6 text-center transition-opacity duration-500 ease-out ${phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
    >
      <div className="flex flex-col items-center">
        {/* 보태니컬 미니멀 잎사귀 모티프 */}
        <svg
          width="34"
          height="34"
          viewBox="0 0 36 36"
          fill="none"
          className="mb-5 text-sage"
          aria-hidden="true"
        >
          <path
            d="M18 30C18 19 24 11 31 7C25 7 18 11 18 19C18 11 11 7 5 7C12 11 18 19 18 30Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 30V18"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        <p className="font-editorial text-[11px] tracking-[0.34em] text-champagne uppercase">
          We Are Getting Married
        </p>

        <h1 className="font-editorial mt-3 text-[clamp(24px,6vw,38px)] font-light italic tracking-[0.04em] text-ink">
          <span className="whitespace-nowrap">
            {WEDDING_CONFIG.couple.groom.englishName}
          </span>
          <span className="mx-2.5 text-[0.72em] font-light text-champagne">
            &amp;
          </span>
          <span className="whitespace-nowrap">
            {WEDDING_CONFIG.couple.bride.englishName}
          </span>
        </h1>

        <div className="mt-5 h-px w-10 bg-champagne/60" />

        <p className="font-editorial tabular-lining mt-4 text-[14px] tracking-[0.26em] text-stone">
          {WEDDING_CONFIG.schedule.displayDateDot}
        </p>
      </div>
    </div>
  );
}
