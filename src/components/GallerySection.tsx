"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";

const INITIAL_VISIBLE = 9;

export function GallerySection() {
  const photos = WEDDING_CONFIG.gallery;
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const visiblePhotos = expanded ? photos : photos.slice(0, INITIAL_VISIBLE);

  const showPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev + 1) % photos.length
    );
  }, [photos.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, showNext, showPrev]);

  return (
    <section
      id="gallery"
      className="border-t border-sand/80 px-5 py-16 text-center sm:px-8 sm:py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75 }}
      >
        <p className="font-editorial text-[12px] tracking-[0.32em] text-sage uppercase">
          Gallery
        </p>
        <h2 className="font-batang mt-2 text-[21px] font-normal text-ink">
          우리의 소중한 순간들
        </h2>
        <p className="mt-1.5 text-[12.5px] text-muted">
          사진을 누르시면 크게 감상하실 수 있습니다 ({photos.length}장)
        </p>

        {/* 초소형 폴드(280px)에서는 2열, 일반 모바일 이상에서는 3열 */}
        <div className="mt-8 grid grid-cols-2 gap-2 min-[340px]:grid-cols-3 sm:gap-2.5">
          {visiblePhotos.map((photo, idx) => (
            <motion.button
              key={photo.id}
              type="button"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: (idx % 3) * 0.04 }}
              onClick={() => setSelectedIndex(idx)}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-linen text-left focus:outline-none focus:ring-2 focus:ring-sage"
              aria-label={`${photo.alt} 크게 보기`}
            >
              <img
                src={photo.thumb}
                alt={photo.alt}
                loading={idx < INITIAL_VISIBLE ? "lazy" : "eager"}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute right-1.5 bottom-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-xs transition group-hover:opacity-100">
                <Expand className="h-3 w-3" />
              </span>
            </motion.button>
          ))}
        </div>

        {photos.length > INITIAL_VISIBLE && (
          <div className="mt-7">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="rounded-full border border-champagne/60 bg-white px-7 py-2.5 text-[13px] font-medium text-ink transition hover:border-sage hover:text-sage active:scale-[0.98]"
            >
              {expanded
                ? "사진 접기"
                : `사진 더보기 (+${photos.length - INITIAL_VISIBLE}장)`}
            </button>
          </div>
        )}
      </motion.div>

      {/* 풀스크린 스와이프 라이트박스 */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[95] flex flex-col justify-between bg-[#151412]/96 text-white backdrop-blur-md"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const deltaX =
              (e.changedTouches[0]?.clientX ?? touchStartX.current) -
              touchStartX.current;
            if (deltaX > 48) showPrev();
            if (deltaX < -48) showNext();
            touchStartX.current = null;
          }}
        >
          {/* 상단 바 */}
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <span className="font-editorial text-[14px] tracking-[0.2em] text-white/80">
              {String(selectedIndex + 1).padStart(2, "0")} /{" "}
              {String(photos.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              aria-label="갤러리 닫기"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 메인 이미지 영역 */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-3 sm:px-14">
            <button
              type="button"
              onClick={showPrev}
              aria-label="이전 사진"
              className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/70 sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <AnimatePresence mode="wait">
              <motion.img
                key={photos[selectedIndex].src}
                src={photos[selectedIndex].src}
                alt={photos[selectedIndex].alt}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-h-[72dvh] max-w-full rounded-lg object-contain shadow-2xl"
              />
            </AnimatePresence>

            <button
              type="button"
              onClick={showNext}
              aria-label="다음 사진"
              className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/70 sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* 하단 캡션 & 썸네일 스트립 */}
          <div className="px-4 pt-2 pb-5">
            <p className="mb-3 text-center text-[12.5px] text-white/75">
              {photos[selectedIndex].alt}
            </p>
            <div className="mx-auto flex max-w-[640px] gap-1.5 overflow-x-auto pb-1">
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative h-12 w-10 shrink-0 overflow-hidden rounded-md transition ${idx === selectedIndex
                      ? "ring-2 ring-white opacity-100"
                      : "opacity-45 hover:opacity-80"
                    }`}
                >
                  <img
                    src={p.thumb}
                    alt={p.alt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
