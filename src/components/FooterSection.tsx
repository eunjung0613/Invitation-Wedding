"use client";

import { motion } from "framer-motion";
import { Link2, Share2 } from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { useToast } from "./ToastProvider";

export function FooterSection() {
  const { showToast } = useToast();

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("청첩장 주소가 복사되었습니다.");
    } catch {
      showToast("브라우저 주소창의 링크를 복사해 주세요.");
    }
  };

  const shareInvitation = async () => {
    const shareData = {
      title: WEDDING_CONFIG.meta.title,
      text: WEDDING_CONFIG.meta.description,
      url: window.location.href,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // 사용자가 공유 취소 시 무시
        return;
      }
    }

    await copyUrl();
    showToast("링크가 복사되었습니다. 카카오톡에 붙여넣어 공유해 주세요!");
  };

  return (
    <footer className="border-t border-sand/80 bg-ivory text-center">
      {/* 엔딩 배너 (_08 -> photo-09.jpg, 원본 4:5 세로 비율 그대로 유지하여 왜곡 없이 길게 연출) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.85 }}
        className="relative overflow-hidden"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <img
            src={WEDDING_CONFIG.featuredPhotos.closingBanner}
            alt="함께 걸어갈 새로운 시작"
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />

          {/* 하단 잔디 영역에만 은은한 포레스트 그린 그라데이션을 깔아 두 사람 실루엣 보존 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t from-[#1D271E]/88 via-[#1D271E]/42 to-transparent" />

          {/* Thank you 문구 + 영문 이름 & 날짜 크레딧을 하나로 조화롭게 배치 */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-8 text-white">
            <p className="font-editorial text-[clamp(22px,5.2vw,28px)] leading-snug font-light italic tracking-[0.05em] drop-shadow-sm">
              Thank you for celebrating with us
            </p>
            <p className="font-batang mt-1.5 text-[13px] text-white/90">
              소중한 날, 따뜻한 축복으로 함께해 주셔서 감사합니다.
            </p>

            <div className="mx-auto my-3.5 h-px w-8 bg-white/35" />

            <p className="font-editorial text-[16px] font-light tracking-[0.12em] text-white/95">
              {WEDDING_CONFIG.couple.groom.englishName} &amp;{" "}
              {WEDDING_CONFIG.couple.bride.englishName}
            </p>
            <p className="font-editorial tabular-lining mt-1 text-[11.5px] tracking-[0.22em] text-white/75">
              {WEDDING_CONFIG.schedule.displayDateDot} · SEOUL
            </p>
          </div>
        </div>
      </motion.div>

      {/* 초록빛 가든 톤과 어우러지는 공유 · 링크 복사 영역 */}
      <div className="bg-gradient-to-b from-[#EEF1EC] to-ivory px-5 pt-7 pb-9 sm:px-8">
        <div className="mx-auto grid max-w-[360px] grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={shareInvitation}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-4 py-3 text-[13px] font-medium text-white shadow-xs transition hover:bg-sage-dark active:scale-[0.98]"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>청첩장 공유하기</span>
          </button>

          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-sage/35 bg-white px-4 py-3 text-[13px] font-medium text-sage-dark shadow-xs transition hover:border-sage hover:bg-sage/8 active:scale-[0.98]"
          >
            <Link2 className="h-3.5 w-3.5 text-sage" />
            <span>링크 복사</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
