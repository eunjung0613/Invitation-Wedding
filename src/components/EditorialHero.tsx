"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";

interface EditorialHeroProps {
  /** 'split'은 폴드 펼침/태블릿/PC 좌측 고정 패널, 'mobile'은 모바일/폴드 접힘 상단 풀스크린 */
  variant: "split" | "mobile";
}

const NAV_ITEMS = [
  { href: "#invitation", label: "모시는 글" },
  { href: "#calendar", label: "예식 일시" },
  { href: "#gallery", label: "갤러리" },
  { href: "#location", label: "오시는 길" },
  { href: "#rsvp", label: "참석 여부" },
  { href: "#accounts", label: "마음 전하기" },
  { href: "#guest-snaps", label: "하객 스냅" },
  { href: "#guestbook", label: "방명록" },
];

export function EditorialHero({ variant }: EditorialHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = WEDDING_CONFIG.featuredPhotos.heroAlternates;
  const activeSlide = slides[activeIndex];
  const isSplit = variant === "split";

  return (
    <div
      className={
        isSplit
          ? "relative flex h-dvh w-full flex-col justify-between overflow-hidden bg-[#242823]"
          : "relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-[#242823]"
      }
    >
      {/* 메인 화보 배경 (기본: 14번 언덕 위 키스 실루엣 photo-15.jpg) */}
      <AnimatePresence initial={false}>
        <motion.div
          key={activeSlide.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={activeSlide.src}
            alt={`${WEDDING_CONFIG.couple.groom.koreanName} ${WEDDING_CONFIG.couple.bride.koreanName} 웨딩 화보`}
            className="animate-ken-burns h-full w-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* 상단·하단 감성 그라데이션 (Porto 포스터 가독성 유지하면서 하늘과 잔디 톤 보존) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/42 via-ink/5 to-ink/72" />

      {/* 상단 에디토리얼 매거진 헤더 (Porto 스타일) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="relative z-10 px-5 pt-16 text-center text-white sm:px-8 sm:pt-14"
      >
        <p className="font-editorial text-[11px] tracking-[0.34em] text-white/95 uppercase drop-shadow-sm">
          The Wedding Invitation
        </p>
        <div className="mx-auto mt-2.5 flex items-center justify-center gap-3 text-[11px] tracking-[0.22em] text-white/90">
          <span className="h-px w-6 bg-white/60" />
          <span className="font-editorial tabular-lining text-[14px] tracking-[0.25em]">
            {WEDDING_CONFIG.schedule.displayDateDot}
          </span>
          <span className="h-px w-6 bg-white/60" />
        </div>
      </motion.div>

      {/* 하단 신랑·신부 이름 & 예식 정보 (Porto 포스터 푸터) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, delay: 0.35 }}
        className="relative z-10 px-5 pb-7 text-center text-white sm:px-8 sm:pb-8"
      >
        <p
          className={`font-editorial leading-tight font-light italic tracking-[0.03em] text-white drop-shadow ${isSplit
            ? "text-[clamp(22px,2.5vw,38px)]"
            : "text-[clamp(19px,6.2vw,34px)]"
            }`}
        >
          <span className="whitespace-nowrap">
            {WEDDING_CONFIG.couple.groom.englishName}
          </span>
          <span className="mx-2 text-[0.72em] font-light text-white/80">
            &amp;
          </span>
          <span className="whitespace-nowrap">
            {WEDDING_CONFIG.couple.bride.englishName}
          </span>
        </p>

        <p className="font-batang mt-2 text-[clamp(15px,2.2vw,18px)] tracking-[0.26em] text-white/95">
          {WEDDING_CONFIG.couple.groom.koreanName}
          <span className="mx-2.5 text-[12px] text-white/70">·</span>
          {WEDDING_CONFIG.couple.bride.koreanName}
        </p>

        <div className="mx-auto mt-4 max-w-[340px] border-t border-white/25 pt-3.5 text-[12px] leading-relaxed tracking-[0.04em] text-white/90">
          <p>{WEDDING_CONFIG.schedule.displayFullKo}</p>
          <p className="mt-0.5 text-white/80">
            {WEDDING_CONFIG.venue.name} ({WEDDING_CONFIG.venue.building}){" "}
            {WEDDING_CONFIG.venue.hall}
          </p>
        </div>

        {/* 화보 커버 스위처 (14번 기본 + 4컷 전환 가능) */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {slides.map((slide, idx) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`커버 화보 ${idx + 1} 보기`}
              className={`h-1.5 rounded-full transition-all ${idx === activeIndex
                ? "w-6 bg-white"
                : "w-1.5 bg-white/45 hover:bg-white/75"
                }`}
            />
          ))}
        </div>

        {/* 폴드 펼침/태블릿/PC 전용 빠른 섹션 점프 네비게이션 */}
        {isSplit ? (
          <nav
            aria-label="청첩장 섹션 바로가기"
            className="mt-5 flex flex-wrap items-center justify-center gap-1.5"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/25 bg-black/20 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm transition hover:border-white/60 hover:bg-white/20"
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : (
          <a
            href="#invitation"
            aria-label="아래로 스크롤하여 청첩장 보기"
            className="mt-5 inline-flex flex-col items-center gap-1 text-[10px] tracking-[0.24em] text-white/75 uppercase transition hover:text-white"
          >
            <span>Scroll</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        )}
      </motion.div>
    </div>
  );
}
