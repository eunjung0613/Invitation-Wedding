"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bus,
  Car,
  Copy,
  MapPin,
  Navigation,
  Phone,
  TrainFront,
} from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { useToast } from "./ToastProvider";

export function LocationSection() {
  const [mapTab, setMapTab] = useState<"map" | "sketch">("map");
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
            /* 문래역 5번 출구 -> 문래동주민센터 방향 300m -> SK리더스뷰 2층 규수당 감성 약도 */
            <div className="bg-[#FBF9F5] p-5">
              <svg
                viewBox="0 0 420 280"
                className="w-full rounded-xl"
                role="img"
                aria-label="문래역 5번 출구에서 규수당 문래점(SK리더스뷰 2층)까지 도보 6분 300m 약도"
              >
                {/* 배경 도로망 */}
                <rect width="420" height="280" fill="#FBF9F5" />
                {/* 가로 문래로 */}
                <path
                  d="M 20 158 L 400 158"
                  stroke="#E4DDD2"
                  strokeWidth="26"
                  strokeLinecap="round"
                />
                {/* 세로 당산로 */}
                <path
                  d="M 102 20 L 102 260"
                  stroke="#E4DDD2"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                {/* 세로 문래역 교차로 보조도로 */}
                <path
                  d="M 290 60 L 290 250"
                  stroke="#EFEAE1"
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {/* 도보 이동 점선 경로 */}
                <path
                  d="M 118 158 L 285 158 L 285 112"
                  fill="none"
                  stroke="#5F6F60"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 2호선 문래역 */}
                <circle cx="102" cy="158" r="24" fill="#3CB44A" />
                <text
                  x="102"
                  y="155"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="700"
                >
                  2호선
                </text>
                <text
                  x="102"
                  y="168"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="700"
                >
                  문래역
                </text>

                {/* 5번 출구 배지 */}
                <rect
                  x="130"
                  y="123"
                  width="54"
                  height="22"
                  rx="11"
                  fill="#FFFFFF"
                  stroke="#5F6F60"
                  strokeWidth="1.2"
                />
                <text
                  x="157"
                  y="138"
                  textAnchor="middle"
                  fill="#475648"
                  fontSize="10"
                  fontWeight="600"
                >
                  5번 출구
                </text>

                {/* 거리 표기 */}
                <rect
                  x="166"
                  y="174"
                  width="116"
                  height="22"
                  rx="11"
                  fill="#5F6F60"
                />
                <text
                  x="224"
                  y="189"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="600"
                >
                  도보 6분 · 직진 300m
                </text>

                {/* 문래동주민센터 방향 */}
                <text
                  x="345"
                  y="162"
                  textAnchor="middle"
                  fill="#8C8479"
                  fontSize="9.5"
                >
                  문래동주민센터 방면 →
                </text>

                {/* 규수당 문래점 (SK리더스뷰 2층) 목적지 */}
                <rect
                  x="216"
                  y="42"
                  width="148"
                  height="64"
                  rx="14"
                  fill="#475648"
                />
                <text
                  x="290"
                  y="66"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12.5"
                  fontWeight="700"
                >
                  규수당 문래점
                </text>
                <text
                  x="290"
                  y="83"
                  textAnchor="middle"
                  fill="#E4EDE5"
                  fontSize="10"
                >
                  SK리더스뷰 2층 · 카이타스홀
                </text>
                <text
                  x="290"
                  y="97"
                  textAnchor="middle"
                  fill="#C8D6C9"
                  fontSize="9"
                >
                  지하 3층 주차장 (2시간 무료)
                </text>

                {/* 에이스하이테크시티 (만차 시) */}
                <rect
                  x="216"
                  y="214"
                  width="156"
                  height="38"
                  rx="10"
                  fill="#FFFFFF"
                  stroke="#D8CFC2"
                  strokeWidth="1.2"
                />
                <text
                  x="294"
                  y="231"
                  textAnchor="middle"
                  fill="#5E5850"
                  fontSize="10"
                  fontWeight="600"
                >
                  에이스하이테크시티
                </text>
                <text
                  x="294"
                  y="244"
                  textAnchor="middle"
                  fill="#8F887E"
                  fontSize="9"
                >
                  만차 시 주차 후 등록
                </text>
              </svg>
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
    </section>
  );
}
