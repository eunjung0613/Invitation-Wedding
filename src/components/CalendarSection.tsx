"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, ExternalLink } from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { downloadWeddingIcs, getGoogleCalendarUrl } from "@/lib/calendar";
import { useToast } from "./ToastProvider";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: "upcoming" | "today" | "past";
}

function computeCountdown(): CountdownState {
  const target = new Date(WEDDING_CONFIG.schedule.isoDateTime).getTime();
  const now = Date.now();
  const diff = target - now;

  // 한국 시간 기준 같은 날인지 확인
  const kstFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayKst = kstFormatter.format(new Date(now));
  const targetKst = `${WEDDING_CONFIG.schedule.year}-${String(
    WEDDING_CONFIG.schedule.month
  ).padStart(2, "0")}-${String(WEDDING_CONFIG.schedule.day).padStart(2, "0")}`;

  if (todayKst === targetKst && diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status: "today" };
  }

  if (diff <= 0) {
    const passedDays = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
    return {
      days: passedDays,
      hours: 0,
      minutes: 0,
      seconds: 0,
      status: "past",
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, status: "upcoming" };
}

// 2027년 3월 달력 계산 (3월 1일 = 월요일, 총 31일)
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function buildMonthGrid(year: number, month: number): Array<number | null> {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun..6=Sat
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export function CalendarSection() {
  const [countdown, setCountdown] = useState<CountdownState | null>(null);
  const { showToast } = useToast();
  const { year, month, day } = WEDDING_CONFIG.schedule;
  const cells = buildMonthGrid(year, month);

  useEffect(() => {
    setCountdown(computeCountdown());
    const id = window.setInterval(() => {
      setCountdown(computeCountdown());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      id="calendar"
      className="border-t border-sand/80 bg-linen/55 px-5 py-16 text-center sm:px-9 sm:py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75 }}
      >
        <p className="font-editorial text-[12px] tracking-[0.32em] text-sage uppercase">
          Wedding Day
        </p>

        <h2 className="font-editorial tabular-lining mt-2 text-[32px] font-light tracking-[0.08em] text-ink sm:text-[36px]">
          {WEDDING_CONFIG.schedule.displayDateDot}
        </h2>

        <p className="mt-1.5 text-[13.5px] font-normal text-stone">
          {WEDDING_CONFIG.schedule.weekdayKo} {WEDDING_CONFIG.schedule.timeKo}
        </p>

        {/* 03 28 풍선 사진 포인트 카드 */}
        <div className="mx-auto mt-7 max-w-[340px] overflow-hidden rounded-2xl border border-sand bg-white p-2 shadow-xs">
          <div className="aspect-[16/10] overflow-hidden rounded-xl">
            <img
              src={WEDDING_CONFIG.featuredPhotos.dateBalloon}
              alt="03 28 숫자 풍선을 들고 있는 신랑 신부"
              className="h-full w-full object-cover object-[center_42%]"
              loading="lazy"
            />
          </div>
        </div>

        {/* 2027년 3월 미니멀 에디토리얼 캘린더 */}
        <div className="mx-auto mt-8 max-w-[340px] rounded-3xl border border-sand bg-white px-4 py-6 shadow-[0_8px_28px_rgba(44,42,39,0.04)] sm:px-6">
          <div className="mb-4 flex items-baseline justify-between border-b border-sand/70 pb-3">
            <span className="font-editorial text-[22px] font-medium tracking-[0.08em] text-ink">
              March
            </span>
            <span className="font-editorial text-[13px] tracking-[0.2em] text-muted">
              {year}. {String(month).padStart(2, "0")}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-[10px] tracking-[0.12em]">
            {WEEKDAYS.map((w, idx) => (
              <div
                key={w}
                className={
                  idx === 0
                    ? "font-medium text-[#B86A5B]"
                    : idx === 6
                    ? "font-medium text-sage"
                    : "text-muted"
                }
              >
                {w}
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-y-2 text-[13px]">
            {cells.map((dateNum, idx) => {
              if (dateNum === null) {
                return <div key={`empty-${idx}`} />;
              }
              const isWeddingDay = dateNum === day;
              const isSunday = idx % 7 === 0;
              const isSaturday = idx % 7 === 6;

              return (
                <div
                  key={dateNum}
                  className="flex items-center justify-center py-0.5"
                >
                  {isWeddingDay ? (
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-sage font-semibold text-white shadow-sm">
                      {dateNum}
                      <span className="absolute -inset-1 rounded-full border border-sage/35" />
                    </span>
                  ) : (
                    <span
                      className={
                        isSunday
                          ? "text-[#B86A5B]"
                          : isSaturday
                          ? "text-sage/90"
                          : "text-ink/85"
                      }
                    >
                      {dateNum}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 실시간 D-Day 카운트다운 */}
        <div className="mx-auto mt-7 max-w-[340px]">
          {countdown && countdown.status === "upcoming" && (
            <>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "DAYS", value: String(countdown.days) },
                  { label: "HOUR", value: pad(countdown.hours) },
                  { label: "MIN", value: pad(countdown.minutes) },
                  { label: "SEC", value: pad(countdown.seconds) },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="rounded-2xl border border-sand bg-white/90 py-3"
                  >
                    <p className="font-editorial tabular-lining text-[22px] font-medium text-ink">
                      {unit.value}
                    </p>
                    <p className="mt-0.5 text-[9.5px] tracking-[0.18em] text-muted">
                      {unit.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-stone">
                {WEDDING_CONFIG.couple.groom.firstName}
                <span className="mx-1 text-[#C47C6E]">♥</span>
                {WEDDING_CONFIG.couple.bride.firstName}의 결혼식이{" "}
                <strong className="font-semibold text-sage-dark">
                  {countdown.days}일
                </strong>{" "}
                남았습니다.
              </p>
            </>
          )}

          {countdown && countdown.status === "today" && (
            <p className="font-batang rounded-2xl border border-sage/30 bg-white px-4 py-4 text-[14.5px] text-sage-dark">
              오늘은 {WEDDING_CONFIG.couple.groom.firstName} ♥{" "}
              {WEDDING_CONFIG.couple.bride.firstName}의 결혼식 날입니다!
            </p>
          )}

          {countdown && countdown.status === "past" && (
            <p className="font-batang rounded-2xl border border-sand bg-white px-4 py-4 text-[14px] text-stone">
              함께 축복해 주셔서 감사합니다. (결혼 후 +{countdown.days}일)
            </p>
          )}

          {/* 캘린더 일정 추가 버튼 */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                downloadWeddingIcs();
                showToast("일정 파일(.ics)을 다운로드했습니다.");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-4 py-2 text-[12px] font-medium text-ink transition hover:border-sage hover:text-sage"
            >
              <CalendarPlus className="h-3.5 w-3.5 text-sage" />
              <span>캘린더 저장 (.ics)</span>
            </button>
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-4 py-2 text-[12px] font-medium text-ink transition hover:border-sage hover:text-sage"
            >
              <span>구글 캘린더</span>
              <ExternalLink className="h-3 w-3 text-muted" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
