"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, Lock, Share2 } from "lucide-react";
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
      {/* 엔딩 배너 (_08 -> photo-09.jpg, 푸른 들판으로 함께 달려가는 뒷모습) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.85 }}
        className="relative overflow-hidden"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={WEDDING_CONFIG.featuredPhotos.closingBanner}
            alt="함께 걸어갈 새로운 시작"
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-7 text-white">
            <p className="font-editorial text-[22px] font-light italic tracking-[0.06em]">
              Thank you for celebrating with us
            </p>
            <p className="font-batang mt-1.5 text-[13px] text-white/90">
              소중한 날, 따뜻한 축복으로 함께해 주셔서 감사합니다.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 공유 버튼 영역 */}
      <div className="px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-[360px] grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={shareInvitation}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FEE500] px-4 py-3 text-[13px] font-semibold text-[#191919] shadow-xs transition hover:brightness-95 active:scale-[0.98]"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>청첩장 공유하기</span>
          </button>

          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-sand bg-white px-4 py-3 text-[13px] font-medium text-ink shadow-xs transition hover:border-sage hover:text-sage active:scale-[0.98]"
          >
            <Link2 className="h-3.5 w-3.5 text-sage" />
            <span>링크 복사</span>
          </button>
        </div>

        {/* 꽃과 커플 미러 미니 포인트 */}
        <div className="mx-auto mt-8 max-w-[200px] overflow-hidden rounded-xl border border-sand bg-white p-1.5 shadow-xs">
          <img
            src={WEDDING_CONFIG.featuredPhotos.floralAccent}
            alt="웨딩 플라워 디테일"
            className="aspect-[3/2] w-full rounded-lg object-cover"
            loading="lazy"
          />
        </div>

        <div className="mt-7 space-y-1.5 text-[11px] tracking-[0.14em] text-muted">
          <p className="font-editorial text-[13px] text-stone">
            {WEDDING_CONFIG.couple.groom.englishName} &amp;{" "}
            {WEDDING_CONFIG.couple.bride.englishName}
          </p>
          <p>{WEDDING_CONFIG.schedule.displayDateDot} · SEOUL</p>
        </div>

        <div className="mt-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] text-muted/80 transition hover:bg-linen hover:text-stone"
          >
            <Lock className="h-3 w-3" />
            <span>신랑·신부 관리</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
