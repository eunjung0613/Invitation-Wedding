"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Phone, X } from "lucide-react";
import { WEDDING_CONFIG, type ContactPerson } from "@/config/wedding";
import {
  getDefaultWeddingSettings,
  subscribeWeddingSettings,
} from "@/lib/weddingStore";
import { useToast } from "./ToastProvider";

export function InvitationSection() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contacts, setContacts] = useState(
    () => getDefaultWeddingSettings().contacts
  );
  const { showToast } = useToast();
  const { groom, bride } = WEDDING_CONFIG.couple;

  useEffect(() => {
    return subscribeWeddingSettings((settings) => {
      setContacts(settings.contacts);
    });
  }, []);

  const handleContactAction = (person: ContactPerson, type: "tel" | "sms") => {
    const digits = person.phone.replace(/\D/g, "");
    if (!digits) {
      showToast(`${person.name}님의 연락처는 준비 중입니다.`);
      return;
    }
    window.location.href = `${type}:${digits}`;
  };

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

        {/* 혼주에게 연락하기 버튼 */}
        <div className="mt-7">
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-champagne/60 bg-white px-6 py-2.5 text-[13px] font-medium text-ink transition hover:border-sage hover:text-sage active:scale-[0.98]"
          >
            <Phone className="h-3.5 w-3.5 text-sage" />
            <span>신랑 · 신부 및 혼주에게 연락하기</span>
          </button>
        </div>
      </motion.div>

      {/* 4컷 시네마틱 인터루드 (_15 -> photo-16.jpg) */}
      <motion.figure
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}
        className="mx-auto mt-14 max-w-[400px]"
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

      {/* 연락하기 모달 */}
      <AnimatePresence>
        {contactOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setContactOpen(false)}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-4 backdrop-blur-xs sm:items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] overflow-hidden rounded-3xl bg-ivory shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-sand px-6 py-4">
                <div className="text-left">
                  <p className="font-editorial text-[11px] tracking-[0.26em] text-sage uppercase">
                    Contact
                  </p>
                  <h3 className="font-batang text-[16px] text-ink">
                    연락하기
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  aria-label="닫기"
                  className="rounded-full p-1.5 text-stone transition hover:bg-sand/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5 text-left">
                {[
                  { title: "신랑측", list: contacts.groomSide },
                  { title: "신부측", list: contacts.brideSide },
                ].map((group) => (
                  <div key={group.title}>
                    <p className="mb-2.5 text-[12px] font-medium tracking-wider text-sage">
                      {group.title}
                    </p>
                    <div className="divide-y divide-sand/70 rounded-2xl border border-sand bg-white px-4">
                      {group.list.map((person) => (
                        <div
                          key={`${group.title}-${person.role}`}
                          className="flex items-center justify-between py-3"
                        >
                          <div>
                            <span className="text-[11px] text-muted">
                              {person.role}
                            </span>
                            <p className="font-batang text-[14.5px] text-ink">
                              {person.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleContactAction(person, "tel")}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-linen text-sage transition hover:bg-sage hover:text-white"
                              aria-label={`${person.name} 전화하기`}
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleContactAction(person, "sms")}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-linen text-champagne transition hover:bg-champagne hover:text-white"
                              aria-label={`${person.name} 문자 보내기`}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
