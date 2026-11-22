"use client";

import { motion } from "framer-motion";
import { WEDDING_CONFIG } from "@/config/wedding";

export function InvitationSection() {
  const { groom, bride } = WEDDING_CONFIG.couple;

  return (
    <section
      id="invitation"
      className="relative px-5 py-16 text-center sm:px-9 sm:py-20"
    >
      {/* PC/폴드 우측 패널 상단 감성 마스트헤드 */}
      <div className="mb-10 hidden min-[700px]:block">
        <p className="font-editorial text-[11px] tracking-[0.34em] text-champagne uppercase">
          Save The Date · {WEDDING_CONFIG.schedule.displayDateDot}
        </p>
        <div className="mx-auto mt-3 h-px w-8 bg-sand" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75 }}
      >
        <p className="font-editorial text-[12px] tracking-[0.32em] text-sage uppercase">
          {WEDDING_CONFIG.greeting.kicker}
        </p>

        <h2 className="font-batang mt-3 whitespace-pre-line text-[clamp(20px,4.5vw,24px)] leading-[1.6] font-normal text-ink">
          {WEDDING_CONFIG.greeting.title}
        </h2>

        <div className="mx-auto my-7 h-8 w-px bg-champagne/50" />

        <div className="mx-auto max-w-[360px] space-y-5 text-[14px] leading-[1.95] font-light text-stone sm:text-[14.5px]">
          {WEDDING_CONFIG.greeting.paragraphs.map((paragraph, idx) => (
            <p key={idx} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {/* 양가 혼주 및 신랑·신부 성함 */}
        <div className="mx-auto mt-10 max-w-[340px] border-y border-sand py-6">
          <div className="space-y-3 font-batang text-[15px] text-ink sm:text-[16px]">
            <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <span className="font-normal">
                {groom.father} · {groom.mother}
              </span>
              <span className="text-[12.5px] text-stone">
                의 {groom.relation}
              </span>
              <span className="ml-1 font-bold tracking-[0.06em]">
                {groom.firstName}
              </span>
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <span className="font-normal">
                {bride.father} · {bride.mother}
              </span>
              <span className="text-[12.5px] text-stone">
                의 {bride.relation}
              </span>
              <span className="ml-1 font-bold tracking-[0.06em]">
                {bride.firstName}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* 4컷 시네마틱 인터루드 (_15 -> photo-16.jpg) */}
      <motion.figure
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}
        className="mx-auto mt-12 max-w-[400px]"
      >
        <div className="overflow-hidden rounded-2xl border border-sand bg-white p-2 shadow-[0_12px_36px_rgba(44,42,39,0.06)]">
          <img
            src={WEDDING_CONFIG.featuredPhotos.storyInterlude}
            alt="서로에게 달려가 안기는 4컷 웨딩 스냅"
            className="w-full rounded-xl object-cover"
            loading="lazy"
          />
        </div>
        <figcaption className="font-editorial mt-3 text-[13px] italic tracking-[0.12em] text-muted">
          Running toward our spring together
        </figcaption>
      </motion.figure>
    </section>
  );
}
