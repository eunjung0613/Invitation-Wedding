"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bus,
  Car,
  Copy,
  Expand,
  MapPin,
  Navigation,
  Phone,
  TrainFront,
  X,
} from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { useToast } from "./ToastProvider";

export function LocationSection() {
  const [mapTab, setMapTab] = useState<"map" | "sketch">("map");
  const [sketchZoomOpen, setSketchZoomOpen] = useState(false);
  const { showToast } = useToast();
  const { venue } = WEDDING_CONFIG;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(venue.roadAddress);
      showToast("도로명 주소가 복사되었습니다.");
    } catch {
      showToast("주소를 길게 눌러 복사해 주세요.");
    }
  };

  const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(
    `${venue.name} ${venue.shortAddress}`
  )}`;
  const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(
    venue.name
  )},${venue.lat},${venue.lng}`;

  const handleOpenTmap = () => {
    const appUrl = `tmap://route?goalname=${encodeURIComponent(
      venue.name
    )}&goalx=${venue.lng}&goaly=${venue.lat}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = appUrl;
      window.setTimeout(() => {
        showToast("티맵 앱이 설치되어 있지 않다면 카카오맵/네이버지도를 이용해 주세요.");
      }, 1500);
    } else {
      window.open(kakaoMapUrl, "_blank", "noopener,noreferrer");
      showToast("PC 환경에서는 카카오맵 길찾기로 연결됩니다.");
    }
  };

  const googleEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${venue.shortAddress} ${venue.name}`
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section
      id="location"
      className="border-t border-sand/80 bg-linen/55 px-5 py-16 sm:px-8 sm:py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75 }}
      >
        <div className="text-center">
          <p className="font-editorial text-[12px] tracking-[0.32em] text-sage uppercase">
            Location
          </p>
          <h2 className="font-batang mt-2 text-[21px] font-normal text-ink">
            오시는 길
          </h2>

          <div className="mt-5 space-y-1">
            <p className="font-batang text-[16.5px] font-bold text-ink">
              {venue.name} ({venue.building})
            </p>
            <p className="text-[14px] font-medium text-sage-dark">
              {venue.hall}
            </p>
            <p className="pt-1 text-[13px] text-stone">{venue.roadAddress}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={copyAddress}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-3.5 py-1.5 text-[12px] text-ink transition hover:border-sage hover:text-sage"
            >
              <Copy className="h-3 w-3 text-sage" />
              <span>주소 복사</span>
            </button>
            <a
              href={`tel:${venue.phoneTel}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-3.5 py-1.5 text-[12px] text-ink transition hover:border-sage hover:text-sage"
            >
              <Phone className="h-3 w-3 text-sage" />
              <span>{venue.phone}</span>
            </a>
          </div>
        </div>

        {/* 지도 / 약도 전환 탭 */}
        <div className="mt-7 overflow-hidden rounded-3xl border border-sand bg-white shadow-[0_8px_28px_rgba(44,42,39,0.05)]">
          <div className="grid grid-cols-2 border-b border-sand/80 bg-ivory/70 text-[12.5px] font-medium">
            <button
              type="button"
              onClick={() => setMapTab("map")}
              className={`py-3 transition ${
                mapTab === "map"
                  ? "bg-white text-sage-dark shadow-[inset_0_-2px_0_#5F6F60]"
                  : "text-muted hover:text-ink"
              }`}
            >
              지도 보기
            </button>
            <button
              type="button"
              onClick={() => setMapTab("sketch")}
              className={`py-3 transition ${
                mapTab === "sketch"
                  ? "bg-white text-sage-dark shadow-[inset_0_-2px_0_#5F6F60]"
                  : "text-muted hover:text-ink"
              }`}
            >
              간편 약도
            </button>
          </div>

          {mapTab === "map" ? (
            <div className="relative aspect-[4/3] w-full bg-linen">
              <iframe
                title="규수당 문래점 위치 지도"
                src={googleEmbedSrc}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            /* 사용자 제공 공식 약도 이미지 (클릭 시 크게 보기 지원) */
            <div className="bg-white p-3">
              <button
                type="button"
                onClick={() => setSketchZoomOpen(true)}
                className="group relative block w-full overflow-hidden rounded-xl border border-sand/70 bg-white focus:outline-none focus:ring-2 focus:ring-sage"
                aria-label="약도 크게 보기"
              >
                <img
                  src={venue.sketchMapImage}
                  alt="규수당 문래점(SK리더스뷰 2층) 오시는 길 약도"
                  className="h-auto w-full object-contain"
                  loading="lazy"
                />
                <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-full bg-ink/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs transition group-hover:bg-sage">
                  <Expand className="h-3 w-3" />
                  <span>크게 보기</span>
                </span>
              </button>
            </div>
          )}

          {/* 내비게이션 앱 3종 연동 버튼 */}
          <div className="grid grid-cols-3 divide-x divide-sand/80 border-t border-sand/80 bg-white text-[12px] font-medium text-ink">
            <a
              href={naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-3.5 transition hover:bg-ivory"
            >
              <span className="h-2 w-2 rounded-full bg-[#03C75A]" />
              <span>네이버지도</span>
            </a>
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-3.5 transition hover:bg-ivory"
            >
              <span className="h-2 w-2 rounded-full bg-[#FEE500] ring-1 ring-[#D4B800]" />
              <span>카카오맵</span>
            </a>
            <button
              type="button"
              onClick={handleOpenTmap}
              className="flex items-center justify-center gap-1.5 py-3.5 transition hover:bg-ivory"
            >
              <Navigation className="h-3 w-3 text-[#2B64F6]" />
              <span>티맵</span>
            </button>
          </div>
        </div>

        {/* 교통 및 주차 상세 안내 */}
        <div className="mt-7 space-y-3.5 text-left">
          {/* 지하철 */}
          <div className="rounded-2xl border border-sand bg-white px-5 py-4">
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
              <TrainFront className="h-4 w-4 text-sage" />
              <span>{venue.transport.subway.title}</span>
            </div>
            <ul className="mt-2.5 space-y-1 text-[13px] leading-relaxed text-stone">
              {venue.transport.subway.lines.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-champagne" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 버스 */}
          <div className="rounded-2xl border border-sand bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                <Bus className="h-4 w-4 text-sage" />
                <span>{venue.transport.bus.title}</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-linen px-2.5 py-0.5 text-[11px] font-medium text-stone">
                <MapPin className="h-3 w-3 text-sage" />
                {venue.transport.bus.stopName}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-[13px] text-stone">
              {venue.transport.bus.routes.map((route) => (
                <div
                  key={route.type}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span
                    className="inline-flex min-w-[44px] justify-center rounded-md px-2 py-0.5 text-[11px] font-medium text-white"
                    style={{ backgroundColor: route.color }}
                  >
                    {route.type}
                  </span>
                  <span className="font-medium text-ink/90">
                    {route.numbers}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 주차 안내 */}
          <div className="rounded-2xl border border-sand bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                <Car className="h-4 w-4 text-sage" />
                <span>{venue.transport.parking.title}</span>
              </div>
              <span className="rounded-full bg-sage/12 px-2.5 py-0.5 text-[11px] font-semibold text-sage-dark">
                {venue.transport.parking.highlight}
              </span>
            </div>
            <ul className="mt-2.5 space-y-1.5 text-[13px] leading-relaxed text-stone">
              {venue.transport.parking.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* 약도 크게 보기 모달 */}
      {sketchZoomOpen && (
        <div
          onClick={() => setSketchZoomOpen(false)}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setSketchZoomOpen(false)}
            aria-label="약도 닫기"
            className="fixed top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={venue.sketchMapImage}
            alt="규수당 문래점(SK리더스뷰 2층) 오시는 길 약도 확대"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] max-w-full rounded-xl bg-white object-contain shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}
