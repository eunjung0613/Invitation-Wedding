"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Phone, X } from "lucide-react";
import { type ContactPerson } from "@/config/wedding";
import {
  getDefaultWeddingSettings,
  subscribeWeddingSettings,
} from "@/lib/weddingStore";
import { useToast } from "./ToastProvider";

export function ContactSection() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contacts, setContacts] = useState(
    () => getDefaultWeddingSettings().contacts
  );
  const { showToast } = useToast();

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
      id="contact"
      className="px-5 pt-0 pb-16 text-center sm:px-8 sm:pb-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.65 }}
        className="mx-auto max-w-[380px] rounded-3xl border border-sand bg-white px-6 py-7 shadow-[0_8px_24px_rgba(44,42,39,0.035)]"
      >
        <p className="font-editorial text-[11.5px] tracking-[0.3em] text-sage uppercase">
          Contact
        </p>
        <h2 className="font-batang mt-1.5 text-[18.5px] font-normal text-ink">
          신랑 · 신부 및 혼주 연락처
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-stone">
          궁금한 점이나 축하 인사를 전하실 분은
          <br />
          아래 버튼을 눌러 바로 연락해 주세요.
        </p>

        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-champagne/70 bg-ivory px-6 py-3 text-[13px] font-medium text-ink transition hover:border-sage hover:bg-sage hover:text-white active:scale-[0.98]"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>신랑 · 신부 및 혼주에게 연락하기</span>
        </button>
      </motion.div>

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
