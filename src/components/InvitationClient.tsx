"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Share2 } from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { OpeningCurtain } from "./OpeningCurtain";
import { BgmPlayer } from "./BgmPlayer";
import { EditorialHero } from "./EditorialHero";
import { InvitationSection } from "./InvitationSection";
import { CalendarSection } from "./CalendarSection";
import { GallerySection } from "./GallerySection";
import { LocationSection } from "./LocationSection";
import { RsvpSection } from "./RsvpSection";
import { ContactSection } from "./ContactSection";
import { AccountsSection } from "./AccountsSection";
import { GuestSnapSection } from "./GuestSnapSection";
import { GuestbookSection } from "./GuestbookSection";
import { FooterSection } from "./FooterSection";
import { useToast } from "./ToastProvider";

export function InvitationClient() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const onScroll = () => {
      setShowTopBtn(window.scrollY > 560);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const quickShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: WEDDING_CONFIG.meta.title,
          text: WEDDING_CONFIG.meta.description,
          url: window.location.href,
        });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("청첩장 링크가 복사되었습니다.");
    } catch {
      showToast("주소창의 링크를 복사해 주세요.");
    }
  };

  return (
    <>
      <OpeningCurtain />

      {/* 상단 플로팅 유틸리티 바 (BGM + 공유) */}
      <div className="fixed top-3.5 right-3.5 z-50 flex items-center gap-2 sm:top-5 sm:right-5">
        <BgmPlayer />
        <button
          type="button"
          onClick={quickShare}
          aria-label="청첩장 공유하기"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-ivory/82 text-ink shadow-sm backdrop-blur-md transition hover:bg-white active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5 text-sage" />
        </button>
      </div>

      {/*
        에디토리얼 2단 스플릿 레이아웃:
        - 모바일 / 갤럭시 폴드 접힘 (< 700px): 풀스크린 세로 1단 청첩장
        - 갤럭시 폴드 펼침 (700px~884px) / 태블릿 / PC: 좌측 고정 화보 커버 + 우측 스크롤 청첩장
      */}
      <div className="min-h-dvh w-full min-[700px]:grid min-[700px]:grid-cols-[44%_56%] lg:grid-cols-[48%_52%] xl:grid-cols-[50%_50%]">
        {/* 좌측 고정 화보 패널 (폴드 펼침 / 태블릿 / PC) */}
        <aside className="hidden min-[700px]:sticky min-[700px]:top-0 min-[700px]:block min-[700px]:h-dvh">
          <EditorialHero variant="split" />
        </aside>

        {/* 우측 메인 콘텐츠 패널 (모바일에서는 전체 화면) */}
        <main className="relative w-full bg-ivory min-[700px]:border-l min-[700px]:border-sand/80">
          {/* 모바일 / 폴드 접힘 전용 풀스크린 커버 */}
          <div className="min-[700px]:hidden">
            <EditorialHero variant="mobile" />
          </div>

          <div className="mx-auto w-full max-w-[540px]">
            <InvitationSection />
            <CalendarSection />
            <GallerySection />
            <LocationSection />
            <RsvpSection />
            <ContactSection />
            <AccountsSection />
            <GuestSnapSection />
            <GuestbookSection />
            <FooterSection />
          </div>
        </main>
      </div>

      {/* 맨 위로 버튼 */}
      {showTopBtn && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="맨 위로 이동"
          className="fixed right-4 bottom-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-white/90 text-ink shadow-md backdrop-blur-sm transition hover:border-sage hover:text-sage active:scale-95"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </>
  );
}
